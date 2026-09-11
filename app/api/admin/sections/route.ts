import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db, save } from "@/lib/db";
import type { HomeSectionConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

function requireAdmin() {
  const u = getSessionUser();
  return u && u.role === "admin" ? u : null;
}

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  return NextResponse.json({ sections: db().sections });
}

export async function PUT(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const incoming: Partial<HomeSectionConfig>[] | undefined = body?.sections;
  if (!Array.isArray(incoming)) return NextResponse.json({ error: "sections array required." }, { status: 400 });
  const d = db();
  for (const patch of incoming) {
    if (!patch?.id) continue;
    const sec = d.sections.find(s => s.id === patch.id);
    if (!sec) continue;
    if (typeof patch.label === "string") sec.label = patch.label;
    if (typeof patch.enabled === "boolean") sec.enabled = patch.enabled;
    if (typeof patch.order === "number") sec.order = patch.order;
    if (typeof patch.type === "string") sec.type = patch.type as HomeSectionConfig["type"];
    if (typeof patch.genre === "string") sec.genre = patch.genre;
  }
  d.sections.sort((a, b) => a.order - b.order);
  save();
  return NextResponse.json({ sections: d.sections });
}
