// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

/**
 * omerdengiz.com — Astro configuration
 *
 * Target: static files synced to S3, served through CloudFront, with a
 * Lambda@Edge viewer-request handler rewriting pretty URLs and a
 * viewer-response handler injecting a strict CSP.
 *
 * Three settings below are load-bearing for that deployment. See notes.
 */
export default defineConfig({
  // MIGRATION STATE (2026-09-23): temporarily www, not the apex.
  //
  // This value drives every canonical link, og:url and sitemap entry. The apex
  // currently fails at TLS because its CloudFront alias is still held by a
  // distribution in an unreachable AWS account, so pointing canonicals at it
  // would advertise a URL that cannot be loaded — to crawlers, to social
  // previews, and to anyone following a share link.
  //
  // Revert to 'https://omerdengiz.com' as soon as the apex alias is released.
  site: 'https://www.omerdengiz.com',

  // Fully static output — no SSR adapter, no server runtime.
  output: 'static',

  build: {
    // `directory` emits /meta/index.html rather than /meta.html.
    // This matches the Lambda@Edge viewer-request rewrites exactly:
    //   /meta   → /meta/index.html   (extensionless branch)
    //   /meta/  → /meta/index.html   (trailing-slash branch)
    // Switching to 'file' would break every subpage URL at the edge.
    format: 'directory',

    // Never inline <style> into the document. Two reasons:
    //   1. CSP hygiene — we want to drop 'unsafe-inline' from style-src later.
    //   2. Cache economics — external CSS is content-hashed and lands under
    //      the 1-year immutable rule in deploy.sh; inlined CSS would be
    //      re-downloaded with every HTML revalidation.
    inlineStylesheets: 'never',

    // Hashed bundles live under assets/_ so the existing deploy.sh rule
    //   aws s3 sync site/assets/ --cache-control "max-age=31536000, immutable"
    // covers them without modification. Content hashing also retires the
    // manual ?v=20260423d cache-bust hack permanently.
    assets: 'assets/_',
  },

  // Emit <link rel="canonical">-friendly URLs without a trailing slash
  // ambiguity. Lambda@Edge normalizes both forms, so 'ignore' is safe and
  // avoids Astro generating redirects a static origin cannot serve.
  trailingSlash: 'ignore',

  // Astro's dev toolbar injects inline scripts. Harmless locally (no CSP in
  // dev), but disabling keeps dev output closer to what ships.
  devToolbar: {
    enabled: false,
  },

  prefetch: {
    // Prefetch on hover only — no eager prefetching of every link.
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  vite: {
    build: {
      // Force every bundled script to a separate file. Without this, Astro
      // inlines small author <script> blocks straight into the HTML, which
      // the `script-src 'self'` CSP in lambda-edge/index.js blocks outright.
      assetsInlineLimit: 0,

      // One stylesheet instead of one per component. Code-splitting CSS is
      // usually the right default, but here it produced 5-8 separate
      // render-blocking requests per page for a total under 50 KB — the
      // round trips cost far more than the bytes saved by splitting. A single
      // file is also cached once across the whole site rather than
      // re-fetched per route.
      cssCodeSplit: false,
    },
  },

  integrations: [
    sitemap({
      // The styleguide is an internal design-system reference, not content.
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
});