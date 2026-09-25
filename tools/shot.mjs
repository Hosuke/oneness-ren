#!/usr/bin/env node
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
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
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
  const available = (await fs.readdir(cacheDir))
    .filter(name => /^chromium_headless_shell-\d+$/.test(name))
    .sort((a, b) => Number(b.split('-').at(-1)) - Number(a.split('-').at(-1)));
  const candidates = ['chromium_headless_shell-1228', ...available.filter(name => name !== 'chromium_headless_shell-1228')];
  for (const candidate of candidates) {
    try {
      const binary = await findBinary(path.join(cacheDir, candidate));
      if (binary) return binary;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  throw new Error(`No chrome-headless-shell binary found under ${cacheDir}`);
}

const issues = { consoleErrors: [], consoleWarnings: [], pageErrors: [], failedRequests: [], badResponses: [] };
const totals = [];
let screenshotCount = 0;

function collect(page, name) {
  page.on('console', message => {
    const item = `[${name}] ${message.text()}`;
    if (message.type() === 'error') issues.consoleErrors.push(item);
    if (message.type() === 'warning') issues.consoleWarnings.push(item);
  });
  page.on('pageerror', error => issues.pageErrors.push(`[${name}] ${error.message}`));
  page.on('requestfailed', request => issues.failedRequests.push(`[${name}] ${request.url()} — ${request.failure()?.errorText}`));
  page.on('response', response => {
    if (response.status() >= 400) issues.badResponses.push(`[${name}] ${response.status()} ${response.url()}`);
  });
}

async function capture(page, filename) {
  await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
  screenshotCount += 1;
}

async function loadPage(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.evaluate(async () => {
    await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 15000))]);
  });
}

async function firstVisibleWord(page) {
  return page.locator('#hero .w').evaluateAll(words => {
    for (const word of words) {
      const box = word.getBoundingClientRect();
      const style = getComputedStyle(word);
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      if (box.width > 0 && box.height > 0 && Number(style.opacity) > 0.1 &&
          style.visibility !== 'hidden' && x > 12 && x < innerWidth - 12 && y > 12 && y < innerHeight - 12 &&
          document.elementFromPoint(x, y)?.closest('.w') === word) return { x, y };
    }
    return null;
  });
}

async function tapEmptySpot(page) {
  const point = await page.evaluate(() => {
    for (const [fx, fy] of [[0.5, 0.5], [0.62, 0.46], [0.4, 0.38], [0.75, 0.3]]) {
      const x = innerWidth * fx;
      const y = innerHeight * fy;
      if (!document.elementFromPoint(x, y)?.closest('.w, button, a')) return { x, y };
    }
    return { x: 8, y: 8 };
  });
  await page.touchscreen.tap(point.x, point.y);
}

async function sectionMiddle(page, id) {
  await page.locator(id).evaluate(section => {
    const visual = section.querySelector('.chapter-visual');
    const box = (visual || section).getBoundingClientRect();
    // Chapter progress is .5 when the visual's top reaches 40% of the viewport.
    // A short closing section instead uses its own geometric middle.
    const offset = visual ? box.top - innerHeight * 0.4 : box.top + box.height / 2 - innerHeight / 2;
    window.scrollTo({ top: scrollY + offset, behavior: 'instant' });
  });
  await page.waitForTimeout(1500);
}

const configurations = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: 'dark', viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
  { name: 'reduced-motion', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
];

await fs.mkdir(outDir, { recursive: true });
let browser;
let runError;
try {
  const binary = await executablePath();
  browser = await chromium.launch({ executablePath: binary, headless: true });
  console.log(`Browser: ${binary}`);
  for (const { name, ...options } of configurations) {
    const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference', ...options });
    const page = await context.newPage();
    collect(page, name);
    await loadPage(page, baseUrl.href);
    await page.waitForTimeout(7000);
    await capture(page, `${name}-hero.png`);
    if (options.hasTouch) await tapEmptySpot(page);
    else await page.mouse.move(options.viewport.width / 2, options.viewport.height / 2);
    await page.waitForTimeout(3000);
    await capture(page, `${name}-hero-pointer.png`);

    let word = await firstVisibleWord(page);
    for (let attempt = 0; !word && attempt < 5; attempt += 1) {
      await page.waitForTimeout(1000);
      word = await firstVisibleWord(page);
    }
    if (!word) throw new Error(`[${name}] No visible, clickable hero word after intro.`);
    if (options.hasTouch) await page.touchscreen.tap(word.x, word.y);
    else await page.mouse.click(word.x, word.y);
    await page.locator('#word-dialog').waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(600);
    await capture(page, `${name}-card.png`);
    await page.locator('#word-dialog [data-close-card]').click();
    await page.waitForTimeout(350);

    for (const [id, suffix] of [['#chapter-1', 'ch1'], ['#chapter-2', 'ch2'], ['#chapter-3', 'ch3'], ['#closing', 'closing']]) {
      await sectionMiddle(page, id);
      await capture(page, `${name}-${suffix}.png`);
    }
    totals.push(`${name}: 7 screenshots`);
    console.log(`${name}: 7 screenshots complete`);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const page = await context.newPage();
  collect(page, 'sources');
  await loadPage(page, new URL('sources.html', baseUrl).href);
  await capture(page, 'sources.png');
  totals.push('sources: 1 screenshot');
  await context.close();
} catch (error) {
  runError = error;
} finally {
  if (browser) await browser.close();
}

console.log('\nScreenshot verification summary');
console.log(totals.join('\n'));
console.log(`Screenshots: ${screenshotCount}/29`);
console.log(`Console errors: ${issues.consoleErrors.length}`);
console.log(`Console warnings: ${issues.consoleWarnings.length}`);
console.log(`Page errors: ${issues.pageErrors.length}`);
console.log(`Failed requests: ${issues.failedRequests.length}`);
console.log(`HTTP responses >= 400: ${issues.badResponses.length}`);
console.log(`Output: ${outDir}`);
for (const [category, messages] of Object.entries(issues)) {
  if (messages.length) console.log(`\n${category}:\n${messages.join('\n')}`);
}
if (runError) console.error(`Screenshot run failed: ${runError.stack || runError}`);
process.exitCode = runError || issues.consoleErrors.length || issues.pageErrors.length ? 1 : 0;
