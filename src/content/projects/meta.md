---
sheet: "02"
order: 2
standalone: true
title: How this site is built
summary: >-
  A static build on S3 behind CloudFront, with pretty URLs and security
  headers injected at the edge, provisioned entirely in Terraform, and
  rebuilt in a different account after the original one became unreachable.
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
  - label: Accounts
    value: One
  - label: Edge
    value: Lambda@Edge
    accent: true
metrics:
  - value: "1"
    label: AWS account
    note: DNS and hosting together, deliberately
  - value: "1"
    label: Edge function
    note: Two event associations
  - value: "0"
    label: Third-party origins
    note: Fonts self-hosted
    accent: true
notes:
  - title: DNS and hosting share an account, after learning why
    body: >-
      The zone originally sat in a different account from the bucket and
      distribution, to exercise a cross-account delegation boundary. That
      boundary became the failure: when the hosting account went out of reach
      it took the hosted zone with it, while the .com delegation kept pointing
      at nameservers that now answered REFUSED. Every resolver returned
      SERVFAIL and the site was unreachable, while the domain registration was
      itself perfectly healthy in the account still accessible. Keeping the
      zone with the registration means an account-level problem can no longer
      separate them.
  - title: CloudFront reserves alias names across all accounts
    tone: annotate
    body: >-
      Rebuilding in the new account failed with CNAMEAlreadyExists. A
      suspended account keeps its resources, so the old distribution still
      held the names. The www alias moved across by publishing a TXT record
      proving control of the domain; the apex could not, because its
      verification record would have to be a sibling of the zone rather than
      a child, and no zone we control can publish it.
  - title: One function, two event associations
    body: >-
      The same Lambda@Edge handler runs on viewer-request to rewrite
      extensionless paths to their index documents, and on viewer-response to
      inject security headers. Splitting it into two functions would double
      the deployment surface for no gain.
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

Static files in S3, served through CloudFront with an ACM certificate, fronted
by a Route 53 hosted zone that now sits in the **same account as the domain
registration** (see note 1). Everything is declared in Terraform, which is what
made rebuilding the whole stack in a different account a short exercise rather
than a long one.

None of this is necessary for a site this size, which is what makes it a
useful thing to have built. The interesting parts are the joints:
DNS delegation, edge behaviour, cache semantics, and what happens when one of
them breaks (see note 2).

## Pretty URLs at the edge

S3 static hosting serves objects, not routes. A request for `/projects/capstone`
has no matching object; the object is `/projects/capstone/index.html`.

A **Lambda@Edge** function on viewer-request rewrites directory-style and
extensionless paths to their index documents. The same function, on
viewer-response, sets HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
referrer policy, and a strict Content-Security-Policy (see note 4).

## Caching

Assets are served with a one-year `immutable` cache and HTML with
`max-age=0, must-revalidate`. The resume PDF fits neither rule. It changes
under a fixed name, and browsers honour `immutable` by not revalidating at
all, so an updated file stayed behind a stale copy until a version query was
edited into five HTML files by hand.

Content hashing removed that manual step and introduced a worse problem. A
hashed filename makes a new file a new URL, so the old object stops existing
and any page still open from before a deploy gets a 404 on the download.
Hashing is correct for what a page loads and wrong for what a person clicks.

The resume is served from a stable `/resume.pdf` with a five minute TTL. An
updated file appears almost immediately, and a URL pasted into a job
application keeps working.

## Verifying what ships

The build fails on a CSP violation rather than deferring the discovery to
production (see note 4). Fonts are self-hosted and subset to Latin and Latin
Extended, which removes the last third-party origin from the critical path and
lets the policy drop the font CDN entirely.
