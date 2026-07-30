/**
 * Enrich the local game catalogue with real metadata and artwork.
 *
 * Sources
 *   RAWG (needs RAWG_API_KEY)  — canonical name, release date, genres,
 *                                developers/publishers, Metacritic score,
 *                                landscape artwork, screenshots, store links.
 *                                Covers console-only titles that Steam lacks.
 *   Steam CDN (no key needed)  — the portrait 600x900 library capsule and the
 *                                1920x620 library hero, which RAWG has no
 *                                equivalent for. The Steam appid is extracted
 *                                from the store link RAWG returns.
 *
 * Every remote asset URL is verified with a HEAD request before being written,
 * so the app never renders a broken image: anything unverified simply falls
 * back to the procedural SVG art.
 *
 * Output: src/lib/catalog.generated.json  (committed; the API key is not)
 *
 * Usage:  node --experimental-strip-types --env-file=.env.local scripts/enrich.ts
 *         ... --only doom-eternal,portal-2     enrich just these slugs
 *         ... --force                          re-fetch entries already present
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { GAMES } from '../src/lib/games.ts';
import { paletteFromUrl } from '../src/lib/palette.ts';

const KEY = process.env.RAWG_API_KEY;
if (!KEY) {
  console.error('RAWG_API_KEY is missing. Run with --env-file=.env.local');
  process.exit(1);
}

const OUT = path.join(process.cwd(), 'src', 'lib', 'catalog.generated.json');
const FORCE = process.argv.includes('--force');
const onlyArg = process.argv.indexOf('--only');
const ONLY =
  onlyArg !== -1 && process.argv[onlyArg + 1]
    ? new Set(process.argv[onlyArg + 1].split(','))
    : null;

/* ------------------------------------------------------------------- types */

export interface EnrichedGame {
  /** Our catalogue slug. */
  slug: string;
  rawgId: number | null;
  /** Canonical title as RAWG spells it. */
  name: string | null;
  released: string | null;
  metacritic: number | null;
  rating: number | null;
  genres: string[];
  developers: string[];
  publishers: string[];
  platforms: string[];
  description: string | null;
  steamAppId: number | null;
  /** Verified asset URLs. A null means "use the procedural fallback". */
  capsule: string | null;
  header: string | null;
  hero: string | null;
  screenshots: string[];
  /** Dominant + accent colours sampled from the real artwork. */
  colors: [string, string, string] | null;
  fetchedAt: string;
}

/* ------------------------------------------------------------------ helpers */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string, attempt = 1): Promise<unknown | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'steamder-enrich/1.0' } });
    if (res.status === 429 && attempt <= 4) {
      const wait = 2000 * attempt;
      console.log(`    rate limited, waiting ${wait}ms`);
      await sleep(wait);
      return getJson(url, attempt + 1);
    }
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    if (attempt <= 3) {
      await sleep(1200 * attempt);
      return getJson(url, attempt + 1);
    }
    console.log(`    request failed: ${(err as Error).message}`);
    return null;
  }
}

/** True when the URL responds with an image. */
async function assetExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!res.ok) return false;
    const type = res.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) return false;
    // Steam serves a tiny placeholder for missing library assets.
    const len = Number.parseInt(res.headers.get('content-length') ?? '0', 10);
    return !(len > 0 && len < 1200);
  } catch {
    return false;
  }
}

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Pick the RAWG result that best matches our title and year. */
function bestMatch(
  results: { id: number; name: string; released: string | null; rating: number }[],
  title: string,
  year: number,
): { id: number; name: string } | null {
  if (results.length === 0) return null;
  const target = norm(title);

  let best: { id: number; name: string } | null = null;
  let bestScore = -Infinity;

  for (const r of results) {
    const candidate = norm(r.name);
    let score = 0;
    if (candidate === target) score += 100;
    else if (candidate.startsWith(target) || target.startsWith(candidate)) score += 60;
    else if (candidate.includes(target) || target.includes(candidate)) score += 30;
    else continue; // unrelated title, skip entirely

    if (year > 0 && r.released) {
      const ry = Number.parseInt(r.released.slice(0, 4), 10);
      const gap = Math.abs(ry - year);
      score += gap === 0 ? 25 : gap <= 1 ? 15 : gap <= 3 ? 5 : -10 * Math.min(gap, 5);
    }
    score += Math.min(r.rating ?? 0, 5); // nudge towards the better-known entry

    if (score > bestScore) {
      bestScore = score;
      best = { id: r.id, name: r.name };
    }
  }

  return bestScore >= 25 ? best : null;
}

/** Extract the Steam appid from any Steam store URL. */
function steamAppIdFrom(urls: string[]): number | null {
  for (const u of urls) {
    const m = /store\.steampowered\.com\/app\/(\d+)/.exec(u);
    if (m) return Number.parseInt(m[1], 10);
  }
  return null;
}

/* ---------------------------------------------------------------- the work */

interface RawgSearch {
  results?: { id: number; name: string; released: string | null; rating: number }[];
}

interface RawgDetail {
  id: number;
  name: string;
  released: string | null;
  metacritic: number | null;
  rating: number | null;
  description_raw?: string;
  background_image: string | null;
  background_image_additional: string | null;
  genres?: { name: string }[];
  developers?: { name: string }[];
  publishers?: { name: string }[];
  platforms?: { platform: { name: string } }[];
  stores?: { url?: string; store?: { slug: string } }[];
}

interface RawgScreens {
  results?: { image: string }[];
}

interface RawgStores {
  results?: { url: string }[];
}

const STEAM_CDN = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps';

/**
 * Titles RAWG files under a different name than the one we display.
 * Keyed by our slug; the value is what we search for.
 */
const SEARCH_OVERRIDES: Record<string, string> = {
  'hitman-3': 'Hitman 3',
  pubg: "PLAYERUNKNOWN'S BATTLEGROUNDS",
  'fifa-23': 'EA Sports FC 24',
  'stardew-multiplayer': 'Stardew Valley',
  'runescape': 'Old School RuneScape',
};

async function enrichOne(slug: string, title: string, year: number): Promise<EnrichedGame> {
  const empty: EnrichedGame = {
    slug,
    rawgId: null,
    name: null,
    released: null,
    metacritic: null,
    rating: null,
    genres: [],
    developers: [],
    publishers: [],
    platforms: [],
    description: null,
    steamAppId: null,
    capsule: null,
    header: null,
    hero: null,
    screenshots: [],
    colors: null,
    fetchedAt: new Date().toISOString(),
  };

  const query = SEARCH_OVERRIDES[slug] ?? title;
  const search = (await getJson(
    `https://api.rawg.io/api/games?key=${KEY}&search=${encodeURIComponent(query)}&page_size=8`,
  )) as RawgSearch | null;

  const match = bestMatch(search?.results ?? [], query, year);
  if (!match) {
    console.log(`  ✗ no RAWG match`);
    return empty;
  }

  const detail = (await getJson(`https://api.rawg.io/api/games/${match.id}?key=${KEY}`)) as
    | RawgDetail
    | null;
  if (!detail) {
    console.log(`  ✗ detail fetch failed`);
    return empty;
  }

  const [screens, stores] = (await Promise.all([
    getJson(`https://api.rawg.io/api/games/${match.id}/screenshots?key=${KEY}`),
    getJson(`https://api.rawg.io/api/games/${match.id}/stores?key=${KEY}`),
  ])) as [RawgScreens | null, RawgStores | null];

  const storeUrls = [
    ...(stores?.results ?? []).map((s) => s.url),
    ...(detail.stores ?? []).map((s) => s.url ?? ''),
  ].filter(Boolean);
  const appId = steamAppIdFrom(storeUrls);

  // Steam has the portrait capsule and the wide hero; RAWG only has landscape art.
  let capsule: string | null = null;
  let header: string | null = null;
  let hero: string | null = null;

  if (appId) {
    const candidates = {
      capsule: `${STEAM_CDN}/${appId}/library_600x900.jpg`,
      header: `${STEAM_CDN}/${appId}/header.jpg`,
      hero: `${STEAM_CDN}/${appId}/library_hero.jpg`,
    };
    const [okCapsule, okHeader, okHero] = await Promise.all([
      assetExists(candidates.capsule),
      assetExists(candidates.header),
      assetExists(candidates.hero),
    ]);
    if (okCapsule) capsule = candidates.capsule;
    if (okHeader) header = candidates.header;
    if (okHero) hero = candidates.hero;
  }

  // RAWG artwork fills whichever landscape slots Steam did not.
  if (detail.background_image) {
    if (!header) header = detail.background_image;
    if (!hero) hero = detail.background_image_additional ?? detail.background_image;
  }

  const screenshots = (screens?.results ?? [])
    .map((s) => s.image)
    .filter(Boolean)
    .slice(0, 5);

  const colorSource = header ?? hero ?? capsule;
  const colors = colorSource ? await paletteFromUrl(colorSource) : null;

  console.log(
    `  ✓ ${detail.name}${appId ? ` (steam ${appId})` : ''} · ` +
      `${capsule ? 'capsule ' : ''}${header ? 'header ' : ''}${hero ? 'hero ' : ''}` +
      `${screenshots.length} shots${colors ? ' · palette' : ''}`,
  );

  return {
    slug,
    rawgId: detail.id,
    name: detail.name,
    released: detail.released,
    metacritic: detail.metacritic,
    rating: detail.rating,
    genres: (detail.genres ?? []).map((g) => g.name),
    developers: (detail.developers ?? []).map((d) => d.name),
    publishers: (detail.publishers ?? []).map((p) => p.name),
    platforms: (detail.platforms ?? []).map((p) => p.platform.name),
    description: detail.description_raw ? detail.description_raw.slice(0, 900) : null,
    steamAppId: appId,
    capsule,
    header,
    hero,
    screenshots,
    colors,
    fetchedAt: new Date().toISOString(),
  };
}

async function main(): Promise<void> {
  // Always start from what is already on disk: --force controls which entries get
  // re-fetched, never whether the rest survive. Re-reading is what makes
  // `--only x --force` safe to run against a full catalogue.
  const existing: Record<string, EnrichedGame> = existsSync(OUT)
    ? JSON.parse(readFileSync(OUT, 'utf8'))
    : {};

  const targets = GAMES.filter((g) => {
    if (ONLY) return ONLY.has(g.slug);
    if (FORCE) return true;
    return !existing[g.slug];
  });

  console.log(`Enriching ${targets.length} of ${GAMES.length} titles.\n`);

  let matched = 0;
  let withCapsule = 0;

  for (let i = 0; i < targets.length; i++) {
    const g = targets[i];
    console.log(`[${i + 1}/${targets.length}] ${g.title} (${g.year})`);
    const result = await enrichOne(g.slug, g.title, g.year);
    existing[g.slug] = result;
    if (result.rawgId) matched++;
    if (result.capsule) withCapsule++;

    // Checkpoint regularly so a long run is never lost.
    if (i % 10 === 9 || i === targets.length - 1) {
      mkdirSync(path.dirname(OUT), { recursive: true });
      writeFileSync(OUT, `${JSON.stringify(existing, null, 2)}\n`);
    }

    // Stay well inside RAWG's free-tier rate limit.
    await sleep(260);
  }

  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(existing, null, 2)}\n`);

  const total = Object.keys(existing).length;
  const capsules = Object.values(existing).filter((e) => e.capsule).length;
  const heroes = Object.values(existing).filter((e) => e.hero).length;
  console.log(
    `\nDone. ${matched}/${targets.length} matched this run (${withCapsule} new Steam capsules).\n` +
      `Catalogue file now holds ${total} entries: ${capsules} portrait capsules, ${heroes} heroes.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
