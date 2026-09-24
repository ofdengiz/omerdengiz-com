---
sheet: "02"
order: 2
standalone: true
title: How this site is built
summary: >-
  A static Astro build served from a private S3 bucket through CloudFront,
  with URL rewriting and security headers at the edge and every resource
  declared in Terraform.
context: Self-directed · this site
stack:
  - Astro
  - AWS S3
  - CloudFront
  - ACM
  - Lambda@Edge
  - Route 53
  - Terraform
source: https://github.com/ofdengiz/omerdengiz-com
live: https://www.omerdengiz.com
cells:
  - label: Discipline
    value: Cloud · IaC
  - label: Origin
    value: Private S3
  - label: Edge
    value: Lambda@Edge
    accent: true
metrics:
  - value: "1"
    label: Edge function
    note: Two event associations
  - value: "6"
    label: Security headers
    note: Set at the edge
  - value: "0"
    label: Third-party origins
    note: Fonts self-hosted
    accent: true
notes:
  - title: The origin is not public
    body: >-
      The bucket blocks all public access. CloudFront reaches it through
      Origin Access Control, and the bucket policy admits requests only from
      this one distribution's ARN. Objects are versioned and encrypted at rest.
  - title: One function, two event associations
    body: >-
      The same Lambda@Edge handler runs on viewer-request to rewrite
      extensionless paths to their index documents, and on viewer-response to
      set security headers. Splitting it into two functions would double the
      deployment surface for no gain.
  - title: The CSP is verified at build time
    tone: annotate
    body: >-
      A Content-Security-Policy violation is invisible locally and only
      surfaces as a blocked resource in production. The build parses the
      policy out of the Lambda source and audits the generated HTML against
      it, so a violation fails the build instead of shipping. There is no
      second copy of the policy to fall out of sync.
revisions:
  - >-
    Move the Terraform state to S3 with locking. It is local today, which is
    fine for one operator and wrong for any number greater than one.
---

## The shape of it

Static files in a private S3 bucket, served through CloudFront over HTTP/2 and
HTTP/3 with an ACM certificate and TLS 1.2 as the minimum (see note 1). DNS is
in Route 53. Every resource, including the edge function, the certificate and
its validation records, is declared in Terraform.

## URLs at the edge

S3 serves objects, not routes. A request for `/projects/capstone` has no
matching object; the object is `/projects/capstone/index.html`.

A **Lambda@Edge** function on viewer-request rewrites directory-style and
extensionless paths to their index documents. The same function, on
viewer-response, sets HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy` and a strict Content-Security-Policy
(see note 2).

## Caching

Content-hashed assets are served with a one-year `immutable` cache and HTML
with `max-age=0, must-revalidate`, so a deploy shows on the next page load and
no unchanged asset is fetched twice.

The resume is the exception. It keeps a fixed address, `/resume.pdf`, so a
link pasted into an application stays valid, and it is served with a
five-minute TTL so an updated file appears almost immediately.

## Verifying what ships

The build fails on a CSP violation (see note 3). Fonts are self-hosted and
subset to Latin and Latin Extended, so the policy allows no third-party origin
at all.
