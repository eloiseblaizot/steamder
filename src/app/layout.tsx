import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getLang } from '@/lib/lang';

/** Production origin, overridable for previews and local work. */
const SITE_URL =
  process.env.STEAMDER_SITE_URL ??
  (process.env.NODE_ENV === 'production' ? 'https://steamder.com' : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'STEAMDER',
    template: '%s — STEAMDER',
  },
  description:
    'STEAMDER — vos relations, cataloguées comme une bibliothèque Steam. Une parodie. / Your relationships, catalogued like a Steam library. A parody.',
  applicationName: 'STEAMDER',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/img/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/img/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/img/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'STEAMDER',
    url: SITE_URL,
    title: 'STEAMDER',
    description: 'Vos relations, cataloguées. / Your relationships, catalogued.',
    images: [{ url: '/img/icon-512.png', width: 512, height: 512, alt: 'STEAMDER' }],
  },
  twitter: {
    card: 'summary',
    title: 'STEAMDER',
    description: 'Vos relations, cataloguées. / Your relationships, catalogued.',
    images: ['/img/icon-512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#190811',
  colorScheme: 'dark',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();

  return (
    <html lang={lang}>
      <body>
        <div className="page_bg">{children}</div>
      </body>
    </html>
  );
}
