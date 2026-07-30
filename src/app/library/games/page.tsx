import Link from 'next/link';
import { redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Footer } from '@/components/ui';
import DeleteCustomGame from './DeleteCustomGame';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { gameHeader } from '@/lib/catalog';
import { genreLabel } from '@/lib/i18n';
import {
  customGameUsage,
  listCustomGamesBy,
  MAX_GAMES_PER_USER,
} from '@/lib/customGames';

export const metadata = { title: 'Vos jeux' };

export default async function MyGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect('/login');

  const [{ t, lang }, sp] = await Promise.all([getT(), searchParams]);
  const games = listCustomGamesBy(user.id);

  return (
    <>
      <Chrome
        active="library"
        subnav={[
          { href: '/library', label: t('lib_title') },
          { href: '/library/new', label: t('nav_add') },
          { href: '/library/games', label: t('cg_mine'), active: true },
          { href: '/library/games/new', label: t('cg_add_cta') },
        ]}
      />

      <div className="page" style={{ maxWidth: 860 }}>
        <div className="breadcrumbs">
          <Link href="/library">{t('nav_library')}</Link> &gt; {t('cg_mine')}
        </div>

        <h1 className="section_title">
          {t('cg_mine')}
          <span className="section_title_extra">
            {t('cg_count', { n: games.length, max: MAX_GAMES_PER_USER })}
          </span>
        </h1>

        {sp.error === 'in_use' && (
          <div className="form_error" style={{ marginBottom: 14 }}>
            {t('cg_delete_blocked')}
          </div>
        )}

        <p style={{ marginTop: 0, marginBottom: 16 }}>
          <Link href="/library/games/new" className="btn btn_primary">
            + {t('cg_add_cta')}
          </Link>
        </p>

        {games.length === 0 ? (
          <div className="empty_state">
            <h3>{t('cg_mine_none')}</h3>
            <p>{t('cg_intro')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 6 }}>
            {games.map((g) => {
              const usage = customGameUsage(g.slug);
              return (
                <div key={g.slug} className="store_row" style={{ cursor: 'default' }}>
                  <Link href={`/game/${g.slug}`} className="store_row_thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gameHeader(g.slug)} alt="" width={184} height={86} loading="lazy" />
                  </Link>
                  <div className="store_row_body">
                    <Link href={`/game/${g.slug}`} className="store_row_title">
                      {g.title}
                    </Link>
                    <div className="store_row_meta">
                      <span className="pill">{t('cg_badge')}</span>
                      <span>{genreLabel(g.genre, lang)}</span>
                      {g.year > 0 && (
                        <>
                          <span className="faint">·</span>
                          <span>{g.year}</span>
                        </>
                      )}
                      <span className="faint">·</span>
                      <span className={usage > 0 ? undefined : 'faint'}>
                        {usage > 0
                          ? t('cg_used_by', {
                              n:
                                lang === 'fr'
                                  ? `${usage} relation${usage === 1 ? '' : 's'}`
                                  : `${usage} relationship${usage === 1 ? '' : 's'}`,
                            })
                          : t('cg_unused')}
                      </span>
                    </div>
                  </div>
                  <div className="store_row_side" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Link href={`/library/games/${g.slug}/edit`} className="btn btn_secondary btn_sm">
                      {t('cg_edit')}
                    </Link>
                    {usage === 0 ? (
                      <DeleteCustomGame
                        slug={g.slug}
                        label={t('cg_delete')}
                        confirmText={t('cg_delete_confirm')}
                      />
                    ) : (
                      <button type="button" className="btn btn_ghost btn_sm" disabled title={t('cg_delete_blocked')}>
                        {t('cg_delete')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer t={t} />
    </>
  );
}
