import 'server-only';
import { GAMES, getGame, UNKNOWN_GAME, type Game, type Genre } from './games';
import {
  getCustomGame,
  isCustomSlug,
  listCustomGames,
  type CustomGameRow,
} from './customGames';
import { capsuleSrc, headerSrc, heroSrc, screenshotSrc, smallCapsuleSrc, realColors } from './assets';
import { uploadUrl } from './uploads';
import { capsuleUrl, headerUrl, heroUrl, screenshotUrl, smallCapsuleUrl } from './artUrl';
import { darken, lighten, withAlpha } from './art';

/**
 * The single place that answers "what is this game slug?".
 *
 * Two catalogues sit behind it: the 200 curated titles in games.ts, whose art
 * comes from RAWG and the Steam CDN, and titles users submitted themselves,
 * whose art they uploaded. Everything downstream — capsules, page theming,
 * genre stats — goes through here so both kinds behave identically.
 */

export interface ResolvedGame extends Game {
  /** True for a user-submitted title. */
  custom: boolean;
  /** Submitter's user id, for custom titles. */
  authorId: number | null;
}

function fromCustom(row: CustomGameRow): ResolvedGame {
  return {
    slug: row.slug,
    title: row.title,
    year: row.year,
    genre: row.genre,
    colors: [row.color_deep, row.color_mid, row.color_accent],
    tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
    custom: true,
    authorId: row.created_by,
  };
}

export function resolveGame(slug: string): ResolvedGame {
  if (isCustomSlug(slug)) {
    const row = getCustomGame(slug);
    if (row) return fromCustom(row);
    // Submitted title that has since been removed.
    return { ...UNKNOWN_GAME, slug, custom: true, authorId: null };
  }
  return { ...getGame(slug), custom: false, authorId: null };
}

/** Every title a user can pick from: curated catalogue plus all submissions. */
export function allGames(): ResolvedGame[] {
  const curated: ResolvedGame[] = GAMES.map((g) => ({ ...g, custom: false, authorId: null }));
  const custom = listCustomGames().map(fromCustom);
  return [...curated, ...custom].sort((a, b) => a.title.localeCompare(b.title));
}

/* ---------------------------------------------------------------- artwork */

/**
 * Artwork for any slug. Custom titles use their uploads; curated titles fall
 * through to the real-art resolver, which itself falls back to procedural SVG.
 */
export function gameCapsule(slug: string): string {
  const row = getCustomGame(slug);
  if (row) return row.asset_capsule ? uploadUrl(row.asset_capsule) : capsuleUrl(slug);
  return capsuleSrc(slug);
}

export function gameHeader(slug: string): string {
  const row = getCustomGame(slug);
  if (row) return row.asset_header ? uploadUrl(row.asset_header) : headerUrl(slug);
  return headerSrc(slug);
}

export function gameHero(slug: string): string {
  const row = getCustomGame(slug);
  if (row) return row.asset_hero ? uploadUrl(row.asset_hero) : heroUrl(slug);
  return heroSrc(slug);
}

export function gameSmallCapsule(slug: string): string {
  const row = getCustomGame(slug);
  if (row) return row.asset_header ? uploadUrl(row.asset_header) : smallCapsuleUrl(slug);
  return smallCapsuleSrc(slug);
}

/**
 * A custom title has one banner rather than a screenshot gallery, so the media
 * strip alternates its three uploads instead of showing four identical frames.
 */
export function gameScreenshot(slug: string, index: number): string {
  const row = getCustomGame(slug);
  if (!row) return screenshotSrc(slug, index);

  const shots = [row.asset_hero, row.asset_header, row.asset_capsule].filter(
    (a): a is string => Boolean(a),
  );
  if (shots.length === 0) return screenshotUrl(slug, index);
  return uploadUrl(shots[index % shots.length]);
}

export function gameScreenshotCount(slug: string): number {
  const row = getCustomGame(slug);
  if (row) return [row.asset_hero, row.asset_header, row.asset_capsule].filter(Boolean).length;
  return 0;
}

/** Palette for page theming: uploaded art, sampled real art, then the fallback. */
export function gameColors(slug: string): [string, string, string] {
  const row = getCustomGame(slug);
  if (row) return [row.color_deep, row.color_mid, row.color_accent];
  return realColors(slug) ?? getGame(slug).colors;
}

/** Genre for stats, resolving custom titles correctly. */
export function gameGenre(slug: string): Genre {
  return resolveGame(slug).genre;
}

/** True when the slug names a title that actually exists. */
export function gameExists(slug: string): boolean {
  if (isCustomSlug(slug)) return getCustomGame(slug) !== null;
  return GAMES.some((g) => g.slug === slug);
}

/**
 * Per-game page theme, mirroring how Steam tints a store page to match the art.
 * Works identically for curated and user-submitted titles.
 */
export function gameTheme(slug: string): {
  deep: string;
  mid: string;
  accent: string;
  pageTop: string;
  pageBottom: string;
  panel: string;
  panelEdge: string;
} {
  const [deep, mid, accent] = gameColors(slug);
  return {
    deep,
    mid,
    accent,
    pageTop: darken(mid, 0.55),
    pageBottom: darken(deep, 0.25),
    panel: withAlpha(lighten(mid, 0.06), 0.42),
    panelEdge: withAlpha(lighten(accent, 0.1), 0.28),
  };
}
