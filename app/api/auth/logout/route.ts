import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  logout();
  return NextResponse.json({ ok: true });
}
