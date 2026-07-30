import Link from 'next/link';
import { redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Avatar, Footer } from '@/components/ui';
import { acceptFriendAction, removeFriendAction } from '@/app/actions';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import {
  countRelationships,
  listFriends,
  listPendingIncoming,
  listPendingOutgoing,
} from '@/lib/queries';
import { relativeTime } from '@/lib/stats';
import type { PublicUser } from '@/lib/types';

export const metadata = { title: 'Amis' };

export default async function FriendsPage() {
  const user = await currentUser();
  if (!user) redirect('/login');

  const { t, lang } = await getT();

  const incoming = listPendingIncoming(user.id);
  const outgoing = listPendingOutgoing(user.id);
  const friends = listFriends(user.id);

  function Row({ u, children }: { u: PublicUser; children?: React.ReactNode }) {
    const online = Date.now() - Date.parse(u.last_seen_at) < 5 * 60_000;
    return (
      <div className="friend_row">
        <Link href={`/id/${u.handle}`}>
          <Avatar user={u} size={44} />
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
            {' · '}
            {t('fr_shared', { n: countRelationships(u.id) })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>{children}</div>
      </div>
    );
  }

  return (
    <>
      <Chrome
        active="community"
        subnav={[
          { href: '/community', label: t('com_players') },
          { href: '/friends', label: t('nav_friends'), active: true },
        ]}
      />

      <div className="page">
        <h1 className="section_title">
          {t('fr_title')}
          <span className="section_title_extra">{friends.length}</span>
        </h1>

        {/* -------------------------------------------------- incoming invites */}
        <section style={{ marginBottom: 22 }}>
          <h2 className="section_title">
            {t('fr_incoming')}
            <span className="section_title_extra">{incoming.length}</span>
          </h2>
          {incoming.length > 0 ? (
            <div style={{ display: 'grid', gap: 5 }}>
              {incoming.map((u) => (
                <Row key={u.id} u={u}>
                  <form action={acceptFriendAction}>
                    <input type="hidden" name="handle" value={u.handle} />
                    <button type="submit" className="btn btn_primary btn_sm">
                      {t('fr_accept')}
                    </button>
                  </form>
                  <form action={removeFriendAction}>
                    <input type="hidden" name="handle" value={u.handle} />
                    <button type="submit" className="btn btn_ghost btn_sm">
                      {t('fr_decline')}
                    </button>
                  </form>
                </Row>
              ))}
            </div>
          ) : (
            <p className="tiny faint">{t('fr_none_incoming')}</p>
          )}
        </section>

        {/* -------------------------------------------------- outgoing invites */}
        <section style={{ marginBottom: 22 }}>
          <h2 className="section_title">
            {t('fr_outgoing')}
            <span className="section_title_extra">{outgoing.length}</span>
          </h2>
          {outgoing.length > 0 ? (
            <div style={{ display: 'grid', gap: 5 }}>
              {outgoing.map((u) => (
                <Row key={u.id} u={u}>
                  <form action={removeFriendAction}>
                    <input type="hidden" name="handle" value={u.handle} />
                    <button type="submit" className="btn btn_ghost btn_sm">
                      {t('fr_cancel')}
                    </button>
                  </form>
                </Row>
              ))}
            </div>
          ) : (
            <p className="tiny faint">{t('fr_none_outgoing')}</p>
          )}
        </section>

        {/* ------------------------------------------------------- friend list */}
        <section>
          <h2 className="section_title">
            {t('fr_yours')}
            <span className="section_title_extra">{friends.length}</span>
          </h2>
          {friends.length > 0 ? (
            <div style={{ display: 'grid', gap: 5 }}>
              {friends.map((u) => (
                <Row key={u.id} u={u}>
                  <Link href={`/id/${u.handle}/library`} className="btn btn_secondary btn_sm">
                    {t('nav_library')}
                  </Link>
                  <form action={removeFriendAction}>
                    <input type="hidden" name="handle" value={u.handle} />
                    <button type="submit" className="btn btn_ghost btn_sm">
                      ✕
                    </button>
                  </form>
                </Row>
              ))}
            </div>
          ) : (
            <div className="empty_state">
              <p style={{ marginBottom: 14 }}>{t('fr_none')}</p>
              <Link href="/community" className="btn btn_primary">
                {t('com_find')}
              </Link>
            </div>
          )}
        </section>
      </div>

      <Footer t={t} />
    </>
  );
}
