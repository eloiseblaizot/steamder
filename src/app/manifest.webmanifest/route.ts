export const dynamic = 'force-static';

export function GET() {
  return Response.json(
    {
      name: 'STEAMDER',
      short_name: 'STEAMDER',
      description: 'Vos relations, cataloguées. / Your relationships, catalogued.',
      start_url: '/',
      display: 'standalone',
      background_color: '#1a0710',
      theme_color: '#190811',
      icons: [
        { src: '/img/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/img/icon-384.png', sizes: '384x384', type: 'image/png' },
        { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/img/icon-1024.png', sizes: '1024x1024', type: 'image/png' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
}
