import type { Theme } from './types';

/**
 * Profile themes. Steam lets you buy a profile background; here you pick one of
 * five shades inside STEAMDER's warm range.
 */
export const THEME_COLORS: Record<Theme, { deep: string; mid: string; accent: string }> = {
  crimson: { deep: '#401420', mid: '#9f1752', accent: '#f2679a' },
  ember: { deep: '#3a1410', mid: '#a13b1a', accent: '#f0954b' },
  velvet: { deep: '#2a1030', mid: '#6b1f7a', accent: '#d382f0' },
  obsidian: { deep: '#1a1014', mid: '#43242e', accent: '#c79aa8' },
  rose: { deep: '#4a1c2c', mid: '#c93b6e', accent: '#ffa8c4' },
};

export function themeVars(theme: Theme): Record<string, string> {
  const c = THEME_COLORS[theme] ?? THEME_COLORS.crimson;
  return {
    '--game-deep': c.deep,
    '--game-mid': c.mid,
    '--game-accent': c.accent,
  };
}
