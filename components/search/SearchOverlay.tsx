"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TitleCard } from "@/lib/card";
import { cx, titleLink } from "@/lib/format";
import ArtImage from "@/components/art/ArtImage";
import { IconArrowLeft, IconClock, IconSearch, IconSpark, IconX } from "@/components/icons";

const LS_RECENT = "lumora.recent-searches.v1";

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_RECENT) ?? "[]");
  } catch { return []; }
}
function pushRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
    localStorage.setItem(LS_RECENT, JSON.stringify(next));
  } catch {}
}

export default function SearchOverlay({
  open,
  onClose,
  popularSearches,
}: {
  open: boolean;
  onClose: () => void;
  popularSearches: string[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<TitleCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setRecent(readRecent());
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced live suggestions
  useEffect(() => {
    const query = q.trim();
    if (!query) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`, { signal: ctl.signal });
        const data = await res.json();
        setItems(data.items ?? []);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setItems([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => { ctl.abort(); clearTimeout(t); };
  }, [q]);

  const submit = useCallback((term?: string) => {
    const query = (term ?? q).trim();
    if (!query) return;
    pushRecent(query);
    onClose();
    setQ("");
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }, [q, onClose, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] animate-fade-in" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-ink-950/88 backdrop-blur-xl" onClick={onClose} aria-hidden="true" />
      <div className="relative mx-auto flex h-full w-full max-w-3xl flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+18px)] sm:pt-8">
        {/* input row */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} aria-label="Close search" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-mist-300 transition-colors hover:bg-white/[0.08] hover:text-white">
            <IconArrowLeft size={20} />
          </button>
          <form
            className="relative flex-1"
            onSubmit={e => { e.preventDefault(); submit(); }}
            role="search"
          >
            <IconSearch size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search titles, actors, directors, genres, years…"
              aria-label="Search Lumora"
              className="field h-12 rounded-full border-white/15 bg-white/[0.06] pl-11 pr-11 text-[15px] placeholder:text-mist-500"
            />
            {q && (
              <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Clear search" className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-mist-400 hover:bg-white/10 hover:text-white">
                <IconX size={14} />
              </button>
            )}
          </form>
        </div>

        <div className="mt-5 flex-1 overflow-y-auto pb-28 lg:pb-8">
          {!q.trim() ? (
            <div className="space-y-8 animate-fade-up">
              {recent.length > 0 && (
                <section aria-label="Recent searches">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-mist-400">
                      <IconClock size={13} /> Recent
                    </h3>
                    <button
                      type="button"
                      onClick={() => { localStorage.removeItem(LS_RECENT); setRecent([]); }}
                      className="text-[11px] font-semibold text-mist-500 hover:text-mist-200"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map(term => (
                      <button key={term} type="button" onClick={() => submit(term)} className="chip transition-colors hover:border-white/30 hover:text-white">
                        {term}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <section aria-label="Popular searches">
                <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-mist-400">
                  <IconSpark size={13} className="text-ember-400" /> Popular right now
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map(term => (
                    <button key={term} type="button" onClick={() => submit(term)} className="chip border-ember-400/25 bg-ember-400/[0.07] text-mist-200 transition-colors hover:border-ember-400/60 hover:text-white">
                      {term}
                    </button>
                  ))}
                </div>
              </section>
              <p className="text-xs leading-relaxed text-mist-600">
                Tip: search works across titles, cast, directors, creators, genres, release years and languages.
              </p>
            </div>
          ) : (
            <div>
              {loading && items.length === 0 && (
                <ul className="space-y-2" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl p-2">
                      <div className="skeleton h-16 w-11 rounded-md" />
                      <div className="flex-1">
                        <div className="skeleton h-3.5 w-1/3 rounded" />
                        <div className="skeleton mt-2 h-3 w-1/4 rounded" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {!loading && items.length === 0 && (
                <div className="rounded-xl2 border border-dashed border-white/10 px-6 py-12 text-center">
                  <p className="font-display font-bold text-mist-100">No matches for “{q.trim()}”</p>
                  <p className="mt-1.5 text-sm text-mist-400">Try a title, a person, a genre like “horror”, or a year like “1959”.</p>
                </div>
              )}
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={item.id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <Link
                      href={titleLink(item)}
                      onClick={() => { pushRecent(q.trim()); onClose(); setQ(""); }}
                      className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.06]"
                    >
                      <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10">
                        <ArtImage
                          src={item.poster}
                          alt=""
                          seed={item.slug}
                          title={item.title}
                          genres={item.genres}
                          year={item.year}
                          sizes="44px"
                          className="h-full w-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-mist-50 group-hover:text-ember-300">{item.title}</p>
                        <p className="mt-0.5 truncate text-xs text-mist-400">
                          {item.year} · {item.kind === "movie" ? "Movie" : "Series"}
                          {item.genres[0] ? ` · ${item.genres[0]}` : ""}
                        </p>
                      </div>
                      <span className="chip shrink-0">★ {item.rating.toFixed(1)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => submit()}
                  className={cx("mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-mist-100 transition-colors hover:border-ember-400/40 hover:text-ember-300")}
                >
                  See all results for “{q.trim()}”
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
