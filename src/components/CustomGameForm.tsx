'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
  createCustomGameAction,
  updateCustomGameAction,
  type FormState,
} from '@/app/actions';

export interface GameFormLabels {
  intro: string;
  privacy: string;
  name: string;
  year: string;
  yearHint: string;
  genre: string;
  tags: string;
  tagsHint: string;
  banner: string;
  bannerHint: string;
  cover: string;
  coverHint: string;
  replaceArt: string;
  replaceArtHint: string;
  submit: string;
  saved: string;
  cancel: string;
  genres: { value: string; label: string }[];
}

export interface GameFormInitial {
  slug: string;
  title: string;
  year: number;
  genre: string;
  tags: string;
  currentBanner: string;
  currentCover: string;
}

/** Local preview of a picked file, so you see the crop before uploading. */
function ImagePicker({
  name,
  label,
  hint,
  accept,
  aspect,
  required,
  existing,
}: {
  name: string;
  label: string;
  hint: string;
  accept: string;
  aspect: string;
  required?: boolean;
  existing?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div>
      <label className="field_label" htmlFor={name}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {(preview || existing) && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={preview ?? existing}
            alt=""
            style={{
              width: 148,
              aspectRatio: aspect,
              objectFit: 'cover',
              borderRadius: 3,
              flexShrink: 0,
              boxShadow: '0 0 0 1px rgba(242,103,154,0.25)',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            id={name}
            name={name}
            type="file"
            accept={accept}
            required={required}
            className="input"
            style={{ padding: 6 }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              // Revoke the previous blob URL before replacing it.
              setPreview((old) => {
                if (old) URL.revokeObjectURL(old);
                return file ? URL.createObjectURL(file) : null;
              });
            }}
          />
          <p className="field_hint">{hint}</p>
        </div>
      </div>
    </div>
  );
}

export default function CustomGameForm({
  mode,
  labels,
  initial,
  cancelHref,
}: {
  mode: 'create' | 'edit';
  labels: GameFormLabels;
  initial?: GameFormInitial;
  cancelHref: string;
}) {
  const action = mode === 'create' ? createCustomGameAction : updateCustomGameAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} style={{ display: 'grid', gap: 18 }}>
      {mode === 'edit' && initial && <input type="hidden" name="slug" value={initial.slug} />}

      {state.error && <div className="form_error">{state.error}</div>}
      {state.ok && <div className="form_notice">{labels.saved}</div>}

      <p className="form_notice" style={{ margin: 0 }}>
        {labels.intro}
      </p>
      <p className="form_error" style={{ margin: 0 }}>
        ⚠ {labels.privacy}
      </p>

      <section className="panel">
        <div
          style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
        >
          <div>
            <label className="field_label" htmlFor="title">
              {labels.name}
            </label>
            <input
              id="title"
              name="title"
              className="input"
              defaultValue={initial?.title ?? ''}
              maxLength={90}
              required
            />
          </div>
          <div>
            <label className="field_label" htmlFor="year">
              {labels.year}
            </label>
            <input
              id="year"
              name="year"
              type="number"
              min={1901}
              max={2199}
              className="input"
              defaultValue={initial && initial.year > 0 ? initial.year : ''}
            />
            <p className="field_hint">{labels.yearHint}</p>
          </div>
          <div>
            <label className="field_label" htmlFor="genre">
              {labels.genre}
            </label>
            <select id="genre" name="genre" className="select" defaultValue={initial?.genre ?? 'action'}>
              {labels.genres.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field_label" htmlFor="tags">
              {labels.tags}
            </label>
            <input id="tags" name="tags" className="input" defaultValue={initial?.tags ?? ''} />
            <p className="field_hint">{labels.tagsHint}</p>
          </div>
        </div>
      </section>

      <section className="panel" style={{ display: 'grid', gap: 16 }}>
        {mode === 'edit' && (
          <p className="field_hint" style={{ margin: 0 }}>
            {labels.replaceArt} — {labels.replaceArtHint}
          </p>
        )}
        <ImagePicker
          name="banner"
          label={labels.banner}
          hint={labels.bannerHint}
          accept="image/jpeg,image/png,image/webp,image/avif"
          aspect="460 / 215"
          required={mode === 'create'}
          existing={initial?.currentBanner}
        />
        <ImagePicker
          name="cover"
          label={labels.cover}
          hint={labels.coverHint}
          accept="image/jpeg,image/png,image/webp,image/avif"
          aspect="2 / 3"
          existing={initial?.currentCover}
        />
      </section>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="submit" className="btn btn_primary btn_lg" disabled={pending}>
          {labels.submit}
        </button>
        <Link href={cancelHref} className="btn btn_ghost">
          {labels.cancel}
        </Link>
      </div>
    </form>
  );
}
