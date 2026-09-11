import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db, ensureUserData, save } from "@/lib/db";
import type { ProgressEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Merge a signed-out visitor's local state into their account (union, newest wins). */
export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const ud = ensureUserData(user.id);
  const validIds = new Set(db().titles.map(t => t.id));

  const guestWatchlist: string[] = Array.isArray(b.watchlist) ? b.watchlist.filter((x: string) => validIds.has(x)) : [];
  for (const id of guestWatchlist) if (!ud.watchlist.includes(id)) ud.watchlist.push(id);

  const guestProgress: Record<string, ProgressEntry> = b.progress && typeof b.progress === "object" ? b.progress : {};
  for (const [key, entry] of Object.entries(guestProgress)) {
    if (!entry || !validIds.has(entry.titleId)) continue;
    const existing = ud.progress[key];
    if (!existing || new Date(entry.updatedAt ?? 0) > new Date(existing.updatedAt)) {
      ud.progress[key] = { ...entry, key, updatedAt: entry.updatedAt ?? new Date().toISOString() };
    }
  }

  const guestHistory: { titleId: string; kind: "movie" | "tv"; slug: string; at: string }[] =
    Array.isArray(b.history) ? b.history.filter((h: { titleId: string }) => h && validIds.has(h.titleId)) : [];
  const seen = new Set(ud.history.map(h => `${h.titleId}|${h.slug}`));
  for (const h of guestHistory) {
    const k = `${h.titleId}|${h.slug}`;
    if (!seen.has(k)) { ud.history.push(h); seen.add(k); }
  }
  ud.history.sort((a, b2) => +new Date(b2.at) - +new Date(a.at));
  ud.history = ud.history.slice(0, 80);

  save();
  return NextResponse.json({ ok: true, watchlist: ud.watchlist, progress: ud.progress, history: ud.history });
}
