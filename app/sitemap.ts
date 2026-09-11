import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { genres } from "@/lib/genres";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const d = db();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/movies`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/tv`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/browse`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/trending`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/new`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/genres`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/search`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/copyright`, changeFrequency: "yearly", priority: 0.2 },
    ...genres.map(g => ({
      url: `${SITE}/genre/${g.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  const titleRoutes: MetadataRoute.Sitemap = [];
  for (const t of d.titles) {
    const updated = new Date(t.updatedAt ?? t.createdAt ?? now);
    if (t.kind === "movie") {
      titleRoutes.push({ url: `${SITE}/movie/${t.slug}`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 });
    } else {
      titleRoutes.push({ url: `${SITE}/tv/${t.slug}`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 });
      for (const s of t.seasons ?? []) {
        for (const ep of s.episodes) {
          titleRoutes.push({
            url: `${SITE}/tv/${t.slug}/season-${s.number}/episode-${ep.number}`,
            lastModified: updated,
            changeFrequency: "monthly",
            priority: 0.5,
          });
        }
      }
    }
  }

  return [...staticRoutes, ...titleRoutes];
}
