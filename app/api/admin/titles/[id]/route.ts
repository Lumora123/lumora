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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const t = db().titles.find(x => x.id === params.id || x.slug === params.id);
  if (!t) return NextResponse.json({ error: "Title not found." }, { status: 404 });
  return NextResponse.json({ title: t });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const d = db();
  const idx = d.titles.findIndex(x => x.id === params.id || x.slug === params.id);
  if (idx < 0) return NextResponse.json({ error: "Title not found." }, { status: 404 });
  const patch = (await req.json().catch(() => null)) as Partial<Title> | null;
  if (!patch) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  const current = d.titles[idx];
  const next: Title = {
    ...current,
    ...patch,
    id: current.id, // immutable
    slug: patch.slug ? String(patch.slug).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : current.slug,
    rating: patch.rating != null ? Math.min(10, Math.max(0, Number(patch.rating))) : current.rating,
    popularity: patch.popularity != null ? Math.min(100, Math.max(0, Number(patch.popularity))) : current.popularity,
    updatedAt: new Date().toISOString(),
  };
  if (next.slug !== current.slug && d.titles.some(t => t.slug === next.slug)) {
    return NextResponse.json({ error: `Slug "${next.slug}" is already in use.` }, { status: 409 });
  }
  d.titles[idx] = next;
  save();
  return NextResponse.json({ title: next });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const d = db();
  const idx = d.titles.findIndex(x => x.id === params.id || x.slug === params.id);
  if (idx < 0) return NextResponse.json({ error: "Title not found." }, { status: 404 });
  const [removed] = d.titles.splice(idx, 1);
  // clean user references
  for (const ud of Object.values(d.userData)) {
    ud.watchlist = ud.watchlist.filter(id => id !== removed.id);
    for (const key of Object.keys(ud.progress)) {
      if (ud.progress[key].titleId === removed.id) delete ud.progress[key];
    }
    ud.history = ud.history.filter(h => h.titleId !== removed.id);
  }
  save();
  return NextResponse.json({ ok: true });
}
