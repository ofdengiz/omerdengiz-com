#!/usr/bin/env node
/**
 * verify-csp.mjs — check the built site against the CSP we actually serve.
 *
 * The Content-Security-Policy lives in lambda-edge/index.js and is applied by
 * CloudFront at viewer-response time, which means a violation is invisible
 * locally and only shows up as a blocked resource in production. This script
 * closes that gap: it reads the policy from the Lambda source (single source
 * of truth, no duplicated copy to drift) and audits every built HTML file.
 *
 * Usage:  node scripts/verify-csp.mjs [distDir]
 * Exit:   0 = clean, 1 = violations found
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// resolve() (not join()) so an absolute path argument is honoured as-is.
const DIST = process.argv[2] ? resolve(ROOT, process.argv[2]) : join(ROOT, 'dist');
const LAMBDA = join(ROOT, 'lambda-edge', 'index.js');

/* -- 1. Extract the live CSP from the Lambda@Edge source ------------------- */

/**
 * The site's own origin. `'self'` in a CSP resolves to the document origin, so
 * absolute URLs pointing at our own host are permitted even though the literal
 * origin never appears in the policy text. Read from astro.config.mjs so this
 * stays correct if the domain ever changes.
 */
function readSelfOrigin() {
  try {
    const cfg = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf8');
    const m = cfg.match(/site\s*:\s*['"]([^'"]+)['"]/);
    return m ? new URL(m[1]).origin : null;
  } catch {
    return null;
  }
}

function readPolicy() {
  const src = readFileSync(LAMBDA, 'utf8');
  const block = src.match(/setHeader\(\s*headers,\s*'Content-Security-Policy',\s*\[([\s\S]*?)\]/);
  if (!block) throw new Error('Could not find the CSP array in lambda-edge/index.js');

  const directives = {};
  for (const m of block[1].matchAll(/"([^"]+)"/g)) {
    const [name, ...values] = m[1].trim().split(/\s+/);
    directives[name] = values;
  }
  return directives;
}

/* -- 2. Walk the built HTML ------------------------------------------------ */

function htmlFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, acc);
    else if (entry.endsWith('.html')) acc.push(full);
  }
  return acc;
}

/* -- 3. Audit rules -------------------------------------------------------- */

/**
 * Only elements that actually FETCH a subresource are governed by CSP fetch
 * directives. An <a href> is navigation — CSP does not restrict where a link
 * points, and flagging one is a false positive. <base href> is governed by
 * base-uri and <form action> by form-action, both checked separately.
 */
const SUBRESOURCE_TAGS = [
  ['script', 'src'],
  ['link', 'href'],
  ['img', 'src'],
  ['iframe', 'src'],
  ['frame', 'src'],
  ['embed', 'src'],
  ['object', 'data'],
  ['source', 'src'],
  ['track', 'src'],
  ['video', 'src'],
  ['audio', 'src'],
  ['use', 'href'],
];

function audit(file, html, policy) {
  const findings = [];
  const allows = (directive, token) => (policy[directive] || []).includes(token);

  // Inline <script> with a body (ignores src-only tags and JSON-LD).
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [, attrs, body] = m;
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue;
    if (!body.trim()) continue;
    if (!allows('script-src', "'unsafe-inline'")) {
      findings.push({
        rule: 'script-src',
        detail: `inline <script> (${body.trim().length} chars) — blocked, needs an external file or a hash`,
        sample: body.trim().slice(0, 70).replace(/\s+/g, ' '),
      });
    }
  }

  // Inline <style> blocks.
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (!m[1].trim()) continue;
    if (!allows('style-src', "'unsafe-inline'")) {
      findings.push({
        rule: 'style-src',
        detail: `inline <style> (${m[1].trim().length} chars) — blocked`,
        sample: m[1].trim().slice(0, 70).replace(/\s+/g, ' '),
      });
    }
  }

  // Inline event handlers (onclick=, onload=, ...) always require 'unsafe-inline'.
  for (const m of html.matchAll(/\son([a-z]+)\s*=\s*["'][^"']+["']/gi)) {
    if (!allows('script-src', "'unsafe-inline'")) {
      findings.push({
        rule: 'script-src',
        detail: `inline event handler on${m[1]}= — blocked`,
        sample: m[0].trim().slice(0, 70),
      });
    }
  }

  // style="..." attributes are governed by style-src-attr / 'unsafe-inline'.
  const styleAttrs = [...html.matchAll(/\sstyle\s*=\s*["'][^"']+["']/gi)];
  if (styleAttrs.length && !allows('style-src', "'unsafe-inline'")) {
    findings.push({
      rule: 'style-src',
      detail: `${styleAttrs.length} inline style="" attribute(s) — blocked`,
      sample: styleAttrs[0][0].trim().slice(0, 70),
    });
  }

  // Third-party origins loaded as subresources must appear in some directive.
  // Our own origin counts as 'self'.
  const permitted = new Set(Object.values(policy).flat().filter((v) => v.startsWith('http')));
  if (SELF_ORIGIN) permitted.add(SELF_ORIGIN);

  for (const [tag, attr] of SUBRESOURCE_TAGS) {
    const re = new RegExp(`<${tag}\\b[^>]*?\\b${attr}\\s*=\\s*["'](https?://[^"'/]+)`, 'gi');
    for (const m of html.matchAll(re)) {
      const origin = m[1];
      if (![...permitted].some((p) => origin.startsWith(p))) {
        findings.push({
          rule: 'external-host',
          detail: `<${tag} ${attr}> loads from ${origin}, not allowed by any directive`,
          sample: m[0].slice(0, 70),
        });
      }
    }
  }

  // <form action> is governed by form-action.
  for (const m of html.matchAll(/<form\b[^>]*?\baction\s*=\s*["'](https?:\/\/[^"'/]+)/gi)) {
    if (![...permitted].some((p) => m[1].startsWith(p))) {
      findings.push({
        rule: 'form-action',
        detail: `form submits to ${m[1]}, not allowed by form-action`,
        sample: m[0].slice(0, 70),
      });
    }
  }

  return findings.map((f) => ({ ...f, file: relative(DIST, file).replace(/\\/g, '/') }));
}

/* -- 4. Report ------------------------------------------------------------- */

const SELF_ORIGIN = readSelfOrigin();
const policy = readPolicy();
const files = htmlFiles(DIST);
const all = files.flatMap((f) => audit(f, readFileSync(f, 'utf8'), policy));

console.log('\nCSP verification — policy read from lambda-edge/index.js');
console.log('─'.repeat(64));
for (const [name, values] of Object.entries(policy)) {
  console.log(`  ${name.padEnd(22)} ${values.join(' ') || '(no value)'}`);
}
console.log('─'.repeat(64));
if (SELF_ORIGIN) console.log(`  'self' resolves to     ${SELF_ORIGIN}`);
console.log(`  ${files.length} HTML file(s) audited in ${relative(ROOT, DIST).replace(/\\/g, '/')}/\n`);

if (!all.length) {
  console.log('  PASS — no CSP violations found.\n');
  process.exit(0);
}

const byRule = all.reduce((acc, f) => ((acc[f.rule] ??= []).push(f), acc), {});
for (const [rule, items] of Object.entries(byRule)) {
  console.log(`  ${rule} — ${items.length} violation(s)`);
  for (const i of items) {
    console.log(`    ${i.file}`);
    console.log(`      ${i.detail}`);
    console.log(`      > ${i.sample}`);
  }
  console.log('');
}
console.log(`  FAIL — ${all.length} violation(s).\n`);
process.exit(1);
