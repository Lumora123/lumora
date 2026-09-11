import type { TitleCard } from "@/lib/card";
import MovieCard from "./MovieCard";

export default function MovieGrid({ cards, progressByKey }: { cards: TitleCard[]; progressByKey?: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {cards.map((c, i) => (
        <MovieCard
          key={c.id}
          card={c}
          size="fluid"
          priority={i < 7}
          progress={progressByKey?.[c.kind === "movie" ? `movie:${c.slug}` : `tv:${c.slug}:s1e1`]}
        />
      ))}
    </div>
  );
}
