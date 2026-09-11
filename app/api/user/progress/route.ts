import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureUserData, save } from "@/lib/db";
import type { ProgressEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const key = String(b.key ?? "");
  if (!key) return NextResponse.json({ error: "Progress key is required." }, { status: 400 });
  const position = Math.max(0, Number(b.position) || 0);
  const duration = Math.max(1, Number(b.duration) || 1);
  const ud = ensureUserData(user.id);
  const entry: ProgressEntry = {
    key,
    titleId: String(b.titleId ?? ""),
    kind: b.kind === "tv" ? "tv" : "movie",
    slug: String(b.slug ?? ""),
    season: b.season != null ? Number(b.season) : undefined,
    episode: b.episode != null ? Number(b.episode) : undefined,
    position,
    duration,
    updatedAt: new Date().toISOString(),
  };
  ud.progress[key] = entry;
  ud.history = [{ titleId: entry.titleId, kind: entry.kind, slug: entry.slug, at: entry.updatedAt },
    ...ud.history.filter(h => !(h.titleId === entry.titleId && h.slug === entry.slug))].slice(0, 80);
  save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const key = String(b.key ?? "");
  const ud = ensureUserData(user.id);
  if (ud.progress[key]) {
    delete ud.progress[key];
    save();
  }
  return NextResponse.json({ ok: true });
}
