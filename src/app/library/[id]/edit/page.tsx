import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Footer } from '@/components/ui';
import RelationshipForm from '@/components/RelationshipForm';
import DeleteRelationship from './DeleteRelationship';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { formLabels, pickerGames } from '@/lib/formData';
import { getRelationship } from '@/lib/queries';
import { resolveGame } from '@/lib/catalog';

export const metadata = { title: 'Modifier la relation' };

export default async function EditRelationshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect('/login');

  const [{ t, lang }, { id }] = await Promise.all([getT(), params]);
  const rel = getRelationship(Number.parseInt(id, 10));

  // A relationship can only be edited by its owner.
  if (!rel || rel.user_id !== user.id) notFound();

  const game = resolveGame(rel.game_slug);

  return (
    <>
      <Chrome
        active="library"
        subnav={[
          { href: '/library', label: t('lib_title') },
          { href: `/app/${rel.id}`, label: game.title },
          { href: `/library/${rel.id}/edit`, label: t('app_edit'), active: true },
        ]}
      />

      <div className="page" style={{ maxWidth: 780 }}>
        <div className="breadcrumbs">
          <Link href="/library">{t('nav_library')}</Link> &gt;{' '}
          <Link href={`/app/${rel.id}`}>{game.title}</Link> &gt; {t('app_edit')}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 300, color: '#fff', margin: '0 0 16px' }}>
          {t('edit_title')}
        </h1>

        <RelationshipForm
          mode="edit"
          games={pickerGames(lang)}
          labels={formLabels(t, t('edit_submit'))}
          cancelHref={`/app/${rel.id}`}
          initial={{
            id: rel.id,
            real_name: rel.real_name,
            real_location: rel.real_location,
            private_notes: rel.private_notes,
            game_slug: rel.game_slug,
            status: rel.status,
            verdict: rel.verdict,
            score: rel.score,
            long_distance: rel.long_distance === 1,
            started_on: rel.started_on,
            ended_on: rel.ended_on ?? '',
            review: rel.review,
            tags: rel.tags,
          }}
        />

        <div className="panel" style={{ marginTop: 26, borderColor: 'rgba(192,102,60,0.35)' }}>
          <DeleteRelationship
            id={rel.id}
            label={t('edit_delete')}
            confirmText={t('edit_delete_confirm')}
          />
        </div>
      </div>

      <Footer t={t} />
    </>
  );
}
