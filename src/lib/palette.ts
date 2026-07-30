/**
 * Samples a three-colour palette out of an image, so any artwork — official or
 * uploaded — can theme a page the way Steam tints a store page to match its art.
 *
 * Returns [deep, mid, accent]: a dark background, a median mid tone, and the
 * most vivid colour present, lifted so it stays legible as a link colour.
 *
 * Node-only (pulls in sharp), but deliberately not marked `server-only` so the
 * enrichment script can share it.
 */

import sharp from 'sharp';

export type Palette = [deep: string, mid: string, accent: string];

/** Fallback used when an image cannot be decoded — STEAMDER's own crimson. */
export const DEFAULT_PALETTE: Palette = ['#401420', '#9f1752', '#f2679a'];

type Rgb = [number, number, number];

function hex(c: Rgb): string {
  return `#${c
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('')}`;
}

const luminance = (c: Rgb) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

function saturation(c: Rgb): number {
  const max = Math.max(...c);
  const min = Math.min(...c);
  return max === 0 ? 0 : (max - min) / max;
}

function average(list: Rgb[]): Rgb {
  return [
    list.reduce((a, c) => a + c[0], 0) / list.length,
    list.reduce((a, c) => a + c[1], 0) / list.length,
    list.reduce((a, c) => a + c[2], 0) / list.length,
  ];
}

export async function paletteFromBuffer(buf: Buffer): Promise<Palette | null> {
  try {
    const { data, info } = await sharp(buf)
      .resize(48, 48, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const px: Rgb[] = [];
    for (let i = 0; i < data.length; i += info.channels) {
      px.push([data[i], data[i + 1], data[i + 2]]);
    }
    if (px.length === 0) return null;

    const sorted = [...px].sort((a, b) => luminance(a) - luminance(b));

    // Darkest decile, pulled further down: this becomes the page background.
    const darkAvg = average(sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.1))));
    const deep: Rgb = [darkAvg[0] * 0.6, darkAvg[1] * 0.6, darkAvg[2] * 0.6];

    // Median band.
    const from = Math.floor(sorted.length * 0.4);
    const to = Math.max(from + 1, Math.floor(sorted.length * 0.65));
    const mid = average(sorted.slice(from, to));

    // Most saturated pixel that is neither crushed black nor blown-out white.
    let accent = px[0];
    let best = -1;
    for (const c of px) {
      const l = luminance(c);
      if (l < 40 || l > 240) continue;
      const score = saturation(c) * 1.4 + l / 255;
      if (score > best) {
        best = score;
        accent = c;
      }
    }
    const lifted: Rgb = [
      accent[0] + (255 - accent[0]) * 0.32,
      accent[1] + (255 - accent[1]) * 0.32,
      accent[2] + (255 - accent[2]) * 0.32,
    ];

    return [hex(deep), hex(mid), hex(lifted)];
  } catch {
    return null;
  }
}

export async function paletteFromUrl(url: string): Promise<Palette | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return paletteFromBuffer(Buffer.from(await res.arrayBuffer()));
  } catch {
    return null;
  }
}
