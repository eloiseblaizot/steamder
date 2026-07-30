import Link from 'next/link';
import { avatarUrl } from '@/lib/artUrl';
import { gameCapsule, gameHeader, resolveGame } from '@/lib/catalog';
import { genreLabel, statusKey, verdictKey, type Lang, type Translate } from '@/lib/i18n';
import {
  dayCount,
  formatDate,
  formatDuration,
  formatHours,
  hoursPlayed,
  isCurrentlyPlaying,
  scoreBand,
} from '@/lib/stats';
import type { PublicUser, Status, Verdict, VisibleRelationship } from '@/lib/types';

/* -------------------------------------------------------------------- avatar */

export function Avatar({
  user,
  size = 40,
  frame = true,
}: {
  user: PublicUser;
  size?: number;
  frame?: boolean;
}) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={avatarUrl(user.avatar_seed)}
      alt=""
      width={size}
      height={size}
      className={frame ? `avatar_sm avatar_frame_${user.avatar_frame}` : 'avatar_sm'}
      style={{ width: size, height: size }}
    />
  );
}

/* --------------------------------------------------------------------- pills */

export function StatusPill({ status, t }: { status: Status; t: Translate }) {
  const cls =
    status === 'ghosted'
      ? 'pill pill_negative'
      : status === 'ongoing'
        ? 'pill pill_accent'
        : status === 'on_hold' || status === 'wishlist'
          ? 'pill pill_mixed'
          : 'pill';
  return <span className={cls}>{t(statusKey(status))}</span>;
}

export function VerdictBadge({ verdict, t }: { verdict: Verdict; t: Translate }) {
  const up = verdict === 'recommended';
  return (
    <span className="review_verdict">
      <span className={up ? 'thumb thumb_up' : 'thumb thumb_down'} aria-hidden>
        {up ? '👍' : '👎'}
      </span>
      <span className={up ? 'summary_positive' : 'summary_negative'}>{t(verdictKey(verdict))}</span>
    </span>
  );
}

/** Steam's Metacritic-style score box. */
export function ScoreBox({ score, label }: { score: number; label: string }) {
  return (
    <div className="score_box">
      <div className={`score_value ${scoreBand(score)}`}>{score}</div>
      <div className="score_label">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ capsules */

/**
 * Portrait library capsule. Shows the assigned game's generated art plus the
 * public facts — never the private ones, which `VisibleRelationship` omits
 * outright for non-friends.
 */
export function Capsule({
  rel,
  t,
  lang,
  showLock = true,
}: {
  rel: VisibleRelationship;
  t: Translate;
  lang: Lang;
  showLock?: boolean;
}) {
  const game = resolveGame(rel.game_slug);
  const hours = hoursPlayed(rel);

  return (
    <Link href={`/app/${rel.id}`} className="capsule" title={game.title}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={gameCapsule(rel.game_slug)} alt={game.title} width={600} height={900} loading="lazy" />
      <span className="capsule_badge">
        <StatusPill status={rel.status} t={t} />
        {rel.long_distance === 1 && <span className="pill pill_ld">{t('f_long_distance')}</span>}
        {showLock && !rel.revealed && <span className="pill">🔒</span>}
      </span>
      <span className="capsule_footer">
        <span>{formatHours(hours, lang)}</span>
        <span className={rel.verdict === 'recommended' ? 'summary_positive' : 'summary_negative'}>
          {rel.score}
        </span>
      </span>
    </Link>
  );
}

/** Steam's horizontal store row: wide thumbnail, title, meta, score on the right. */
export function StoreRow({
  rel,
  owner,
  t,
  lang,
  showOwner = false,
}: {
  rel: VisibleRelationship;
  owner?: PublicUser;
  t: Translate;
  lang: Lang;
  showOwner?: boolean;
}) {
  const game = resolveGame(rel.game_slug);
  const days = dayCount(rel);

  return (
    <Link href={`/app/${rel.id}`} className="store_row">
      <span className="store_row_thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={gameHeader(rel.game_slug)} alt={game.title} width={184} height={86} loading="lazy" />
      </span>
      <span className="store_row_body">
        <span className="store_row_title">{game.title}</span>
        <span className="store_row_meta">
          <StatusPill status={rel.status} t={t} />
          <span>{formatDuration(days, lang)}</span>
          <span className="faint">·</span>
          <span>{formatHours(hoursPlayed(rel), lang)}</span>
          {rel.long_distance === 1 && <span className="pill pill_ld">{t('f_long_distance')}</span>}
        </span>
        {showOwner && owner && (
          <span className="store_row_meta">
            {t('app_owned_by')} <strong style={{ color: '#fff' }}>{owner.display_name}</strong>
          </span>
        )}
      </span>
      <span className="store_row_side">
        <span className={`score_value ${scoreBand(rel.score)}`} style={{ width: 34, height: 26, fontSize: 15 }}>
          {rel.score}
        </span>
        <span className="tiny muted">{genreLabel(game.genre, lang)}</span>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------- review */

/** Steam community review card. */
export function ReviewCard({
  rel,
  owner,
  t,
  lang,
}: {
  rel: VisibleRelationship;
  owner: PublicUser;
  t: Translate;
  lang: Lang;
}) {
  const game = resolveGame(rel.game_slug);

  return (
    <article className="review">
      <div className="review_left">
        <Link href={`/id/${owner.handle}`} className="review_author">
          <Avatar user={owner} size={32} />
          <span>{owner.display_name}</span>
        </Link>
        <Link href={`/app/${rel.id}`} className="tiny">
          {game.title}
        </Link>
        <span className="tiny faint">{formatDate(rel.started_on, lang)}</span>
        {!rel.revealed && <span className="pill">🔒 {t('app_locked_short')}</span>}
      </div>
      <div className="review_body">
        <VerdictBadge verdict={rel.verdict} t={t} />
        <div className="review_hours">
          {t('lib_hours_total', { n: formatHours(hoursPlayed(rel), lang).replace(/\s?(h|hrs)$/, '') })}
          {isCurrentlyPlaying(rel.status) && <> · {t('app_still_running')}</>}
        </div>
        <p className="review_text">{rel.review || t('app_no_review')}</p>
        {rel.tags.length > 0 && (
          <div className="tag_row" style={{ marginTop: 9 }}>
            {rel.tags
              .split(',')
              .filter(Boolean)
              .map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------- charts */

/** Horizontal bar row used by the stats panels. */
export function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="bar_row">
      <span className="muted nowrap" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </span>
      <span className="bar_track">
        <span className="bar_fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="bar_count">{count}</span>
    </div>
  );
}

export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="stat">
      <div className="stat_value">{value}</div>
      <div className="stat_label">{label}</div>
    </div>
  );
}

/* -------------------------------------------------------------------- footer */

export function Footer({ t }: { t: Translate }) {
  return (
    <footer className="footer">
      <div className="footer_inner">
        <p style={{ margin: '0 0 8px' }}>{t('footer_parody')}</p>
        <p style={{ margin: 0 }}>{t('footer_privacy')}</p>
      </div>
    </footer>
  );
}
