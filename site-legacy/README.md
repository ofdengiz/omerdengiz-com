# site-legacy — the hand-written site, retired 2026-08-22

This is the site that ran at omerdengiz.com before the Astro rebuild. It is
kept for one release cycle as a rollback path, then deleted.

**Nothing here is deployed.** `deploy.sh` builds `dist/` from `src/`.

Binary assets (the technical report, the OG image, the resume PDF) have been
removed from this directory. They were byte-identical duplicates of files that
still live in `public/` and `src/assets/`, and carrying a second copy of an
8.7 MB PDF in a public repo is noise. `git checkout v1-legacy -- site` restores
them along with everything else.

## Rolling back

The tag `v1-legacy` marks the last commit where this tree was live.

```bash
git checkout v1-legacy -- site deploy.sh
bash deploy.sh --skip-build      # syncs site/ with the old cache rules
```

Then revert the Lambda@Edge policy too, because this markup loads Google Fonts
and the current CSP permits no third-party origins:

```bash
git checkout v1-legacy -- lambda-edge/index.js
cd terraform && terraform apply
```

Note that `v1-legacy` predates the July resume revision, so restoring it would
also restore the older resume PDF and its since-revised claims. Copy the
current `Omer_Dengiz_Resume.pdf` over `site/assets/resume/` before deploying.

## Why it was replaced

- Nav and footer markup was duplicated across six HTML files, so a one-line
  change meant six edits. The resume cache-bust query needed exactly that,
  three separate times.
- No focus styles, no skip link, no landmark labelling, and filter chips with
  no pressed state. Accessibility was well short of 100.
- A canvas particle animation ran `requestAnimationFrame` forever with an
  O(n²) neighbour loop — roughly 145,000 distance checks per second — and
  never paused when scrolled past or when the tab was hidden.
- A render-blocking stylesheet from a third-party font CDN.
- Dark theme forced on every visitor, with no `prefers-color-scheme` support.
