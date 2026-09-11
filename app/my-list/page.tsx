"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TitleCard } from "@/lib/card";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import PageHeader from "@/components/browse/PageHeader";
import MovieGrid from "@/components/cards/MovieGrid";
import { GridSkeleton, EmptyState } from "@/components/ui/States";
import { IconBookmark, IconFilm, IconTv } from "@/components/icons";

type SortKey = "added" | "alpha" | "rating" | "year";
type KindFilter = "all" | "movie" | "tv";

export default function MyListPage() {
  const { ready, watchlist } = useStore();
  const [cards, setCards] = useState<TitleCard[] | null>(null);
  const [sort, setSort] = useState<SortKey>("added");
  const [kind, setKind] = useState<KindFilter>("all");

  useEffect(() => {
    fetch("/api/titles")
      .then(r => r.json())
      .then(d => setCards(d.items ?? []))
      .catch(() => setCards([]));
  }, []);

  const items = useMemo(() => {
    if (!cards) return [];
    const byId = new Map(cards.map(c => [c.id, c]));
    let list = watchlist.map(id => byId.get(id)).filter((c): c is TitleCard => !!c);
    if (kind !== "all") list = list.filter(c => c.kind === kind);
    switch (sort) {
      case "alpha": list = [...list].sort((a, b) => a.title.localeCompare(b.title)); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "year": list = [...list].sort((a, b) => b.year - a.year); break;
      default: break; // watchlist order = most recently added first
    }
    return list;
  }, [cards, watchlist, sort, kind]);

  return (
    <>
      <PageHeader
        eyebrow="Your library"
        title="My List"
        description="Everything you've saved to watch later — synced to your account when signed in, kept on this device when you're not."
      />
      <div className="shell py-8 lg:py-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" role="group" aria-label="Filter by type">
            {([
              ["all", "All"],
              ["movie", "Movies"],
              ["tv", "Series"],
            ] as [KindFilter, string][]).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={cx(
                  "rounded-lg border px-3.5 py-2 text-[12.5px] font-bold transition-colors",
                  kind === k ? "border-ember-400/60 bg-ember-400/12 text-ember-200" : "border-white/10 bg-white/[0.03] text-mist-400 hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[12.5px] font-semibold text-mist-400">
            Sort
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="field h-9 w-auto cursor-pointer rounded-lg py-0 text-[12.5px]"
            >
              <option value="added">Recently added</option>
              <option value="alpha">Alphabetical</option>
              <option value="rating">Highest rated</option>
              <option value="year">Newest first</option>
            </select>
          </label>
        </div>

        {!ready || !cards ? (
          <GridSkeleton count={10} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<IconBookmark size={22} />}
            title={watchlist.length === 0 ? "Your list is empty" : "Nothing matches this filter"}
            body={
              watchlist.length === 0
                ? "Tap the + button on any poster — or the My List action on a detail page — to save it here for later."
                : "Try switching the type filter back to All."
            }
            action={
              <div className="flex gap-2.5">
                <Link href="/movies" className="btn-ghost btn-md gap-2"><IconFilm size={14} /> Browse movies</Link>
                <Link href="/tv" className="btn-ghost btn-md gap-2"><IconTv size={14} /> Browse series</Link>
              </div>
            }
          />
        ) : (
          <MovieGrid cards={items} />
        )}
      </div>
    </>
  );
}
