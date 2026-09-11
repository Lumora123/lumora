import type { ListFilters, SortKey } from "@/lib/queries";
import type { TitleKind } from "@/lib/types";

export type SP = Record<string, string | string[] | undefined>;

const asArray = (v: string | string[] | undefined): string[] =>
  v == null ? [] : Array.isArray(v) ? v : v.split(",").filter(Boolean);

export function parseListParams(sp: SP, forced?: Partial<ListFilters>): { filters: ListFilters; page: number } {
  const kinds = asArray(sp.type).filter(k => k === "movie" || k === "tv") as TitleKind[];
  const year = asArray(sp.year).map(Number).filter(y => y >= 1900 && y <= 2100);
  const decade = asArray(sp.decade).map(Number).filter(y => y >= 1900 && y <= 2100);
  const minRating = sp.rating ? Number(sp.rating) : undefined;
  const runtime = ["short", "medium", "long"].includes(String(sp.runtime)) ? (sp.runtime as "short" | "medium" | "long") : undefined;
  const sort = ["popular", "latest", "rating", "alpha", "added"].includes(String(sp.sort)) ? (sp.sort as SortKey) : "popular";
  const page = Math.max(1, Number(sp.page) || 1);

  const filters: ListFilters = {
    q: typeof sp.q === "string" ? sp.q.trim() : undefined,
    kinds: forced?.kinds ?? (kinds.length ? kinds : undefined),
    genres: forced?.genres ?? (asArray(sp.genre).length ? asArray(sp.genre) : undefined),
    years: year.length ? year : undefined,
    minRating: minRating && !isNaN(minRating) ? minRating : undefined,
    languages: asArray(sp.lang).length ? asArray(sp.lang) : undefined,
    countries: asArray(sp.country).length ? asArray(sp.country) : undefined,
    runtime: forced?.runtime ?? runtime,
    sort: forced?.sort ?? sort,
    pageSize: 24,
  };
  if (decade.length) {
    const lo = Math.min(...decade);
    const hi = Math.max(...decade) + 9;
    filters.yearRange = [lo, hi];
  }
  return { filters, page };
}

/** Serialize current browse state back to a query string (used by FilterBar). */
export function buildQuery(state: Record<string, string | number | undefined | null | (string | number)[]>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) {
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    usp.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}
