# omerdengiz.com

Personal portfolio site for **Omer Dengiz** — a static Astro build hosted on
AWS (S3 + CloudFront + ACM + Lambda@Edge) and provisioned entirely with
Terraform.

```
Browser  ──►  Route 53  ──►  CloudFront
                               │  Lambda@Edge  (pretty URLs + security headers)
                               │  ACM cert     (us-east-1, DNS-validated)
                               └─►  S3 bucket  (private, OAC)
```

The hosted zone and the domain registration deliberately live in the **same**
AWS account. They used to be split across two, until the account holding the
zone became unreachable and took DNS down with it while the registration sat
healthy and untouchable in the other one. The post-mortem is written up at
[/meta](https://www.omerdengiz.com/meta).

## Repository layout

```
.
├── src/                     # Astro source — the site is built from here
│   ├── pages/               # routes: /, /meta, /projects/[slug], /404
│   ├── layouts/             # Base, CaseStudy
│   ├── components/          # blueprint primitives, nav, content
│   ├── content/projects/    # case studies in Markdown (Zod-validated)
│   ├── data/                # profile, experience, skills, projects, topology
│   ├── styles/              # tokens, base, fonts, prose
│   └── assets/resume/       # canonical resume PDF (content-hashed at build)
├── public/                  # copied verbatim: og.png, docs, robots.txt
├── dist/                    # build output — this is what is uploaded (gitignored)
├── site-legacy/             # the previous hand-written site, retired 2026-08
├── lambda-edge/
│   └── index.js             # Lambda@Edge handler (viewer-request + viewer-response)
├── terraform/               # Infrastructure as Code
│   ├── versions.tf providers.tf variables.tf
│   ├── s3.tf acm.tf lambda.tf cloudfront.tf outputs.tf
│   └── terraform.tfvars.example
├── scripts/
│   ├── verify-csp.mjs       # audits dist/ against the live CSP; fails the build
│   └── emit-stable-assets.mjs  # stable /resume.pdf alongside the hashed copy
├── deploy.sh                # build → sync dist/ → S3 + invalidate CloudFront
└── README.md
```

---

## Prerequisites

| Tool              | Version                | Install                                      |
| ----------------- | ---------------------- | -------------------------------------------- |
| Terraform         | ≥ 1.6                  | already installed at `C:\terraform\terraform` |
| AWS CLI v2        | 2.x                    | already installed                            |
| Node.js (optional)| only if you edit edge  | —                                            |

One AWS CLI profile is required — the account that holds both the domain
registration and the hosted zone:

```powershell
aws configure --profile omerdengiz
```

Set the same name in `terraform.tfvars` as `aws_profile`.

---

## One-time setup (first deploy)

Everything lives in one account, so there is no manual cross-account
delegation step.

### Step 1 — Configure tfvars

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # set aws_profile
terraform init
```

### Step 2 — Apply

```bash
terraform apply
```

If the hosted zone already exists (for example because the domain was
registered through Route 53, which creates one), import it first so the
account does not end up with two:

```bash
terraform apply -target=aws_acm_certificate.site   # for_each needs the cert
terraform import aws_route53_zone.site <ZONE_ID>
terraform apply
```

### Step 3 — Point the registrar at the zone

Same account, so this is a CLI call rather than a console visit:

```bash
terraform output -json route53_name_servers
aws route53domains update-domain-nameservers --region us-east-1   --domain-name omerdengiz.com   --nameservers Name=<ns1> Name=<ns2> Name=<ns3> Name=<ns4>
```

Deleting and recreating a hosted zone always produces a **new** nameserver
set, so this must be repeated after any such rebuild.

### Step 4 — Upload the site

```bash
cd ..
./deploy.sh
```

---

## Day-to-day workflow

| Task                                    | Command                          |
| --------------------------------------- | -------------------------------- |
| Edit project copy                       | edit `src/content/projects/*.md` |
| Edit resume-derived data                | edit `src/data/*.ts`             |
| Preview locally                         | `npm run dev`                    |
| Build + verify CSP                      | `npm run build`                  |
| Deploy changes                          | `./deploy.sh`                    |
| Deploy a dry run (show changes only)    | `./deploy.sh --dry-run`          |
| Update infrastructure                   | `cd terraform && terraform apply`|
| Update Lambda@Edge                      | edit `lambda-edge/index.js` → `terraform apply` |
| Tear everything down                    | `cd terraform && terraform destroy` *(see note below)* |

---

## Updating the resume

The resume exists in two places that must never disagree: the PDF a recruiter
downloads, and the experience/skills text rendered on the site. Both are
derived from one source file.

```bash
# 1. Regenerate Omer_Dengiz_Resume.pdf from the .docx, then:
cp Omer_Dengiz_Resume.pdf src/assets/resume/

# 2. If any bullet or skill changed, mirror the exact wording into:
#      src/data/experience.ts   roles[].bullets, education
#      src/data/skills.ts       skillGroups[].items
#      src/data/profile.ts      summary

# 3. Build and deploy — this publishes all three URLs at once.
bash deploy.sh
```

That single deploy publishes:

| URL | Cache | Purpose |
| --- | --- | --- |
| `/assets/_/Omer_Dengiz_Resume.<hash>.pdf` | 1 year, immutable | what the site links to |
| `/resume.pdf` | 5 minutes | the stable URL to put in applications |
| `/assets/resume/Omer_Dengiz_Resume.pdf` | 5 minutes | legacy path, kept for links already sent |

The hash changes automatically when the file does, so there is no cache-bust
query to maintain. Verify the site and the PDF agree by extracting the text:

```bash
python -c "from pypdf import PdfReader; print('
'.join(p.extract_text() for p in PdfReader('Omer_Dengiz_Resume.pdf').pages))"
```

> **Lambda@Edge destroy caveat:** replicated Lambda@Edge functions take 1–3 hours to fully delete from CloudFront edge locations. `terraform destroy` may fail the first time on the Lambda — wait an hour and re-run.

---

## What this showcase demonstrates

For recruiters / hiring managers skimming the source:

- **Infrastructure as code that earned its keep** — the original hosting account became unreachable and took the hosted zone and distribution with it. Because the whole stack is Terraform, rebuilding it in the account holding the domain was a re-apply, not a reconstruction. See `src/content/projects/meta.md` for the DNS post-mortem.
- **S3 origin hardening** — bucket is private, public access blocked, CloudFront reaches it only via Origin Access Control (OAC), encrypted at rest, versioned.
- **CloudFront best practices** — HTTPS-only, TLS 1.2+, HTTP/2 and HTTP/3, custom 404, compression, AWS-managed cache policies.
- **Lambda@Edge** — single handler, two CloudFront events (viewer-request + viewer-response), pretty URL rewrites + CSP / HSTS / X-Frame-Options / Permissions-Policy headers.
- **ACM DNS validation across accounts** — cert issued in the hosting account, validated against DNS records in the domain account.
- **Terraform** — multi-provider (ca-central-1 + us-east-1 alias), default tags, archive-packaged Lambda, remote-backend-ready.
- **Deploy hygiene** — cache-control policy tuned per asset type, automatic invalidation, dry-run support.

---

## Addressing the "stale GitHub repo" perception

Old `last updated` dates on the existing `github.com/ofdengiz` repos may look
inactive to a recruiter. Three-part mitigation:

1. **This site is a new public repo.** Push `Resume_Web_Sitesi` to GitHub as
   `omerdengiz-com`. The repo (and contribution graph) will be fresh and
   contain Terraform, IaC, and edge compute — the exact stack the resume
   claims. Pin it on your GitHub profile.
2. **Project cards on this site deliberately do not show "last commit."**
   They highlight the technology and outcome instead, which is what actually
   matters to the reader.
3. **Consider a 20-minute pass through your older repos** to add a short
   "Archive note" to each README explaining the context and when the work
   was done. A refreshed README ≠ fake activity, but it reassures a reader
   that the work is genuine and you are still the maintainer.

---

## Troubleshooting

| Symptom                                             | Likely cause / fix                                            |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `terraform apply` stalls on `acm_certificate_validation` | NS delegation (Step 3) hasn't propagated yet. Wait, then `dig NS omerdengiz.com +short` to confirm the new name servers are live. |
| Site loads but `https://` shows a cert warning      | CloudFront is still deploying — wait 15–20 min after apply.   |
| `403 Forbidden` in browser                          | S3 OAC policy race during first deploy — re-run `./deploy.sh`. |
| Lambda@Edge changes don't take effect               | New version must be `publish = true` (it is). Also: CloudFront edge caches old lambda for up to 5 min; invalidate `/*`. |
| `terraform destroy` fails on Lambda                 | Replication lingers 1–3 hours; wait then re-run.              |

---

## Cost estimate

For a personal portfolio with low traffic:

- **S3**: a few cents / month
- **CloudFront**: free tier (1 TB out + 10M requests / month) covers this easily
- **ACM**: free
- **Lambda@Edge**: free for the first 1 M requests; this site won't come close
- **Route 53** (domain account): $0.50/month per hosted zone + $0.40 per million queries

Expected total: **< $1/month** while under free tier.

---

## License

Source code: MIT. Content (copy, resume, capstone report) © Omer Dengiz —
all rights reserved.
