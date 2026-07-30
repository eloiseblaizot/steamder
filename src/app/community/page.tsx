import Link from 'next/link';
import Chrome from '@/components/Chrome';
import { Avatar, Footer } from '@/components/ui';
import FriendButton from '@/components/FriendButton';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { countFriends, countRelationships, friendState, listUsers, searchUsers } from '@/lib/queries';
import { relativeTime } from '@/lib/stats';

export const metadata = { title: 'Communauté' };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [viewer, { t, lang }, sp] = await Promise.all([currentUser(), getT(), searchParams]);
  const q = (sp.q ?? '').trim();
  const users = q ? searchUsers(q) : listUsers();
  const viewerId = viewer?.id ?? null;

  return (
    <>
      <Chrome
        active="community"
        searchAction="/community"
        searchPlaceholder={t('search_users_placeholder')}
        subnav={[
          { href: '/community', label: t('com_players'), active: true },
          ...(viewer ? [{ href: '/friends', label: t('nav_friends') }] : []),
        ]}
      />

      <div className="page">
        <h1 className="section_title">
          {t('com_title')}
          <span className="section_title_extra">
            {users.length} {t('com_players').toLowerCase()}
          </span>
        </h1>

        <form action="/community" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t('com_find')}
            aria-label={t('com_find')}
            style={{ maxWidth: 320 }}
          />
          <button type="submit" className="btn btn_secondary">
            {t('com_find')}
          </button>
        </form>

        {users.length === 0 ? (
          <div className="empty_state">
            <h3>{t('com_no_results')}</h3>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 8,
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {users.map((u) => {
              const state = friendState(viewerId, u.id);
              const rels = countRelationships(u.id);
              const friends = countFriends(u.id);
              const online = Date.now() - Date.parse(u.last_seen_at) < 5 * 60_000;

              return (
                <div key={u.id} className="friend_row" style={{ alignItems: 'flex-start' }}>
                  <Link href={`/id/${u.handle}`}>
                    <Avatar user={u} size={48} />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/id/${u.handle}`} className="friend_name">
                      {u.display_name}
                    </Link>
                    <div className="friend_meta">
                      {online ? (
                        <span className="persona_status">{t('prof_online')}</span>
                      ) : (
                        t('prof_offline', { when: relativeTime(u.last_seen_at, lang) })
                      )}
                    </div>
                    <div className="friend_meta" style={{ marginTop: 2 }}>
                      {rels} {t('prof_relationships').toLowerCase()} · {friends}{' '}
                      {t('prof_friends').toLowerCase()}
                      {u.real_country ? ` · ${u.real_country}` : ''}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <FriendButton
                        handle={u.handle}
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
