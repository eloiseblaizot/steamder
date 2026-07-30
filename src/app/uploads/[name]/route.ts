import { createReadStream, existsSync, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import { uploadPath } from '@/lib/uploads';

/**
 * Serves user-uploaded game artwork from data/uploads.
 *
 * `uploadPath` only resolves names matching the pattern we generate ourselves
 * (`<slug>-<kind>.webp`), so a crafted name cannot escape the directory. The
 * content type is hard-coded rather than sniffed, because every file here was
 * re-encoded to WebP on the way in.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const file = uploadPath(decodeURIComponent(name));

  if (!file || !existsSync(file)) {
    return new Response('Not found', { status: 404 });
  }

  const stat = statSync(file);
  if (!stat.isFile()) return new Response('Not found', { status: 404 });

  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;

  return new Response(stream, {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(stat.size),
      // Filenames change when the artwork is replaced, so this is safe to pin.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; sandbox",
    },
  });
}
