import "server-only";
import { db } from "@/lib/db";
import { genreBySlug, genres } from "@/lib/genres";
import type { Episode, Title, TitleKind } from "@/lib/types";
import { playableSources } from "@/lib/format";

export type SortKey = "popular" | "latest" | "rating" | "alpha" | "added";

export interface ListFilters {
  q?: string;
  kinds?: TitleKind[];
  genres?: string[];
  years?: number[]; // exact years; use yearRange for spans
  yearRange?: [number, number];
  minRating?: number;
  languages?: string[];
  countries?: string[];
  runtime?: "short" | "medium" | "long"; // <80m / 80–130m / >130m
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

function sortTitles(list: Title[], sort: SortKey = "popular"): Title[] {
  const arr = [...list];
  switch (sort) {
    case "latest":
      return arr.sort((a, b) => b.year - a.year || b.popularity - a.popularity);
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating || b.popularity - a.popularity);
    case "alpha":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "added":
      return arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    default:
      return arr.sort((a, b) => b.popularity - a.popularity);
  }
}

function tokenize(s: string) {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1);
}

/** Relevance score for a text query. 0 = no match. */
export function matchScore(t: Title, q: string): number {
  const query = q.trim().toLowerCase();
  if (!query) return 0;
  let score = 0;
  const title = t.title.toLowerCase();
  if (title === query) score += 120;
  if (title.startsWith(query)) score += 60;
  if (title.includes(query)) score += 40;
  const tagline = (t.tagline ?? "").toLowerCase();
  if (tagline.includes(query)) score += 4;
  if (t.director?.toLowerCase().includes(query)) score += 18;
  t.creators?.forEach(c => { if (c.toLowerCase().includes(query)) score += 14; });
  if (t.cast.some(c => c.name.toLowerCase().includes(query))) score += 14;
  if (t.genres.some(g => (genreBySlug.get(g)?.name ?? g).toLowerCase().includes(query) || g === query)) score += 10;
  if (String(t.year) === query) score += 12;
  if (t.languages.join(",").includes(query)) score += 6;
  if (t.countries.join(",").toLowerCase().includes(query)) score += 6;
  // token-level fallback
  if (score === 0) {
    const qt = tokenize(query);
    const tt = tokenize(`${t.title} ${t.director ?? ""} ${t.cast.map(c => c.name).join(" ")} ${t.genres.join(" ")} ${t.year}`);
    const hits = qt.filter(x => tt.some(y => y.startsWith(x) || x.startsWith(y))).length;
    if (hits) score += hits * 8;
  }
  return score;
}

export function listTitles(f: ListFilters = {}): { items: Title[]; total: number; page: number; pages: number } {
  let items = db().titles;
  if (f.q) {
    items = items
      .map(t => ({ t, s: matchScore(t, f.q!) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s || b.t.popularity - a.t.popularity)
      .map(x => x.t);
  }
  if (f.kinds?.length) items = items.filter(t => f.kinds!.includes(t.kind));
  if (f.genres?.length) items = items.filter(t => t.genres.some(g => f.genres!.includes(g)));
  if (f.years?.length) items = items.filter(t => f.years!.includes(t.year));
  if (f.yearRange) items = items.filter(t => t.year >= f.yearRange![0] && t.year <= f.yearRange![1]);
  if (f.minRating) items = items.filter(t => t.rating >= f.minRating!);
  if (f.languages?.length) items = items.filter(t => t.languages.some(l => f.languages!.includes(l)));
  if (f.countries?.length) items = items.filter(t => t.countries.some(c => f.countries!.includes(c)));
  if (f.runtime) {
    items = items.filter(t => {
      const m = t.runtime / 60;
      if (f.runtime === "short") return m < 80;
      if (f.runtime === "medium") return m >= 80 && m <= 130;
      return m > 130;
    });
  }
  if (!f.q) items = sortTitles(items, f.sort ?? "popular");
  const total = items.length;
  const pageSize = f.pageSize ?? 24;
  const page = Math.max(1, f.page ?? 1);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);
  return { items: paged, total, page, pages };
}

export function getTitleBySlug(slug: string, kind?: TitleKind): Title | null {
  const t = db().titles.find(x => x.slug === slug && (!kind || x.kind === kind));
  return t ?? null;
}

export function getTitleById(id: string): Title | null {
  return db().titles.find(x => x.id === id) ?? null;
}

export function getEpisode(showSlug: string, season: number, epNum: number): { show: Title; episode: Episode } | null {
  const show = getTitleBySlug(showSlug, "tv");
  if (!show?.seasons) return null;
  const seasonObj = show.seasons.find(s => s.number === season);
  const episode = seasonObj?.episodes.find(e => e.number === epNum);
  if (!episode) return null;
  return { show, episode };
}

/* ------------------------------ home rails ------------------------------ */
const rail = (t: Title[]) => t.slice(0, 18);

export function railTrending() {
  return rail(sortTitles(db().titles.filter(t => t.trending), "popular"));
}
export function railPopularMovies() {
  return rail(db().titles.filter(t => t.kind === "movie" && playableSources(t.streamingSources).length > 0).sort((a, b) => b.popularity - a.popularity));
}
export function railPopularTV() {
  return rail(db().titles.filter(t => t.kind === "tv").sort((a, b) => b.popularity - a.popularity));
}
export function railNewReleases() {
  return rail(db().titles.filter(t => t.flags?.newRelease).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
}
export function railRecentlyAdded() {
  return rail([...db().titles].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
}
export function railTopRated() {
  return rail(sortTitles(db().titles.filter(t => t.rating >= 7.0), "rating"));
}
export function railGenre(genre: string) {
  return rail(sortTitles(db().titles.filter(t => t.genres.includes(genre)), "popular"));
}
export function heroTitles() {
  const featured = db().titles.filter(t => t.featured && playableCount(t) > 0);
  const ordered = featured.sort((a, b) => b.popularity - a.popularity);
  return ordered.length ? ordered : sortTitles(db().titles, "popular").slice(0, 5);
}
function playableCount(t: Title) {
  if (t.kind === "movie") return playableSources(t.streamingSources).length;
  return t.seasons?.some(s => s.episodes.some(e => playableSources(e.streamingSources).length)) ? 1 : 0;
}

/* -------------------------------- facets -------------------------------- */
export function facets() {
  const titles = db().titles;
  const years = [...new Set(titles.map(t => t.year))].sort((a, b) => a - b);
  const languages = [...new Set(titles.flatMap(t => t.languages))].sort();
  const countries = [...new Set(titles.flatMap(t => t.countries))].sort();
  const usedGenres = genres.filter(g => titles.some(t => t.genres.includes(g.slug)));
  return { years, languages, countries, genres: usedGenres };
}

export function popularSearches(): string[] {
  const t = db().titles;
  return [
    ...sortTitles(t.filter(x => x.trending), "popular").slice(0, 6).map(x => x.title),
    "Alfred Hitchcock", "Buster Keaton", "Vincent Price", "horror", "public domain",
  ].slice(0, 10);
}

export function searchTitles(q: string, limit = 60): Title[] {
  return listTitles({ q, pageSize: limit }).items;
}

export function suggest(q: string, limit = 6): Title[] {
  return listTitles({ q, pageSize: limit }).items;
}

export function allGenres() {
  return genres;
}

export function genreCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const g of genres) counts[g.slug] = db().titles.filter(t => t.genres.includes(g.slug)).length;
  return counts;
}
