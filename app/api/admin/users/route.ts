import { NextResponse } from "next/server";
import { getSessionUser, toPublicUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = getSessionUser();
  if (!me || me.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const d = db();
  const users = d.users.map(u => ({
    ...toPublicUser(u),
    watchlistCount: d.userData[u.id]?.watchlist.length ?? 0,
    historyCount: d.userData[u.id]?.history.length ?? 0,
    inProgressCount: Object.keys(d.userData[u.id]?.progress ?? {}).length,
  }));
  return NextResponse.json({ users, stats: {
    titles: d.titles.length,
    movies: d.titles.filter(t => t.kind === "movie").length,
    shows: d.titles.filter(t => t.kind === "tv").length,
    episodes: d.titles.reduce((a, t) => a + (t.seasons?.reduce((b, s) => b + s.episodes.length, 0) ?? 0), 0),
    users: d.users.length,
    sessions: Object.keys(d.sessions).length,
  } });
}
