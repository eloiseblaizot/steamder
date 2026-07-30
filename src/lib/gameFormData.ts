import 'server-only';
import { GENRES } from './games';
import { genreLabel, type Lang, type Translate } from './i18n';
import { MAX_UPLOAD_BYTES } from './uploads';
import type { GameFormLabels } from '@/components/CustomGameForm';

export function gameFormLabels(t: Translate, lang: Lang, submit: string): GameFormLabels {
  const mb = String(Math.round(MAX_UPLOAD_BYTES / 1024 / 1024));
  return {
    intro: t('cg_intro'),
    privacy: t('cg_privacy'),
    name: t('cg_name'),
    year: t('cg_year'),
    yearHint: t('cg_year_hint'),
    genre: t('cg_genre'),
    tags: t('cg_tags'),
    tagsHint: t('cg_tags_hint'),
    banner: t('cg_banner'),
    bannerHint: t('cg_banner_hint', { mb }),
    cover: t('cg_cover'),
    coverHint: t('cg_cover_hint'),
    replaceArt: t('cg_replace_art'),
    replaceArtHint: t('cg_replace_art_hint'),
    submit,
    saved: t('cg_saved'),
    cancel: t('g_cancel'),
    genres: GENRES.map((g) => ({ value: g, label: genreLabel(g, lang) })),
  };
}
