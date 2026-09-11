import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toCard } from "@/lib/card";

export const dynamic = "force-dynamic";

/** Public slim catalog — used by client pages (My List, History) to resolve ids. */
export async function GET() {
  return NextResponse.json({ items: db().titles.map(toCard) });
}
