import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrowseView from "@/components/browse/BrowseView";
import { genreBySlug, genres } from "@/lib/genres";
import { genreCounts, listTitles } from "@/lib/queries";

export const revalidate = 0;

export function generateStaticParams() {
  return genres.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const g = genreBySlug.get(params.slug);
  if (!g) return { title: "Genre not found" };
  const count = listTitles({ genres: [g.slug], pageSize: 1 }).total;
  return {
    title: `${g.name} Movies & Shows`,
    description: `Stream ${count} legally available ${g.name.toLowerCase()} titles on Lumora. ${g.description}`,
    alternates: { canonical: `/genre/${g.slug}` },
    openGraph: { title: `${g.name} on Lumora`, description: g.description, url: `/genre/${g.slug}` },
  };
}

export default function GenrePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const g = genreBySlug.get(params.slug);
  if (!g) notFound();
  const counts = genreCounts();
  if (!counts[g.slug]) notFound();

  return (
    <BrowseView
      eyebrow="Genre"
      heading={g.name}
      description={g.description}
      searchParams={searchParams}
      forced={{ genres: [g.slug], hideGenresControl: true }}
    />
  );
}
