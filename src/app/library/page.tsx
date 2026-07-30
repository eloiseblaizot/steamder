import Link from 'next/link';
import { redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Capsule, Footer, StatusPill } from '@/components/ui';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { gameCapsule, gameHero, gameSmallCapsule, resolveGame } from '@/lib/catalog';
import { applyVisibility, countFriends, listRawRelationships } from '@/lib/queries';
import { countUnlocked, ACHIEVEMENT_TOTAL } from '@/lib/achievements';
import {
  computeStats,
  formatDate,
  formatDuration,
  formatHours,
  dayCount,
  hoursPlayed,
  isCurrentlyPlaying,
  sortRelationships,
} from '@/lib/stats';
import type { Status } from '@/lib/types';

export const metadata = { title: 'Bibliothèque' };

type Sort = 'recent' | 'hours' | 'score' | 'name';

const SORTS: Sort[] = ['recent', 'hours', 'score', 'name'];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; status?: string; sel?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect('/login');

  const [{ t, lang }, params] = await Promise.all([getT(), searchParams]);

  const rows = listRawRelationships(user.id);
  const friendCount = countFriends(user.id);
  const unlocked = countUnlocked(rows, friendCount);
  const stats = computeStats(rows, unlocked);

  // The owner always sees their own private fields.
  const all = rows.map((r) => applyVisibility(r, true));

  const q = (params.q ?? '').trim().toLowerCase();
  const statusFilter = params.status as Status | undefined;
  const sort: Sort = SORTS.includes(params.sort as Sort) ? (params.sort as Sort) : 'recent';

  let visible = all;
  if (q) {
    visible = visible.filter((rel) => {
      const game = resolveGame(rel.game_slug);
      const name = rel.revealed ? rel.real_name.toLowerCase() : '';
      return (
        game.title.toLowerCase().includes(q) || name.includes(q) || rel.tags.toLowerCase().includes(q)
      );
    });
  }
  if (statusFilter) visible = visible.filter((rel) => rel.status === statusFilter);
  visible = sortRelationships(visible, sort);

  // Hero: the explicitly selected entry, else the most recently started one.
  const selectedId = Number.parseInt(params.sel ?? '', 10);
  const hero =
    all.find((r) => r.id === selectedId) ??
    sortRelationships(all, 'recent').find((r) => r.status !== 'wishlist') ??
    all[0];

  const groups: { key: Status | 'all'; label: string; count: number }[] = [
    { key: 'all', label: t('lib_all'), count: all.length },
    { key: 'ongoing', label: t('st_ongoing'), count: all.filter((r) => r.status === 'ongoing').length },
    {
      key: 'situationship',
      label: t('st_situationship'),
      count: all.filter((r) => r.status === 'situationship').length,
    },
    { key: 'on_hold', label: t('st_on_hold'), count: all.filter((r) => r.status === 'on_hold').length },
    { key: 'ended', label: t('st_ended'), count: all.filter((r) => r.status === 'ended').length },
    { key: 'ghosted', label: t('st_ghosted'), count: all.filter((r) => r.status === 'ghosted').length },
    { key: 'wishlist', label: t('lib_wishlist'), count: all.filter((r) => r.status === 'wishlist').length },
  ];

  const heroGame = hero ? resolveGame(hero.game_slug) : null;

  return (
    <>
      <Chrome
        active="library"
        subnav={[
          { href: '/library', label: t('lib_title'), active: true },
          { href: '/library/new', label: t('nav_add') },
          { href: '/library/games', label: t('cg_mine') },
          { href: `/id/${user.handle}`, label: t('nav_profile') },
          { href: '/friends', label: t('nav_friends') },
        ]}
      />

      <div className="page page_wide">
        {all.length === 0 ? (
          <div className="panel_solid empty_state">
            <h3>{t('lib_empty_title')}</h3>
            <p style={{ marginBottom: 16 }}>{t('lib_empty_body')}</p>
            <Link href="/library/new" className="btn btn_primary">
              + {t('add_submit')}
            </Link>
          </div>
        ) : (
          <div className="library">
            {/* ------------------------------------------------------- sidebar */}
            <aside className="library_sidebar">
              <form action="/library" className="library_search">
                <input
                  className="input"
                  name="q"
                  type="search"
                  defaultValue={params.q ?? ''}
                  placeholder={t('lib_search')}
                  aria-label={t('lib_search')}
                  style={{ fontSize: 12, padding: '5px 8px' }}
                />
                {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
                {sort !== 'recent' && <input type="hidden" name="sort" value={sort} />}
              </form>

              <div className="library_group_title">
                <span>{t('lib_title')}</span>
                <span>{all.length}</span>
              </div>
              {groups.map((g) => {
                const href =
                  g.key === 'all'
                    ? `/library${q ? `?q=${encodeURIComponent(q)}` : ''}`
                    : `/library?status=${g.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
                const isActive = g.key === 'all' ? !statusFilter : statusFilter === g.key;
                return (
                  <Link
                    key={g.key}
                    href={href}
                    className={`library_item ${isActive ? 'active' : ''}`}
                  >
                    <span style={{ flex: 1 }}>{g.label}</span>
                    <span className="tiny faint">{g.count}</span>
                  </Link>
                );
              })}

              <div className="library_group_title" style={{ marginTop: 10 }}>
                <span>{t('lib_count', { n: visible.length })}</span>
              </div>
              {visible.map((rel) => {
                const game = resolveGame(rel.game_slug);
                return (
                  <Link
                    key={rel.id}
                    href={`/app/${rel.id}`}
                    className={`library_item ${hero?.id === rel.id ? 'active' : ''}`}
                    title={rel.revealed ? `${game.title} — ${rel.real_name}` : game.title}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gameSmallCapsule(rel.game_slug)} alt="" width={22} height={22} loading="lazy" />
                    <span>{game.title}</span>
                  </Link>
                );
              })}
              {visible.length === 0 && (
                <p className="tiny faint" style={{ padding: '8px 14px' }}>
                  {t('com_no_results')}
                </p>
              )}
            </aside>

            {/* ---------------------------------------------------- main column */}
            <div className="library_main">
              {hero && heroGame && (
                <div
                  className="library_hero"
                  style={{ backgroundImage: `url("${gameHero(hero.game_slug)}")` }}
                >
                  <div className="library_hero_content">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gameCapsule(hero.game_slug)}
                      alt=""
                      width={130}
                      height={195}
                      style={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.7)', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 400, color: '#fff' }}>
                        {heroGame.title}
                      </h1>
                      <div
                        className="tiny"
                        style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}
                      >
                        <StatusPill status={hero.status} t={t} />
                        {hero.long_distance === 1 && <span className="pill pill_ld">{t('f_long_distance')}</span>}
                        <span className="muted">
                          {t('lib_hours_total', {
                            n: hoursPlayed(hero).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US'),
                          })}
                        </span>
                        <span className="faint">·</span>
                        <span className="muted">{formatDuration(dayCount(hero), lang)}</span>
                      </div>
                      {hero.revealed && (
                        <div className="tiny muted" style={{ marginBottom: 10 }}>
                          {hero.real_name}
                          {hero.real_location ? ` — ${hero.real_location}` : ''}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link href={`/app/${hero.id}`} className="btn_play">
                          ▶{' '}
                          {isCurrentlyPlaying(hero.status)
                            ? t('lib_play')
                            : hero.status === 'wishlist'
                              ? t('lib_install')
                              : t('lib_replay')}
                        </Link>
                        <Link href={`/library/${hero.id}/edit`} className="btn btn_secondary">
                          {t('app_edit')}
                        </Link>
                        <span className="tiny faint">
                          {t('lib_last_played')}: {formatDate(hero.ended_on ?? hero.started_on, lang)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ padding: 18 }}>
                {/* ----------------------------------------------- stat strip */}
                <div className="stat_grid" style={{ marginBottom: 18 }}>
                  <div className="stat">
                    <div className="stat_value">{stats.level}</div>
                    <div className="stat_label">{t('prof_level')}</div>
                  </div>
                  <div className="stat">
                    <div className="stat_value">
                      {stats.totalHours.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                    </div>
                    <div className="stat_label">{t('prof_hours')}</div>
                  </div>
                  <div className="stat">
                    <div className="stat_value">{stats.avgScore}</div>
                    <div className="stat_label">{t('prof_avg_score')}</div>
                  </div>
                  <div className="stat">
                    <div className="stat_value">
                      {unlocked}
                      <span className="tiny faint"> / {ACHIEVEMENT_TOTAL}</span>
                    </div>
                    <div className="stat_label">{t('prof_achievements')}</div>
                  </div>
                </div>

                {/* --------------------------------------------- sort + grid */}
                <div className="tabs">
                  {SORTS.map((s) => {
                    const sp = new URLSearchParams();
                    if (q) sp.set('q', q);
                    if (statusFilter) sp.set('status', statusFilter);
                    sp.set('sort', s);
                    return (
                      <Link
                        key={s}
                        href={`/library?${sp.toString()}`}
                        className={`tab ${sort === s ? 'active' : ''}`}
                      >
                        {t(`sort_${s}` as 'sort_recent')}
                      </Link>
                    );
                  })}
                </div>

                {visible.length > 0 ? (
                  <div className="capsule_grid">
                    {visible.map((rel) => (
                      <Capsule key={rel.id} rel={rel} t={t} lang={lang} showLock={false} />
                    ))}
                  </div>
                ) : (
                  <div className="empty_state">
                    <h3>{t('com_no_results')}</h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer t={t} />
    </>
  );
}
