import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { recommendedForYou } from "@/lib/recommend";
import { toCard } from "@/lib/card";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = getSessionUser();
  return NextResponse.json({ items: recommendedForYou(user?.id ?? null, 16).map(toCard) });
}
