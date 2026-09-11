/**
 * LUMORA core data model.
 *
 * Streaming rights/source information is deliberately kept separate from
 * metadata: `streamingSources` is the ONLY place a playback URL may live, and
 * every source must carry a `rights` declaration describing why we are allowed
 * to serve it. A title with no authorized source renders "Streaming
 * unavailable" — we never fall back to an unauthorized source.
 */

export type TitleKind = "movie" | "tv";

/** Provenance of a playback source. Anything not in this list must not ship. */
export type RightsKind =
  | "public-domain"      // work is in the public domain (pre-1930 / unrenewed US films etc.)
  | "cc-licensed"        // Creative Commons licensed by the rights holder
  | "original"           // produced/owned by Lumora
  | "authorized-partner" // explicit written streaming authorization from rights holder
  | "demo";              // placeholder demo asset owned by us (never real copyrighted media)

export interface StreamingSource {
  id: string;
  /** Human-facing quality label, e.g. "1080p", "720p", "SD". */
  quality: string;
  /** Vertical resolution in px when known (used for honest quality labels). */
  height?: number;
  type: "mp4" | "hls" | "dash";
  url: string;
  /** Approximate bitrate in kbps when known. */
  bitrate?: number;
  rights: RightsKind;
  /** Optional attribution line shown in the player (required by CC licenses). */
  attribution?: string;
  /** Optional expiry — expired sources are hidden and the player shows the unavailable state. */
  expiresAt?: string;
}

export interface SubtitleTrack {
  id: string;
  lang: string; // BCP-47
  label: string;
  url: string; // WebVTT served from our own origin (CORS-safe)
  kind?: "subtitles" | "captions";
  default?: boolean;
}

export interface AudioTrack {
  id: string;
  lang: string;
  label: string;
  default?: boolean;
}

export interface CastMember {
  name: string;
  role?: string;
}

export interface TrailerSpec {
  /** "clip" = a time-window of an authorized main source; "file" = standalone asset. */
  kind: "clip" | "file";
  url?: string; // for kind === "file"
  sourceId?: string; // for kind === "clip"
  start?: number; // seconds
  duration?: number; // seconds
}

export interface Episode {
  id: string;
  season: number;
  number: number;
  title: string;
  synopsis: string;
  runtime: number; // seconds
  stillSeed?: string; // seed for procedural still art
  streamingSources: StreamingSource[];
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
  trailer?: TrailerSpec;
  releaseDate?: string;
}

export interface Season {
  number: number;
  title?: string;
  year?: number;
  synopsis?: string;
  episodes: Episode[];
}

export interface Title {
  id: string;
  kind: TitleKind;
  title: string;
  slug: string;
  tagline?: string;
  synopsis: string;
  /** Optional remote artwork (authorized CDN). When absent, procedural brand art is rendered. */
  poster?: string;
  backdrop?: string;
  trailer?: TrailerSpec;
  releaseDate?: string; // original premiere
  year: number;
  runtime: number; // seconds; for TV = average episode runtime
  genres: string[]; // genre slugs
  languages: string[];
  countries: string[];
  rating: number; // 0..10 community score (demo dataset)
  popularity: number; // 0..100 internal trending score
  cast: CastMember[];
  director?: string;
  creators?: string[];
  contentRating: string; // e.g. "NR", "PG", "TV-PG"
  streamingSources: StreamingSource[];
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
  featured: boolean;
  trending: boolean;
  /** Editorial flags controlling home rails. */
  flags?: { newRelease?: boolean; topRated?: boolean; lumoraPick?: boolean };
  seasons?: Season[]; // TV only
  rightsNote: string; // human-readable provenance shown on detail pages
  contentTier: "production" | "demo"; // demo content is visibly separated
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // scrypt
  salt: string;
  role: "user" | "admin";
  avatarSeed?: string;
  createdAt: string;
  resetToken?: string | null;
  resetExpires?: string | null;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatarSeed?: string;
  createdAt: string;
}

export interface ProgressEntry {
  /** Stable key: movie:<slug> or tv:<slug>:s<season>e<episode> */
  key: string;
  titleId: string;
  kind: TitleKind;
  slug: string;
  season?: number;
  episode?: number;
  position: number; // seconds
  duration: number; // seconds
  updatedAt: string;
}

export interface UserData {
  userId: string;
  watchlist: string[]; // title ids
  progress: Record<string, ProgressEntry>;
  history: { titleId: string; kind: TitleKind; slug: string; at: string }[];
}

export interface HomeSectionConfig {
  id: string;
  label: string;
  type:
    | "trending"
    | "popular-movies"
    | "popular-tv"
    | "new-releases"
    | "recently-added"
    | "top-rated"
    | "genre"
    | "continue-watching"
    | "recommended";
  genre?: string;
  enabled: boolean;
  order: number;
}

export interface DBShape {
  titles: Title[];
  users: User[];
  sessions: Record<string, { userId: string; createdAt: string; expiresAt: string }>;
  userData: Record<string, UserData>;
  sections: HomeSectionConfig[];
  meta: { seededAt: string; version: number };
}

export interface GenreDef {
  slug: string;
  name: string;
  description: string;
  /** palette index for procedural art */
  hue: number;
}
