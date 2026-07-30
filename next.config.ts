import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // better-sqlite3 is a native addon: keep it external so Next doesn't try to bundle it.
  serverExternalPackages: ['better-sqlite3', 'sharp'],
  experimental: {
    serverActions: {
      // Game artwork is uploaded through a server action, and the default cap is
      // 1 MB. Keep this in step with MAX_UPLOAD_BYTES in lib/uploads.ts (8 MB),
      // with headroom for the second image plus the multipart envelope.
      bodySizeLimit: '20mb',
    },
  },
  // Artwork is served either as SVG from the /art route or hotlinked from the
  // RAWG / Steam CDNs through plain <img>, so no next/image loader config is needed.
};

export default nextConfig;
