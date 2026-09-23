#!/usr/bin/env bash
# --------------------------------------------------------------------------
# deploy.sh — build the site, sync it to S3, invalidate CloudFront
#
# Reads bucket name + distribution id from Terraform outputs.
# Usage: ./deploy.sh [--dry-run] [--skip-build]
#
# CACHING MODEL
# -------------
# Only content-hashed files may be `immutable`. Everything else gets a short
# TTL. The previous version applied a one-year immutable header to all of
# /assets/, including the resume PDF — a file that changes under a fixed name.
# Browsers honour `immutable` by not revalidating at all, so updated resumes
# stayed invisible and had to be forced out with a hand-edited ?v= query on
# every page. Splitting the rules by whether the name is content-derived
# removes that whole class of problem.
#
#   /assets/_/**            hashed by Vite        1 year, immutable
#   *.html                  mutable, tiny         must-revalidate
#   /resume.pdf             stable share URL      5 minutes
#   /assets/resume/**       legacy stable URL     5 minutes
#   everything else         docs, og, favicon     1 hour
# --------------------------------------------------------------------------
set -euo pipefail

DRY_RUN=""
SKIP_BUILD=""
for arg in "$@"; do
  case "$arg" in
    --dry-run)    DRY_RUN="--dryrun"; echo "==> DRY RUN — no files will change." ;;
    --skip-build) SKIP_BUILD="1" ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="${REPO_ROOT}/dist"
TF_DIR="${REPO_ROOT}/terraform"

# --- 0. Build -------------------------------------------------------------
# `npm run build` runs astro build, emits the stable asset aliases, and fails
# on any Content-Security-Policy violation. A CSP break is invisible locally
# and only shows up as a blocked resource in production, so the gate lives
# here rather than in review.
if [[ -z "${SKIP_BUILD}" ]]; then
  echo "==> Building..."
  ( cd "${REPO_ROOT}" && npm run build )
  echo
fi

if [[ ! -d "${DIST_DIR}" ]]; then
  echo "ERROR: ${DIST_DIR} does not exist. Run without --skip-build." >&2
  exit 1
fi
if [[ ! -f "${DIST_DIR}/index.html" ]]; then
  echo "ERROR: ${DIST_DIR}/index.html missing — refusing to sync a broken build." >&2
  exit 1
fi

cd "${TF_DIR}"

BUCKET="$(terraform output -raw s3_bucket_name)"
DIST_ID="$(terraform output -raw cloudfront_distribution_id)"
PROFILE_LINE=""
if PROFILE="$(terraform output -raw aws_profile 2>/dev/null)"; then
  [[ -n "${PROFILE}" ]] && PROFILE_LINE="--profile ${PROFILE}"
fi

echo "==> Bucket        : s3://${BUCKET}"
echo "==> Distribution  : ${DIST_ID}"
echo "==> Source        : ${DIST_DIR}"
echo

# --- 1. Hashed bundles — safe to cache forever ----------------------------
#
# Deliberately NOT --delete.
#
# These filenames contain a content hash, so a new build never overwrites an
# old file — it adds a new one. Deleting the old ones looked tidy and broke
# real sessions: anyone holding a page from before a deploy still references
# the previous hashes, and those requests started 404ing the moment the sync
# finished. For CSS and JS that means an unstyled page; for the resume it
# meant Chrome reporting "file wasn't available on site" on a download that
# had worked a minute earlier.
#
# Old hashed objects are immutable and tiny, so leaving them costs almost
# nothing and keeps already-served pages working. Prune them occasionally, or
# add an S3 lifecycle rule expiring assets/_/ objects after ~90 days.
echo "==> Syncing /assets/_/ (content-hashed, immutable, additive)..."
aws s3 sync ${DRY_RUN} ${PROFILE_LINE} \
  "${DIST_DIR}/assets/_/" "s3://${BUCKET}/assets/_/" \
  --cache-control "public, max-age=31536000, immutable"

# --- 2. Everything else, with cleanup -------------------------------------
# Runs before the HTML pass so its --delete can remove files dropped from the
# build (the old hand-written CSS and JS, for instance) without also deleting
# HTML. HTML is re-uploaded with correct headers in step 3.
echo "==> Syncing remaining files (1 hour) and pruning removed ones..."
aws s3 sync ${DRY_RUN} ${PROFILE_LINE} \
  "${DIST_DIR}/" "s3://${BUCKET}/" \
  --delete \
  --exclude "assets/_/*" \
  --cache-control "public, max-age=3600"

# --- 3. HTML — always revalidate ------------------------------------------
echo "==> Re-syncing HTML with must-revalidate..."
aws s3 sync ${DRY_RUN} ${PROFILE_LINE} \
  "${DIST_DIR}/" "s3://${BUCKET}/" \
  --exclude "*" --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html; charset=utf-8"

# --- 4. Stable resume URLs — short TTL ------------------------------------
# These are the URLs that go into job applications. They must stay valid, and
# they must not be cached hard, because the file changes under a fixed name.
echo "==> Re-syncing stable resume URLs with a 5 minute TTL..."
for KEY in "resume.pdf" "assets/resume/Omer_Dengiz_Resume.pdf"; do
  if [[ -f "${DIST_DIR}/${KEY}" ]]; then
    aws s3 cp ${DRY_RUN} ${PROFILE_LINE} \
      "${DIST_DIR}/${KEY}" "s3://${BUCKET}/${KEY}" \
      --cache-control "public, max-age=300, must-revalidate" \
      --content-type "application/pdf"
  fi
done

if [[ -n "${DRY_RUN}" ]]; then
  echo
  echo "==> Dry run complete. Skipping invalidation."
  exit 0
fi

# --- 5. Invalidate CloudFront ---------------------------------------------
echo
echo "==> Creating CloudFront invalidation for /* ..."
aws cloudfront create-invalidation \
  ${PROFILE_LINE} \
  --distribution-id "${DIST_ID}" \
  --paths "/*" \
  --query 'Invalidation.Id' --output text

echo "==> Done."
