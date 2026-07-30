/**
 * Regenerates the screenshots used in README.md.
 *
 * Needs a running production server and the demo data:
 *   npm run db:seed
 *   npm run build && PORT=3311 npm run start
 *   npm run screenshots
 *
 * Uses the Chromium that Playwright already caches on this machine; only
 * `playwright-core` is installed, so no browser is downloaded.
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const EXECUTABLE =
  process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const BASE = process.env.BASE ?? 'http://localhost:3311';
const OUT = process.argv[2] ?? 'docs/screenshots';
mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1440, height: 900 };

/** Wait until every <img> has either loaded or failed, so nothing is half-painted. */
async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page
    .evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((i) => !i.complete)
          .map((i) => new Promise((r) => {
            i.addEventListener('load', r, { once: true });
            i.addEventListener('error', r, { once: true });
          })),
      ),
    )
    .catch(() => {});
  await page.waitForTimeout(700);
}

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2, // crisp on retina and on GitHub
  colorScheme: 'dark',
  locale: 'fr-FR',
});
const page = await context.newPage();

/** Sign in so the authenticated pages can be captured. */
async function login(handle) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="handle"]', handle);
  await page.fill('input[name="password"]', 'steamder123');
  await Promise.all([
    page.waitForURL(/\/library/, { timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await settle(page);
}

async function shot(name, url, { full = false, height } = {}) {
  if (height) await page.setViewportSize({ width: VIEWPORT.width, height });
  await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });
  if (height) await page.setViewportSize(VIEWPORT);
  console.log('·', name);
}

/** First relationship in a given user's library, as a /app/<id> path. */
async function firstRelationshipOf(handle) {
  await page.goto(`${BASE}/id/${handle}/library`, { waitUntil: 'domcontentloaded' });
  const href = await page.getAttribute('a.capsule', 'href');
  return href ?? '/app/1';
}

await login('aurore');

// Signed in as aurore: malik is an accepted friend (private fields revealed),
// ines only has a pending invite (private fields locked).
const friendRel = await firstRelationshipOf('malik');
const strangerRel = await firstRelationshipOf('ines');

await shot('01-store', '/', { height: 1150 });
await shot('02-library', '/library', { height: 1000 });
await shot('03-relationship', friendRel, { height: 1250 });
await shot('04-profile', '/id/malik', { height: 1150 });
await shot('05-achievements', '/id/aurore/achievements', { height: 1000 });
await shot('06-locked', strangerRel, { height: 1000 });
await shot('07-add-game', '/library/games/new', { height: 1250 });
await shot('08-community', '/community', { height: 900 });
await shot('09-game', '/game/hades', { height: 1150 });

// English variant of the store, to show the bilingual UI.
await context.addCookies([
  { name: 'steamder_lang', value: 'en', url: BASE },
]);
await shot('10-store-en', '/', { height: 1150 });

await browser.close();
console.log('done ->', OUT);
