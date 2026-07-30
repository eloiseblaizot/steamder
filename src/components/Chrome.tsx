import Link from 'next/link';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { avatarUrl } from '@/lib/artUrl';
import { listPendingIncoming } from '@/lib/queries';
import { logoutAction } from '@/app/actions';
import LangSwitch from './LangSwitch';

interface Props {
  /** Which primary nav entry to light up. */
  active?: 'store' | 'library' | 'community' | 'profile';
  /** Sub-navigation entries, as Steam's store does under the global header. */
  subnav?: { href: string; label: string; active?: boolean }[];
  /** Search box target, e.g. /community. */
  searchAction?: string;
  searchPlaceholder?: string;
}

/**
 * Steam's two-tier chrome: a dark global header with the logo and uppercase
 * primary nav, then an optional darker sub-navigation strip.
 */
export default async function Chrome({ active, subnav, searchAction, searchPlaceholder }: Props) {
  const [user, { t, lang }] = await Promise.all([currentUser(), getT()]);
  const pending = user ? listPendingIncoming(user.id).length : 0;

  return (
    <>
      <header className="global_header">
        <div className="global_header_inner">
          <Link href="/" className="steamder_logo" aria-label="STEAMDER">
            {/* Static asset, not user content — plain img keeps this a server component. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/icon-64.png" alt="" width={34} height={34} />
            <span className="steamder_logo_word">Steamder</span>
          </Link>

          <nav className="global_nav">
            <Link href="/" className={active === 'store' ? 'active' : undefined}>
              {t('nav_store')}
            </Link>
            <Link href="/library" className={active === 'library' ? 'active' : undefined}>
              {t('nav_library')}
            </Link>
            <Link href="/community" className={active === 'community' ? 'active' : undefined}>
              {t('nav_community')}
            </Link>
            {user && (
              <Link href="/friends">
                {t('nav_friends')}
                {pending > 0 && <span className="pill pill_accent" style={{ marginLeft: 6 }}>{pending}</span>}
              </Link>
            )}
          </nav>

          <div className="global_actions">
            <LangSwitch lang={lang} />
            {user ? (
              <>
                <Link href={`/id/${user.handle}`} className="header_avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarUrl(user.avatar_seed)} alt="" width={26} height={26} />
                  <span>{user.display_name}</span>
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="btn btn_ghost btn_sm">
                    {t('nav_logout')}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn_ghost btn_sm">
                  {t('nav_login')}
                </Link>
                <Link href="/register" className="btn btn_primary btn_sm">
                  {t('nav_register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="subnav">
        <div className="subnav_inner">
          {(subnav ?? []).map((item) => (
            <Link key={item.href} href={item.href} className={item.active ? 'active' : undefined}>
              {item.label}
            </Link>
          ))}
          <span className="subnav_spacer" />
          {searchAction && (
            <form action={searchAction} className="nav_search" role="search">
              <input
                type="search"
                name="q"
                placeholder={searchPlaceholder ?? t('search_placeholder')}
                aria-label={searchPlaceholder ?? t('search_placeholder')}
              />
              <button type="submit" aria-label={t('search_placeholder')}>
                ⌕
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
