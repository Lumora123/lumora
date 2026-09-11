import { NextResponse } from "next/server";
import { getSessionUser, toPublicUser } from "@/lib/auth";
import { db, save } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const me = getSessionUser();
  if (!me || me.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const d = db();
  const user = d.users.find(u => u.id === params.id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.role === "string") {
    if (user.id === me.id && body.role !== "admin") {
      return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
    }
    if (["user", "admin"].includes(body.role)) user.role = body.role;
  }
  if (typeof body.name === "string" && body.name.trim()) user.name = body.name.trim();
  save();
  return NextResponse.json({ user: toPublicUser(user) });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = getSessionUser();
  if (!me || me.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (me.id === params.id) return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  const d = db();
  const idx = d.users.findIndex(u => u.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const [removed] = d.users.splice(idx, 1);
  delete d.userData[removed.id];
  for (const [token, sess] of Object.entries(d.sessions)) {
    if (sess.userId === removed.id) delete d.sessions[token];
  }
  save();
  return NextResponse.json({ ok: true });
}
