/**
 * Procedural artwork generator.
 *
 * Every relationship needs a capsule, a header image and a hero banner, in the
 * same aspect ratios Steam uses. We ship no third-party art: each image is an
 * original abstract SVG deterministically derived from the game's slug and its
 * three-colour palette, so a given game always looks the same everywhere.
 *
 * Steam asset ratios reproduced here:
 *   capsule (portrait library art) 600x900
 *   header  (store/list thumbnail)  460x215
 *   hero    (library banner)       1920x620
 */

import { getGame, type Game } from './games';

/* ----------------------------------------------------------- deterministic rng */

function hash32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/* -------------------------------------------------------------------- colours */

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
}

export function lighten(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

export function darken(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ------------------------------------------------------------------- lettering */

/** Short emblem for a title: up to 3 initials, or the first 2 letters of one word. */
export function emblem(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^(the|of|and|a|le|la|les|de|du|des|and)$/i.test(w));

  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* -------------------------------------------------------------------- patterns */

type PatternFn = (w: number, h: number, c: [string, string, string], rand: () => number) => string;

/** Diagonal light rays. */
const rays: PatternFn = (w, h, [, mid, accent], rand) => {
  let out = '';
  const n = 7 + Math.floor(rand() * 6);
  for (let i = 0; i < n; i++) {
    const x = rand() * w * 1.6 - w * 0.3;
    const width = w * (0.02 + rand() * 0.09);
    const op = 0.1 + rand() * 0.26;
    const col = rand() > 0.65 ? accent : mid;
    out += `<rect x="${x.toFixed(1)}" y="${-h * 0.3}" width="${width.toFixed(1)}" height="${(h * 1.6).toFixed(1)}" fill="${col}" opacity="${op.toFixed(3)}" transform="rotate(-24 ${(w / 2).toFixed(1)} ${(h / 2).toFixed(1)})"/>`;
  }
  return out;
};

/** Concentric orbit rings. */
const orbits: PatternFn = (w, h, [, mid, accent], rand) => {
  let out = '';
  const cx = w * (0.35 + rand() * 0.3);
  const cy = h * (0.35 + rand() * 0.3);
  const n = 5 + Math.floor(rand() * 5);
  for (let i = 0; i < n; i++) {
    const r = (Math.min(w, h) * (0.12 + i * 0.13)).toFixed(1);
    const col = i % 3 === 0 ? accent : mid;
    out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="none" stroke="${col}" stroke-width="${(1 + rand() * 3).toFixed(1)}" opacity="${(0.18 + rand() * 0.3).toFixed(3)}"/>`;
  }
  out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(Math.min(w, h) * 0.07).toFixed(1)}" fill="${accent}" opacity="0.5"/>`;
  return out;
};

/** Angular shards. */
const shards: PatternFn = (w, h, [, mid, accent], rand) => {
  let out = '';
  const n = 6 + Math.floor(rand() * 7);
  for (let i = 0; i < n; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const s = Math.min(w, h) * (0.1 + rand() * 0.28);
    const pts = [
      `${x.toFixed(1)},${y.toFixed(1)}`,
      `${(x + s).toFixed(1)},${(y + s * (0.3 + rand())).toFixed(1)}`,
      `${(x - s * rand()).toFixed(1)},${(y + s * 1.2).toFixed(1)}`,
    ].join(' ');
    out += `<polygon points="${pts}" fill="${rand() > 0.7 ? accent : mid}" opacity="${(0.14 + rand() * 0.3).toFixed(3)}"/>`;
  }
  return out;
};

/** Layered sine waves. */
const waves: PatternFn = (w, h, [, mid, accent], rand) => {
  let out = '';
  const n = 4 + Math.floor(rand() * 4);
  for (let i = 0; i < n; i++) {
    const baseY = h * (0.3 + (i / n) * 0.7);
    const amp = h * (0.03 + rand() * 0.09);
    const period = w / (1 + rand() * 2.5);
    let d = `M ${-w * 0.1} ${baseY.toFixed(1)}`;
    for (let x = 0; x <= w * 1.1; x += w / 12) {
      d += ` Q ${(x + period / 4).toFixed(1)} ${(baseY - amp).toFixed(1)} ${(x + period / 2).toFixed(1)} ${baseY.toFixed(1)}`;
    }
    d += ` L ${w * 1.1} ${h * 1.1} L ${-w * 0.1} ${h * 1.1} Z`;
    out += `<path d="${d}" fill="${i === n - 1 ? accent : mid}" opacity="${(0.14 + i * 0.07).toFixed(3)}"/>`;
  }
  return out;
};

/** Technical grid with a few highlighted cells. */
const grid: PatternFn = (w, h, [, mid, accent], rand) => {
  const step = Math.min(w, h) / (6 + Math.floor(rand() * 6));
  let out = `<g stroke="${mid}" stroke-width="1" opacity="0.34">`;
  for (let x = 0; x <= w; x += step) out += `<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${h}"/>`;
  for (let y = 0; y <= h; y += step) out += `<line x1="0" y1="${y.toFixed(1)}" x2="${w}" y2="${y.toFixed(1)}"/>`;
  out += '</g>';
  const cells = 4 + Math.floor(rand() * 8);
  for (let i = 0; i < cells; i++) {
    const cx = Math.floor(rand() * (w / step)) * step;
    const cy = Math.floor(rand() * (h / step)) * step;
    out += `<rect x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" width="${step.toFixed(1)}" height="${step.toFixed(1)}" fill="${rand() > 0.6 ? accent : mid}" opacity="${(0.16 + rand() * 0.32).toFixed(3)}"/>`;
  }
  return out;
};

/** Soft radial blooms. */
const bloom: PatternFn = (w, h, [, mid, accent], rand) => {
  let out = '';
  const n = 3 + Math.floor(rand() * 4);
  for (let i = 0; i < n; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const r = Math.min(w, h) * (0.2 + rand() * 0.45);
    const col = i % 2 === 0 ? accent : mid;
    out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#bloom${i})"/>`;
    out += `<defs><radialGradient id="bloom${i}"><stop offset="0%" stop-color="${col}" stop-opacity="${(0.34 + rand() * 0.26).toFixed(3)}"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></radialGradient></defs>`;
  }
  return out;
};

/** Horizontal scanlines with a bright band. */
const scanlines: PatternFn = (w, h, [, mid, accent], rand) => {
  let out = '';
  const step = h / (18 + Math.floor(rand() * 22));
  for (let y = 0; y < h; y += step * 2) {
    out += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="${step.toFixed(2)}" fill="${mid}" opacity="0.24"/>`;
  }
  const bandY = h * (0.2 + rand() * 0.55);
  out += `<rect x="0" y="${bandY.toFixed(1)}" width="${w}" height="${(h * 0.06).toFixed(1)}" fill="${accent}" opacity="0.46"/>`;
  return out;
};

/** Interlocking hexes. */
const hexes: PatternFn = (w, h, [, mid, accent], rand) => {
  const r = Math.min(w, h) / (7 + Math.floor(rand() * 5));
  const hStep = r * 1.5;
  const vStep = r * Math.sqrt(3);
  let out = '';
  let row = 0;
  for (let y = -vStep; y < h + vStep; y += vStep / 2, row++) {
    for (let x = row % 2 === 0 ? 0 : hStep / 2; x < w + hStep; x += hStep) {
      if (rand() > 0.62) continue;
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        pts.push(`${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`);
      }
      out += `<polygon points="${pts.join(' ')}" fill="none" stroke="${rand() > 0.75 ? accent : mid}" stroke-width="1.5" opacity="${(0.18 + rand() * 0.3).toFixed(3)}"/>`;
    }
  }
  return out;
};

const PATTERNS: PatternFn[] = [rays, orbits, shards, waves, grid, bloom, scanlines, hexes];

/* ---------------------------------------------------------------- composition */

interface ArtOptions {
  /** Show the emblem letters. */
  letters?: boolean;
  /** Show the full title text. */
  title?: boolean;
  /** Font size override for the emblem. */
  emblemSize?: number;
}

function buildSvg(game: Game, w: number, h: number, opts: ArtOptions = {}): string {
  const seed = hash32(game.slug);
  const rand = rng(seed);
  const [deep, mid, accent] = game.colors;

  const pattern = PATTERNS[seed % PATTERNS.length];
  const angle = 100 + (seed % 80);

  const body = pattern(w, h, game.colors, rand);
  const letters = emblem(game.title);
  const emSize = opts.emblemSize ?? Math.min(w, h) * 0.34;

  const vignette = `
    <radialGradient id="vig" cx="50%" cy="42%" r="78%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.5"/>
    </radialGradient>`;

  const bg = `
    <linearGradient id="bg" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${lighten(mid, 0.06)}"/>
      <stop offset="48%" stop-color="${darken(mid, 0.35)}"/>
      <stop offset="100%" stop-color="${deep}"/>
    </linearGradient>`;

  const emblemFill = `
    <linearGradient id="em" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lighten(accent, 0.4)}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.55"/>
    </linearGradient>`;

  const emblemLayer = opts.letters
    ? `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
             font-family="Arial Black, Arial, Helvetica, sans-serif"
             font-size="${emSize.toFixed(0)}" font-weight="900" letter-spacing="${(emSize * 0.02).toFixed(1)}"
             fill="url(#em)" opacity="0.9">${escapeXml(letters)}</text>`
    : '';

  const titleLayer = opts.title
    ? (() => {
        const words = game.title.split(' ');
        const lines: string[] = [];
        let line = '';
        const maxChars = Math.max(10, Math.floor(w / (h > w ? 22 : 34)));
        for (const word of words) {
          if ((line + ' ' + word).trim().length > maxChars && line) {
            lines.push(line.trim());
            line = word;
          } else {
            line = `${line} ${word}`;
          }
        }
        if (line.trim()) lines.push(line.trim());
        const fs = Math.min(w, h) * (h > w ? 0.075 : 0.1);
        const startY = h - 18 - (lines.length - 1) * fs * 1.15;
        return (
          `<rect x="0" y="${(startY - fs).toFixed(1)}" width="${w}" height="${(h - startY + fs + 4).toFixed(1)}" fill="url(#scrim)"/>` +
          `<defs><linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stop-color="#000" stop-opacity="0"/>
             <stop offset="60%" stop-color="#000" stop-opacity="0.66"/>
             <stop offset="100%" stop-color="#000" stop-opacity="0.85"/>
           </linearGradient></defs>` +
          lines
            .map(
              (l, i) =>
                `<text x="${(w * 0.055).toFixed(1)}" y="${(startY + i * fs * 1.15).toFixed(1)}"
                       font-family="Arial, Helvetica, sans-serif" font-size="${fs.toFixed(0)}"
                       font-weight="700" fill="#ffffff" opacity="0.95">${escapeXml(l)}</text>`,
            )
            .join('')
        );
      })()
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <defs>${bg}${vignette}${emblemFill}</defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${body}
  ${emblemLayer}
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
  ${titleLayer}
</svg>`;
}

function dataUri(svg: string): string {
  // encodeURIComponent keeps this safe for every SVG we generate and avoids base64 bloat.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

/* --------------------------------------------- raw SVG (served by /art route) */

/** 600x900 portrait library capsule. */
export function capsuleSvg(slug: string): string {
  return buildSvg(getGame(slug), 600, 900, { letters: true, title: true, emblemSize: 210 });
}

/** 460x215 store/list header image. */
export function headerSvg(slug: string): string {
  return buildSvg(getGame(slug), 460, 215, { letters: true, title: true, emblemSize: 76 });
}

/** 1920x620 library hero banner. */
export function heroSvg(slug: string): string {
  return buildSvg(getGame(slug), 1920, 620, { letters: false });
}

/** 231x87 small capsule used in dense lists. */
export function smallCapsuleSvg(slug: string): string {
  return buildSvg(getGame(slug), 231, 87, { letters: true, emblemSize: 34 });
}

/** 16:9 art used for the "screenshots" strip. */
export function screenshotSvg(slug: string, index: number): string {
  const game = getGame(slug);
  // Vary the seed so each screenshot gets its own pattern while keeping the palette.
  const variant: Game = { ...game, slug: `${game.slug}#shot${index}` };
  return buildSvg(variant, 600, 338, {});
}

/* ------------------------------------------------------- data URI (inline use) */

export function capsuleUri(slug: string): string {
  return dataUri(capsuleSvg(slug));
}

export function headerUri(slug: string): string {
  return dataUri(headerSvg(slug));
}

export function heroUri(slug: string): string {
  return dataUri(heroSvg(slug));
}

export function smallCapsuleUri(slug: string): string {
  return dataUri(smallCapsuleSvg(slug));
}

export function screenshotUri(slug: string, index: number): string {
  return dataUri(screenshotSvg(slug, index));
}

/* -------------------------------------------------------------------- avatars */

/**
 * Steam-style square avatar, generated from a seed string.
 * Deterministic: same seed always yields the same avatar.
 */
export function avatarSvg(seed: string, size = 184): string {
  const h = hash32(seed);
  const rand = rng(h);

  const hue = h % 360;
  // Keep avatars inside STEAMDER's warm range so they sit well against the chrome.
  const warmHue = 320 + ((hue % 80) - 40); // 280..360
  const base = `hsl(${warmHue}, ${45 + (h % 30)}%, ${22 + (h % 12)}%)`;
  const light = `hsl(${warmHue + 12}, ${60 + (h % 25)}%, ${58 + (h % 18)}%)`;
  const mid = `hsl(${warmHue - 10}, ${50 + (h % 20)}%, ${38 + (h % 14)}%)`;

  // Symmetric 5x5 blocky sigil, in the spirit of an identicon.
  const cells = 5;
  const cell = size / cells;
  let body = '';
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < Math.ceil(cells / 2); x++) {
      if (rand() > 0.52) continue;
      const col = rand() > 0.62 ? light : mid;
      const op = (0.5 + rand() * 0.5).toFixed(2);
      const mirrorX = cells - 1 - x;
      body += `<rect x="${(x * cell).toFixed(1)}" y="${(y * cell).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" fill="${col}" opacity="${op}"/>`;
      if (mirrorX !== x) {
        body += `<rect x="${(mirrorX * cell).toFixed(1)}" y="${(y * cell).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" fill="${col}" opacity="${op}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img">
    <rect width="${size}" height="${size}" fill="${base}"/>
    ${body}
    <rect width="${size}" height="${size}" fill="url(#av)"/>
    <defs><linearGradient id="av" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.30"/>
    </linearGradient></defs>
  </svg>`;
}

export function avatarUri(seed: string, size = 184): string {
  return dataUri(avatarSvg(seed, size));
}
