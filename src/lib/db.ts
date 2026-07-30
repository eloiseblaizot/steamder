import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.STEAMDER_DB ?? path.join(process.cwd(), 'data', 'steamder.db');

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  handle                   TEXT    NOT NULL UNIQUE,
  display_name             TEXT    NOT NULL,
  password_hash            TEXT    NOT NULL,
  bio                      TEXT    NOT NULL DEFAULT '',
  real_country             TEXT    NOT NULL DEFAULT '',
  avatar_seed              TEXT    NOT NULL,
  avatar_frame             TEXT    NOT NULL DEFAULT 'none',
  theme                    TEXT    NOT NULL DEFAULT 'crimson',
  showcase                 TEXT    NOT NULL DEFAULT 'stats',
  featured_relationship_id INTEGER REFERENCES relationships(id) ON DELETE SET NULL,
  created_at               TEXT    NOT NULL,
  last_seen_at             TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS relationships (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Friends-only fields. Never leave the server for non-friends.
  real_name      TEXT    NOT NULL,
  real_location  TEXT    NOT NULL DEFAULT '',
  private_notes  TEXT    NOT NULL DEFAULT '',

  -- Public fields, visible to everyone.
  game_slug      TEXT    NOT NULL,
  status         TEXT    NOT NULL,
  verdict        TEXT    NOT NULL,
  score          INTEGER NOT NULL,
  long_distance  INTEGER NOT NULL DEFAULT 0,
  started_on     TEXT    NOT NULL,
  ended_on       TEXT,
  review         TEXT    NOT NULL DEFAULT '',
  tags           TEXT    NOT NULL DEFAULT '',

  created_at     TEXT    NOT NULL,
  updated_at     TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_relationships_user ON relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_relationships_game ON relationships(game_slug);

CREATE TABLE IF NOT EXISTS friendships (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        TEXT    NOT NULL DEFAULT 'pending',
  created_at    TEXT    NOT NULL,
  responded_at  TEXT,
  UNIQUE(requester_id, addressee_id),
  CHECK(requester_id <> addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id, status);

-- Titles submitted by users, with artwork they uploaded themselves. These live
-- alongside the static catalogue in games.ts and are resolved together by
-- catalog.ts. created_by is nullable and SET NULL on user deletion: a game
-- outlives its submitter, because other people's relationships point at it.
CREATE TABLE IF NOT EXISTS custom_games (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT    NOT NULL UNIQUE,
  title         TEXT    NOT NULL,
  year          INTEGER NOT NULL DEFAULT 0,
  genre         TEXT    NOT NULL,
  tags          TEXT    NOT NULL DEFAULT '',
  created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Sampled from the uploaded art so pages theme themselves like any other title.
  color_deep    TEXT    NOT NULL,
  color_mid     TEXT    NOT NULL,
  color_accent  TEXT    NOT NULL,

  -- Filenames under data/uploads, served by the /uploads route.
  asset_capsule TEXT,
  asset_header  TEXT,
  asset_hero    TEXT,

  created_at    TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_games_author ON custom_games(created_by);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT    PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT    NOT NULL,
  expires_at  TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`;

let instance: Database.Database | null = null;

export function db(): Database.Database {
  if (instance) return instance;

  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const conn = new Database(DB_PATH);
  conn.pragma('journal_mode = WAL');
  conn.pragma('foreign_keys = ON');
  conn.exec(SCHEMA);

  // Drop sessions that have already expired; cheap enough to do once per boot.
  conn.prepare(`DELETE FROM sessions WHERE expires_at < ?`).run(new Date().toISOString());

  instance = conn;
  return conn;
}

export function nowIso(): string {
  return new Date().toISOString();
}
