import type { MetadataRoute } from 'next';
import { GAMES } from '@/lib/games';
import { listUsers } from '@/lib/queries';

const SITE_URL = process.env.STEAMDER_SITE_URL ?? 'https://steamder.com';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/community`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  const gamePages: MetadataRoute.Sitemap = GAMES.map((g) => ({
    url: `${SITE_URL}/game/${g.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  // Public profiles only — the library and settings routes are viewer-scoped.
  const profilePages: MetadataRoute.Sitemap = listUsers(500).map((u) => ({
    url: `${SITE_URL}/id/${u.handle}`,
    lastModified: new Date(u.last_seen_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...gamePages, ...profilePages];
}
