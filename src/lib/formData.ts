import 'server-only';
import { allGames, gameHeader } from './catalog';
import { genreLabel, statusKey, verdictKey, type Lang, type Translate } from './i18n';
import { STATUSES, VERDICTS } from './types';
import type { FormLabels, PickerGame } from '@/components/RelationshipForm';

/** Catalogue trimmed to what the client picker needs. */
export function pickerGames(lang: Lang): PickerGame[] {
  return allGames().map((g) => ({
    slug: g.slug,
    title: g.title,
    year: g.year,
    genre: genreLabel(g.genre, lang),
    tags: g.tags,
    cover: gameHeader(g.slug),
    custom: g.custom,
  })).sort((a, b) => a.title.localeCompare(b.title));
}

export function formLabels(t: Translate, submit: string): FormLabels {
  return {
    submit,
    intro: t('add_intro'),
    sectionPrivate: t('section_private'),
    sectionPublic: t('section_public'),
    realName: t('f_real_name'),
    realLocation: t('f_real_location'),
    notes: t('f_notes'),
    game: t('pick_game'),
    gameHint: t('pick_game_hint'),
    gameSearch: t('game_search_placeholder'),
    status: t('f_status'),
    verdict: t('f_verdict'),
    score: t('f_score'),
    scoreHint: t('score_hint'),
    longDistance: t('f_long_distance'),
    started: t('f_started'),
    ended: t('f_ended'),
    endedHint: t('ongoing_hint'),
    review: t('f_review'),
    tags: t('f_tags'),
    tagsHint: t('tags_hint'),
    cancel: t('g_cancel'),
    statuses: STATUSES.map((s) => ({ value: s, label: t(statusKey(s)) })),
    verdicts: VERDICTS.map((v) => ({ value: v, label: t(verdictKey(v)) })),
    noResults: t('com_no_results'),
    addLink: t('cg_add_link'),
    addCta: t('cg_add_cta'),
    communityBadge: t('cg_badge'),
  };
}
