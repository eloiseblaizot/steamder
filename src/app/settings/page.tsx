import { redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Footer } from '@/components/ui';
import SettingsForm from './SettingsForm';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { resolveGame } from '@/lib/catalog';
import { listRawRelationships } from '@/lib/queries';
import { frameKey, showcaseKey, themeKey } from '@/lib/i18n';
import { AVATAR_FRAMES, SHOWCASES, THEMES } from '@/lib/types';

export const metadata = { title: 'Paramètres' };

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect('/login');

  const { t, lang } = await getT();
  const rels = listRawRelationships(user.id);

  return (
    <>
      <Chrome
        active="profile"
        subnav={[
          { href: `/id/${user.handle}`, label: t('nav_profile') },
          { href: '/settings', label: t('nav_settings'), active: true },
        ]}
      />

      <div className="page" style={{ maxWidth: 720 }}>
        <h1 className="section_title" style={{ fontSize: 18 }}>
          {t('set_title')}
        </h1>

        <SettingsForm
          initial={{
            display_name: user.display_name,
            handle: user.handle,
            bio: user.bio,
            country: user.real_country,
            theme: user.theme,
            avatar_frame: user.avatar_frame,
            showcase: user.showcase,
            featured_relationship_id: user.featured_relationship_id,
            avatar_seed: user.avatar_seed,
          }}
          lang={lang}
          labels={{
            displayName: t('set_display_name'),
            handle: t('set_handle'),
            bio: t('set_bio'),
            country: t('set_country'),
            theme: t('set_theme'),
            frame: t('set_frame'),
            showcase: t('set_showcase'),
            avatar: t('set_avatar'),
            reroll: t('set_avatar_reroll'),
            featured: t('set_featured'),
            featuredNone: t('set_featured_none'),
            save: t('set_save'),
            saved: t('set_saved'),
            lang: t('set_lang'),
            handleHint: t('auth_handle_hint'),
            themes: THEMES.map((v) => ({ value: v, label: t(themeKey(v)) })),
            frames: AVATAR_FRAMES.map((v) => ({ value: v, label: t(frameKey(v)) })),
            showcases: SHOWCASES.map((v) => ({ value: v, label: t(showcaseKey(v)) })),
            relationships: rels.map((r) => ({
              id: r.id,
              label: `${resolveGame(r.game_slug).title} — ${r.real_name}`,
            })),
          }}
        />
      </div>

      <Footer t={t} />
    </>
  );
}
