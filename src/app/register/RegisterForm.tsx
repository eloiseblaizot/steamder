'use client';

import { useActionState } from 'react';
import { registerAction, type FormState } from '@/app/actions';

interface Labels {
  handle: string;
  handleHint: string;
  displayName: string;
  password: string;
  passwordHint: string;
  confirm: string;
  submit: string;
}

export default function RegisterForm({ labels }: { labels: Labels }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(registerAction, {});

  return (
    <form action={formAction} style={{ display: 'grid', gap: 12 }}>
      {state.error && <div className="form_error">{state.error}</div>}

      <div>
        <label className="field_label" htmlFor="handle">
          {labels.handle}
        </label>
        <input
          id="handle"
          name="handle"
          className="input"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          pattern="[A-Za-z0-9_\-]{3,24}"
          required
        />
        <p className="field_hint">{labels.handleHint}</p>
      </div>

      <div>
        <label className="field_label" htmlFor="display_name">
          {labels.displayName}
        </label>
        <input id="display_name" name="display_name" className="input" maxLength={48} required />
      </div>

      <div>
        <label className="field_label" htmlFor="password">
          {labels.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="field_hint">{labels.passwordHint}</p>
      </div>

      <div>
        <label className="field_label" htmlFor="password_confirm">
          {labels.confirm}
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          className="input"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <button type="submit" className="btn btn_primary btn_block" disabled={pending}>
        {labels.submit}
      </button>
    </form>
  );
}
