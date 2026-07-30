'use client';

import { useActionState, useMemo, useState } from 'react';
import Link from 'next/link';
import { createRelationshipAction, updateRelationshipAction, type FormState } from '@/app/actions';
import type { Status, Verdict } from '@/lib/types';

/** Catalogue entry, trimmed down for the client. */
export interface PickerGame {
  slug: string;
  title: string;
  year: number;
  genre: string;
  tags: string[];
  /** Resolved on the server: real artwork when we have it, procedural otherwise. */
  cover: string;
  /** True for a title a user submitted rather than one from the curated catalogue. */
  custom: boolean;
}

export interface FormLabels {
  submit: string;
  intro: string;
  sectionPrivate: string;
  sectionPublic: string;
  realName: string;
  realLocation: string;
  notes: string;
  game: string;
  gameHint: string;
  gameSearch: string;
  status: string;
  verdict: string;
  score: string;
  scoreHint: string;
  longDistance: string;
  started: string;
  ended: string;
  endedHint: string;
  review: string;
  tags: string;
  tagsHint: string;
  cancel: string;
  statuses: { value: Status; label: string }[];
  verdicts: { value: Verdict; label: string }[];
  noResults: string;
  addLink: string;
  addCta: string;
  communityBadge: string;
}

export interface RelationshipInitial {
  id?: number;
  real_name: string;
  real_location: string;
  private_notes: string;
  game_slug: string;
  status: Status;
  verdict: Verdict;
  score: number;
  long_distance: boolean;
  started_on: string;
  ended_on: string;
  review: string;
  tags: string;
}

const BLANK: RelationshipInitial = {
  real_name: '',
  real_location: '',
  private_notes: '',
  game_slug: '',
  status: 'ongoing',
  verdict: 'recommended',
  score: 75,
  long_distance: false,
  started_on: '',
  ended_on: '',
  review: '',
  tags: '',
};

/** Statuses that require an end date, mirroring the server-side rule. */
const NEEDS_END: Status[] = ['ended', 'ghosted'];

export default function RelationshipForm({
  mode,
  games,
  labels,
  initial,
  cancelHref,
  preselect,
}: {
  mode: 'create' | 'edit';
  games: PickerGame[];
  labels: FormLabels;
  initial?: RelationshipInitial;
  cancelHref: string;
  /** Preselected slug, e.g. after coming back from adding a game. */
  preselect?: string;
}) {
  const start = initial ?? BLANK;
  const action = mode === 'create' ? createRelationshipAction : updateRelationshipAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  const [query, setQuery] = useState('');
  const [slug, setSlug] = useState(preselect ?? start.game_slug);
  const [status, setStatus] = useState<Status>(start.status);
  const [score, setScore] = useState(start.score);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? games.filter(
          (g) => g.title.toLowerCase().includes(q) || g.tags.some((tag) => tag.includes(q)),
        )
      : games;
    // Keep the selected title visible even when it falls outside the filter.
    const selected = games.find((g) => g.slug === slug);
    const list = pool.slice(0, 60);
    if (selected && !list.some((g) => g.slug === selected.slug)) list.unshift(selected);
    return list;
  }, [games, query, slug]);

  const selectedGame = games.find((g) => g.slug === slug);
  const needsEnd = NEEDS_END.includes(status);

  return (
    <form action={formAction} style={{ display: 'grid', gap: 18 }}>
      {mode === 'edit' && initial?.id !== undefined && (
        <input type="hidden" name="id" value={initial.id} />
      )}
      <input type="hidden" name="game_slug" value={slug} />

      {state.error && <div className="form_error">{state.error}</div>}
      <p className="form_notice" style={{ margin: 0 }}>
        {labels.intro}
      </p>

      {/* ------------------------------------------------------- game picker */}
      <section>
        <h2 className="section_title">{labels.game}</h2>
        <p className="field_hint" style={{ marginTop: 0, marginBottom: 8 }}>
          {labels.gameHint}
        </p>

        {selectedGame && (
          <div
            className="panel_raised"
            style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedGame.cover}
              alt=""
              width={132}
              height={62}
              style={{ borderRadius: 2, flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 15 }}>{selectedGame.title}</div>
              <div className="tiny muted" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{selectedGame.genre}</span>
                {selectedGame.year > 0 && <span>· {selectedGame.year}</span>}
                {selectedGame.custom && <span className="pill">{labels.communityBadge}</span>}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          <input
            className="input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.gameSearch}
            aria-label={labels.gameSearch}
            style={{ flex: 1, minWidth: 200 }}
          />
          <span className="tiny muted nowrap">
            {labels.addLink}{' '}
            <Link href="/library/games/new">{labels.addCta}</Link>
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 6,
            maxHeight: 330,
            overflowY: 'auto',
            padding: 6,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 3,
          }}
        >
          {results.map((g) => {
            const active = g.slug === slug;
            return (
              <button
                key={g.slug}
                type="button"
                onClick={() => setSlug(g.slug)}
                title={g.title}
                style={{
                  display: 'block',
                  padding: 0,
                  border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                  borderRadius: 3,
                  background: '#1a0710',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textAlign: 'left',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.cover}
                  alt=""
                  width={150}
                  height={70}
                  loading="lazy"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
                <span
                  style={{
                    display: 'block',
                    padding: '4px 6px',
                    fontSize: 11,
                    color: active ? '#fff' : 'var(--color-ink-dim)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {g.custom ? '★ ' : ''}
                  {g.title}
                </span>
              </button>
            );
          })}
          {results.length === 0 && (
            <p className="tiny faint" style={{ padding: 10 }}>
              {labels.noResults}
            </p>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- private fields */}
      <section>
        <h2 className="section_title">🔒 {labels.sectionPrivate}</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div>
            <label className="field_label" htmlFor="real_name">
              {labels.realName}
            </label>
            <input
              id="real_name"
              name="real_name"
              className="input"
              defaultValue={start.real_name}
              maxLength={80}
              required
            />
          </div>
          <div>
            <label className="field_label" htmlFor="real_location">
              {labels.realLocation}
            </label>
            <input
              id="real_location"
              name="real_location"
              className="input"
              defaultValue={start.real_location}
              maxLength={80}
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="field_label" htmlFor="private_notes">
            {labels.notes}
          </label>
          <textarea
            id="private_notes"
            name="private_notes"
            className="textarea"
            defaultValue={start.private_notes}
            maxLength={4000}
          />
        </div>
      </section>

      {/* ----------------------------------------------------- public fields */}
      <section>
        <h2 className="section_title">{labels.sectionPublic}</h2>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label className="field_label" htmlFor="status">
              {labels.status}
            </label>
            <select
              id="status"
              name="status"
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {labels.statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field_label" htmlFor="verdict">
              {labels.verdict}
            </label>
            <select id="verdict" name="verdict" className="select" defaultValue={start.verdict}>
              {labels.verdicts.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field_label" htmlFor="started_on">
              {labels.started}
            </label>
            <input
              id="started_on"
              name="started_on"
              type="date"
              className="input"
              defaultValue={start.started_on}
              required
            />
          </div>

          <div>
            <label className="field_label" htmlFor="ended_on">
              {labels.ended}
            </label>
            <input
              id="ended_on"
              name="ended_on"
              type="date"
              className="input"
              defaultValue={start.ended_on}
              required={needsEnd}
              disabled={!needsEnd}
            />
            <p className="field_hint">{labels.endedHint}</p>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="field_label" htmlFor="score">
            {labels.score}: <strong style={{ color: '#fff' }}>{score}</strong> / 100
          </label>
          <input
            id="score"
            name="score"
            type="range"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-accent-2)' }}
          />
          <p className="field_hint">{labels.scoreHint}</p>
        </div>

        <label className="checkbox_row" style={{ marginTop: 12 }}>
          <input type="checkbox" name="long_distance" defaultChecked={start.long_distance} />
          <span>{labels.longDistance}</span>
        </label>

        <div style={{ marginTop: 12 }}>
          <label className="field_label" htmlFor="review">
            {labels.review}
          </label>
          <textarea
            id="review"
            name="review"
            className="textarea"
            defaultValue={start.review}
            maxLength={4000}
            style={{ minHeight: 130 }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="field_label" htmlFor="tags">
            {labels.tags}
          </label>
          <input
            id="tags"
            name="tags"
            className="input"
            defaultValue={start.tags}
            placeholder="cosy, long-distance, first"
          />
          <p className="field_hint">{labels.tagsHint}</p>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="submit" className="btn btn_primary btn_lg" disabled={pending || !slug}>
          {labels.submit}
        </button>
        <Link href={cancelHref} className="btn btn_ghost">
          {labels.cancel}
        </Link>
      </div>
    </form>
  );
}
