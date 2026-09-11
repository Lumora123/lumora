"use client";

import Link from "next/link";
import { memo } from "react";
import type { TitleCard } from "@/lib/card";
import { cx, episodeLink, genreName, titleLink } from "@/lib/format";
import ArtImage from "@/components/art/ArtImage";
import { DemoBadge, QualityBadge, RatingBadge } from "@/components/ui/Badges";
import WatchlistButton from "@/components/ui/WatchlistButton";
import { IconInfo, IconPlay } from "@/components/icons";

export interface MovieCardProps {
  card: TitleCard;
  /** 0..1 playback progress — renders a resume bar when set. */
  progress?: number;
  size?: "sm" | "md" | "fluid";
  priority?: boolean;
}

function MovieCardBase({ card, progress, size = "md", priority }: MovieCardProps) {
  const href = titleLink(card);
  const watchHref = card.kind === "movie" ? `/watch/movie/${card.slug}` : episodeLink(card.slug, 1, 1);

  return (
    <div
      className={cx(
        "group/card relative",
        size === "fluid" ? "w-full" : cx("shrink-0",
          size === "md" ? "w-[148px] xs:w-[160px] sm:w-[172px] lg:w-[186px] xl:w-[200px]" : "w-[128px] sm:w-[142px] lg:w-[156px]")
      )}
    >
      <Link href={href} aria-label={`${card.title} (${card.year}) — open details`} className="block">
        <div
          className={cx(
            "relative aspect-[2/3] overflow-hidden rounded-card bg-ink-850 ring-1 ring-white/[0.06]",
            "transition-all duration-300 ease-cinema",
            "group-hover/card:-translate-y-1.5 group-hover/card:scale-[1.035] group-hover/card:shadow-lift group-hover/card:ring-white/20"
          )}
        >
          <ArtImage
            src={card.poster}
            alt={`${card.title} poster`}
            seed={card.slug}
            title={card.title}
            genres={card.genres}
            year={card.year}
            demo={card.contentTier === "demo"}
            sizes="(max-width: 640px) 150px, (max-width: 1280px) 175px, 200px"
            priority={priority}
            className="h-full w-full"
          />

          <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
            {card.contentTier === "demo" && <DemoBadge />}
          </div>
          <div className="pointer-events-none absolute right-2 top-2 flex flex-col items-end gap-1">
            <QualityBadge label={card.qualityLabel} />
          </div>

          {progress != null && progress > 0 && (
            <div className="pointer-events-none absolute inset-x-2 bottom-2 h-[3px] overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-ember-400" style={{ width: `${Math.min(100, progress * 100)}%` }} />
            </div>
          )}
        </div>
      </Link>

      {/* hover action overlay — sibling of the link so no nested anchors */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end rounded-card bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent p-2.5 opacity-0 transition-opacity duration-300 ease-cinema group-hover/card:opacity-100 [@media(hover:none)]:hidden">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-mist-300">
          <RatingBadge rating={card.rating} className="bg-white/10" />
          <span>{card.year}</span>
          {card.genres[0] && <span className="truncate text-mist-400">{genreName(card.genres[0])}</span>}
        </div>
        <div className="pointer-events-auto flex items-center gap-1.5">
          <Link
            href={card.hasSources ? watchHref : href}
            className="grid h-8 w-8 place-items-center rounded-full bg-mist-50 text-ink-950 shadow-lift transition-transform duration-200 hover:scale-110 active:scale-95"
            aria-label={`Watch ${card.title}`}
          >
            <IconPlay size={13} className="ml-px" />
          </Link>
          <WatchlistButton titleId={card.id} className="h-8 w-8" />
          <Link
            href={href}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/50 text-mist-100 backdrop-blur-md transition-colors hover:border-white/60"
            aria-label={`More info about ${card.title}`}
          >
            <IconInfo size={14} />
          </Link>
        </div>
      </div>

      {/* always-visible meta — touch users never depend on hover */}
      <div className="mt-2 px-0.5">
        <Link href={href} className="block truncate text-[12.5px] font-semibold text-mist-100 transition-colors hover:text-ember-300">
          {card.title}
        </Link>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-mist-500">
          <span>{card.year}</span>
          <span aria-hidden="true">•</span>
          <span className="flex items-center gap-0.5 text-ember-400/90">★ {card.rating.toFixed(1)}</span>
          {card.kind === "tv" && card.seasonCount != null && (
            <>
              <span aria-hidden="true">•</span>
              <span>{card.seasonCount} Season{card.seasonCount > 1 ? "s" : ""}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const MovieCard = memo(MovieCardBase);
export default MovieCard;
