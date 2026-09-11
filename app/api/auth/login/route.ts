import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    const user = login(email, password);
    if (!user) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Login failed." }, { status: 500 });
  }
}
