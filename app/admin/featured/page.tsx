"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TitleCard } from "@/lib/card";
import type { HomeSectionConfig } from "@/lib/types";
import { cx } from "@/lib/format";
import { IconCheck, IconChevronDown, IconChevronUp, IconSpark } from "@/components/icons";

interface Flags {
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  topRated: boolean;
  lumoraPick: boolean;
}

export default function AdminFeaturedPage() {
  const [cards, setCards] = useState<TitleCard[] | null>(null);
  const [full, setFull] = useState<Record<string, Flags>>({});
  const [sections, setSections] = useState<HomeSectionConfig[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = () => {
    fetch("/api/admin/titles")
      .then(r => r.json())
      .then((d: { items: TitleCard[] }) => {
        const items = d.items ?? [];
        setCards(items);
        setFull(Object.fromEntries(items.map(c => [c.id, {
          featured: (c as unknown as { featured?: boolean }).featured ?? false,
          trending: c.trending,
          newRelease: !!c.flags?.newRelease,
          topRated: !!c.flags?.topRated,
          lumoraPick: !!c.flags?.lumoraPick,
        }])));
      })
      .catch(() => setCards([]));
    fetch("/api/admin/sections")
      .then(r => r.json())
      .then((d: { sections: HomeSectionConfig[] }) => setSections(d.sections ?? []))
      .catch(() => setSections([]));
  };

  useEffect(load, []);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2600); };

  const toggle = async (c: TitleCard, key: keyof Flags) => {
    const next = { ...full[c.id], [key]: !full[c.id][key] };
    setFull(prev => ({ ...prev, [c.id]: next }));
    const patch = {
      featured: next.featured,
      trending: next.trending,
      flags: { newRelease: next.newRelease, topRated: next.topRated, lumoraPick: next.lumoraPick },
    };
    const res = await fetch(`/api/admin/titles/${c.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      setFull(prev => ({ ...prev, [c.id]: full[c.id] }));
      flash("Update failed.");
    }
  };

  const saveSections = async (next: HomeSectionConfig[]) => {
    setSections(next);
    const res = await fetch("/api/admin/sections", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sections: next }),
    });
    if (res.ok) flash("Sections saved.");
    else { load(); flash("Section update failed — reverted."); }
  };

  const move = (idx: number, dir: -1 | 1) => {
    if (!sections) return;
    const next = [...sections];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    next.forEach((s, i) => { s.order = i + 1; });
    saveSections(next);
  };

  const filtered = (cards ?? []).filter(c => !q.trim() || c.title.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="font-display text-2xl font-extrabold uppercase text-mist-50">Featured & Sections</h1>
        <p className="mt-1 text-[13px] text-mist-400">Control what the homepage promotes and which rails appear, in what order.</p>
      </header>

      {msg && (
        <p className="flex items-center gap-2 rounded-lg border border-signal/25 bg-signal/[0.06] px-4 py-2.5 text-[13px] font-semibold text-signal" role="status">
          <IconCheck size={14} /> {msg}
        </p>
      )}

      {/* sections */}
      <section className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-5" aria-label="Homepage sections">
        <h2 className="mb-4 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.16em] text-mist-300">
          <IconSpark size={15} className="text-ember-300" /> Homepage rails
        </h2>
        {!sections ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-11 rounded-lg" />)}</div>
        ) : (
          <ol className="space-y-2">
            {sections.map((s, i) => (
              <li key={s.id} className="flex flex-wrap items-center gap-2.5 rounded-lg border border-white/[0.07] bg-ink-950/50 px-3 py-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/[0.05] font-mono text-[12px] font-bold text-mist-400">{i + 1}</span>
                <input
                  className="field h-9 min-w-[140px] flex-1"
                  value={s.label}
                  aria-label={`Label for section ${s.id}`}
                  onChange={e => { const next = [...sections]; next[i] = { ...s, label: e.target.value }; saveSections(next); }}
                />
                <span className="chip shrink-0">{s.type}{s.genre ? `:${s.genre}` : ""}</span>
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[12px] font-bold text-mist-400">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-ember-400"
                    checked={s.enabled}
                    onChange={e => { const next = [...sections]; next[i] = { ...s, enabled: e.target.checked }; saveSections(next); }}
                  />
                  Enabled
                </label>
                <span className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-quiet btn-sm" aria-label={`Move ${s.label} up`}>
                    <IconChevronUp size={14} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="btn-quiet btn-sm" aria-label={`Move ${s.label} down`}>
                    <IconChevronDown size={14} />
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-[12px] text-mist-600">
          Rail content is computed from catalog flags (trending, newRelease, topRated, lumoraPick) and genre/type. Add a
          genre rail by editing the section type in the datastore — label and visibility are managed here.
        </p>
      </section>

      {/* title flags */}
      <section className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-5" aria-label="Title promotion flags">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-mist-300">Title flags</h2>
          <input
            type="search"
            className="field h-9 w-full max-w-xs"
            placeholder="Filter titles…"
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Filter titles"
          />
        </div>
        {!cards ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-mist-500">
                  <th scope="col" className="px-3 py-2.5">Title</th>
                  {(["featured", "trending", "newRelease", "topRated", "lumoraPick"] as (keyof Flags)[]).map(k => (
                    <th key={k} scope="col" className="px-2 py-2.5 text-center">{k}</th>
                  ))}
                  <th scope="col" className="px-3 py-2.5 text-right">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03]">
                    <td className="max-w-[240px] truncate px-3 py-2.5 font-semibold text-mist-200">{c.title}</td>
                    {(["featured", "trending", "newRelease", "topRated", "lumoraPick"] as (keyof Flags)[]).map(k => (
                      <td key={k} className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={full[c.id]?.[k] ?? false}
                          aria-label={`${k} for ${c.title}`}
                          onClick={() => toggle(c, k)}
                          className={cx(
                            "relative mx-auto block h-5 w-9 rounded-full transition-colors",
                            full[c.id]?.[k] ? "bg-ember-400" : "bg-white/15"
                          )}
                        >
                          <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", full[c.id]?.[k] ? "left-[1.15rem]" : "left-0.5")} />
                        </button>
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-right">
                      <Link href={`/admin/titles/${c.id}`} className="btn-quiet btn-sm">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
