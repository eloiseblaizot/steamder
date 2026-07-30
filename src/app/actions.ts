'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { db, nowIso } from '@/lib/db';
import { HANDLE_RE, hashPassword, verifyPassword } from '@/lib/auth';
import { createSession, currentUser, destroySession } from '@/lib/session';
import { getLang } from '@/lib/lang';
import { isLang, LANG_COOKIE, makeT, type Lang } from '@/lib/i18n';
import { GENRES, type Genre } from '@/lib/games';
import {
  acceptFriendRequest,
  getRelationship,
  getUserByHandle,
  getUserRowByHandle,
  removeFriendship,
  sendFriendRequest,
} from '@/lib/queries';
import { gameExists } from '@/lib/catalog';
import {
  CUSTOM_PREFIX,
  countCustomGamesBy,
  customGameUsage,
  customSlugExists,
  deleteCustomGame,
  getCustomGame,
  insertCustomGame,
  MAX_GAMES_PER_USER,
  updateCustomGameArtwork,
  updateCustomGameDetails,
} from '@/lib/customGames';
import {
  deleteGameArtwork,
  MAX_UPLOAD_BYTES,
  processGameArtwork,
  type UploadError,
} from '@/lib/uploads';
import {
  AVATAR_FRAMES,
  SHOWCASES,
  STATUSES,
  THEMES,
  VERDICTS,
  type AvatarFrame,
  type Showcase,
  type Status,
  type Theme,
  type UserRow,
  type Verdict,
} from '@/lib/types';

export interface FormState {
  error?: string;
  ok?: boolean;
}

const EMPTY: FormState = {};

/* ------------------------------------------------------------------ helpers */

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === 'on' || fd.get(key) === 'true' || fd.get(key) === '1';
}

/** ISO date (YYYY-MM-DD) or null. */
function isoDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : value;
}

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

async function tr() {
  const lang = await getLang();
  return makeT(lang);
}

/* --------------------------------------------------------------------- lang */

export async function setLangAction(lang: Lang): Promise<void> {
  const jar = await cookies();
  jar.set(LANG_COOKIE, isLang(lang) ? lang : 'fr', {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/', 'layout');
}

/* --------------------------------------------------------------------- auth */

export async function registerAction(
  _prev: FormState = EMPTY,
  fd: FormData,
): Promise<FormState> {
  const t = await tr();

  const handle = str(fd, 'handle').toLowerCase();
  const displayName = str(fd, 'display_name');
  const password = String(fd.get('password') ?? '');
  const confirm = String(fd.get('password_confirm') ?? '');

  if (!HANDLE_RE.test(handle)) return { error: t('auth_err_handle_invalid') };
  if (!displayName) return { error: t('auth_err_name_required') };
  if (password.length < 8) return { error: t('auth_err_password_short') };
  if (password !== confirm) return { error: t('auth_err_password_mismatch') };

  const taken = db().prepare(`SELECT 1 FROM users WHERE handle = ?`).get(handle);
  if (taken) return { error: t('auth_err_handle_taken') };

  const now = nowIso();
  const info = db()
    .prepare(
      `INSERT INTO users (handle, display_name, password_hash, avatar_seed, created_at, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(handle, displayName.slice(0, 48), hashPassword(password), `${handle}-${Date.now()}`, now, now);

  await createSession(Number(info.lastInsertRowid));
  redirect('/library');
}

export async function loginAction(_prev: FormState = EMPTY, fd: FormData): Promise<FormState> {
  const t = await tr();

  const handle = str(fd, 'handle').toLowerCase();
  const password = String(fd.get('password') ?? '');

  const row = getUserRowByHandle(handle);
  if (!row || !verifyPassword(password, row.password_hash)) {
    return { error: t('auth_err_credentials') };
  }

  await createSession(row.id);
  redirect('/library');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/');
}

/* ------------------------------------------------------------ relationships */

interface RelInput {
  real_name: string;
  real_location: string;
  private_notes: string;
  game_slug: string;
  status: Status;
  verdict: Verdict;
  score: number;
  long_distance: 0 | 1;
  started_on: string;
  ended_on: string | null;
  review: string;
  tags: string;
}

function parseRel(fd: FormData): { value: RelInput } | { error: string } {
  const real_name = str(fd, 'real_name').slice(0, 80);
  if (!real_name) return { error: 'REAL_NAME_REQUIRED' };

  const game_slug = str(fd, 'game_slug');
  if (!game_slug || !gameExists(game_slug)) return { error: 'GAME_REQUIRED' };

  const started_on = isoDate(str(fd, 'started_on'));
  if (!started_on) return { error: 'START_REQUIRED' };

  const status = oneOf(str(fd, 'status'), STATUSES, 'ongoing');
  let ended_on = isoDate(str(fd, 'ended_on'));

  // A finished playthrough needs an end date; a running one never keeps one.
  if (status === 'ended' || status === 'ghosted') {
    if (!ended_on) return { error: 'END_REQUIRED' };
  } else {
    ended_on = null;
  }

  if (ended_on && ended_on < started_on) return { error: 'END_BEFORE_START' };

  const rawScore = Number.parseInt(str(fd, 'score'), 10);
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, rawScore)) : 50;

  // Normalise tags: comma-separated, trimmed, de-duplicated, max 12.
  const tags = [
    ...new Set(
      str(fd, 'tags')
        .split(',')
        .map((s) => s.trim().toLowerCase().replace(/\s+/g, '-'))
        .filter((s) => s.length > 0 && s.length <= 28),
    ),
  ]
    .slice(0, 12)
    .join(',');

  return {
    value: {
      real_name,
      real_location: str(fd, 'real_location').slice(0, 80),
      private_notes: str(fd, 'private_notes').slice(0, 4000),
      game_slug,
      status,
      verdict: oneOf(str(fd, 'verdict'), VERDICTS, 'recommended'),
      score,
      long_distance: bool(fd, 'long_distance') ? 1 : 0,
      started_on,
      ended_on,
      review: str(fd, 'review').slice(0, 4000),
      tags,
    },
  };
}

function relErrorMessage(code: string, t: Awaited<ReturnType<typeof tr>>, lang: Lang): string {
  const fr = lang === 'fr';
  switch (code) {
    case 'REAL_NAME_REQUIRED':
      return fr ? 'Le vrai prénom est obligatoire.' : 'The real name is required.';
    case 'GAME_REQUIRED':
      return fr ? 'Choisissez un jeu dans le catalogue.' : 'Pick a game from the catalogue.';
    case 'START_REQUIRED':
      return fr ? 'La date de début est obligatoire.' : 'The start date is required.';
    case 'END_REQUIRED':
      return fr
        ? 'Une relation terminée ou abandonnée a besoin d’une date de fin.'
        : 'A completed or abandoned relationship needs an end date.';
    case 'END_BEFORE_START':
      return fr
        ? 'La date de fin ne peut pas précéder la date de début.'
        : 'The end date cannot be before the start date.';
    default:
      return t('g_error');
  }
}

export async function createRelationshipAction(
  _prev: FormState = EMPTY,
  fd: FormData,
): Promise<FormState> {
  const user = await currentUser();
  const lang = await getLang();
  const t = makeT(lang);
  if (!user) return { error: t('auth_login_required') };

  const parsed = parseRel(fd);
  if ('error' in parsed) return { error: relErrorMessage(parsed.error, t, lang) };
  const v = parsed.value;

  const now = nowIso();
  const info = db()
    .prepare(
      `INSERT INTO relationships
       (user_id, real_name, real_location, private_notes, game_slug, status, verdict, score,
        long_distance, started_on, ended_on, review, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      user.id,
      v.real_name,
      v.real_location,
      v.private_notes,
      v.game_slug,
      v.status,
      v.verdict,
      v.score,
      v.long_distance,
      v.started_on,
      v.ended_on,
      v.review,
      v.tags,
      now,
      now,
    );

  revalidatePath('/library');
  revalidatePath('/');
  revalidatePath(`/id/${user.handle}`);
  redirect(`/app/${info.lastInsertRowid}`);
}

export async function updateRelationshipAction(
  _prev: FormState = EMPTY,
  fd: FormData,
): Promise<FormState> {
  const user = await currentUser();
  const lang = await getLang();
  const t = makeT(lang);
  if (!user) return { error: t('auth_login_required') };

  const id = Number.parseInt(str(fd, 'id'), 10);
  const existing = getRelationship(id);
  if (!existing || existing.user_id !== user.id) return { error: t('g_not_found') };

  const parsed = parseRel(fd);
  if ('error' in parsed) return { error: relErrorMessage(parsed.error, t, lang) };
  const v = parsed.value;

  db()
    .prepare(
      `UPDATE relationships SET
         real_name = ?, real_location = ?, private_notes = ?, game_slug = ?, status = ?,
         verdict = ?, score = ?, long_distance = ?, started_on = ?, ended_on = ?,
         review = ?, tags = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
    )
    .run(
      v.real_name,
      v.real_location,
      v.private_notes,
      v.game_slug,
      v.status,
      v.verdict,
      v.score,
      v.long_distance,
      v.started_on,
      v.ended_on,
      v.review,
      v.tags,
      nowIso(),
      id,
      user.id,
    );

  revalidatePath('/library');
  revalidatePath('/');
  revalidatePath(`/app/${id}`);
  revalidatePath(`/id/${user.handle}`);
  redirect(`/app/${id}`);
}

export async function deleteRelationshipAction(fd: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect('/login');

  const id = Number.parseInt(str(fd, 'id'), 10);
  db().prepare(`DELETE FROM relationships WHERE id = ? AND user_id = ?`).run(id, user.id);

  revalidatePath('/library');
  revalidatePath('/');
  revalidatePath(`/id/${user.handle}`);
  redirect('/library');
}

/* ------------------------------------------------------------------ friends */

export async function friendRequestAction(fd: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect('/login');

  const target = getUserByHandle(str(fd, 'handle'));
  if (target) {
    sendFriendRequest(user.id, target.id);
    revalidatePath(`/id/${target.handle}`);
  }
  revalidatePath('/friends');
}

export async function acceptFriendAction(fd: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect('/login');

  const target = getUserByHandle(str(fd, 'handle'));
  if (target) {
    acceptFriendRequest(user.id, target.id);
    revalidatePath(`/id/${target.handle}`);
  }
  revalidatePath('/friends');
  revalidatePath(`/id/${user.handle}`);
}

export async function removeFriendAction(fd: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect('/login');

  const target = getUserByHandle(str(fd, 'handle'));
  if (target) {
    removeFriendship(user.id, target.id);
    revalidatePath(`/id/${target.handle}`);
  }
  revalidatePath('/friends');
  revalidatePath(`/id/${user.handle}`);
}

/* ------------------------------------------------------- user-submitted games */

/** Slugify a title into the `u-` namespace, so it can never shadow the catalogue. */
function customSlug(title: string): string {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${CUSTOM_PREFIX}${base || 'title'}`;
}

/** Append a numeric suffix until the slug is free. */
function uniqueCustomSlug(title: string): string {
  const base = customSlug(title);
  if (!customSlugExists(base)) return base;
  for (let i = 2; i < 200; i++) {
    const candidate = `${base}-${i}`;
    if (!customSlugExists(candidate)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

function uploadErrorMessage(code: UploadError, lang: Lang): string {
  const fr = lang === 'fr';
  switch (code) {
    case 'NO_FILE':
      return fr ? 'Ajoutez une image de bannière.' : 'Add a banner image.';
    case 'TOO_LARGE':
      return fr
        ? `Image trop lourde (maximum ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} Mo).`
        : `Image too large (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB).`;
    case 'BAD_TYPE':
      return fr
        ? 'Format non accepté. Utilisez du JPEG, PNG, WebP ou AVIF.'
        : 'Unsupported format. Use JPEG, PNG, WebP or AVIF.';
    case 'TOO_MANY_PIXELS':
      return fr ? 'Image trop grande en pixels.' : 'Image has too many pixels.';
    case 'TOO_SMALL':
      return fr
        ? 'Image trop petite : 200 × 100 pixels minimum.'
        : 'Image too small: 200 × 100 pixels minimum.';
    default:
      return fr ? 'Image illisible.' : 'Could not read that image.';
  }
}

function parseGameFields(fd: FormData) {
  const title = str(fd, 'title').slice(0, 90);
  const yearRaw = Number.parseInt(str(fd, 'year'), 10);
  const year = Number.isFinite(yearRaw) && yearRaw > 1900 && yearRaw < 2200 ? yearRaw : 0;
  const genre = oneOf<Genre>(str(fd, 'genre'), GENRES, 'action');
  const tags = [
    ...new Set(
      str(fd, 'tags')
        .split(',')
        .map((s) => s.trim().toLowerCase().replace(/\s+/g, '-'))
        .filter((s) => s.length > 0 && s.length <= 28),
    ),
  ]
    .slice(0, 8)
    .join(',');
  return { title, year, genre, tags };
}

export async function createCustomGameAction(
  _prev: FormState = EMPTY,
  fd: FormData,
): Promise<FormState> {
  const user = await currentUser();
  const lang = await getLang();
  const t = makeT(lang);
  if (!user) return { error: t('auth_login_required') };

  const { title, year, genre, tags } = parseGameFields(fd);
  if (!title) return { error: t('cg_err_title') };

  if (countCustomGamesBy(user.id) >= MAX_GAMES_PER_USER) {
    return { error: t('cg_err_limit', { n: MAX_GAMES_PER_USER }) };
  }

  const banner = fd.get('banner');
  if (!(banner instanceof File) || banner.size === 0) return { error: t('cg_err_banner') };
  const coverRaw = fd.get('cover');
  const cover = coverRaw instanceof File && coverRaw.size > 0 ? coverRaw : null;

  const slug = uniqueCustomSlug(title);
  const art = await processGameArtwork(slug, banner, cover);
  if (typeof art === 'string') return { error: uploadErrorMessage(art, lang) };

  insertCustomGame({
    slug,
    title,
    year,
    genre,
    tags,
    createdBy: user.id,
    colors: art.palette,
    assets: art.assets,
  });

  revalidatePath('/library/new');
  revalidatePath('/library/games');
  revalidatePath(`/game/${slug}`);

  // Hand the user straight back to the relationship form with this title selected.
  redirect(`/library/new?game=${encodeURIComponent(slug)}`);
}

export async function updateCustomGameAction(
  _prev: FormState = EMPTY,
  fd: FormData,
): Promise<FormState> {
  const user = await currentUser();
  const lang = await getLang();
  const t = makeT(lang);
  if (!user) return { error: t('auth_login_required') };

  const slug = str(fd, 'slug');
  const existing = getCustomGame(slug);
  if (!existing || existing.created_by !== user.id) return { error: t('g_not_found') };

  const { title, year, genre, tags } = parseGameFields(fd);
  if (!title) return { error: t('cg_err_title') };

  updateCustomGameDetails(slug, user.id, { title, year, genre, tags });

  // Replacing the artwork is optional on edit.
  const banner = fd.get('banner');
  if (banner instanceof File && banner.size > 0) {
    const coverRaw = fd.get('cover');
    const cover = coverRaw instanceof File && coverRaw.size > 0 ? coverRaw : null;
    const art = await processGameArtwork(slug, banner, cover);
    if (typeof art === 'string') return { error: uploadErrorMessage(art, lang) };
    updateCustomGameArtwork(slug, user.id, art.palette, art.assets);
  }

  revalidatePath('/library/games');
  revalidatePath(`/game/${slug}`);
  revalidatePath('/library');
  revalidatePath('/');
  return { ok: true };
}

export async function deleteCustomGameAction(fd: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect('/login');

  const slug = str(fd, 'slug');
  const existing = getCustomGame(slug);
  if (!existing || existing.created_by !== user.id) redirect('/library/games');

  // Refuse while anyone's relationship still points at this title, so we never
  // leave a library entry pointing at a title that no longer exists.
  if (customGameUsage(slug) > 0) redirect('/library/games?error=in_use');

  if (deleteCustomGame(slug, user.id)) deleteGameArtwork(slug);

  revalidatePath('/library/games');
  revalidatePath('/library/new');
  redirect('/library/games');
}

/* ----------------------------------------------------------------- settings */

export async function updateProfileAction(
  _prev: FormState = EMPTY,
  fd: FormData,
): Promise<FormState> {
  const user = await currentUser();
  const lang = await getLang();
  const t = makeT(lang);
  if (!user) return { error: t('auth_login_required') };

  const displayName = str(fd, 'display_name').slice(0, 48);
  if (!displayName) return { error: t('auth_err_name_required') };

  const handle = str(fd, 'handle').toLowerCase();
  if (!HANDLE_RE.test(handle)) return { error: t('auth_err_handle_invalid') };
  if (handle !== user.handle) {
    const taken = db().prepare(`SELECT 1 FROM users WHERE handle = ? AND id <> ?`).get(handle, user.id);
    if (taken) return { error: t('auth_err_handle_taken') };
  }

  const theme = oneOf<Theme>(str(fd, 'theme'), THEMES, 'crimson');
  const frame = oneOf<AvatarFrame>(str(fd, 'avatar_frame'), AVATAR_FRAMES, 'none');
  const showcase = oneOf<Showcase>(str(fd, 'showcase'), SHOWCASES, 'stats');

  // Only accept a featured relationship the user actually owns.
  const featuredRaw = Number.parseInt(str(fd, 'featured_relationship_id'), 10);
  let featured: number | null = null;
  if (Number.isFinite(featuredRaw)) {
    const rel = getRelationship(featuredRaw);
    if (rel && rel.user_id === user.id) featured = rel.id;
  }

  const rerollAvatar = bool(fd, 'reroll_avatar');
  const avatarSeed = rerollAvatar
    ? `${user.handle}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    : (db().prepare(`SELECT avatar_seed FROM users WHERE id = ?`).get(user.id) as UserRow).avatar_seed;

  db()
    .prepare(
      `UPDATE users SET display_name = ?, handle = ?, bio = ?, real_country = ?,
         theme = ?, avatar_frame = ?, showcase = ?, featured_relationship_id = ?, avatar_seed = ?
       WHERE id = ?`,
    )
    .run(
      displayName,
      handle,
      str(fd, 'bio').slice(0, 1200),
      str(fd, 'country').slice(0, 48),
      theme,
      frame,
      showcase,
      featured,
      avatarSeed,
      user.id,
    );

  const nextLang = str(fd, 'lang');
  if (isLang(nextLang)) await setLangAction(nextLang);

  revalidatePath('/settings');
  revalidatePath(`/id/${handle}`);
  revalidatePath('/', 'layout');

  if (handle !== user.handle) redirect('/settings');
  return { ok: true };
}
