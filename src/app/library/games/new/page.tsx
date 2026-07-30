import Link from 'next/link';
import { redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Footer } from '@/components/ui';
import CustomGameForm from '@/components/CustomGameForm';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { gameFormLabels } from '@/lib/gameFormData';
import { countCustomGamesBy, MAX_GAMES_PER_USER } from '@/lib/customGames';

export const metadata = { title: 'Ajouter un jeu' };

export default async function NewGamePage() {
  const user = await currentUser();
  if (!user) redirect('/login');

  const { t, lang } = await getT();
  const used = countCustomGamesBy(user.id);
  const atLimit = used >= MAX_GAMES_PER_USER;

  return (
    <>
      <Chrome
        active="library"
        subnav={[
          { href: '/library', label: t('lib_title') },
          { href: '/library/new', label: t('nav_add') },
          { href: '/library/games', label: t('cg_mine') },
          { href: '/library/games/new', label: t('cg_add_cta'), active: true },
        ]}
      />

      <div className="page" style={{ maxWidth: 760 }}>
        <div className="breadcrumbs">
          <Link href="/library">{t('nav_library')}</Link> &gt;{' '}
          <Link href="/library/games">{t('cg_mine')}</Link> &gt; {t('cg_add_cta')}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 300, color: '#fff', margin: '0 0 6px' }}>
          {t('cg_add_title')}
        </h1>
        <p className="tiny muted" style={{ margin: '0 0 16px' }}>
          {t('cg_count', { n: used, max: MAX_GAMES_PER_USER })}
        </p>

        {atLimit ? (
          <div className="panel_solid empty_state">
            <h3>{t('cg_err_limit', { n: MAX_GAMES_PER_USER })}</h3>
            <Link href="/library/games" className="btn btn_secondary" style={{ marginTop: 12 }}>
              {t('cg_manage')}
            </Link>
          </div>
        ) : (
          <CustomGameForm
            mode="create"
            labels={gameFormLabels(t, lang, t('cg_submit'))}
            cancelHref="/library/games"
          />
        )}
      </div>

      <Footer t={t} />
    </>
  );
}
