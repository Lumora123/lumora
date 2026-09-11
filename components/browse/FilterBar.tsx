"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { cx } from "@/lib/format";
import { countryName, languageLabel } from "@/lib/format";
import { IconChevronDown, IconFilter, IconX } from "@/components/icons";

export interface Facets {
  genres: { slug: string; name: string }[];
  languages: string[];
  countries: string[];
  decades: number[];
}

const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "added", label: "Recently added" },
  { value: "latest", label: "Newest first" },
  { value: "rating", label: "Highest rated" },
  { value: "alpha", label: "A → Z" },
];

const RUNTIMES = [
  { value: "short", label: "Under 80 min" },
  { value: "medium", label: "80–130 min" },
  { value: "long", label: "Over 130 min" },
];

const RATINGS = [
  { value: "6", label: "6.0+" },
  { value: "7", label: "7.0+" },
  { value: "7.5", label: "7.5+" },
  { value: "8", label: "8.0+" },
];

function Chip({ active, children, onClick, label }: { active: boolean; children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 active:scale-95",
        active
          ? "border-ember-400/70 bg-ember-400/15 text-ember-200 shadow-[0_0_18px_-6px_rgba(245,166,35,0.5)]"
          : "border-white/10 bg-white/[0.03] text-mist-300 hover:border-white/30 hover:text-white"
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

export default function FilterBar({
  facets,
  resultCount,
  forced,
}: {
  facets: Facets;
  resultCount: number;
  forced?: { kinds?: boolean; genres?: boolean };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const params = useMemo(() => new URLSearchParams(sp?.toString() ?? ""), [sp]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value == null || value === "") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const toggleMulti = (key: string, value: string) => {
    const current = (params.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setParam(key, next.length ? next.join(",") : null);
  };

  const activeCount = ["type", "genre", "decade", "rating", "lang", "country", "runtime"].filter(
    k => (params.get(k) ?? "").length > 0 && !(forced?.kinds && k === "type") && !(forced?.genres && k === "genre")
  ).length;

  const clearAll = () => {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };

  const type = params.get("type") ?? "";
  const genresSel = (params.get("genre") ?? "").split(",").filter(Boolean);
  const decadesSel = (params.get("decade") ?? "").split(",").filter(Boolean);
  const rating = params.get("rating") ?? "";
  const langsSel = (params.get("lang") ?? "").split(",").filter(Boolean);
  const countriesSel = (params.get("country") ?? "").split(",").filter(Boolean);
  const runtime = params.get("runtime") ?? "";
  const sort = params.get("sort") ?? "popular";

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-mist-400" role="status" aria-live="polite">
          <span className="font-bold text-mist-100">{resultCount}</span> title{resultCount === 1 ? "" : "s"}
          {activeCount > 0 && <span className="ml-2 text-mist-500">· {activeCount} filter{activeCount === 1 ? "" : "s"} active</span>}
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sort}
              onChange={e => setParam("sort", e.target.value === "popular" ? null : e.target.value)}
              aria-label="Sort results"
              className="field h-10 cursor-pointer appearance-none rounded-lg border-white/10 bg-ink-850/90 pl-3.5 pr-9 text-[13px] font-semibold"
            >
              {SORTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <IconChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mist-400" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            className={cx(
              "flex h-10 items-center gap-2 rounded-lg border px-3.5 text-[13px] font-semibold transition-colors",
              open || activeCount > 0
                ? "border-ember-400/50 bg-ember-400/10 text-ember-200"
                : "border-white/10 bg-ink-850/90 text-mist-200 hover:border-white/30"
            )}
          >
            <IconFilter size={15} />
            Filters
            {activeCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember-400 px-1 text-[10px] font-extrabold text-ink-950">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 animate-fade-up space-y-5 rounded-xl2 border border-white/[0.07] bg-ink-900/60 p-5 backdrop-blur">
          {!forced?.kinds && (
            <FilterGroup label="Type">
              <Chip active={type === ""} onClick={() => setParam("type", null)} label="All titles">All</Chip>
              <Chip active={type === "movie"} onClick={() => setParam("type", "movie")} label="Movies only">Movies</Chip>
              <Chip active={type === "tv"} onClick={() => setParam("type", "tv")} label="TV shows only">TV Shows</Chip>
            </FilterGroup>
          )}
          {!forced?.genres && facets.genres.length > 0 && (
            <FilterGroup label="Genre">
              {facets.genres.map(g => (
                <Chip key={g.slug} active={genresSel.includes(g.slug)} onClick={() => toggleMulti("genre", g.slug)} label={`genre ${g.name}`}>
                  {g.name}
                </Chip>
              ))}
            </FilterGroup>
          )}
          <FilterGroup label="Decade">
            {facets.decades.map(d => (
              <Chip key={d} active={decadesSel.includes(String(d))} onClick={() => toggleMulti("decade", String(d))} label={`decade ${d}s`}>
                {d}s
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Rating">
            {RATINGS.map(r => (
              <Chip key={r.value} active={rating === r.value} onClick={() => setParam("rating", rating === r.value ? null : r.value)} label={`minimum rating ${r.label}`}>
                ★ {r.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Runtime">
            {RUNTIMES.map(r => (
              <Chip key={r.value} active={runtime === r.value} onClick={() => setParam("runtime", runtime === r.value ? null : r.value)} label={`runtime ${r.label}`}>
                {r.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Language">
            {facets.languages.map(l => (
              <Chip key={l} active={langsSel.includes(l)} onClick={() => toggleMulti("lang", l)} label={`language ${languageLabel(l)}`}>
                {languageLabel(l)}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Country">
            {facets.countries.map(c => (
              <Chip key={c} active={countriesSel.includes(c)} onClick={() => toggleMulti("country", c)} label={`country ${countryName(c)}`}>
                {countryName(c)}
              </Chip>
            ))}
          </FilterGroup>
          <div className="flex justify-end border-t border-white/[0.06] pt-4">
            <button type="button" onClick={clearAll} className="btn-quiet btn-sm gap-1.5 text-mist-400">
              <IconX size={13} /> Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-[110px_1fr] sm:items-start">
      <span className="label mb-0 mt-1 sm:mb-0">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
