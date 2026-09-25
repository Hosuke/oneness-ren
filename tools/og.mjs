#!/usr/bin/env node
// Renders assets/og.png (1200×630) from the still hero. Usage: node tools/og.mjs [baseUrl]
// Browser tooling lives only in ~/.cache/oneness-work, never in this repository.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(path.join(os.homedir(), '.cache/oneness-work/'));
const { chromium } = require('playwright-core');
const baseUrl = process.argv[2] || 'http://localhost:8765/';
const cacheDir = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '../assets/og.png');

async function findBinary(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isFile() && entry.name === 'chrome-headless-shell') return candidate;
    if (entry.isDirectory()) {
      const nested = await findBinary(candidate);
      if (nested) return nested;
    }
  }
  return null;
}

const shells = (await fs.readdir(cacheDir)).filter(name => /^chromium_headless_shell-\d+$/.test(name))
  .sort((a, b) => Number(b.split('-').at(-1)) - Number(a.split('-').at(-1)));
let executablePath = null;
for (const shell of shells) if ((executablePath = await findBinary(path.join(cacheDir, shell)))) break;

if (!executablePath) throw new Error(`No chrome-headless-shell under ${cacheDir}`);
const browser = await chromium.launch({ executablePath });
try {
  // The still layout is deterministic: no half-risen words in the preview.
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.scene-hint, .motion-toggle { visibility: hidden; }' });
  await page.waitForTimeout(1500);
  await page.locator('#hero').screenshot({ path: out });
} finally {
  await browser.close();
}
console.log(`wrote ${out} (${(await fs.stat(out)).size} bytes)`);
