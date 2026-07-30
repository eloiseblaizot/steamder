import Link from 'next/link';
import { notFound } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Avatar, Footer } from '@/components/ui';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';
import { themeVars } from '@/lib/themes';
import { countFriends, getUserByHandle, listRawRelationships } from '@/lib/queries';
import {
  ACHIEVEMENT_TOTAL,
  achDesc,
  achName,
  evaluateAchievements,
} from '@/lib/achievements';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const user = getUserByHandle(handle.toLowerCase());
  return { title: user ? `Succès — ${user.display_name}` : 'Introuvable' };
}

export default async function AchievementsPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const [, { t, lang }, { handle }] = await Promise.all([currentUser(), getT(), params]);

  const owner = getUserByHandle(handle.toLowerCase());
  if (!owner) notFound();

  const rows = listRawRelationships(owner.id);
  const achievements = evaluateAchievements(rows, countFriends(owner.id));
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);
  const pct = Math.round((unlocked.length / ACHIEVEMENT_TOTAL) * 100);

  return (
    <div style={themeVars(owner.theme) as React.CSSProperties}>
      <Chrome
        active="profile"
        subnav={[
          { href: `/id/${owner.handle}`, label: t('nav_profile') },
          { href: `/id/${owner.handle}/library`, label: t('nav_library') },
          { href: `/id/${owner.handle}/achievements`, label: t('prof_achievements'), active: true },
        ]}
      />

      <div className="page">
        <div className="breadcrumbs">
          <Link href={`/id/${owner.handle}`}>{owner.display_name}</Link> &gt; {t('prof_achievements')}
        </div>

        <div
          className="panel_solid"
          style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}
        >
          <Avatar user={owner} size={54} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 300, color: '#fff' }}>
              {t('prof_achievements')} — {owner.display_name}
            </h1>
            <div className="tiny muted" style={{ margin: '4px 0 6px' }}>
              {unlocked.length} / {ACHIEVEMENT_TOTAL} ({pct}%)
            </div>
            <div className="progress">
              <div className="progress_fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <section style={{ marginBottom: 22 }}>
          <h2 className="section_title">
            {lang === 'fr' ? 'Débloqués' : 'Unlocked'}
            <span className="section_title_extra">{unlocked.length}</span>
          </h2>
          {unlocked.length > 0 ? (
            <div className="ach_grid">
              {unlocked.map((a) => (
                <div key={a.id} className="ach">
                  <div className="ach_icon">{a.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="ach_name">{achName(a, lang)}</div>
                    <div className="ach_desc">{achDesc(a, lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="tiny faint">{t('g_none')}</p>
          )}
        </section>

        <section>
          <h2 className="section_title">
            {lang === 'fr' ? 'Verrouillés' : 'Locked'}
            <span className="section_title_extra">{locked.length}</span>
          </h2>
          <div className="ach_grid">
            {locked.map((a) => (
              <div key={a.id} className="ach ach_locked">
                <div className="ach_icon">{a.hidden ? '❔' : a.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="ach_name">
                    {a.hidden ? (lang === 'fr' ? 'Succès caché' : 'Hidden achievement') : achName(a, lang)}
                  </div>
                  <div className="ach_desc">
                    {a.hidden
                      ? lang === 'fr'
                        ? 'Les détails de ce succès restent masqués jusqu’à son obtention.'
                        : 'The details of this achievement stay hidden until it is unlocked.'
                      : achDesc(a, lang)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer t={t} />
    </div>
  );
}
