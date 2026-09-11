import type { Episode, StreamingSource, Title } from "@/lib/types";
import { genreBySlug } from "@/lib/genres";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function formatRuntime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h <= 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatClock(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function genreName(slug: string): string {
  return genreBySlug.get(slug)?.name ?? slug;
}

export function genreNames(slugs: string[]): string {
  return slugs.map(genreName).join(" · ");
}

/** Honest quality badge derived from real encoded heights. */
export function qualityBadge(sources: StreamingSource[]): { label: "4K" | "HD" | null; best: string } {
  const live = sources.filter(isSourceLive);
  const hls = live.find(s => s.type === "hls");
  const best = live.reduce((max, s) => Math.max(max, s.height ?? 0), 0);
  if (hls) return { label: best >= 700 ? "HD" : null, best: "Adaptive" };
  if (best >= 1800) return { label: "4K", best: `${best}p` };
  if (best >= 700) return { label: "HD", best: `${best}p` };
  return { label: null, best: best ? `${best}p` : "—" };
}

export function isSourceLive(s: StreamingSource): boolean {
  return !s.expiresAt || new Date(s.expiresAt).getTime() > Date.now();
}

export function playableSources(sources: StreamingSource[]): StreamingSource[] {
  return sources.filter(isSourceLive);
}

export function hasPlayableSources(sources: StreamingSource[]): boolean {
  return playableSources(sources).length > 0;
}

export function languageLabel(code: string): string {
  const map: Record<string, string> = {
    en: "English", de: "German", fr: "French", es: "Spanish", ru: "Russian",
    it: "Italian", ja: "Japanese", ko: "Korean", zh: "Chinese", hi: "Hindi", ur: "Urdu",
  };
  return map[code] ?? code.toUpperCase();
}

export function countryName(code: string): string {
  const map: Record<string, string> = {
    US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France",
    IT: "Italy", SU: "Soviet Union", CA: "Canada", JP: "Japan", IN: "India", PK: "Pakistan",
  };
  return map[code] ?? code;
}

/* ------------------------- canonical link helpers ------------------------ */
export const titleLink = (t: Pick<Title, "kind" | "slug">) =>
  t.kind === "movie" ? `/movie/${t.slug}` : `/tv/${t.slug}`;

export const episodeLink = (slug: string, season: number, episode: number) =>
  `/tv/${slug}/season-${season}/episode-${episode}`;

export const watchMovieLink = (slug: string, sourceId?: string, t?: number) =>
  `/watch/movie/${slug}${sourceId ? `?src=${encodeURIComponent(sourceId)}` : ""}${t ? `${sourceId ? "&" : "?"}t=${Math.round(t)}` : ""}`;

export const watchEpisodeLink = (slug: string, season: number, episode: number, sourceId?: string, t?: number) =>
  `/watch/tv/${slug}/season-${season}/episode-${episode}${sourceId ? `?src=${encodeURIComponent(sourceId)}` : ""}${t ? `${sourceId ? "&" : "?"}t=${Math.round(t)}` : ""}`;

export function episodeSources(t: Title, season?: number, episode?: number): { ep: Episode | null; sources: StreamingSource[] } {
  if (t.kind !== "tv" || !t.seasons) return { ep: null, sources: [] };
  const s = t.seasons.find(x => x.number === season) ?? t.seasons[0];
  const ep = s?.episodes.find(e => e.number === episode) ?? s?.episodes[0] ?? null;
  return { ep, sources: ep ? playableSources(ep.streamingSources) : [] };
}
