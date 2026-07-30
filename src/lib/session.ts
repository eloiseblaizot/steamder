import 'server-only';
import { cookies } from 'next/headers';
import { db, nowIso } from './db';
import { newSessionToken } from './auth';
import type { PublicUser, UserRow } from './types';

export const SESSION_COOKIE = 'steamder_session';
const SESSION_DAYS = 30;

export async function createSession(userId: number): Promise<void> {
  const token = newSessionToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  db()
    .prepare(`INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`)
    .run(token, userId, nowIso(), expires.toISOString());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) db().prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
  jar.delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Cached per request via React's cookies() memoisation. */
export async function currentUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = db()
    .prepare(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, nowIso()) as UserRow | undefined;

  if (!row) return null;

  db().prepare(`UPDATE users SET last_seen_at = ? WHERE id = ?`).run(nowIso(), row.id);

  const { password_hash: _omit, ...safe } = row;
  return safe;
}

/** Like currentUser() but throws — for server actions that require a session. */
export async function requireUser(): Promise<PublicUser> {
  const user = await currentUser();
  if (!user) throw new Error('AUTH_REQUIRED');
  return user;
}
