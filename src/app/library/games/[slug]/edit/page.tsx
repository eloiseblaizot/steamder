import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Footer } from '@/components/ui';
import CustomGameForm from '@/components/CustomGameForm';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { gameFormLabels } from '@/lib/gameFormData';
import { gameCapsule, gameHeader } from '@/lib/catalog';
import { getCustomGame } from '@/lib/customGames';

export const metadata = { title: 'Modifier le jeu' };

export default async function EditGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser();
  if (!user) redirect('/login');

  const [{ t, lang }, { slug }] = await Promise.all([getT(), params]);
  const game = getCustomGame(slug);

  // Only the submitter may edit their own title.
  if (!game || game.created_by !== user.id) notFound();

  return (
    <>
      <Chrome
        active="library"
        subnav={[
          { href: '/library', label: t('lib_title') },
          { href: '/library/games', label: t('cg_mine') },
          { href: `/library/games/${slug}/edit`, label: t('cg_edit'), active: true },
        ]}
      />

      <div className="page" style={{ maxWidth: 760 }}>
        <div className="breadcrumbs">
          <Link href="/library/games">{t('cg_mine')}</Link> &gt;{' '}
          <Link href={`/game/${slug}`}>{game.title}</Link> &gt; {t('cg_edit')}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 300, color: '#fff', margin: '0 0 16px' }}>
          {t('cg_edit_title')}
        </h1>

        <CustomGameForm
          mode="edit"
          labels={gameFormLabels(t, lang, t('cg_save'))}
          cancelHref="/library/games"
          initial={{
            slug: game.slug,
            title: game.title,
            year: game.year,
            genre: game.genre,
            tags: game.tags,
            currentBanner: gameHeader(game.slug),
            currentCover: gameCapsule(game.slug),
          }}
        />
      </div>

      <Footer t={t} />
    </>
  );
}
