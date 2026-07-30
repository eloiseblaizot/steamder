import 'server-only';
import { db, nowIso } from './db';
import type {
  FriendState,
  FriendshipRow,
  PublicUser,
  RelationshipRow,
  UserRow,
  VisibleRelationship,
} from './types';

/* ------------------------------------------------------------------ users */

function strip(row: UserRow): PublicUser {
  const { password_hash: _omit, ...safe } = row;
  return safe;
}

export function getUserByHandle(handle: string): PublicUser | null {
  const row = db().prepare(`SELECT * FROM users WHERE handle = ?`).get(handle) as
    | UserRow
    | undefined;
  return row ? strip(row) : null;
}

export function getUserById(id: number): PublicUser | null {
  const row = db().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  return row ? strip(row) : null;
}

export function getUserRowByHandle(handle: string): UserRow | null {
  return (db().prepare(`SELECT * FROM users WHERE handle = ?`).get(handle) as UserRow) ?? null;
}

export function listUsers(limit = 60): PublicUser[] {
  const rows = db()
    .prepare(`SELECT * FROM users ORDER BY last_seen_at DESC LIMIT ?`)
    .all(limit) as UserRow[];
  return rows.map(strip);
}

export function searchUsers(term: string, limit = 40): PublicUser[] {
  const like = `%${term.toLowerCase()}%`;
  const rows = db()
    .prepare(
      `SELECT * FROM users
       WHERE lower(handle) LIKE ? OR lower(display_name) LIKE ?
       ORDER BY last_seen_at DESC LIMIT ?`,
    )
    .all(like, like, limit) as UserRow[];
  return rows.map(strip);
}

/* ------------------------------------------------------------ friendships */

/** True when an accepted friendship links the two users (in either direction). */
export function areFriends(a: number, b: number): boolean {
  if (a === b) return true;
  const row = db()
    .prepare(
      `SELECT 1 FROM friendships
       WHERE status = 'accepted'
         AND ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))`,
    )
    .get(a, b, b, a);
  return Boolean(row);
}

export function friendState(viewerId: number | null, targetId: number): FriendState {
  if (viewerId === null) return 'anonymous';
  if (viewerId === targetId) return 'self';

  const row = db()
    .prepare(
      `SELECT * FROM friendships
       WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)`,
    )
    .get(viewerId, targetId, targetId, viewerId) as FriendshipRow | undefined;

  if (!row) return 'none';
  if (row.status === 'accepted') return 'friends';
  return row.requester_id === viewerId ? 'request_sent' : 'request_received';
}

export function listFriends(userId: number): PublicUser[] {
  const rows = db()
    .prepare(
      `SELECT u.* FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
       WHERE f.status = 'accepted' AND (f.requester_id = ? OR f.addressee_id = ?)
       ORDER BY u.last_seen_at DESC`,
    )
    .all(userId, userId, userId) as UserRow[];
  return rows.map(strip);
}

export function countFriends(userId: number): number {
  const row = db()
    .prepare(
      `SELECT COUNT(*) AS n FROM friendships
       WHERE status = 'accepted' AND (requester_id = ? OR addressee_id = ?)`,
    )
    .get(userId, userId) as { n: number };
  return row.n;
}

export function listPendingIncoming(userId: number): PublicUser[] {
  const rows = db()
    .prepare(
      `SELECT u.* FROM friendships f
       JOIN users u ON u.id = f.requester_id
       WHERE f.addressee_id = ? AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
    )
    .all(userId) as UserRow[];
  return rows.map(strip);
}

export function listPendingOutgoing(userId: number): PublicUser[] {
  const rows = db()
    .prepare(
      `SELECT u.* FROM friendships f
       JOIN users u ON u.id = f.addressee_id
       WHERE f.requester_id = ? AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
    )
    .all(userId) as UserRow[];
  return rows.map(strip);
}

export function sendFriendRequest(fromId: number, toId: number): void {
  if (fromId === toId) return;
  const existing = db()
    .prepare(
      `SELECT * FROM friendships
       WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)`,
    )
    .get(fromId, toId, toId, fromId) as FriendshipRow | undefined;

  if (existing) {
    // They already invited us: treat this as an accept rather than a duplicate row.
    if (existing.status === 'pending' && existing.addressee_id === fromId) {
      acceptFriendRequest(fromId, toId);
    }
    return;
  }

  db()
    .prepare(
      `INSERT INTO friendships (requester_id, addressee_id, status, created_at)
       VALUES (?, ?, 'pending', ?)`,
    )
    .run(fromId, toId, nowIso());
}

export function acceptFriendRequest(viewerId: number, requesterId: number): void {
  db()
    .prepare(
      `UPDATE friendships SET status = 'accepted', responded_at = ?
       WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'`,
    )
    .run(nowIso(), requesterId, viewerId);
}

export function removeFriendship(a: number, b: number): void {
  db()
    .prepare(
      `DELETE FROM friendships
       WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)`,
    )
    .run(a, b, b, a);
}

/* ---------------------------------------------------------- relationships */

/**
 * Strip the private columns unless the viewer is allowed to see them.
 * This is the single choke point for the friends-only rule — every read path
 * that reaches a component goes through here.
 */
export function applyVisibility(row: RelationshipRow, revealed: boolean): VisibleRelationship {
  if (revealed) return { revealed: true, ...row };
  const { real_name: _n, real_location: _l, private_notes: _p, ...rest } = row;
  return { revealed: false, ...rest };
}

export function listRelationshipsFor(ownerId: number, viewerId: number | null): VisibleRelationship[] {
  const rows = db()
    .prepare(`SELECT * FROM relationships WHERE user_id = ? ORDER BY started_on DESC, id DESC`)
    .all(ownerId) as RelationshipRow[];

  const revealed = viewerId !== null && areFriends(viewerId, ownerId);
  return rows.map((r) => applyVisibility(r, revealed));
}

/** Raw rows — only for the owner's own edit flows and for stats computation. */
export function listRawRelationships(ownerId: number): RelationshipRow[] {
  return db()
    .prepare(`SELECT * FROM relationships WHERE user_id = ? ORDER BY started_on DESC, id DESC`)
    .all(ownerId) as RelationshipRow[];
}

export function getRelationship(id: number): RelationshipRow | null {
  return (
    (db().prepare(`SELECT * FROM relationships WHERE id = ?`).get(id) as RelationshipRow) ?? null
  );
}

export function getVisibleRelationship(
  id: number,
  viewerId: number | null,
): { rel: VisibleRelationship; owner: PublicUser } | null {
  const row = getRelationship(id);
  if (!row) return null;
  const owner = getUserById(row.user_id);
  if (!owner) return null;

  const revealed = viewerId !== null && areFriends(viewerId, row.user_id);
  return { rel: applyVisibility(row, revealed), owner };
}

export function countRelationships(userId: number): number {
  const row = db()
    .prepare(`SELECT COUNT(*) AS n FROM relationships WHERE user_id = ?`)
    .get(userId) as { n: number };
  return row.n;
}

/** Most-reviewed games across the whole platform — powers the store front. */
export function trendingGames(limit = 12): { game_slug: string; plays: number; avg: number }[] {
  return db()
    .prepare(
      `SELECT game_slug, COUNT(*) AS plays, CAST(ROUND(AVG(score)) AS INTEGER) AS avg
       FROM relationships
       GROUP BY game_slug
       ORDER BY plays DESC, avg DESC
       LIMIT ?`,
    )
    .all(limit) as { game_slug: string; plays: number; avg: number }[];
}

/** Recent public reviews across the platform, with their author. */
export function recentReviews(
  viewerId: number | null,
  limit = 10,
): { rel: VisibleRelationship; owner: PublicUser }[] {
  const rows = db()
    .prepare(
      `SELECT * FROM relationships
       WHERE length(review) > 0
       ORDER BY updated_at DESC LIMIT ?`,
    )
    .all(limit) as RelationshipRow[];

  const out: { rel: VisibleRelationship; owner: PublicUser }[] = [];
  for (const row of rows) {
    const owner = getUserById(row.user_id);
    if (!owner) continue;
    const revealed = viewerId !== null && areFriends(viewerId, row.user_id);
    out.push({ rel: applyVisibility(row, revealed), owner });
  }
  return out;
}

/** Attach owners and apply per-viewer visibility to a batch of rows. */
function withOwners(
  rows: RelationshipRow[],
  viewerId: number | null,
): { rel: VisibleRelationship; owner: PublicUser }[] {
  const out: { rel: VisibleRelationship; owner: PublicUser }[] = [];
  for (const row of rows) {
    const owner = getUserById(row.user_id);
    if (!owner) continue;
    const revealed = viewerId !== null && areFriends(viewerId, row.user_id);
    out.push({ rel: applyVisibility(row, revealed), owner });
  }
  return out;
}

/** Newest additions across the platform — the store's "New & Trending" row. */
export function recentRelationships(
  viewerId: number | null,
  limit = 8,
): { rel: VisibleRelationship; owner: PublicUser }[] {
  const rows = db()
    .prepare(`SELECT * FROM relationships ORDER BY created_at DESC, id DESC LIMIT ?`)
    .all(limit) as RelationshipRow[];
  return withOwners(rows, viewerId);
}

/** Highest scored across the platform — the store's "Top Sellers" row. */
export function topRatedRelationships(
  viewerId: number | null,
  limit = 12,
): { rel: VisibleRelationship; owner: PublicUser }[] {
  const rows = db()
    .prepare(
      `SELECT * FROM relationships
       WHERE status <> 'wishlist'
       ORDER BY score DESC, id DESC LIMIT ?`,
    )
    .all(limit) as RelationshipRow[];
  return withOwners(rows, viewerId);
}

/** One eye-catching entry for the store hero: high score, has a review. */
export function featuredRelationship(
  viewerId: number | null,
): { rel: VisibleRelationship; owner: PublicUser } | null {
  const row = db()
    .prepare(
      `SELECT * FROM relationships
       WHERE status <> 'wishlist' AND length(review) > 80
       ORDER BY score DESC, updated_at DESC LIMIT 1`,
    )
    .get() as RelationshipRow | undefined;
  if (!row) return null;
  return withOwners([row], viewerId)[0] ?? null;
}

export interface PlatformTotals {
  relationships: number;
  users: number;
  ongoing: number;
}

export function platformTotals(): PlatformTotals {
  const r = db().prepare(`SELECT COUNT(*) AS n FROM relationships`).get() as { n: number };
  const u = db().prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number };
  const o = db()
    .prepare(`SELECT COUNT(*) AS n FROM relationships WHERE status IN ('ongoing','situationship')`)
    .get() as { n: number };
  return { relationships: r.n, users: u.n, ongoing: o.n };
}

/** Every row on the platform, for aggregate hour counts on the store front. */
export function allRelationshipsForStats(): RelationshipRow[] {
  return db().prepare(`SELECT * FROM relationships`).all() as RelationshipRow[];
}

/** Everyone who has "played" a given game — the game's own store page. */
export function relationshipsByGame(
  slug: string,
  viewerId: number | null,
): { rel: VisibleRelationship; owner: PublicUser }[] {
  const rows = db()
    .prepare(`SELECT * FROM relationships WHERE game_slug = ? ORDER BY score DESC`)
    .all(slug) as RelationshipRow[];

  const out: { rel: VisibleRelationship; owner: PublicUser }[] = [];
  for (const row of rows) {
    const owner = getUserById(row.user_id);
    if (!owner) continue;
    const revealed = viewerId !== null && areFriends(viewerId, row.user_id);
    out.push({ rel: applyVisibility(row, revealed), owner });
  }
  return out;
}
