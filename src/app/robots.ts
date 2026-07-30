import type { MetadataRoute } from 'next';

const SITE_URL = process.env.STEAMDER_SITE_URL ?? 'https://steamder.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nothing behind these is useful to a crawler, and profile pages are
        // reachable from /community anyway.
        disallow: ['/settings', '/friends', '/library', '/art/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
