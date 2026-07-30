import Link from 'next/link';
import Chrome from '@/components/Chrome';
import { Capsule, Footer, ReviewCard, StoreRow, Stat } from '@/components/ui';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { gameHeader, gameHero, resolveGame } from '@/lib/catalog';
import { GAME_COUNT } from '@/lib/games';
import {
  allRelationshipsForStats,
  featuredRelationship,
  platformTotals,
  recentRelationships,
  recentReviews,
  topRatedRelationships,
  trendingGames,
} from '@/lib/queries';
import { formatHours, hoursPlayed, reviewSummaryLabel, computeStats } from '@/lib/stats';
import { genreLabel } from '@/lib/i18n';

export default async function StorePage() {
  const [user, { t, lang }] = await Promise.all([currentUser(), getT()]);
  const viewerId = user?.id ?? null;

  const totals = platformTotals();
  const allRows = allRelationshipsForStats();
  const globalHours = allRows.reduce((a, r) => a + hoursPlayed(r), 0);
  const globalStats = computeStats(allRows);
  const summary = reviewSummaryLabel(globalStats.reviewSummary, lang);

  const featured = featuredRelationship(viewerId);
  const recent = recentRelationships(viewerId, 6);
  const topRated = topRatedRelationships(viewerId, 12);
  const reviews = recentReviews(viewerId, 4);
  const trending = trendingGames(8);

  return (
    <>
      <Chrome
        active="store"
        searchAction="/community"
        searchPlaceholder={t('search_users_placeholder')}
        subnav={[
          { href: '/', label: t('store_featured'), active: true },
          { href: '/library', label: t('nav_library') },
          { href: '/community', label: t('nav_community') },
          ...(user ? [{ href: '/library/new', label: t('nav_add') }] : []),
        ]}
      />

      <div className="page">
        {/* ---------------------------------------- featured, Steam's big capsule */}
        {featured ? (
          <section style={{ marginBottom: 26 }}>
            <h2 className="section_title">
              {t('store_featured')}
              <span className="section_title_extra">
                {t('store_players_now', { n: totals.ongoing })}
              </span>
            </h2>

            <Link
              href={`/app/${featured.rel.id}`}
              style={{
                display: 'block',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                background: '#1a0710',
              }}
            >
              <div
                style={{
                  height: 300,
                  backgroundImage: `url("${gameHero(featured.rel.game_slug)}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 'auto 0 0 0',
                  padding: '46px 20px 18px',
                  background: 'linear-gradient(180deg, transparent, rgba(15,4,9,0.95))',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 18,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="tiny" style={{ color: '#f5a3c0', letterSpacing: '0.1em' }}>
                    {t('store_special_offer').toUpperCase()}
                  </div>
                  <h3 style={{ margin: '2px 0 4px', fontSize: 28, fontWeight: 400, color: '#fff' }}>
                    {resolveGame(featured.rel.game_slug).title}
                  </h3>
                  <div className="tiny muted">
                    {t('app_owned_by')} {featured.owner.display_name} ·{' '}
                    {genreLabel(resolveGame(featured.rel.game_slug).genre, lang)} ·{' '}
                    {formatHours(hoursPlayed(featured.rel), lang)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Steam only shows the badge when there is an actual discount. */}
                  {featured.rel.score < 100 && (
                    <span className="discount_badge">-{100 - featured.rel.score}%</span>
                  )}
                  <span
                    className={`score_value ${featured.rel.score >= 75 ? 'score_high' : featured.rel.score >= 50 ? 'score_mid' : 'score_low'}`}
                  >
                    {featured.rel.score}
                  </span>
                </div>
              </div>
            </Link>
          </section>
        ) : (
          <section className="panel_solid" style={{ marginBottom: 26 }}>
            <h1 style={{ fontSize: 26, fontWeight: 300, margin: '0 0 8px', color: '#fff' }}>
              {t('store_hero_title')}
            </h1>
            <p style={{ margin: '0 0 14px', maxWidth: 620, lineHeight: 1.6 }}>{t('store_hero_body')}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href={user ? '/library/new' : '/register'} className="btn btn_primary">
                {t('store_cta_start')}
              </Link>
              <Link href="/community" className="btn btn_secondary">
                {t('store_cta_browse')}
              </Link>
            </div>
          </section>
        )}

        {/* --------------------------------------------------- platform counters */}
        <section style={{ marginBottom: 26 }}>
          <div className="stat_grid">
            <Stat value={totals.relationships} label={t('store_stat_relationships')} />
            <Stat value={totals.users} label={t('store_stat_players')} />
            <Stat value={globalHours.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} label={t('store_stat_hours')} />
            <Stat value={GAME_COUNT} label={t('store_stat_games')} />
          </div>
        </section>

        <div className="store_layout">
          <div style={{ minWidth: 0 }}>
            {/* ------------------------------------------- new & trending rows */}
            <section style={{ marginBottom: 26 }}>
              <h2 className="section_title">
                {t('store_new_arrivals')}
                <span className="section_title_extra">
                  <span className={`summary_${summary.tone}`}>{summary.label}</span>
                </span>
              </h2>
              {recent.length > 0 ? (
                recent.map(({ rel, owner }) => (
                  <StoreRow key={rel.id} rel={rel} owner={owner} t={t} lang={lang} showOwner />
                ))
              ) : (
                <div className="empty_state">
                  <h3>{t('lib_empty_title')}</h3>
                  <p>{t('lib_empty_body')}</p>
                </div>
              )}
            </section>

            {/* ------------------------------------------------ top rated grid */}
            {topRated.length > 0 && (
              <section style={{ marginBottom: 26 }}>
                <h2 className="section_title">
                  {t('store_top_rated')}
                  <Link href="/community" className="section_title_extra">
                    {t('store_browse_all')} →
                  </Link>
                </h2>
                <div className="capsule_grid">
                  {topRated.map(({ rel }) => (
                    <Capsule key={rel.id} rel={rel} t={t} lang={lang} />
                  ))}
                </div>
              </section>
            )}

            {/* -------------------------------------------------- recent reviews */}
            {reviews.length > 0 && (
              <section>
                <h2 className="section_title">{t('store_recent_reviews')}</h2>
                <div style={{ display: 'grid', gap: 8 }}>
                  {reviews.map(({ rel, owner }) => (
                    <ReviewCard key={rel.id} rel={rel} owner={owner} t={t} lang={lang} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ------------------------------------------------------- right rail */}
          <aside style={{ minWidth: 0 }}>
            <div className="spotlight" style={{ marginBottom: 14 }}>
              <h2 className="section_title" style={{ marginBottom: 8 }}>
                {t('store_trending')}
              </h2>
              <div style={{ display: 'grid', gap: 6 }}>
                {trending.map(({ game_slug, plays, avg }) => {
                  const game = resolveGame(game_slug);
                  return (
                    <Link
                      key={game_slug}
                      href={`/game/${game_slug}`}
                      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={gameHeader(game_slug)}
                        alt=""
                        width={64}
                        height={30}
                        style={{ borderRadius: 2, flexShrink: 0 }}
                        loading="lazy"
                      />
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: 12,
                            color: '#fff',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {game.title}
                        </span>
                        <span className="tiny muted">
                          {plays} × · {avg}/100
                        </span>
                      </span>
                    </Link>
                  );
                })}
                {trending.length === 0 && <p className="tiny muted">{t('g_none')}</p>}
              </div>
            </div>

            {!user && (
              <div className="panel_raised">
                <h3 style={{ margin: '0 0 6px', fontSize: 15, color: '#fff', fontWeight: 400 }}>
                  {t('store_hero_title')}
                </h3>
                <p className="tiny" style={{ margin: '0 0 10px', lineHeight: 1.6 }}>
                  {t('store_hero_body')}
                </p>
                <Link href="/register" className="btn btn_primary btn_block">
                  {t('nav_register')}
                </Link>
              </div>
            )}

            {user && (
              <div className="panel_raised">
                <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#fff', fontWeight: 400 }}>
                  {t('nav_add')}
                </h3>
                <Link href="/library/new" className="btn btn_primary btn_block">
                  + {t('add_submit')}
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Footer t={t} />
    </>
  );
}
