'use client';

import { useActionState, useState } from 'react';
import { updateProfileAction, type FormState } from '@/app/actions';
import { avatarUrl } from '@/lib/artUrl';
import { THEME_COLORS } from '@/lib/themes';
import type { AvatarFrame, Showcase, Theme } from '@/lib/types';
import type { Lang } from '@/lib/i18n';

interface Initial {
  display_name: string;
  handle: string;
  bio: string;
  country: string;
  theme: Theme;
  avatar_frame: AvatarFrame;
  showcase: Showcase;
  featured_relationship_id: number | null;
  avatar_seed: string;
}

interface Labels {
  displayName: string;
  handle: string;
  handleHint: string;
  bio: string;
  country: string;
  theme: string;
  frame: string;
  showcase: string;
  avatar: string;
  reroll: string;
  featured: string;
  featuredNone: string;
  save: string;
  saved: string;
  lang: string;
  themes: { value: Theme; label: string }[];
  frames: { value: AvatarFrame; label: string }[];
  showcases: { value: Showcase; label: string }[];
  relationships: { id: number; label: string }[];
}

export default function SettingsForm({
  initial,
  labels,
  lang,
}: {
  initial: Initial;
  labels: Labels;
  lang: Lang;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfileAction, {});
  const [theme, setTheme] = useState<Theme>(initial.theme);
  const [frame, setFrame] = useState<AvatarFrame>(initial.avatar_frame);
  const colors = THEME_COLORS[theme];

  return (
    <form action={formAction} style={{ display: 'grid', gap: 18 }}>
      {state.error && <div className="form_error">{state.error}</div>}
      {state.ok && <div className="form_notice">{labels.saved}</div>}

      {/* ------------------------------------------------------------ identity */}
      <section className="panel">
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div>
            <label className="field_label" htmlFor="display_name">
              {labels.displayName}
            </label>
            <input
              id="display_name"
              name="display_name"
              className="input"
              defaultValue={initial.display_name}
              maxLength={48}
              required
            />
          </div>
          <div>
            <label className="field_label" htmlFor="handle">
              {labels.handle}
            </label>
            <input
              id="handle"
              name="handle"
              className="input"
              defaultValue={initial.handle}
              pattern="[a-z0-9_\-]{3,24}"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
            <p className="field_hint">{labels.handleHint}</p>
          </div>
          <div>
            <label className="field_label" htmlFor="country">
              {labels.country}
            </label>
            <input
              id="country"
              name="country"
              className="input"
              defaultValue={initial.country}
              maxLength={48}
            />
          </div>
          <div>
            <label className="field_label" htmlFor="lang">
              {labels.lang}
            </label>
            <select id="lang" name="lang" className="select" defaultValue={lang}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="field_label" htmlFor="bio">
            {labels.bio}
          </label>
          <textarea id="bio" name="bio" className="textarea" defaultValue={initial.bio} maxLength={1200} />
        </div>
      </section>

      {/* -------------------------------------------------------------- avatar */}
      <section className="panel">
        <h2 className="section_title">{labels.avatar}</h2>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className={`avatar_full avatar_frame_${frame}`} style={{ width: 96, height: 96 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl(initial.avatar_seed)} alt="" width={96} height={96} />
          </div>
          <div style={{ flex: 1, minWidth: 220, display: 'grid', gap: 12 }}>
            <label className="checkbox_row">
              <input type="checkbox" name="reroll_avatar" />
              <span>{labels.reroll}</span>
            </label>

            <div>
              <label className="field_label" htmlFor="avatar_frame">
                {labels.frame}
              </label>
              <select
                id="avatar_frame"
                name="avatar_frame"
                className="select"
                value={frame}
                onChange={(e) => setFrame(e.target.value as AvatarFrame)}
              >
                {labels.frames.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- theme */}
      <section className="panel">
        <h2 className="section_title">{labels.theme}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {labels.themes.map((th) => {
            const c = THEME_COLORS[th.value];
            const active = theme === th.value;
            return (
              <button
                key={th.value}
                type="button"
                onClick={() => setTheme(th.value)}
                style={{
                  border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                  borderRadius: 3,
                  padding: 6,
                  background: 'rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  color: active ? '#fff' : 'var(--color-ink-dim)',
                  fontSize: 12,
                  fontFamily: 'inherit',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: 64,
                    height: 26,
                    borderRadius: 2,
                    marginBottom: 4,
                    background: `linear-gradient(135deg, ${c.mid}, ${c.deep})`,
                    boxShadow: `inset 0 0 0 1px ${c.accent}`,
                  }}
                />
                {th.label}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="theme" value={theme} />

        <div
          style={{
            height: 60,
            borderRadius: 3,
            background: `linear-gradient(180deg, ${colors.mid}, ${colors.deep})`,
            display: 'grid',
            placeItems: 'center',
            color: colors.accent,
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {labels.theme}
        </div>
      </section>

      {/* ------------------------------------------------------------ showcase */}
      <section className="panel">
        <h2 className="section_title">{labels.showcase}</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div>
            <label className="field_label" htmlFor="showcase">
              {labels.showcase}
            </label>
            <select id="showcase" name="showcase" className="select" defaultValue={initial.showcase}>
              {labels.showcases.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field_label" htmlFor="featured_relationship_id">
              {labels.featured}
            </label>
            <select
              id="featured_relationship_id"
              name="featured_relationship_id"
              className="select"
              defaultValue={initial.featured_relationship_id ?? ''}
            >
              <option value="">{labels.featuredNone}</option>
              {labels.relationships.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div>
        <button type="submit" className="btn btn_primary btn_lg" disabled={pending}>
          {labels.save}
        </button>
      </div>
    </form>
  );
}
