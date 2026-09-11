import type { Title } from "@/lib/types";
import { playableSources, qualityBadge } from "@/lib/format";

/** Slim card payload sent to client components — keeps API responses small. */
export interface TitleCard {
  id: string;
  kind: "movie" | "tv";
  slug: string;
  title: string;
  year: number;
  rating: number;
  popularity: number;
  runtime: number;
  genres: string[];
  languages: string[];
  contentTier: "production" | "demo";
  poster?: string;
  backdrop?: string;
  qualityLabel: "4K" | "HD" | null;
  bestQuality: string;
  hasSources: boolean;
  episodeCount?: number;
  seasonCount?: number;
  flags?: Title["flags"];
  trending: boolean;
}

export function toCard(t: Title): TitleCard {
  const srcs = t.kind === "movie"
    ? playableSources(t.streamingSources)
    : (t.seasons ?? []).flatMap(s => s.episodes.flatMap(e => playableSources(e.streamingSources)));
  const badge = qualityBadge(t.kind === "movie" ? t.streamingSources : (t.seasons?.[0]?.episodes?.[0]?.streamingSources ?? []));
  return {
    id: t.id,
    kind: t.kind,
    slug: t.slug,
    title: t.title,
    year: t.year,
    rating: t.rating,
    popularity: t.popularity,
    runtime: t.runtime,
    genres: t.genres,
    languages: t.languages,
    contentTier: t.contentTier,
    poster: t.poster,
    backdrop: t.backdrop,
    qualityLabel: badge.label,
    bestQuality: badge.best,
    hasSources: srcs.length > 0,
    episodeCount: t.seasons ? t.seasons.reduce((a, s) => a + s.episodes.length, 0) : undefined,
    seasonCount: t.seasons?.length,
    flags: t.flags,
    trending: t.trending,
  };
}
