/**
 * Asset resolution: real artwork when we have it, procedural SVG otherwise.
 *
 * `catalog.generated.json` is produced by `scripts/enrich.ts` from RAWG (metadata,
 * landscape art, screenshots) and the Steam CDN (portrait capsules, wide heroes).
 * Every URL in that file was verified with a HEAD request at generation time, so
 * a non-null value here is safe to render. A null falls back to `/art/...`, which
 * always resolves.
 *
 * Pure string work only — safe to import from client components.
 */

import generated from './catalog.generated.json';
import { capsuleUrl, headerUrl, heroUrl, screenshotUrl, smallCapsuleUrl } from './artUrl';

export interface EnrichedGame {
  slug: string;
  rawgId: number | null;
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
  capsule: string | null;
  header: string | null;
  hero: string | null;
  screenshots: string[];
  colors: [string, string, string] | null;
  fetchedAt: string;
}

const CATALOG = generated as unknown as Record<string, EnrichedGame>;

export function enriched(slug: string): EnrichedGame | null {
  return CATALOG[slug] ?? null;
}

/** True when this title has at least one piece of real artwork. */
export function hasRealArt(slug: string): boolean {
  const e = enriched(slug);
  return Boolean(e && (e.capsule || e.header || e.hero));
}

/* -------------------------------------------------------------------- images */

/** 2:3 portrait capsule. Steam library art when available. */
export function capsuleSrc(slug: string): string {
  return enriched(slug)?.capsule ?? capsuleUrl(slug);
}

/** Wide list/store thumbnail. */
export function headerSrc(slug: string): string {
  return enriched(slug)?.header ?? headerUrl(slug);
}

/** Full-bleed banner. */
export function heroSrc(slug: string): string {
  const e = enriched(slug);
  return e?.hero ?? e?.header ?? heroUrl(slug);
}

/** Small dense-list thumbnail; the wide header crops fine at this size. */
export function smallCapsuleSrc(slug: string): string {
  return enriched(slug)?.header ?? smallCapsuleUrl(slug);
}

/**
 * Screenshot at `index`. Falls back through real screenshots → header art →
 * procedural, so the media strip is never short.
 */
export function screenshotSrc(slug: string, index: number): string {
  const shots = enriched(slug)?.screenshots ?? [];
  if (shots.length > 0) return shots[index % shots.length];
  return screenshotUrl(slug, index);
}

/** How many distinct real screenshots exist (0 when we only have procedural art). */
export function screenshotCount(slug: string): number {
  return enriched(slug)?.screenshots.length ?? 0;
}

/* -------------------------------------------------------------------- colours */

/**
 * Palette for page theming, sampled from the real artwork when we have it.
 * Falls back to the hand-authored palette in `games.ts`.
 */
export function realColors(slug: string): [string, string, string] | null {
  return enriched(slug)?.colors ?? null;
}

/* ------------------------------------------------------------------ metadata */

/** Real developer/publisher/release facts, for the store-page details table. */
export interface RealFacts {
  developers: string[];
  publishers: string[];
  released: string | null;
  metacritic: number | null;
  platforms: string[];
  genres: string[];
  description: string | null;
  steamAppId: number | null;
}

export function realFacts(slug: string): RealFacts | null {
  const e = enriched(slug);
  if (!e || !e.rawgId) return null;
  return {
    developers: e.developers,
    publishers: e.publishers,
    released: e.released,
    metacritic: e.metacritic,
    platforms: e.platforms,
    genres: e.genres,
    description: e.description,
    steamAppId: e.steamAppId,
  };
}

/** Link out to the real Steam store page, when the title has one. */
export function steamStoreUrl(slug: string): string | null {
  const appId = enriched(slug)?.steamAppId;
  return appId ? `https://store.steampowered.com/app/${appId}/` : null;
}
