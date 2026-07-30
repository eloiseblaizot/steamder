/**
 * URL builders for the /art image route. Pure string work, so this module is
 * safe to import from client components (unlike `art.ts`, which does the actual
 * SVG generation on the server).
 */

export type ArtKind = 'capsule' | 'header' | 'hero' | 'small' | 'shot' | 'avatar';

export function artUrl(kind: ArtKind, id: string, index?: number): string {
  const q = index === undefined ? '' : `?i=${index}`;
  return `/art/${kind}/${encodeURIComponent(id)}${q}`;
}

export const capsuleUrl = (slug: string) => artUrl('capsule', slug);
export const headerUrl = (slug: string) => artUrl('header', slug);
export const heroUrl = (slug: string) => artUrl('hero', slug);
export const smallCapsuleUrl = (slug: string) => artUrl('small', slug);
export const screenshotUrl = (slug: string, index: number) => artUrl('shot', slug, index);
export const avatarUrl = (seed: string) => artUrl('avatar', seed);
