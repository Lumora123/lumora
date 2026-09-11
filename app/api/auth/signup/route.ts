import { NextResponse } from "next/server";
import { signup } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    const result = signup(email, password, name);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Sign up failed." }, { status: 500 });
  }
}
