"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TitleCard } from "@/lib/card";
import { formatDate, timeAgo } from "@/lib/format";
import { IconAlert, IconFilm, IconPlus, IconSpark, IconTv, IconUser } from "@/components/icons";

interface AdminStats {
  titles: number;
  movies: number;
  shows: number;
  episodes: number;
  users: number;
  sessions: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cards, setCards] = useState<TitleCard[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => setStats(d.stats ?? null)).catch(() => {});
    fetch("/api/admin/titles").then(r => r.json()).then(d => setCards(d.items ?? [])).catch(() => {});
  }, []);

  const unplayable = (cards ?? []).filter(c => !c.hasSources);
  const featured = (cards ?? []).filter(c => c.trending || (c as TitleCard & { featured?: boolean }).featured);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold uppercase text-mist-50">Overview</h1>
          <p className="mt-1 text-[13px] text-mist-400">Catalog health and account activity at a glance.</p>
        </div>
        <Link href="/admin/titles/new" className="btn-ember btn-md gap-2">
          <IconPlus size={15} /> New title
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Titles" value={stats?.titles} icon={<IconSpark size={16} />} />
        <StatCard label="Movies" value={stats?.movies} icon={<IconFilm size={16} />} />
        <StatCard label="Series" value={stats?.shows} icon={<IconTv size={16} />} />
        <StatCard label="Episodes" value={stats?.episodes} icon={<IconTv size={16} />} />
        <StatCard label="Users" value={stats?.users} icon={<IconUser size={16} />} href="/admin/users" />
        <StatCard label="Active sessions" value={stats?.sessions} icon={<IconUser size={16} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-5" aria-label="Rights health">
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.16em] text-mist-300">
            <IconAlert size={15} className="text-ember-300" /> Streaming health
          </h2>
          {!cards ? (
            <div className="skeleton h-16 rounded-lg" />
          ) : unplayable.length === 0 ? (
            <p className="rounded-lg border border-signal/20 bg-signal/[0.05] px-4 py-3 text-[13px] text-mist-300">
              Every catalog title has at least one authorized, unexpired playback source.
            </p>
          ) : (
            <>
              <p className="mb-3 text-[13px] text-mist-400">
                {unplayable.length} title{unplayable.length === 1 ? "" : "s"} currently show “Streaming unavailable”.
                That is the correct, honest state for unlicensed works — attach an authorized source to make them playable.
              </p>
              <ul className="space-y-2">
                {unplayable.slice(0, 8).map(c => (
                  <li key={c.id}>
                    <Link href={`/admin/titles/${c.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] px-3.5 py-2.5 text-[13px] transition-colors hover:border-ember-400/40">
                      <span className="truncate font-semibold text-mist-200">{c.title}</span>
                      <span className="shrink-0 text-[11.5px] font-bold uppercase tracking-wide text-ember-300">{c.kind}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-[12px] text-mist-600">
            {featured.length} title{featured.length === 1 ? "" : "s"} flagged for home promotion ·{" "}
            <Link href="/admin/featured" className="font-semibold text-ember-300 hover:text-ember-200">manage sections</Link>
          </p>
        </section>

        <section className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-5" aria-label="Recently updated">
          <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.16em] text-mist-300">Recently updated</h2>
          {!cards ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-11 rounded-lg" />)}
            </div>
          ) : (
            <ul className="space-y-2">
              {[...cards]
                .sort((a, b) => String((b as { updatedAt?: string }).updatedAt ?? "").localeCompare(String((a as { updatedAt?: string }).updatedAt ?? "")))
                .slice(0, 6)
                .map(c => (
                  <li key={c.id}>
                    <Link href={`/admin/titles/${c.id}`} className="flex items-center gap-3.5 rounded-lg border border-white/[0.06] px-3.5 py-2.5 transition-colors hover:border-white/20">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-mist-100">{c.title}</span>
                        <span className="block text-[11.5px] text-mist-500">{c.kind === "movie" ? "Movie" : "Series"} · {c.year} · rating {c.rating.toFixed(1)}</span>
                      </span>
                      <span className="shrink-0 text-[11px] font-semibold text-mist-600">added {timeAgo(new Date().toISOString())}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
          <p className="mt-4 text-[12px] text-mist-600">
            Platform build {formatDate(new Date().toISOString())} · datastore: JSON file (swappable) · sessions: httpOnly cookies
          </p>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, href }: { label: string; value?: number; icon: React.ReactNode; href?: string }) {
  const inner = (
    <>
      <span className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-ember-400/10 text-ember-300">{icon}</span>
      <span className="block font-display text-xl font-extrabold text-mist-50">{value ?? "—"}</span>
      <span className="block text-[11.5px] font-semibold text-mist-500">{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-4 transition-colors hover:border-ember-400/30">{inner}</Link>
  ) : (
    <div className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-4">{inner}</div>
  );
}
