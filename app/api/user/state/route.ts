import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureUserData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const ud = ensureUserData(user.id);
  return NextResponse.json({ watchlist: ud.watchlist, progress: ud.progress, history: ud.history });
}
