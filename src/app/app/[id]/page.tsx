import Link from 'next/link';
import { notFound } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Avatar, Footer, ScoreBox, StatusPill, VerdictBadge } from '@/components/ui';
import FriendButton from '@/components/FriendButton';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { gameHeader, gameHero, gameScreenshot, gameTheme, resolveGame } from '@/lib/catalog';
import { friendState, getVisibleRelationship, relationshipsByGame } from '@/lib/queries';
import { genreLabel } from '@/lib/i18n';
import {
  dayCount,
  formatDate,
  formatDuration,
  formatHours,
  hoursPlayed,
  isCurrentlyPlaying,
} from '@/lib/stats';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = getVisibleRelationship(Number.parseInt(id, 10), null);
  if (!found) return { title: 'Introuvable' };
  return { title: resolveGame(found.rel.game_slug).title };
}

export default async function RelationshipPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { t, lang }, { id }] = await Promise.all([currentUser(), getT(), params]);
  const viewerId = user?.id ?? null;

  const found = getVisibleRelationship(Number.parseInt(id, 10), viewerId);
  if (!found) notFound();

  const { rel, owner } = found;
  const game = resolveGame(rel.game_slug);
  const theme = gameTheme(rel.game_slug);
  const isOwner = viewerId === owner.id;
  const state = friendState(viewerId, owner.id);

  const days = dayCount(rel);
  const hours = hoursPlayed(rel);
  const tags = rel.tags.split(',').filter(Boolean);

  // Other people who assigned the same game — Steam's "more like this".
  const others = relationshipsByGame(rel.game_slug, viewerId).filter((o) => o.rel.id !== rel.id);

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
        active="library"
        subnav={[
          { href: '/', label: t('nav_store') },
          ...(user ? [{ href: '/library', label: t('lib_title') }] : []),
          { href: `/id/${owner.handle}`, label: owner.display_name },
          { href: `/game/${game.slug}`, label: game.title, active: true },
        ]}
      />

      {/* --------------------------------------------------------------- hero */}
      <div
        className="app_hero"
        style={{ ['--hero-image' as string]: `url("${gameHero(rel.game_slug)}")` }}
      >
        <div className="app_hero_inner">
          <div className="breadcrumbs">
            <Link href="/">{t('nav_store')}</Link> &gt;{' '}
            <Link href={`/game/${game.slug}`}>{genreLabel(game.genre, lang)}</Link> &gt; {game.title}
          </div>
          <h1 className="app_title">{game.title}</h1>
          <div className="app_subtitle">
            {t('app_owned_by')}{' '}
            <Link href={`/id/${owner.handle}`} style={{ color: '#fff' }}>
              {owner.display_name}
            </Link>
            {' · '}
            {rel.revealed ? (
              <strong style={{ color: theme.accent }}>
                {rel.real_name}
                {rel.real_location ? ` — ${rel.real_location}` : ''}
              </strong>
            ) : (
              <span className="faint">
                🔒 {t('app_hidden_name')}
                {' · '}
                {t('app_hidden_location')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="page">
        <div className="app_columns">
          {/* -------------------------------------------------- media column */}
          <div style={{ minWidth: 0 }}>
            <div className="app_media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gameScreenshot(rel.game_slug, 0)} alt="" width={600} height={338} />
              <div className="app_shots">
                {[1, 2, 3, 4].map((i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={i} src={gameScreenshot(rel.game_slug, i)} alt="" width={600} height={338} loading="lazy" />
                ))}
              </div>
            </div>

            {/* -------------------------------------------------- the review */}
            <section className="panel" style={{ marginTop: 18 }}>
              <h2 className="section_title">{t('app_about')}</h2>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <VerdictBadge verdict={rel.verdict} t={t} />
                  <div className="review_hours" style={{ marginTop: 2 }}>
                    {t('lib_hours_total', {
                      n: hours.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US'),
                    })}
                    {isCurrentlyPlaying(rel.status) && <> · {t('app_still_running')}</>}
                  </div>
                  <p className="review_text" style={{ marginTop: 10 }}>
                    {rel.review || <span className="faint">{t('app_no_review')}</span>}
                  </p>
                </div>
                <ScoreBox score={rel.score} label={t('app_metacritic')} />
              </div>

              {tags.length > 0 && (
                <>
                  <h3 className="section_title" style={{ marginTop: 18, fontSize: 12 }}>
                    {t('app_tags')}
                  </h3>
                  <div className="tag_row">
                    {tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* ------------------------------------- friends-only, or the lock */}
            {rel.revealed ? (
              (rel.private_notes.length > 0 || rel.real_location.length > 0) && (
                <section className="panel" style={{ marginTop: 18 }}>
                  <h2 className="section_title">🔓 {t('section_private')}</h2>
                  <table className="details_table" style={{ marginBottom: 10 }}>
                    <tbody>
                      <tr>
                        <th>{t('f_real_name')}</th>
                        <td>{rel.real_name}</td>
                      </tr>
                      {rel.real_location && (
                        <tr>
                          <th>{t('f_real_location')}</th>
                          <td>{rel.real_location}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {rel.private_notes && <p className="review_text">{rel.private_notes}</p>}
                </section>
              )
            ) : (
              <section className="panel_raised" style={{ marginTop: 18 }}>
                <h2 className="section_title">🔒 {t('app_locked_title')}</h2>
                <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
                  {t('app_locked_body', { name: owner.display_name })}
                </p>
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
              </section>
            )}

            {/* --------------------------------------------- other "players" */}
            <section style={{ marginTop: 18 }}>
              <h2 className="section_title">
                {t('app_other_players')}
                <span className="section_title_extra">{others.length}</span>
              </h2>
              {others.length > 0 ? (
                <div style={{ display: 'grid', gap: 4 }}>
                  {others.slice(0, 8).map(({ rel: other, owner: otherOwner }) => (
                    <Link
                      key={other.id}
                      href={`/app/${other.id}`}
                      className="friend_row"
                      style={{ textDecoration: 'none' }}
                    >
                      <Avatar user={otherOwner} size={32} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="friend_name" style={{ fontSize: 13, display: 'block' }}>
                          {otherOwner.display_name}
                        </span>
                        <span className="friend_meta">
                          {formatHours(hoursPlayed(other), lang)} · {formatDuration(dayCount(other), lang)}
                        </span>
                      </span>
                      <span
                        className={`score_value ${other.score >= 75 ? 'score_high' : other.score >= 50 ? 'score_mid' : 'score_low'}`}
                        style={{ width: 32, height: 24, fontSize: 14 }}
                      >
                        {other.score}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="tiny faint">{t('app_no_other_players')}</p>
              )}
            </section>
          </div>

          {/* --------------------------------------------------- info column */}
          <aside className="app_info">
            <div className="app_info_capsule">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gameHeader(rel.game_slug)} alt={game.title} width={460} height={215} />
            </div>
            <div className="app_info_body">
              <p className="app_blurb" style={{ margin: 0 }}>
                {lang === 'fr'
                  ? `Une partie de ${formatDuration(days, lang)}, ${
                      rel.long_distance ? 'jouée à distance' : 'jouée en local'
                    }, pour ${formatHours(hours, lang)} au compteur.`
                  : `A ${formatDuration(days, lang)} playthrough, ${
                      rel.long_distance ? 'played remotely' : 'played locally'
                    }, for ${formatHours(hours, lang)} on record.`}
              </p>

              <div className="tag_row">
                <StatusPill status={rel.status} t={t} />
                {rel.long_distance === 1 && <span className="pill pill_ld">{t('f_long_distance')}</span>}
                {!rel.revealed && <span className="pill">🔒 {t('app_locked_short')}</span>}
              </div>

              <table className="details_table">
                <tbody>
                  <tr>
                    <th>{t('app_developer')}</th>
                    <td>
                      <Link href={`/id/${owner.handle}`}>{owner.display_name}</Link>
                    </td>
                  </tr>
                  <tr>
                    <th>{t('app_publisher')}</th>
                    <td>{rel.revealed ? rel.real_name : <span className="faint">🔒</span>}</td>
                  </tr>
                  <tr>
                    <th>{t('app_release_date')}</th>
                    <td>{formatDate(rel.started_on, lang)}</td>
                  </tr>
                  {rel.ended_on && (
                    <tr>
                      <th>{t('f_ended')}</th>
                      <td>{formatDate(rel.ended_on, lang)}</td>
                    </tr>
                  )}
                  <tr>
                    <th>{t('f_duration')}</th>
                    <td>{formatDuration(days, lang)}</td>
                  </tr>
                  <tr>
                    <th>{t('app_genre')}</th>
                    <td>
                      <Link href={`/game/${game.slug}`}>{genreLabel(game.genre, lang)}</Link>
                    </td>
                  </tr>
                  <tr>
                    <th>{t('app_players')}</th>
                    <td>{rel.long_distance ? `${t('app_coop')} (online)` : t('app_coop')}</td>
                  </tr>
                  <tr>
                    <th>{t('f_real_location')}</th>
                    <td>
                      {rel.revealed ? (
                        rel.real_location || <span className="faint">{t('g_unknown')}</span>
                      ) : (
                        <span className="faint">🔒 {t('app_hidden_location')}</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* -------------------------------------------- purchase box */}
              <div className="purchase_row">
                <div>
                  <div className="tiny muted">{t('app_playtime_forecast')}</div>
                  <div className="price">{formatHours(hours, lang)}</div>
                </div>
                {isOwner ? (
                  <Link href={`/library/${rel.id}/edit`} className="btn btn_primary">
                    {t('app_edit')}
                  </Link>
                ) : (
                  <div style={{ textAlign: 'right' }}>
                    <div className="tiny muted">{t('app_metacritic')}</div>
                    <div className="price">{rel.score} / 100</div>
                  </div>
                )}
              </div>

              {game.tags.length > 0 && (
                <div>
                  <div className="tiny muted" style={{ marginBottom: 5 }}>
                    {t('app_dlc')}
                  </div>
                  <div className="tag_row">
                    {game.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}
