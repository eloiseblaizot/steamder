import { redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Footer } from '@/components/ui';
import RelationshipForm from '@/components/RelationshipForm';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { formLabels, pickerGames } from '@/lib/formData';
import { gameExists } from '@/lib/catalog';

export const metadata = { title: 'Ajouter une relation' };

export default async function NewRelationshipPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect('/login');

  const [{ t, lang }, sp] = await Promise.all([getT(), searchParams]);
  const preselect = sp.game && gameExists(sp.game) ? sp.game : undefined;

  return (
    <>
      <Chrome
        active="library"
        subnav={[
          { href: '/library', label: t('lib_title') },
          { href: '/library/new', label: t('nav_add'), active: true },
          { href: '/library/games', label: t('cg_mine') },
        ]}
      />

      <div className="page" style={{ maxWidth: 780 }}>
        <div className="breadcrumbs">
          {t('nav_library')} &gt; {t('nav_add')}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 300, color: '#fff', margin: '0 0 16px' }}>
          {t('add_title')}
        </h1>

        <RelationshipForm
          mode="create"
          games={pickerGames(lang)}
          labels={formLabels(t, t('add_submit'))}
          cancelHref="/library"
          preselect={preselect}
        />
      </div>

      <Footer t={t} />
    </>
  );
}
