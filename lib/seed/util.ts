import type { AudioTrack, StreamingSource, SubtitleTrack, Title, TrailerSpec } from "@/lib/types";

/** Canonical Internet Archive download URL with per-segment encoding. */
export const IA = (itemId: string, file: string) =>
  `https://archive.org/download/${itemId}/${file.split("/").map(encodeURIComponent).join("/")}`;

/** Honest quality label derived from the actual encoded height. */
export const qualityFor = (h?: number) => (h ? `${h}p` : "Auto");

const RIGHTS_PD = "public-domain" as const;
const RIGHTS_CC = "cc-licensed" as const;

export const PD_NOTE =
  "This film is in the public domain in the United States. The presentation copy is streamed from the Internet Archive's public-domain feature film collection.";
export const CC_NOTE =
  "An open movie by the Blender Foundation, licensed under Creative Commons Attribution 3.0. Streamed from the Internet Archive.";

export function iaSources(
  itemId: string,
  files: [file: string, height: number][],
  rights: typeof RIGHTS_PD | typeof RIGHTS_CC = RIGHTS_PD,
  attribution?: string
): StreamingSource[] {
  return files.map(([file, height], i) => ({
    id: `${itemId}-${i}`,
    quality: qualityFor(height),
    height,
    type: "mp4" as const,
    url: IA(itemId, file),
    rights,
    attribution,
  }));
}

export const englishAudio = (label = "English (Original)"): AudioTrack[] => [
  { id: "aud-en", lang: "en", label, default: true },
];

export function clipTrailer(sourceId: string, start: number, duration = 30): TrailerSpec {
  return { kind: "clip", sourceId, start, duration };
}

export interface MovieSeed {
  slug: string;
  title: string;
  tagline?: string;
  year: number;
  runtime: number; // seconds
  genres: string[];
  languages?: string[];
  countries?: string[];
  rating: number;
  popularity: number;
  contentRating?: string;
  director?: string;
  cast?: { name: string; role?: string }[];
  synopsis: string;
  releaseDate?: string;
  archiveId?: string;
  sources?: StreamingSource[];
  subtitles?: SubtitleTrack[];
  audioTracks?: AudioTrack[];
  trailer?: TrailerSpec;
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
  topRated?: boolean;
  lumoraPick?: boolean;
  rightsNote?: string;
  contentTier?: "production" | "demo";
  silent?: boolean;
  daysAgo?: number; // catalog-add recency for "Recently Added"
}

let seq = 0;
export function movie(s: MovieSeed): Title {
  const id = `mov-${s.slug}`;
  const created = new Date(Date.now() - (s.daysAgo ?? (seq++ % 30) * 2) * 86400000).toISOString();
  const sources = s.sources ?? (s.archiveId ? [] : []);
  return {
    id,
    kind: "movie",
    title: s.title,
    slug: s.slug,
    tagline: s.tagline,
    synopsis: s.synopsis,
    trailer: s.trailer ?? (sources[0] ? clipTrailer(sources[0].id, 90, 30) : undefined),
    releaseDate: s.releaseDate ?? `${s.year}-01-01`,
    year: s.year,
    runtime: s.runtime,
    genres: s.genres,
    languages: s.languages ?? ["en"],
    countries: s.countries ?? ["US"],
    rating: s.rating,
    popularity: s.popularity,
    cast: s.cast ?? [],
    director: s.director,
    contentRating: s.contentRating ?? "NR",
    streamingSources: sources,
    subtitles: s.subtitles ?? [],
    audioTracks: s.audioTracks ?? englishAudio(s.silent ? "Silent · musical score with intertitles" : undefined),
    featured: !!s.featured,
    trending: !!s.trending,
    flags: {
      newRelease: s.newRelease,
      topRated: s.topRated ?? s.rating >= 7.7,
      lumoraPick: s.lumoraPick,
    },
    rightsNote: s.rightsNote ?? PD_NOTE,
    contentTier: s.contentTier ?? "production",
    createdAt: created,
    updatedAt: created,
  };
}
