#!/usr/bin/env bash
# --------------------------------------------------------------------------
# deploy.sh — sync ./site to S3 and invalidate CloudFront
# Reads bucket name + distribution id from Terraform outputs.
# Usage: ./deploy.sh [--dry-run]
# --------------------------------------------------------------------------
set -euo pipefail

DRY_RUN=""
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="--dryrun"
  echo "==> DRY RUN — no files will change."
fi

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="${REPO_ROOT}/site"
TF_DIR="${REPO_ROOT}/terraform"

cd "${TF_DIR}"

BUCKET="$(terraform output -raw s3_bucket_name)"
DIST_ID="$(terraform output -raw cloudfront_distribution_id)"
PROFILE_LINE=""
if PROFILE="$(terraform output -raw aws_profile 2>/dev/null)"; then
  [[ -n "${PROFILE}" ]] && PROFILE_LINE="--profile ${PROFILE}"
fi

echo "==> Bucket        : s3://${BUCKET}"
echo "==> Distribution  : ${DIST_ID}"
echo

# --- 1. Long-cache static assets (fingerprinted would be better, this is fine
#        because CloudFront invalidation flushes on deploy).
echo "==> Syncing /assets/ with 1-year Cache-Control..."
aws s3 sync ${DRY_RUN} ${PROFILE_LINE} \
  "${SITE_DIR}/assets/" "s3://${BUCKET}/assets/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# --- 2. HTML files with short TTL
echo "==> Syncing HTML with no-cache (must revalidate)..."
aws s3 sync ${DRY_RUN} ${PROFILE_LINE} \
  "${SITE_DIR}/" "s3://${BUCKET}/" \
  --delete \
  --exclude "assets/*" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --exclude "*" --include "*.html"

# --- 3. Everything else at site root (e.g. robots.txt, favicon) — default cache
echo "==> Syncing remaining root files..."
aws s3 sync ${DRY_RUN} ${PROFILE_LINE} \
  "${SITE_DIR}/" "s3://${BUCKET}/" \
  --exclude "assets/*" --exclude "*.html" \
  --cache-control "public, max-age=3600"

if [[ -n "${DRY_RUN}" ]]; then
  echo "==> Dry run complete. Skipping invalidation."
  exit 0
fi

# --- 4. Invalidate CloudFront
echo "==> Creating CloudFront invalidation for /* ..."
aws cloudfront create-invalidation \
  ${PROFILE_LINE} \
  --distribution-id "${DIST_ID}" \
  --paths "/*" \
  --query 'Invalidation.Id' --output text

echo "==> Done."
