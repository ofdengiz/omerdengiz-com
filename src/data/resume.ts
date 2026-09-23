/**
 * resume.ts: the resume asset, resolved once.
 *
 * WHY THE STABLE URL AND NOT A HASHED ONE
 * ---------------------------------------
 * The original problem was that deploy.sh served everything under /assets/
 * with `Cache-Control: immutable`, and browsers honour that by not
 * revalidating at all, so an updated resume stayed invisible behind a stale
 * copy until a `?v=` query was bumped by hand across five HTML files.
 *
 * The first fix was to import the PDF through Vite so it shipped with a
 * content hash: a new resume produced a new URL, and `immutable` became true
 * rather than a lie. That worked, and then failed in a way worth recording.
 *
 * Content hashing is right for what a *page loads*: stylesheets, scripts,
 * fonts. It is wrong for what a *person clicks*. When the resume changed, the
 * old hashed object stopped existing, and every already-open page still
 * pointed at it; the download button answered 404 and the browser reported
 * "file wasn't available on site". A download link has no cache benefit to
 * gain from hashing and inherits all of its fragility.
 *
 * So the link now uses the stable path, which deploy.sh serves with a five
 * minute TTL. Short enough that an updated resume appears almost immediately,
 * stable enough that a link never dies, including the copies pasted into job
 * applications, which is the same reason the alias exists at all.
 *
 * The file is emitted by scripts/emit-stable-assets.mjs during the build.
 * Note that putting it in public/ instead would NOT work: files there are
 * copied verbatim and served under the same rules, but the legacy
 * /assets/resume/ path has to be written too, and only the script does both
 * from a single source file.
 */

export const resume = {
  /**
   * Stable, short-TTL URL. Safe to link from a page that may sit open across
   * a deploy, and safe to paste into an application.
   */
  href: '/resume.pdf',

  /**
   * Filename presented to the reader when they save it. The `download`
   * attribute in ResumeLink pins this, so the saved file is never named
   * after a deployment detail.
   */
  filename: 'Omer_Dengiz_Resume.pdf',

  /** Shown next to the link so the reader knows what they are about to open. */
  format: 'PDF',

  /** Bump when the resume content materially changes. Displayed, so keep honest. */
  revised: 'Sep 2026',
} as const;
