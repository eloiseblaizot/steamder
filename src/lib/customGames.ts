import 'server-only';
import { db, nowIso } from './db';
import type { Genre } from './games';

export interface CustomGameRow {
  id: number;
  slug: string;
  title: string;
  year: number;
  genre: Genre;
  tags: string;
  created_by: number | null;
  color_deep: string;
  color_mid: string;
  color_accent: string;
  asset_capsule: string | null;
  asset_header: string | null;
  asset_hero: string | null;
  created_at: string;
}

/** How many titles one account may submit, as a light abuse ceiling. */
export const MAX_GAMES_PER_USER = 40;

/** User-submitted slugs are namespaced so they can never shadow the catalogue. */
export const CUSTOM_PREFIX = 'u-';

export function isCustomSlug(slug: string): boolean {
  return slug.startsWith(CUSTOM_PREFIX);
}

export function getCustomGame(slug: string): CustomGameRow | null {
  if (!isCustomSlug(slug)) return null;
  return (
    (db().prepare(`SELECT * FROM custom_games WHERE slug = ?`).get(slug) as CustomGameRow) ?? null
  );
}

export function listCustomGames(): CustomGameRow[] {
  return db()
    .prepare(`SELECT * FROM custom_games ORDER BY title COLLATE NOCASE`)
    .all() as CustomGameRow[];
}

export function listCustomGamesBy(userId: number): CustomGameRow[] {
  return db()
    .prepare(`SELECT * FROM custom_games WHERE created_by = ? ORDER BY created_at DESC`)
    .all(userId) as CustomGameRow[];
}

export function countCustomGamesBy(userId: number): number {
  const row = db()
    .prepare(`SELECT COUNT(*) AS n FROM custom_games WHERE created_by = ?`)
    .get(userId) as { n: number };
  return row.n;
}

/** How many relationships — anyone's — point at this title. */
export function customGameUsage(slug: string): number {
  const row = db()
    .prepare(`SELECT COUNT(*) AS n FROM relationships WHERE game_slug = ?`)
    .get(slug) as { n: number };
  return row.n;
}

export function customSlugExists(slug: string): boolean {
  return Boolean(db().prepare(`SELECT 1 FROM custom_games WHERE slug = ?`).get(slug));
}

export interface NewCustomGame {
  slug: string;
  title: string;
  year: number;
  genre: Genre;
  tags: string;
  createdBy: number;
  colors: [string, string, string];
  assets: { capsule: string; header: string; hero: string };
}

export function insertCustomGame(game: NewCustomGame): number {
  const info = db()
    .prepare(
      `INSERT INTO custom_games
       (slug, title, year, genre, tags, created_by,
        color_deep, color_mid, color_accent,
        asset_capsule, asset_header, asset_hero, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      game.slug,
      game.title,
      game.year,
      game.genre,
      game.tags,
      game.createdBy,
      game.colors[0],
      game.colors[1],
      game.colors[2],
      game.assets.capsule,
      game.assets.header,
      game.assets.hero,
      nowIso(),
    );
  return Number(info.lastInsertRowid);
}

export function updateCustomGameDetails(
  slug: string,
  userId: number,
  fields: { title: string; year: number; genre: Genre; tags: string },
): void {
  db()
    .prepare(
      `UPDATE custom_games SET title = ?, year = ?, genre = ?, tags = ?
       WHERE slug = ? AND created_by = ?`,
    )
    .run(fields.title, fields.year, fields.genre, fields.tags, slug, userId);
}

export function updateCustomGameArtwork(
  slug: string,
  userId: number,
  colors: [string, string, string],
  assets: { capsule: string; header: string; hero: string },
): void {
  db()
    .prepare(
      `UPDATE custom_games
       SET color_deep = ?, color_mid = ?, color_accent = ?,
           asset_capsule = ?, asset_header = ?, asset_hero = ?
       WHERE slug = ? AND created_by = ?`,
    )
    .run(colors[0], colors[1], colors[2], assets.capsule, assets.header, assets.hero, slug, userId);
}

export function deleteCustomGame(slug: string, userId: number): boolean {
  const info = db()
    .prepare(`DELETE FROM custom_games WHERE slug = ? AND created_by = ?`)
    .run(slug, userId);
  return info.changes > 0;
}
