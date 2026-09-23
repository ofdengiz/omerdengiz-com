#!/usr/bin/env node
/**
 * emit-stable-assets.mjs: publish the resume at stable URLs as well as the
 * content-hashed one.
 *
 * WHY
 * ---
 * The build imports the resume through Vite, so the site's own links point at
 * a content-hashed filename. That is correct for caching: a new resume is a
 * new URL, so `immutable` is true rather than a lie, and no manual cache-bust
 * is needed.
 *
 * It is wrong for sharing. A hashed URL changes every time the file changes,
 * so a link pasted into a job application breaks the next time the resume is
 * updated, silently and at the worst possible moment.
 *
 * So the same bytes are also written to two stable paths:
 *
 *   /resume.pdf                              the short URL to hand out
 *   /assets/resume/Omer_Dengiz_Resume.pdf    the path the previous site used,
 *                                            preserved because it may already
 *                                            be sitting in submitted
 *                                            applications
 *
 * These are served with a short TTL by deploy.sh, never `immutable`, precisely
 * because their contents can change under a fixed name.
 *
 * Run after `astro build`, before the CSP check.
 */

import { copyFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'src', 'assets', 'resume', 'Omer_Dengiz_Resume.pdf');
const DIST = join(ROOT, 'dist');

const TARGETS = [
  'resume.pdf',
  join('assets', 'resume', 'Omer_Dengiz_Resume.pdf'),
];

if (!existsSync(SOURCE)) {
  console.error(`\n  emit-stable-assets: source not found\n    ${SOURCE}\n`);
  process.exit(1);
}

if (!existsSync(DIST)) {
  console.error('\n  emit-stable-assets: dist/ not found. Run astro build first\n');
  process.exit(1);
}

const size = statSync(SOURCE).size;
console.log('\nStable asset aliases');
console.log('─'.repeat(64));

for (const rel of TARGETS) {
  const dest = join(DIST, rel);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(SOURCE, dest);
  console.log(`  /${rel.replace(/\\/g, '/').padEnd(44)} ${(size / 1024).toFixed(0)} KB`);
}

console.log('─'.repeat(64));
console.log('  Short TTL by deploy.sh: never immutable, since the name is fixed.\n');
