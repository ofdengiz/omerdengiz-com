# omerdengiz.com

Personal portfolio site for **Omer Dengiz** — a static site hosted on AWS
(S3 + CloudFront + ACM + Lambda@Edge), provisioned with Terraform, and fronted
by a Route 53 hosted zone that lives in a *separate* AWS account from the
hosting infrastructure.

```
Browser  ──►  Route 53 (domain account)       ──►  CloudFront (hosting account)
                                                     │  Lambda@Edge  (pretty URLs + security headers)
                                                     │  ACM cert     (us-east-1, DNS-validated)
                                                     └─►  S3 bucket (private, OAC)
```

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

Two AWS CLI profiles are required:

1. **`omerdengiz-hosting`** — the account where the site infrastructure will live.
2. **`omerdengiz-domain`** — the account that owns `omerdengiz.com` and its Route 53 hosted zone. *Used only for manual DNS steps; Terraform never touches it.*

Configure them:

```powershell
aws configure --profile omerdengiz-hosting
aws configure --profile omerdengiz-domain
```

---

## One-time setup (first deploy)

Strategy A: Route 53 hosted zone lives in the **hosting account** (fully managed
by Terraform). The **domain account** is only touched once, at the registrar
level, to delegate the name servers.

### Step 1 — Configure tfvars

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

If you're already logged in as the hosting account via `aws configure`, you can
**delete** the `aws_profile` line. Otherwise set it to your profile name.

### Step 2 — Create the hosted zone first, get the NS

Because the registrar delegation is the blocking step, create the zone alone
first so you can grab its 4 NS values:

```bash
terraform init
terraform apply -target=aws_route53_zone.site
terraform output route53_name_servers
```

You will see something like:

```
route53_name_servers = tolist([
  "ns-123.awsdns-15.com",
  "ns-456.awsdns-57.net",
  "ns-789.awsdns-33.org",
  "ns-012.awsdns-41.co.uk",
])
```

### Step 3 — 🔧 MANUAL: delegate DNS at the domain registrar

Sign into the **domain account** (the one that has `omerdengiz.com` registered):

1. Route 53 → **Registered domains** → `omerdengiz.com` → **Edit name servers**
2. Replace the existing 4 name servers with the 4 values from Step 2
3. Save

Propagation is usually 5–30 minutes. You can verify with:

```bash
dig NS omerdengiz.com +short
# or on Windows PowerShell:
#   Resolve-DnsName omerdengiz.com -Type NS
```

Once the new name servers show up, the **old hosted zone in the domain account
is dormant** — you can delete it (or leave it; it costs ~$0.50/month).

### Step 4 — Full apply

```bash
terraform apply
```

This will:
1. Issue the ACM certificate (validated automatically via the Route 53 zone).
2. Create the Lambda@Edge function and S3 bucket.
3. Deploy the CloudFront distribution.
4. Wire up the ALIAS records (apex + www).

Total time: ~10–20 minutes, mostly CloudFront propagation.

### Step 5 — Upload the site

```bash
cd ..
chmod +x deploy.sh
./deploy.sh
```

Visit **https://omerdengiz.com** 🎉

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

- **Cross-account AWS architecture** — Route 53 in one account, hosting infrastructure in another, wired up cleanly.
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
