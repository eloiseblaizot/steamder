/**
 * Derived statistics for a library.
 *
 * The central conceit: a relationship's duration converts into "hours played",
 * the way Steam counts playtime. Being physically together logs more hours per
 * day than a long-distance relationship, and a wishlisted entry has never been
 * launched, so it logs none.
 */

import 'server-only';
import { gameGenre, resolveGame } from './catalog';
import type { Genre } from './games';
import type { RelationshipRow, Status, VisibleRelationship } from './types';

/** Hours logged per calendar day of the relationship. */
const HOURS_PER_DAY_TOGETHER = 4.2;
const HOURS_PER_DAY_REMOTE = 1.6;

export function dayCount(rel: { started_on: string; ended_on: string | null }): number {
  const start = Date.parse(`${rel.started_on}T00:00:00Z`);
  if (Number.isNaN(start)) return 0;
  const endRaw = rel.ended_on ? Date.parse(`${rel.ended_on}T00:00:00Z`) : Date.now();
  const end = Number.isNaN(endRaw) ? Date.now() : endRaw;
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

export function hoursPlayed(rel: {
  started_on: string;
  ended_on: string | null;
  long_distance: 0 | 1;
  status: Status;
}): number {
  if (rel.status === 'wishlist') return 0;
  const rate = rel.long_distance ? HOURS_PER_DAY_REMOTE : HOURS_PER_DAY_TOGETHER;
  return Math.round(dayCount(rel) * rate);
}

export function isOngoing(status: Status): boolean {
  return status === 'ongoing' || status === 'situationship' || status === 'on_hold';
}

/** Human duration, e.g. "2 years 3 months" / "17 days". */
export function formatDuration(days: number, lang: 'fr' | 'en'): string {
  if (days < 31) {
    return lang === 'fr' ? `${days} jour${days === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'}`;
  }
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30.44);
  const parts: string[] = [];
  if (years > 0) {
    parts.push(lang === 'fr' ? `${years} an${years === 1 ? '' : 's'}` : `${years} year${years === 1 ? '' : 's'}`);
  }
  if (months > 0) {
    parts.push(lang === 'fr' ? `${months} mois` : `${months} month${months === 1 ? '' : 's'}`);
  }
  if (parts.length === 0) {
    parts.push(lang === 'fr' ? `${days} jours` : `${days} days`);
  }
  return parts.join(' ');
}

export function formatHours(hours: number, lang: 'fr' | 'en'): string {
  const n = hours >= 1000 ? hours.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US') : String(hours);
  return lang === 'fr' ? `${n} h` : `${n} hrs`;
}

export function formatDate(iso: string, lang: 'fr' | 'en'): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Relative "last seen" wording. */
export function relativeTime(iso: string, lang: 'fr' | 'en'): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const mins = Math.max(0, Math.round((Date.now() - then) / 60_000));
  if (mins < 6) return lang === 'fr' ? 'à l’instant' : 'just now';
  if (mins < 60) return lang === 'fr' ? `il y a ${mins} min` : `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return lang === 'fr' ? `il y a ${hours} h` : `${hours} hrs ago`;
  const days = Math.round(hours / 24);
  if (days < 31) return lang === 'fr' ? `il y a ${days} j` : `${days} days ago`;
  const months = Math.round(days / 30.44);
  if (months < 12) return lang === 'fr' ? `il y a ${months} mois` : `${months} months ago`;
  const years = Math.round(months / 12);
  return lang === 'fr' ? `il y a ${years} an${years === 1 ? '' : 's'}` : `${years} yr ago`;
}

/** A relationship is "online" (currently playing) when it is still running. */
export function isCurrentlyPlaying(status: Status): boolean {
  return status === 'ongoing' || status === 'situationship';
}

export interface LibraryStats {
  total: number;
  /** Everything except wishlist entries — the actually-played library. */
  played: number;
  wishlisted: number;
  totalHours: number;
  avgHours: number;
  avgScore: number;
  bestScore: number;
  worstScore: number;
  longestDays: number;
  shortestDays: number;
  recommended: number;
  notRecommended: number;
  positiveShare: number;
  longDistance: number;
  longDistanceShare: number;
  completed: number;
  abandoned: number;
  ongoing: number;
  completionRate: number;
  perfectGames: number;
  distinctGenres: number;
  distinctGames: number;
  byStatus: { status: Status; count: number }[];
  byGenre: { genre: Genre; count: number }[];
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  reviewSummary: 'overwhelmingly_positive' | 'positive' | 'mixed' | 'negative' | 'none';
}

/** XP curve: each level costs a little more than the last, like Steam's badges. */
const XP_BASE = 400;

function levelFromXp(xp: number): { level: number; into: number; need: number } {
  let level = 0;
  let remaining = xp;
  let cost = XP_BASE;
  while (remaining >= cost && level < 200) {
    remaining -= cost;
    level += 1;
    cost = XP_BASE + level * 120;
  }
  return { level, into: Math.round(remaining), need: Math.round(cost) };
}

type StatSource = Pick<
  RelationshipRow,
  'status' | 'verdict' | 'score' | 'long_distance' | 'started_on' | 'ended_on' | 'game_slug'
>;

export function computeStats(rels: StatSource[], achievementCount = 0): LibraryStats {
  const played = rels.filter((r) => r.status !== 'wishlist');
  const hours = played.map((r) => hoursPlayed(r));
  const totalHours = hours.reduce((a, b) => a + b, 0);
  const days = played.map((r) => dayCount(r));

  const scores = played.map((r) => r.score);
  const recommended = played.filter((r) => r.verdict === 'recommended').length;
  const notRecommended = played.length - recommended;
  const longDistance = played.filter((r) => r.long_distance === 1).length;

  const completed = rels.filter((r) => r.status === 'ended').length;
  const abandoned = rels.filter((r) => r.status === 'ghosted').length;
  const ongoing = rels.filter((r) => isOngoing(r.status)).length;
  const finished = completed + abandoned;

  const statusCounts = new Map<Status, number>();
  for (const r of rels) statusCounts.set(r.status, (statusCounts.get(r.status) ?? 0) + 1);

  const genreCounts = new Map<Genre, number>();
  for (const r of rels) {
    const g = gameGenre(r.game_slug);
    genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
  }

  const positiveShare = played.length > 0 ? recommended / played.length : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  let reviewSummary: LibraryStats['reviewSummary'] = 'none';
  if (played.length > 0) {
    if (positiveShare >= 0.9 && played.length >= 4) reviewSummary = 'overwhelmingly_positive';
    else if (positiveShare >= 0.7) reviewSummary = 'positive';
    else if (positiveShare >= 0.4) reviewSummary = 'mixed';
    else reviewSummary = 'negative';
  }

  const xp = Math.round(totalHours * 0.6 + rels.length * 180 + achievementCount * 90);
  const { level, into, need } = levelFromXp(xp);

  return {
    total: rels.length,
    played: played.length,
    wishlisted: rels.length - played.length,
    totalHours,
    avgHours: played.length > 0 ? Math.round(totalHours / played.length) : 0,
    avgScore,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    worstScore: scores.length > 0 ? Math.min(...scores) : 0,
    longestDays: days.length > 0 ? Math.max(...days) : 0,
    shortestDays: days.length > 0 ? Math.min(...days) : 0,
    recommended,
    notRecommended,
    positiveShare,
    longDistance,
    longDistanceShare: played.length > 0 ? longDistance / played.length : 0,
    completed,
    abandoned,
    ongoing,
    completionRate: finished > 0 ? completed / finished : 0,
    perfectGames: played.filter((r) => r.score >= 95).length,
    distinctGenres: genreCounts.size,
    distinctGames: new Set(rels.map((r) => r.game_slug)).size,
    byStatus: [...statusCounts.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    byGenre: [...genreCounts.entries()]
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count),
    level,
    xp,
    xpIntoLevel: into,
    xpForLevel: need,
    reviewSummary,
  };
}

/** Steam's review-summary wording, in both languages. */
export function reviewSummaryLabel(
  summary: LibraryStats['reviewSummary'],
  lang: 'fr' | 'en',
): { label: string; tone: 'positive' | 'mixed' | 'negative' } {
  const table = {
    overwhelmingly_positive: {
      en: 'Overwhelmingly Positive',
      fr: 'Extrêmement positives',
      tone: 'positive' as const,
    },
    positive: { en: 'Mostly Positive', fr: 'Plutôt positives', tone: 'positive' as const },
    mixed: { en: 'Mixed', fr: 'Moyennes', tone: 'mixed' as const },
    negative: { en: 'Mostly Negative', fr: 'Plutôt négatives', tone: 'negative' as const },
    none: { en: 'No reviews yet', fr: 'Aucune évaluation', tone: 'mixed' as const },
  };
  const entry = table[summary];
  return { label: lang === 'fr' ? entry.fr : entry.en, tone: entry.tone };
}

/** Score → colour band, matching the Metacritic box on a Steam store page. */
export function scoreBand(score: number): 'score_high' | 'score_mid' | 'score_low' {
  if (score >= 75) return 'score_high';
  if (score >= 50) return 'score_mid';
  return 'score_low';
}

/** Sort helper shared by the library views. */
export function sortRelationships<T extends VisibleRelationship>(
  rels: T[],
  by: 'recent' | 'hours' | 'score' | 'name',
): T[] {
  const copy = [...rels];
  switch (by) {
    case 'hours':
      return copy.sort((a, b) => hoursPlayed(b) - hoursPlayed(a));
    case 'score':
      return copy.sort((a, b) => b.score - a.score);
    case 'name':
      return copy.sort((a, b) =>
        resolveGame(a.game_slug).title.localeCompare(resolveGame(b.game_slug).title),
      );
    default:
      return copy.sort((a, b) => b.started_on.localeCompare(a.started_on));
  }
}
