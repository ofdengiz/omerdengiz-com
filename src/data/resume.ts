/**
 * resume.ts — the resume asset, resolved once.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The legacy site linked the PDF as a literal path and appended a manual
 * cache-bust query (`?v=20260423d`) because deploy.sh serves everything under
 * /assets/ with `Cache-Control: public, max-age=31536000, immutable`. Browsers
 * honour `immutable` by not even revalidating, so an updated resume stayed
 * invisible until the query string was bumped by hand — across five HTML files,
 * every single time.
 *
 * Importing the PDF from src/ (rather than dropping it in public/) hands it to
 * Vite, which emits it with a content hash in the filename. A new PDF produces
 * a new URL automatically, so `immutable` becomes *true* instead of a lie, and
 * the manual query string is gone permanently.
 *
 * IMPORTANT: files in public/ are copied verbatim and are NOT hashed. Moving
 * this PDF to public/ would silently reintroduce the original bug.
 *
 * The `?url` suffix tells Vite to emit the file and give us its final URL
 * rather than trying to parse the bytes.
 */
import resumeHashedUrl from '../assets/resume/Omer_Dengiz_Resume.pdf?url';

export const resume = {
  /** Content-hashed, cache-immutable URL. Use for every on-site link. */
  href: resumeHashedUrl,

  /**
   * Filename presented to the reader when they save it. Kept human-readable
   * on purpose — the hashed name is a caching detail and should never be what
   * lands on a recruiter's desktop.
   */
  filename: 'Omer_Dengiz_Resume.pdf',

  /** Shown next to the link so the reader knows what they are about to open. */
  format: 'PDF',

  /** Bump when the resume content materially changes. Displayed, so keep honest. */
  revised: 'Apr 2026',
} as const;
