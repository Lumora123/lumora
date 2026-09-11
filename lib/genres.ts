import type { GenreDef } from "@/lib/types";

/**
 * Genre taxonomy — kept dependency-free so both server queries and client
 * components (art system, badges) can import it without pulling in the seed.
 */
export const genres: GenreDef[] = [
  { slug: "action", name: "Action", description: "Chases, stunts and serial thrills — from locomotive chases to space opera.", hue: 18 },
  { slug: "adventure", name: "Adventure", description: "Journeys to the edge of the map and beyond.", hue: 36 },
  { slug: "animation", name: "Animation", description: "Hand-drawn classics and open movies rendered frame by frame.", hue: 190 },
  { slug: "comedy", name: "Comedy", description: "Screwball, slapstick and deadpan — laughter through the decades.", hue: 46 },
  { slug: "crime", name: "Crime", description: "Capers, corruption and the detectives who work the cases.", hue: 210 },
  { slug: "cult", name: "Cult", description: "The glorious, the bizarre and the so-bad-they're-essential.", hue: 300 },
  { slug: "documentary", name: "Documentary", description: "The films that invented non-fiction cinema.", hue: 168 },
  { slug: "drama", name: "Drama", description: "Character, consequence and the great American screenplay.", hue: 226 },
  { slug: "family", name: "Family", description: "All-ages features and cartoons the whole household can share.", hue: 130 },
  { slug: "fantasy", name: "Fantasy", description: "Vampires, dragons and dream-logic worlds.", hue: 274 },
  { slug: "horror", name: "Horror", description: "From expressionist nightmares to the birth of the modern zombie.", hue: 348 },
  { slug: "musical", name: "Musical", description: "Song-and-dance spectaculars in glorious Technicolor.", hue: 322 },
  { slug: "mystery", name: "Mystery", description: "Whodunits, wrong men and vanishing ladies.", hue: 246 },
  { slug: "romance", name: "Romance", description: "Screwball chemistry and bittersweet serenades.", hue: 336 },
  { slug: "scifi", name: "Sci-Fi", description: "Rocket ships, mad science and worlds of tomorrow.", hue: 200 },
  { slug: "thriller", name: "Thriller", description: "Suspense engineered by the masters of the form.", hue: 258 },
  { slug: "western", name: "Western", description: "Frontier justice, cattle barons and canyon chases.", hue: 28 },
];

export const genreBySlug = new Map(genres.map(g => [g.slug, g]));
