import Link from 'next/link';
import { notFound } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Footer, ReviewCard, ScoreBox, StoreRow } from '@/components/ui';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { realFacts, steamStoreUrl } from '@/lib/assets';
import {
  gameExists,
  gameHeader,
  gameHero,
  gameScreenshot,
  gameTheme,
  resolveGame,
} from '@/lib/catalog';
import { genreLabel } from '@/lib/i18n';
import { getUserById, relationshipsByGame } from '@/lib/queries';
import { computeStats, formatDate, formatHours, hoursPlayed, reviewSummaryLabel } from '@/lib/stats';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = resolveGame(slug);
  return { title: game.title };
}

/**
 * A game's own page: the aggregate view of everyone who assigned this title to a
 * relationship. This is Steam's store page for a game, where the "reviews" are
 * other people's relationships.
 */
export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const [user, { t, lang }, { slug }] = await Promise.all([currentUser(), getT(), params]);

  if (!gameExists(slug)) notFound();
  const game = resolveGame(slug);

  const viewerId = user?.id ?? null;
  const theme = gameTheme(game.slug);
  const facts = realFacts(game.slug);
  const steamUrl = steamStoreUrl(game.slug);
  const author = game.custom && game.authorId ? getUserById(game.authorId) : null;
  const entries = relationshipsByGame(game.slug, viewerId);
  const stats = computeStats(entries.map((e) => e.rel));
  const summary = reviewSummaryLabel(stats.reviewSummary, lang);
  const withReviews = entries.filter((e) => e.rel.review.trim().length > 0);
  const totalHours = entries.reduce((a, e) => a + hoursPlayed(e.rel), 0);

  return (
    <div
      style={
        {
          '--game-deep': theme.deep,
          '--game-mid': theme.mid,
          '--game-accent': theme.accent,
          '--page-top': theme.pageTop,
          '--page-bottom': theme.pageBottom,
        } as React.CSSProperties
      }
    >
      <Chrome
        active="store"
        subnav={[
          { href: '/', label: t('nav_store') },
          { href: `/game/${game.slug}`, label: game.title, active: true },
        ]}
      />

      <div
        className="app_hero"
        style={{ ['--hero-image' as string]: `url("${gameHero(game.slug)}")` }}
      >
        <div className="app_hero_inner">
          <div className="breadcrumbs">
            <Link href="/">{t('nav_store')}</Link> &gt; {genreLabel(game.genre, lang)} &gt; {game.title}
          </div>
          <h1 className="app_title">{game.title}</h1>
          <div
            className="app_subtitle"
            style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
          >
            {game.custom && <span className="pill pill_accent">{t('cg_badge')}</span>}
            {game.year > 0 && <span>{game.year}</span>}
            <span>{genreLabel(game.genre, lang)}</span>
            <span className="faint">·</span>
            <span>
              {entries.length} {t('prof_relationships').toLowerCase()}
            </span>
            {author && (
              <>
                <span className="faint">·</span>
                <span>
                  {t('cg_by')}{' '}
                  <Link href={`/id/${author.handle}`} style={{ color: '#fff' }}>
                    {author.display_name}
                  </Link>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="page">
        <div className="app_columns">
          <div style={{ minWidth: 0 }}>
            <div className="app_media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gameScreenshot(game.slug, 0)} alt="" width={600} height={338} />
              <div className="app_shots">
                {[1, 2, 3, 4].map((i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={i} src={gameScreenshot(game.slug, i)} alt="" width={600} height={338} loading="lazy" />
                ))}
              </div>
            </div>

            <section style={{ marginTop: 18 }}>
              <h2 className="section_title">
                {t('app_all_reviews')}
                <span className="section_title_extra">
                  <span className={`summary_${summary.tone}`}>{summary.label}</span>
                </span>
              </h2>
              {withReviews.length > 0 ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {withReviews.map(({ rel, owner }) => (
                    <ReviewCard key={rel.id} rel={rel} owner={owner} t={t} lang={lang} />
                  ))}
                </div>
              ) : (
                <p className="tiny faint">{t('app_no_review')}</p>
              )}
            </section>

            {entries.length > 0 && (
              <section style={{ marginTop: 18 }}>
                <h2 className="section_title">{t('app_other_players')}</h2>
                {entries.map(({ rel, owner }) => (
                  <StoreRow key={rel.id} rel={rel} owner={owner} t={t} lang={lang} showOwner />
                ))}
              </section>
            )}
          </div>

          <aside className="app_info">
            <div className="app_info_capsule">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gameHeader(game.slug)} alt={game.title} width={460} height={215} />
            </div>
            <div className="app_info_body">
              <p className="app_blurb" style={{ margin: 0 }}>
                {lang === 'fr'
                  ? `${entries.length} personne${entries.length === 1 ? '' : 's'} ont assigné ce titre à une relation, pour ${formatHours(totalHours, lang)} cumulées.`
                  : `${entries.length} ${entries.length === 1 ? 'person has' : 'people have'} assigned this title to a relationship, for ${formatHours(totalHours, lang)} combined.`}
              </p>

              {facts?.description && (
                <p className="app_blurb faint" style={{ margin: 0, fontSize: 12 }}>
                  {facts.description.split('\n')[0].slice(0, 320)}
                </p>
              )}

              {entries.length > 0 && <ScoreBox score={stats.avgScore} label={t('app_metacritic')} />}

              <table className="details_table">
                <tbody>
                  {author && (
                    <tr>
                      <th>{t('cg_by')}</th>
                      <td>
                        <Link href={`/id/${author.handle}`}>{author.display_name}</Link>
                      </td>
                    </tr>
                  )}
                  {/* Real facts about the actual game, from RAWG. */}
                  {facts?.developers.length ? (
                    <tr>
                      <th>{t('app_developer')}</th>
                      <td>{facts.developers.slice(0, 2).join(', ')}</td>
                    </tr>
                  ) : null}
                  {facts?.publishers.length ? (
                    <tr>
                      <th>{t('app_publisher')}</th>
                      <td>{facts.publishers.slice(0, 2).join(', ')}</td>
                    </tr>
                  ) : null}
                  <tr>
                    <th>{t('app_genre')}</th>
                    <td>
                      {facts?.genres.length ? facts.genres.slice(0, 3).join(', ') : genreLabel(game.genre, lang)}
                    </td>
                  </tr>
                  {facts?.released ? (
                    <tr>
                      <th>{t('app_release_date')}</th>
                      <td>{formatDate(facts.released, lang)}</td>
                    </tr>
                  ) : game.year > 0 ? (
                    <tr>
                      <th>{t('app_release_date')}</th>
                      <td>{game.year}</td>
                    </tr>
                  ) : null}
                  {facts?.platforms.length ? (
                    <tr>
                      <th>{t('app_players')}</th>
                      <td>{facts.platforms.slice(0, 4).join(', ')}</td>
                    </tr>
                  ) : null}
                  {facts?.metacritic ? (
                    <tr>
                      <th>Metacritic</th>
                      <td>
                        <span className={facts.metacritic >= 75 ? 'summary_positive' : 'summary_mixed'}>
                          {facts.metacritic} / 100
                        </span>
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <th>{t('prof_relationships')}</th>
                    <td>{entries.length}</td>
                  </tr>
                  {entries.length > 0 && (
                    <>
                      <tr>
                        <th>{t('prof_avg_score')}</th>
                        <td>{stats.avgScore} / 100</td>
                      </tr>
                      <tr>
                        <th>{t('prof_avg_hours')}</th>
                        <td>{formatHours(stats.avgHours, lang)}</td>
                      </tr>
                      <tr>
                        <th>{t('v_recommended')}</th>
                        <td>{Math.round(stats.positiveShare * 100)}%</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              <div>
                <div className="tiny muted" style={{ marginBottom: 5 }}>
                  {t('app_tags')}
                </div>
                <div className="tag_row">
                  {game.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {game.custom && author && user?.id === author.id && (
                <Link href={`/library/games/${game.slug}/edit`} className="btn btn_secondary btn_block">
                  {t('cg_edit')}
                </Link>
              )}

              {steamUrl && (
                <a
                  href={steamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn_secondary btn_block"
                >
                  {lang === 'fr' ? 'Voir sur Steam' : 'View on Steam'} ↗
                </a>
              )}

              {user && (
                <Link href="/library/new" className="btn btn_primary btn_block">
                  + {t('nav_add')}
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}
