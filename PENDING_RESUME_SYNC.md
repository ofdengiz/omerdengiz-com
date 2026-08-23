# Pending resume sync

**Opened:** 2026-08-22 · **Owner:** Omer · **Closes when:** the source `.docx`
is updated and a new PDF is deployed.

The website and the resume PDF currently describe the same two Interac
responsibilities in different words. This is a known, deliberate, temporary
state — not drift. It is tracked here so it cannot be quietly forgotten.

## What differs

| | Deployed PDF (rev 2026-07-12) | Website (`src/data/experience.ts`) |
|---|---|---|
| Bullet 1 | "Wrote a Python script that pulled current device inventory data from vendor portals via their public API, and built a small test harness to validate the team's API key and response schema **as a first step toward automating** a manual inventory task." | "**Automated** device inventory data extraction from vendor APIs using Python, establishing a validation harness for API credentials and response schema that **eliminated manual tracking effort**." |
| Bullet 2 | "**Shadowed** senior network engineers on ServiceNow incident and change tickets and updated internal wiki and runbook pages…" | "**Collaborated with** senior network engineers to manage ServiceNow incident and change tickets, and **rewrote** internal wiki runbooks…" |

## The one line worth a second look

Bullet 1 moved from *"a first step toward automating a manual inventory task"*
to *"eliminated manual tracking effort."* Those are different claims, not just
different phrasing.

If the script was merged and the team genuinely stopped tracking inventory by
hand, the new wording is accurate and the July PDF was simply undersold. If it
was a proof of concept that did not reach production, an interviewer asking
*"so the manual process is gone now?"* has a sharp follow-up and the honest
answer undercuts the bullet.

A middle wording that stays strong without the exposure:

> Automated device inventory data extraction from vendor APIs using Python,
> with a validation harness for API credentials and response schema that
> **replaced a manual data-gathering step** in the team's inventory workflow.

Bullet 2 needs no such caution — "collaborated with" and "rewrote" describe the
same work as "shadowed" and "updated", just without the self-deprecation.

## To close this out

1. Edit `Omer_Dengiz_Resume.docx` so both bullets match the website.
2. Regenerate the PDF and refresh both copies:
   ```bash
   python scripts/update_resume.py          # if the script still applies
   cp Omer_Dengiz_Resume.pdf src/assets/resume/       # Astro build (hashed)
   cp Omer_Dengiz_Resume.pdf site/assets/resume/      # legacy live tree
   ```
3. Bump the legacy cache-bust query (`?v=`) in `site/**/*.html`, then
   `bash deploy.sh`. After the Phase 7 cutover this step disappears — the
   Astro build hashes the filename automatically.
4. Delete this file.
