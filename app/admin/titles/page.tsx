"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TitleCard } from "@/lib/card";
import { cx } from "@/lib/format";
import { IconEdit, IconEye, IconFilm, IconPlus, IconSearch, IconTv } from "@/components/icons";

export default function AdminTitlesPage() {
  const [cards, setCards] = useState<TitleCard[] | null>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "movie" | "tv">("all");
  const [deleted, setDeleted] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/titles").then(r => r.json()).then(d => setCards(d.items ?? [])).catch(() => setCards([]));
  };
  useEffect(load, []);

  const items = useMemo(() => {
    let list = cards ?? [];
    if (kind !== "all") list = list.filter(c => c.kind === kind);
    const needle = q.trim().toLowerCase();
    if (needle) list = list.filter(c => c.title.toLowerCase().includes(needle) || c.slug.includes(needle));
    return list;
  }, [cards, q, kind]);

  const remove = async (c: TitleCard) => {
    if (!window.confirm(`Delete “${c.title}”? This removes it from the catalog and from every user's list, history and progress. This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/titles/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleted(c.title);
      load();
      setTimeout(() => setDeleted(null), 3500);
    } else {
      const d = await res.json().catch(() => ({}));
      window.alert(d.error || "Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold uppercase text-mist-50">Titles</h1>
          <p className="mt-1 text-[13px] text-mist-400">{cards ? `${cards.length} in catalog` : "Loading…"}</p>
        </div>
        <Link href="/admin/titles/new" className="btn-ember btn-md gap-2"><IconPlus size={15} /> New title</Link>
      </header>

      {deleted && (
        <p className="rounded-lg border border-red-400/25 bg-red-950/40 px-4 py-3 text-[13px] font-semibold text-red-200" role="status">
          Deleted “{deleted}”.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <IconSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Filter by name or slug…"
            className="field pl-10"
            aria-label="Filter titles"
          />
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Filter by kind">
          {(["all", "movie", "tv"] as const).map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={cx(
                "rounded-lg border px-3.5 py-2 text-[12.5px] font-bold capitalize transition-colors",
                kind === k ? "border-ember-400/60 bg-ember-400/12 text-ember-200" : "border-white/10 bg-white/[0.03] text-mist-400 hover:text-white"
              )}
            >
              {k === "all" ? "All" : k === "movie" ? "Movies" : "Series"}
            </button>
          ))}
        </div>
      </div>

      {!cards ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl2 border border-white/[0.07]">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[11px] font-extrabold uppercase tracking-[0.14em] text-mist-500">
                <th scope="col" className="px-4 py-3">Title</th>
                <th scope="col" className="px-4 py-3">Kind</th>
                <th scope="col" className="px-4 py-3">Year</th>
                <th scope="col" className="px-4 py-3">Rating</th>
                <th scope="col" className="px-4 py-3">Sources</th>
                <th scope="col" className="px-4 py-3">Flags</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <span className="block font-bold text-mist-100">{c.title}</span>
                    <span className="block font-mono text-[11px] text-mist-600">{c.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="chip">
                      {c.kind === "movie" ? <IconFilm size={11} /> : <IconTv size={11} />}
                      {c.kind === "movie" ? "Movie" : `Series${c.episodeCount ? ` · ${c.episodeCount} ep` : ""}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mist-400">{c.year}</td>
                  <td className="px-4 py-3 font-semibold text-mist-300">{c.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    {c.hasSources ? (
                      <span className="chip border-signal/30 bg-signal/10 text-signal">playable</span>
                    ) : (
                      <span className="chip border-red-400/30 bg-red-400/10 text-red-300">unavailable</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap gap-1">
                      {c.trending && <span className="chip">trending</span>}
                      {c.flags?.newRelease && <span className="chip">new</span>}
                      {c.flags?.topRated && <span className="chip">top</span>}
                      {c.flags?.lumoraPick && <span className="chip">pick</span>}
                      {c.contentTier === "demo" && <span className="chip border-ember-400/30 bg-ember-400/10 text-ember-300">demo</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex justify-end gap-1.5">
                      <Link href={c.kind === "movie" ? `/movie/${c.slug}` : `/tv/${c.slug}`} target="_blank" className="btn-quiet btn-sm gap-1.5" title="View public page">
                        <IconEye size={14} /> <span className="sr-only sm:not-sr-only">View</span>
                      </Link>
                      <Link href={`/admin/titles/${c.id}`} className="btn-ghost btn-sm gap-1.5" title="Edit">
                        <IconEdit size={14} /> <span className="sr-only sm:not-sr-only">Edit</span>
                      </Link>
                      <button type="button" onClick={() => remove(c)} className="btn-quiet btn-sm text-red-300 hover:bg-red-400/10 hover:text-red-200" title="Delete">
                        Delete
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-mist-500">No titles match this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
