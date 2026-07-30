import 'server-only';
import { cookies } from 'next/headers';
import { DEFAULT_LANG, isLang, LANG_COOKIE, makeT, type Lang, type Translate } from './i18n';

/** Resolve the viewer's language from the cookie, falling back to French. */
export async function getLang(): Promise<Lang> {
  const jar = await cookies();
  const raw = jar.get(LANG_COOKIE)?.value;
  return isLang(raw) ? raw : DEFAULT_LANG;
}

export async function getT(): Promise<{ lang: Lang; t: Translate }> {
  const lang = await getLang();
  return { lang, t: makeT(lang) };
}
