import Link from 'next/link';
import { notFound } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Avatar, BarRow, Capsule, Footer, Stat, StoreRow } from '@/components/ui';
import FriendButton from '@/components/FriendButton';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { avatarUrl } from '@/lib/artUrl';
import { themeVars } from '@/lib/themes';
import { gameCapsule, resolveGame } from '@/lib/catalog';
import { genreLabel, statusKey } from '@/lib/i18n';
import {
  countFriends,
  friendState,
  getUserByHandle,
  listFriends,
  listRawRelationships,
  listRelationshipsFor,
} from '@/lib/queries';
import {
  ACHIEVEMENT_TOTAL,
  achDesc,
  achName,
  evaluateAchievements,
} from '@/lib/achievements';
import {
  computeStats,
  formatDuration,
  formatHours,
  hoursPlayed,
  relativeTime,
  reviewSummaryLabel,
  sortRelationships,
} from '@/lib/stats';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const user = getUserByHandle(handle.toLowerCase());
  return { title: user ? user.display_name : 'Introuvable' };
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const [viewer, { t, lang }, { handle }] = await Promise.all([currentUser(), getT(), params]);

  const owner = getUserByHandle(handle.toLowerCase());
  if (!owner) notFound();

  const viewerId = viewer?.id ?? null;
  const state = friendState(viewerId, owner.id);
  const isSelf = viewerId === owner.id;
  const revealed = state === 'self' || state === 'friends';

  // Stats and achievements are computed from raw rows (aggregate only — see the
  // privacy note in achievements.ts); everything rendered goes through the
  // visibility-filtered list.
  const rawRows = listRawRelationships(owner.id);
  const friendCount = countFriends(owner.id);
  const achievements = evaluateAchievements(rawRows, friendCount);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const stats = computeStats(rawRows, unlockedCount);
  const summary = reviewSummaryLabel(stats.reviewSummary, lang);

  const rels = listRelationshipsFor(owner.id, viewerId);
  const recent = sortRelationships(rels, 'recent');
  const topRated = sortRelationships(rels, 'score');
  const friends = listFriends(owner.id).slice(0, 12);

  const featured =
    rels.find((r) => r.id === owner.featured_relationship_id) ??
    topRated.find((r) => r.status !== 'wishlist');

  const onlineNow = Date.now() - Date.parse(owner.last_seen_at) < 5 * 60_000;
  const maxStatus = Math.max(1, ...stats.byStatus.map((s) => s.count));
  const maxGenre = Math.max(1, ...stats.byGenre.map((g) => g.count));

  const showcaseUnlocked = achievements.filter((a) => a.unlocked);
  const visibleAchievements = achievements.filter((a) => a.unlocked || !a.hidden);

  return (
    <div style={themeVars(owner.theme) as React.CSSProperties}>
      <Chrome
        active="profile"
        subnav={[
          { href: `/id/${owner.handle}`, label: t('nav_profile'), active: true },
          { href: `/id/${owner.handle}/library`, label: t('nav_library') },
          { href: `/id/${owner.handle}/achievements`, label: t('prof_achievements') },
          ...(isSelf ? [{ href: '/settings', label: t('nav_settings') }] : []),
        ]}
      />

      {/* ------------------------------------------------------ profile header */}
      <header className="profile_header">
        <div className="profile_header_inner">
          <div className={`avatar_full avatar_frame_${owner.avatar_frame}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl(owner.avatar_seed)} alt="" width={164} height={164} />
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 className="persona_name">{owner.display_name}</h1>
              <div className="level_badge" title={`${t('prof_level')} ${stats.level}`}>
                {stats.level}
              </div>
            </div>
            <div className="persona_handle">
              /id/{owner.handle}
              {owner.real_country ? ` · ${owner.real_country}` : ''}
            </div>
            <div className={onlineNow ? 'persona_status' : 'persona_handle'} style={{ marginTop: 4 }}>
              {onlineNow
                ? t('prof_online')
                : t('prof_offline', { when: relativeTime(owner.last_seen_at, lang) })}
            </div>

            <p style={{ margin: '10px 0 0', maxWidth: 560, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
              {owner.bio || <span style={{ opacity: 0.6 }}>{t('prof_no_bio')}</span>}
            </p>

            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {isSelf ? (
                <Link href="/settings" className="btn btn_secondary">
                  {t('prof_edit')}
                </Link>
              ) : (
                <FriendButton
                  handle={owner.handle}
                  state={state}
                  labels={{
                    add: t('prof_add_friend'),
                    pending: t('prof_pending'),
                    accept: t('prof_accept'),
                    friends: t('prof_is_friend'),
                    remove: t('prof_remove_friend'),
                    login: t('prof_login_to_add'),
                  }}
                />
              )}
              <span className={`pill ${revealed ? 'pill_accent' : ''}`}>
                {revealed ? `🔓 ${t('prof_private_note')}` : `🔒 ${t('prof_public_note')}`}
              </span>
            </div>
          </div>

          {/* Steam's right-hand counter stack. */}
          <div className="profile_counts">
            <Link href={`/id/${owner.handle}/library`} className="count_row">
              <span>{t('prof_relationships')}</span>
              <span className="count_value">{stats.total}</span>
            </Link>
            <div className="count_row">
              <span>{t('prof_hours')}</span>
              <span className="count_value">
                {stats.totalHours.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
              </span>
            </div>
            <Link href={`/id/${owner.handle}/achievements`} className="count_row">
              <span>{t('prof_achievements')}</span>
              <span className="count_value">
                {unlockedCount}
                <span className="tiny faint"> / {ACHIEVEMENT_TOTAL}</span>
              </span>
            </Link>
            <div className="count_row">
              <span>{t('prof_friends')}</span>
              <span className="count_value">{friendCount}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="page">
        <div className="profile_body">
          {/* ------------------------------------------------- main column */}
          <div style={{ minWidth: 0 }}>
            {/* featured showcase */}
            {featured && (
              <section style={{ marginBottom: 20 }}>
                <h2 className="section_title">
                  {t('prof_favourite')}
                  <span className="section_title_extra">
                    <span className={`summary_${summary.tone}`}>{summary.label}</span>
                  </span>
                </h2>
                <div className="panel" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link href={`/app/${featured.id}`} style={{ flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gameCapsule(featured.game_slug)}
                      alt=""
                      width={120}
                      height={180}
                      style={{ borderRadius: 3, display: 'block' }}
                    />
                  </Link>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Link href={`/app/${featured.id}`} style={{ fontSize: 19, color: '#fff' }}>
                      {resolveGame(featured.game_slug).title}
                    </Link>
                    <div className="tiny muted" style={{ margin: '4px 0 8px' }}>
                      {genreLabel(resolveGame(featured.game_slug).genre, lang)} ·{' '}
                      {formatHours(hoursPlayed(featured), lang)} · {t(statusKey(featured.status))}
                    </div>
                    <p className="review_text tiny" style={{ margin: 0 }}>
                      {featured.review || t('app_no_review')}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* showcase: whichever widget the user pinned */}
            <section style={{ marginBottom: 20 }}>
              <h2 className="section_title">
                {t('prof_showcase')}
                <span className="section_title_extra">{t(`sc_${owner.showcase}` as 'sc_stats')}</span>
              </h2>

              {owner.showcase === 'stats' && (
                <div className="panel">
                  <div className="stat_grid" style={{ marginBottom: 14 }}>
                    <Stat value={stats.avgScore} label={t('prof_avg_score')} />
                    <Stat
                      value={stats.avgHours.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                      label={t('prof_avg_hours')}
                    />
                    <Stat value={formatDuration(stats.longestDays, lang)} label={t('prof_longest')} />
                    <Stat value={`${Math.round(stats.completionRate * 100)}%`} label={t('prof_completion')} />
                    <Stat value={`${Math.round(stats.longDistanceShare * 100)}%`} label={t('prof_ld_share')} />
                    <Stat value={stats.perfectGames} label={t('prof_perfect_games')} />
                  </div>

                  <h3 className="section_title" style={{ fontSize: 12 }}>
                    {t('prof_by_status')}
                  </h3>
                  {stats.byStatus.map((s) => (
                    <BarRow key={s.status} label={t(statusKey(s.status))} count={s.count} max={maxStatus} />
                  ))}

                  <h3 className="section_title" style={{ fontSize: 12, marginTop: 14 }}>
                    {t('prof_by_genre')}
                  </h3>
                  {stats.byGenre.slice(0, 8).map((g) => (
                    <BarRow key={g.genre} label={genreLabel(g.genre, lang)} count={g.count} max={maxGenre} />
                  ))}
                </div>
              )}

              {owner.showcase === 'achievements' && (
                <div className="ach_grid">
                  {showcaseUnlocked.slice(0, 12).map((a) => (
                    <div key={a.id} className="ach">
                      <div className="ach_icon">{a.icon}</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="ach_name">{achName(a, lang)}</div>
                        <div className="ach_desc">{achDesc(a, lang)}</div>
                      </div>
                    </div>
                  ))}
                  {showcaseUnlocked.length === 0 && (
                    <p className="tiny faint">{t('g_none')}</p>
                  )}
                </div>
              )}

              {(owner.showcase === 'top_rated' || owner.showcase === 'worst_rated') && (
                <div>
                  {(owner.showcase === 'top_rated' ? topRated : [...topRated].reverse())
                    .filter((r) => r.status !== 'wishlist')
                    .slice(0, 5)
                    .map((rel) => (
                      <StoreRow key={rel.id} rel={rel} t={t} lang={lang} />
                    ))}
                </div>
              )}
            </section>

            {/* recent activity */}
            <section>
              <h2 className="section_title">
                {t('prof_recent_activity')}
                <Link href={`/id/${owner.handle}/library`} className="section_title_extra">
                  {t('g_view_all')} →
                </Link>
              </h2>
              {recent.length > 0 ? (
                recent.slice(0, 6).map((rel) => <StoreRow key={rel.id} rel={rel} t={t} lang={lang} />)
              ) : (
                <p className="tiny faint">{t('lib_empty_body')}</p>
              )}
            </section>
          </div>

          {/* ------------------------------------------------- right column */}
          <aside style={{ minWidth: 0, display: 'grid', gap: 14 }}>
            {/* level / xp */}
            <div className="spotlight">
              <h2 className="section_title" style={{ marginBottom: 8 }}>
                {t('prof_level')} {stats.level}
              </h2>
              <div className="progress">
                <div
                  className="progress_fill"
                  style={{ width: `${Math.round((stats.xpIntoLevel / stats.xpForLevel) * 100)}%` }}
                />
              </div>
              <p className="tiny muted" style={{ margin: '6px 0 0' }}>
                {stats.xpIntoLevel} / {stats.xpForLevel} XP
              </p>
            </div>

            {/* achievement progress */}
            <div className="spotlight">
              <h2 className="section_title" style={{ marginBottom: 8 }}>
                {t('prof_achievements')}
                <span className="section_title_extra">
                  {unlockedCount} / {ACHIEVEMENT_TOTAL}
                </span>
              </h2>
              <div className="progress" style={{ marginBottom: 10 }}>
                <div
                  className="progress_fill"
                  style={{ width: `${Math.round((unlockedCount / ACHIEVEMENT_TOTAL) * 100)}%` }}
                />
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {visibleAchievements
                  .slice(0, 18)
                  .map((a) => (
                    <span
                      key={a.id}
                      className="ach_icon"
                      title={`${achName(a, lang)} — ${achDesc(a, lang)}`}
                      style={{
                        width: 30,
                        height: 30,
                        fontSize: 15,
                        opacity: a.unlocked ? 1 : 0.28,
                        filter: a.unlocked ? 'none' : 'grayscale(1)',
                      }}
                    >
                      {a.icon}
                    </span>
                  ))}
              </div>
              <Link href={`/id/${owner.handle}/achievements`} className="tiny" style={{ display: 'inline-block', marginTop: 8 }}>
                {t('g_view_all')} →
              </Link>
            </div>

            {/* friends */}
            <div className="spotlight">
              <h2 className="section_title" style={{ marginBottom: 8 }}>
                {t('prof_friends')}
                <span className="section_title_extra">{friendCount}</span>
              </h2>
              {friends.length > 0 ? (
                <div style={{ display: 'grid', gap: 5 }}>
                  {friends.map((f) => (
                    <Link
                      key={f.id}
                      href={`/id/${f.handle}`}
                      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                    >
                      <Avatar user={f} size={28} />
                      <span
                        style={{
                          fontSize: 12,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {f.display_name}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="tiny faint">{t('g_none')}</p>
              )}
            </div>

            {/* wishlist teaser */}
            {stats.wishlisted > 0 && (
              <div className="spotlight">
                <h2 className="section_title" style={{ marginBottom: 8 }}>
                  {t('lib_wishlist')}
                  <span className="section_title_extra">{stats.wishlisted}</span>
                </h2>
                <div className="capsule_grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {rels
                    .filter((r) => r.status === 'wishlist')
                    .slice(0, 3)
                    .map((rel) => (
                      <Capsule key={rel.id} rel={rel} t={t} lang={lang} />
                    ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}
