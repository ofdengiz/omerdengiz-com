# Pending resume sync

**Opened:** 2026-08-22 · **Owner:** Omer · **Closes when:** the source `.docx`
is updated and a new PDF is deployed.

The website and the resume PDF describe the same two Interac responsibilities
in different words. This is a known, deliberate, temporary state — not drift.
It is tracked here so it cannot be quietly forgotten.

## What differs

| | Deployed PDF (rev 2026-07-12) | Website (`src/data/experience.ts`) |
|---|---|---|
| Bullet 1 | "Wrote a Python script that pulled current device inventory data from vendor portals via their public API, and built a small test harness to validate the team's API key and response schema as a first step toward automating a manual inventory task." | "Developed a **Python-based Proof of Concept** to automate device inventory extraction from vendor APIs, establishing a validation schema that **paved the way for replacing** manual tracking." |
| Bullet 2 | "**Shadowed** senior network engineers on ServiceNow incident and change tickets and updated internal wiki and runbook pages…" | "**Collaborated with** senior network engineers to manage ServiceNow incident and change tickets, and **rewrote** internal wiki runbooks…" |

## Claim check — resolved 2026-08-22

An earlier draft of bullet 1 read *"eliminated manual tracking effort."*
Confirmed with Omer that the script was a **Proof of Concept that paved the
way**, not the removal of the manual process, so that wording was rejected
before it shipped.

The current wording is defensible end to end:

- *"Proof of Concept"* — states the maturity level up front, so the follow-up
  question "did it go to production?" has no sting.
- *"establishing a validation schema"* — a concrete artefact that was built.
- *"paved the way for replacing manual tracking"* — describes direction of
  travel, not a completed outcome.

Bullet 2 needed no such caution: "collaborated with" and "rewrote" describe the
same work as "shadowed" and "updated", without the self-deprecation.

## To close this out

1. Edit `Omer_Dengiz_Resume.docx` so both bullets match the website.
2. Regenerate the PDF and refresh both copies:
   ```bash
   cp Omer_Dengiz_Resume.pdf src/assets/resume/       # Astro build (hashed)
   cp Omer_Dengiz_Resume.pdf site/assets/resume/      # legacy live tree
   ```
3. Bump the legacy cache-bust query (`?v=`) in `site/**/*.html`, then
   `bash deploy.sh`. After the Phase 7 cutover this step disappears — the
   Astro build hashes the filename automatically.
4. Delete this file.
