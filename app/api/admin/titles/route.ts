import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db, save } from "@/lib/db";
import { toCard } from "@/lib/card";
import type { Title } from "@/lib/types";

export const dynamic = "force-dynamic";

function requireAdmin() {
  const u = getSessionUser();
  if (!u || u.role !== "admin") return null;
  return u;
}

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  // Admin list includes `featured` + `updatedAt` on top of the public card shape.
  const items = db().titles.map(t => ({ ...toCard(t), featured: t.featured, updatedAt: t.updatedAt }));
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = (await req.json().catch(() => null)) as Partial<Title> | null;
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "A title is required." }, { status: 400 });
  }
  const d = db();
  const slug = (body.slug || body.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `title-${Date.now()}`;
  if (d.titles.some(t => t.slug === slug)) {
    return NextResponse.json({ error: `A title with slug "${slug}" already exists.` }, { status: 409 });
  }
  const now = new Date().toISOString();
  const title: Title = {
    id: `${body.kind === "tv" ? "tv" : "mov"}-${slug}`,
    kind: body.kind === "tv" ? "tv" : "movie",
    title: body.title.trim(),
    slug,
    tagline: body.tagline,
    synopsis: body.synopsis ?? "",
    poster: body.poster,
    backdrop: body.backdrop,
    trailer: body.trailer,
    releaseDate: body.releaseDate,
    year: Number(body.year) || new Date().getFullYear(),
    runtime: Number(body.runtime) || 0,
    genres: Array.isArray(body.genres) ? body.genres : [],
    languages: Array.isArray(body.languages) ? body.languages : ["en"],
    countries: Array.isArray(body.countries) ? body.countries : ["US"],
    rating: Math.min(10, Math.max(0, Number(body.rating) || 0)),
    popularity: Math.min(100, Math.max(0, Number(body.popularity) || 40)),
    cast: Array.isArray(body.cast) ? body.cast : [],
    director: body.director,
    creators: body.creators,
    contentRating: body.contentRating ?? "NR",
    streamingSources: Array.isArray(body.streamingSources) ? body.streamingSources : [],
    subtitles: Array.isArray(body.subtitles) ? body.subtitles : [],
    audioTracks: Array.isArray(body.audioTracks) ? body.audioTracks : [],
    featured: !!body.featured,
    trending: !!body.trending,
    flags: body.flags ?? {},
    seasons: body.kind === "tv" ? (Array.isArray(body.seasons) ? body.seasons : []) : undefined,
    rightsNote: body.rightsNote ?? "Authorization pending — no playback source configured.",
    contentTier: body.contentTier === "demo" ? "demo" : "production",
    createdAt: now,
    updatedAt: now,
  };
  d.titles.unshift(title);
  save();
  return NextResponse.json({ title: toCard(title) }, { status: 201 });
}
