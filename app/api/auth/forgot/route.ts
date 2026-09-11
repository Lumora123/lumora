import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db, save } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * [ASSUMPTION] No email transport is wired up in this build. In production the
 * reset link is emailed and never returned in the response; here it is surfaced
 * only in development so the flow can be exercised end to end.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const generic = {
    ok: true,
    message: "If an account exists for that address, a password reset link is on its way.",
  };
  if (!email) return NextResponse.json(generic);

  const user = db().users.find(u => u.email.toLowerCase() === email);
  if (!user) return NextResponse.json(generic);

  const token = randomBytes(24).toString("hex");
  user.resetToken = token;
  user.resetExpires = new Date(Date.now() + 3600_000).toISOString();
  save();

  const dev = process.env.NODE_ENV !== "production";
  return NextResponse.json(
    dev ? { ...generic, devResetToken: token, devNote: "Development only — emailed in production." } : generic
  );
}
