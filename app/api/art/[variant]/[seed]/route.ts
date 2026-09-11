import { buildArtSvg, ART_DIMS, type ArtVariant } from "@/lib/art";

export const dynamic = "force-dynamic";

const SAFE_SEED = /^[A-Za-z0-9:._-]{1,120}$/;

export async function GET(req: Request, { params }: { params: { variant: string; seed: string } }) {
  const variant = params.variant as ArtVariant;
  const seed = decodeURIComponent(params.seed);
  if (!(variant in ART_DIMS) || !SAFE_SEED.test(seed)) {
    return new Response("Not found", { status: 404 });
  }
  const url = new URL(req.url);
  const genres = (url.searchParams.get("g") ?? "")
    .split(",")
    .map(g => g.trim().toLowerCase())
    .filter(g => /^[a-z0-9-]{1,24}$/.test(g))
    .slice(0, 4);
  const svg = buildArtSvg(seed, genres, variant);
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // Deterministic output → safe to cache forever, CDN-ready.
      "cache-control": "public, max-age=31536000, immutable",
      "content-length": String(Buffer.byteLength(svg)),
    },
  });
}
