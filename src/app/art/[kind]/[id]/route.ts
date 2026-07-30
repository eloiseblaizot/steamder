import {
  avatarSvg,
  capsuleSvg,
  headerSvg,
  heroSvg,
  screenshotSvg,
  smallCapsuleSvg,
} from '@/lib/art';

/**
 * Serves the procedurally generated artwork.
 *
 * Everything here is a pure function of (kind, id, index), so the response is
 * immutable and can be cached hard by the browser.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const { kind, id } = await params;
  const slug = decodeURIComponent(id);
  const index = Number.parseInt(new URL(request.url).searchParams.get('i') ?? '0', 10);

  let svg: string;
  switch (kind) {
    case 'capsule':
      svg = capsuleSvg(slug);
      break;
    case 'header':
      svg = headerSvg(slug);
      break;
    case 'hero':
      svg = heroSvg(slug);
      break;
    case 'small':
      svg = smallCapsuleSvg(slug);
      break;
    case 'shot':
      svg = screenshotSvg(slug, Number.isFinite(index) ? index : 0);
      break;
    case 'avatar':
      svg = avatarSvg(slug, 184);
      break;
    default:
      return new Response('Unknown art kind', { status: 404 });
  }

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      // The generator never reads request data beyond the path, so there is
      // nothing user-controlled being reflected as markup here.
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
