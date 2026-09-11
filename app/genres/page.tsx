import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/browse/BrowseView";
import TitleArt from "@/components/art/TitleArt";
import { genres } from "@/lib/genres";
import { genreCounts } from "@/lib/queries";
import { IconChevronRight } from "@/components/icons";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Genres",
  description: "Explore the Lumora catalog by genre — horror, comedy, sci-fi, noir, documentary, animation and more.",
  alternates: { canonical: "/genres" },
};

export default function GenresPage() {
  const counts = genreCounts();
  const used = genres.filter(g => counts[g.slug] > 0);

  return (
    <>
      <PageHeader
        eyebrow="Discover"
        title="Genres"
        description="Sixteen curated lanes through the catalog — from expressionist horror to open-movie animation."
      />
      <div className="shell py-8 lg:py-10">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {used.map(g => (
            <li key={g.slug}>
              <Link
                href={`/genre/${g.slug}`}
                className="group relative block aspect-[16/10] overflow-hidden rounded-xl2 ring-1 ring-white/[0.07] transition-all duration-300 ease-cinema hover:-translate-y-1 hover:shadow-lift hover:ring-ember-400/40"
              >
                <TitleArt seed={`genre-${g.slug}`} title={g.name} genres={[g.slug]} variant="still" bare className="h-full w-full transition-transform duration-700 ease-cinema group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink-950/92 via-ink-950/30 to-transparent" aria-hidden="true" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                  <span>
                    <span className="block font-display text-lg font-bold text-mist-50">{g.name}</span>
                    <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wider text-mist-400">
                      {counts[g.slug]} title{counts[g.slug] === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-mist-200 transition-all duration-300 group-hover:border-ember-400/60 group-hover:bg-ember-400/15 group-hover:text-ember-300">
                    <IconChevronRight size={15} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
