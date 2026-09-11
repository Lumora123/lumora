import { NextResponse } from "next/server";
import { searchTitles } from "@/lib/queries";
import { toCard } from "@/lib/card";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get("limit") ?? 24)));
  if (!q) return NextResponse.json({ items: [], total: 0, q });
  const items = searchTitles(q, limit).map(toCard);
  return NextResponse.json({ items, total: items.length, q });
}
