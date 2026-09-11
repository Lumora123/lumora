import type { HomeSectionConfig, Title } from "@/lib/types";
export { genres, genreBySlug } from "@/lib/genres";
import { genres } from "@/lib/genres";
import { pdMoviesPartA } from "./movies-a";
import { pdMoviesPartB, demoMovies } from "./movies-b";
import { tvShows } from "./tv";

export const allTitles: Title[] = [...pdMoviesPartA, ...pdMoviesPartB, ...demoMovies, ...tvShows];




export const homeSections: HomeSectionConfig[] = [
  { id: "continue", label: "Continue Watching", type: "continue-watching", enabled: true, order: 0 },
  { id: "trending", label: "Trending Now", type: "trending", enabled: true, order: 1 },
  { id: "recommended", label: "Recommended For You", type: "recommended", enabled: true, order: 2 },
  { id: "new", label: "New Releases", type: "new-releases", enabled: true, order: 3 },
  { id: "popular-movies", label: "Popular Movies", type: "popular-movies", enabled: true, order: 4 },
  { id: "popular-tv", label: "Popular TV Shows", type: "popular-tv", enabled: true, order: 5 },
  { id: "top-rated", label: "Top Rated", type: "top-rated", enabled: true, order: 6 },
  { id: "recently-added", label: "Recently Added", type: "recently-added", enabled: true, order: 7 },
  { id: "g-horror", label: "Horror", type: "genre", genre: "horror", enabled: true, order: 8 },
  { id: "g-comedy", label: "Comedy", type: "genre", genre: "comedy", enabled: true, order: 9 },
  { id: "g-scifi", label: "Sci-Fi", type: "genre", genre: "scifi", enabled: true, order: 10 },
  { id: "g-drama", label: "Drama", type: "genre", genre: "drama", enabled: true, order: 11 },
  { id: "g-thriller", label: "Thriller", type: "genre", genre: "thriller", enabled: true, order: 12 },
  { id: "g-action", label: "Action & Adventure", type: "genre", genre: "action", enabled: true, order: 13 },
  { id: "g-romance", label: "Romance", type: "genre", genre: "romance", enabled: true, order: 14 },
  { id: "g-animation", label: "Animation & Family", type: "genre", genre: "animation", enabled: true, order: 15 },
  { id: "g-mystery", label: "Mystery & Crime", type: "genre", genre: "mystery", enabled: true, order: 16 },
  { id: "g-documentary", label: "Documentary", type: "genre", genre: "documentary", enabled: true, order: 17 },
];

/**
 * Demo accounts seeded for evaluation. In production these would not exist;
 * auth would use a managed provider and admins would be provisioned via ops.
 */
export const seedUsers = [
  { email: "admin@lumora.tv", name: "Ada Kestrel", password: "LumoraAdmin!2026", role: "admin" as const, avatarSeed: "ada" },
  { email: "demo@lumora.tv", name: "Demo Viewer", password: "LumoraDemo!2026", role: "user" as const, avatarSeed: "demo" },
];

/** Pre-baked activity for the demo account so personalization rails are alive on first login. */
export const demoUserState = {
  watchlist: ["mov-charade", "tv-dragnet", "mov-night-of-the-living-dead", "mov-sintel"],
  progress: [
    {
      key: "movie:charade",
      titleId: "mov-charade",
      kind: "movie" as const,
      slug: "charade",
      position: 1265,
      duration: 6785,
    },
    {
      key: "tv:dragnet:s1e1",
      titleId: "tv-dragnet",
      kind: "tv" as const,
      slug: "dragnet",
      season: 1,
      episode: 1,
      position: 610,
      duration: 1559,
    },
    {
      key: "movie:the-39-steps",
      titleId: "mov-the-39-steps",
      kind: "movie" as const,
      slug: "the-39-steps",
      position: 4810,
      duration: 5180,
    },
  ],
  history: ["mov-the-39-steps", "movie:charade", "tv:dragnet:s1e1"],
};
