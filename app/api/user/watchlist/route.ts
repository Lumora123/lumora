import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db, ensureUserData, save } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const titleId = String(body.titleId ?? "");
  const add = body.add !== false;
  if (!db().titles.some(t => t.id === titleId)) {
    return NextResponse.json({ error: "Title not found." }, { status: 404 });
  }
  const ud = ensureUserData(user.id);
  if (add) {
    if (!ud.watchlist.includes(titleId)) ud.watchlist.unshift(titleId);
  } else {
    ud.watchlist = ud.watchlist.filter(id => id !== titleId);
  }
  save();
  return NextResponse.json({ watchlist: ud.watchlist });
}
