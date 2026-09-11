import { NextResponse } from "next/server";
import { db, hashPassword, save } from "@/lib/db";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "").trim();
  const password = String(body.password ?? "");
  if (!token) return NextResponse.json({ error: "A reset token is required." }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const user = db().users.find(u => u.resetToken === token);
  if (!user || !user.resetExpires || new Date(user.resetExpires).getTime() < Date.now()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }
  user.salt = randomBytes(16).toString("hex");
  user.passwordHash = hashPassword(password, user.salt);
  user.resetToken = null;
  user.resetExpires = null;
  save();
  return NextResponse.json({ ok: true });
}
