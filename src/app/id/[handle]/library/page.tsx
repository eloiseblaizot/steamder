import Link from 'next/link';
import { notFound } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Avatar, Capsule, Footer, StoreRow } from '@/components/ui';
import FriendButton from '@/components/FriendButton';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { themeVars } from '@/lib/themes';
import {
  friendState,
  getUserByHandle,
  listRelationshipsFor,
} from '@/lib/queries';
import { sortRelationships } from '@/lib/stats';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const user = getUserByHandle(handle.toLowerCase());
  return { title: user ? `Bibliothèque — ${user.display_name}` : 'Introuvable' };
}

type Sort = 'recent' | 'hours' | 'score' | 'name';
const SORTS: Sort[] = ['recent', 'hours', 'score', 'name'];

export default async function PublicLibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string; view?: string }>;
}) {
  const [viewer, { t, lang }, { handle }, sp] = await Promise.all([
    currentUser(),
    getT(),
    params,
    searchParams,
  ]);

  const owner = getUserByHandle(handle.toLowerCase());
  if (!owner) notFound();

  const viewerId = viewer?.id ?? null;
  const state = friendState(viewerId, owner.id);
  const revealed = state === 'self' || state === 'friends';

  const sort: Sort = SORTS.includes(sp.sort as Sort) ? (sp.sort as Sort) : 'recent';
  const view = sp.view === 'list' ? 'list' : 'grid';
  const rels = sortRelationships(listRelationshipsFor(owner.id, viewerId), sort);

  return (
    <div style={themeVars(owner.theme) as React.CSSProperties}>
      <Chrome
        active="profile"
        subnav={[
          { href: `/id/${owner.handle}`, label: t('nav_profile') },
          { href: `/id/${owner.handle}/library`, label: t('nav_library'), active: true },
          { href: `/id/${owner.handle}/achievements`, label: t('prof_achievements') },
        ]}
      />

      <div className="page">
        <div className="breadcrumbs">
          <Link href={`/id/${owner.handle}`}>{owner.display_name}</Link> &gt; {t('nav_library')}
        </div>

        <div
          className="panel_solid"
          style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}
        >
          <Avatar user={owner} size={54} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 300, color: '#fff' }}>
              {owner.display_name}
            </h1>
            <div className="tiny muted">{t('lib_count', { n: rels.length })}</div>
          </div>
          {!revealed && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="pill">🔒 {t('prof_public_note')}</span>
              <FriendButton
                handle={owner.handle}
                state={state}
                compact
                labels={{
                  add: t('prof_add_friend'),
                  pending: t('prof_pending'),
                  accept: t('prof_accept'),
                  friends: t('prof_is_friend'),
                  remove: t('prof_remove_friend'),
                  login: t('prof_login_to_add'),
                }}
              />
            </div>
          )}
          {revealed && <span className="pill pill_accent">🔓 {t('prof_private_note')}</span>}
        </div>

        <div className="tabs">
          {SORTS.map((s) => (
            <Link
              key={s}
              href={`/id/${owner.handle}/library?sort=${s}&view=${view}`}
              className={`tab ${sort === s ? 'active' : ''}`}
            >
              {t(`sort_${s}` as 'sort_recent')}
            </Link>
          ))}
          <span style={{ flex: 1 }} />
          <Link
            href={`/id/${owner.handle}/library?sort=${sort}&view=grid`}
            className={`tab ${view === 'grid' ? 'active' : ''}`}
          >
            ▦
          </Link>
          <Link
            href={`/id/${owner.handle}/library?sort=${sort}&view=list`}
            className={`tab ${view === 'list' ? 'active' : ''}`}
          >
            ☰
          </Link>
        </div>

        {rels.length === 0 ? (
          <div className="empty_state">
            <h3>{t('lib_empty_title')}</h3>
          </div>
        ) : view === 'grid' ? (
          <div className="capsule_grid">
            {rels.map((rel) => (
              <Capsule key={rel.id} rel={rel} t={t} lang={lang} />
            ))}
          </div>
        ) : (
          <div>
            {rels.map((rel) => (
              <StoreRow key={rel.id} rel={rel} t={t} lang={lang} />
            ))}
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}
