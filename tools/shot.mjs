#!/usr/bin/env node
// 截圖與報錯檢查。Usage: node tools/shot.mjs [baseUrl] [outDir]
// Browser tooling lives only in ~/.cache/oneness-work, never in this repository.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(path.join(os.homedir(), '.cache/oneness-work/'));
let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  console.error('Install playwright-core in ~/.cache/oneness-work before running this script.');
  process.exit(1);
}

const baseUrl = new URL(process.argv[2] || 'http://localhost:8765/');
if (!baseUrl.pathname.endsWith('/')) baseUrl.pathname += '/';
const outDir = path.resolve(process.argv[3] || './shots');
const cacheDir = path.join(os.homedir(), 'Library/Caches/ms-playwright');

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

async function executablePath() {
  const shells = (await fs.readdir(cacheDir)).filter(name => /^chromium_headless_shell-\d+$/.test(name))
    .sort((a, b) => Number(b.split('-').at(-1)) - Number(a.split('-').at(-1)));
  for (const shell of shells) {
    const binary = await findBinary(path.join(cacheDir, shell));
    if (binary) return binary;
  }
  throw new Error(`No chrome-headless-shell binary found under ${cacheDir}`);
}

const configurations = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: 'dark', viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
  { name: 'reduced', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
];

const issues = [];
let shots = 0;

async function capture(page, name) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
  shots += 1;
}

async function stir(page, touch) {
  const { width, height } = page.viewportSize();
  if (touch) {
    for (const [fx, fy] of [[0.3, 0.3], [0.6, 0.5], [0.45, 0.7]]) {
      await page.touchscreen.tap(width * fx, height * fy);
      await page.waitForTimeout(250);
    }
    return;
  }
  await page.mouse.move(width * 0.2, height * 0.3);
  for (let step = 0; step <= 30; step += 1) {
    await page.mouse.move(width * (0.2 + step * 0.02), height * (0.3 + Math.sin(step / 4) * 0.2));
    await page.waitForTimeout(25);
  }
}

async function clickWord(page) {
  const point = await page.evaluate(() => {
    for (const word of document.querySelectorAll('.water .w')) {
      const box = word.getBoundingClientRect();
      if (Number(getComputedStyle(word).opacity) > 0.5 && box.left > 20 && box.right < innerWidth - 20
        && box.top > 20 && box.bottom < innerHeight - 60) return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    }
    return null;
  });
  if (!point) throw new Error('no visible word to click');
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(800);
}

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: await executablePath() });
try {
  for (const { name, ...options } of configurations) {
    const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference', ...options });
    const page = await context.newPage();
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) issues.push(`[${name}] console.${message.type()}: ${message.text()}`); });
    page.on('pageerror', error => issues.push(`[${name}] pageerror: ${error.message}`));
    page.on('requestfailed', request => issues.push(`[${name}] requestfailed: ${request.url().slice(0, 120)} ${request.failure()?.errorText}`));
    page.on('response', response => { if (response.status() >= 400) issues.push(`[${name}] HTTP ${response.status()}: ${response.url()}`); });
    await page.goto(baseUrl.href, { waitUntil: 'networkidle' });
    if (name !== 'reduced') {
      await page.waitForTimeout(500);
      await capture(page, `${name}-0-enter`);
      await page.waitForTimeout(3500);
      await capture(page, `${name}-1-arrive`);
    }
    await page.waitForTimeout(name === 'reduced' ? 2000 : 9000);
    await capture(page, `${name}-2-still`);
    if (name !== 'reduced') {
      await stir(page, options.hasTouch);
      await capture(page, `${name}-3-stirred`);
    }
    await clickWord(page);
    await capture(page, `${name}-4-card`);
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.querySelector('#below').scrollIntoView());
    await page.waitForTimeout(600);
    await capture(page, `${name}-5-below`);
    await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => issues.push(`[sources] pageerror: ${error.message}`));
  await page.goto(new URL('sources.html', baseUrl).href, { waitUntil: 'networkidle' });
  await capture(page, 'sources');
} finally {
  await browser.close();
}

console.log(`Screenshots: ${shots} → ${outDir}`);
console.log(`Issues: ${issues.length}`);
for (const issue of issues) console.log(`  ${issue}`);
process.exit(issues.some(issue => /console.error|pageerror/.test(issue)) ? 1 : 0);
