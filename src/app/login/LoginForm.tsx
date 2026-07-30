'use client';

import { useActionState } from 'react';
import { loginAction, type FormState } from '@/app/actions';

export default function LoginForm({
  labels,
}: {
  labels: { handle: string; password: string; submit: string };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(loginAction, {});

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
          required
        />
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
          autoComplete="current-password"
          required
        />
      </div>

      <button type="submit" className="btn btn_primary btn_block" disabled={pending}>
        {labels.submit}
      </button>
    </form>
  );
}
