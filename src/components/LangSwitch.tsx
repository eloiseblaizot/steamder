'use client';

import { useTransition } from 'react';
import { setLangAction } from '@/app/actions';
import type { Lang } from '@/lib/i18n';

/** FR / EN toggle, styled like Steam's language selector in the header. */
export default function LangSwitch({ lang }: { lang: Lang }) {
  const [pending, start] = useTransition();
  const next: Lang = lang === 'fr' ? 'en' : 'fr';

  return (
    <button
      type="button"
      className="btn btn_ghost btn_sm"
      disabled={pending}
      onClick={() => start(() => setLangAction(next))}
      title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
      style={{ letterSpacing: '0.08em', fontWeight: 700 }}
    >
      {lang === 'fr' ? 'FR' : 'EN'}
    </button>
  );
}
