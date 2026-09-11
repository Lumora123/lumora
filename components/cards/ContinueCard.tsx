"use client";

import Link from "next/link";
import type { TitleCard } from "@/lib/card";
import { cx, formatClock } from "@/lib/format";
import ArtImage from "@/components/art/ArtImage";
import { IconPlay, IconX } from "@/components/icons";

export interface ContinueItem {
  key: string;
  card: TitleCard;
  season?: number;
  episode?: number;
  position: number;
  duration: number;
}

export default function ContinueCard({
  item,
  onRemove,
}: {
  item: ContinueItem;
  onRemove: (key: string) => void;
}) {
  const { card, position, duration } = item;
  const pct = Math.min(100, Math.max(0, (position / Math.max(1, duration)) * 100));
  const remaining = Math.max(0, duration - position);
  const href =
    card.kind === "movie"
      ? `/watch/movie/${card.slug}?t=${Math.floor(position)}`
      : `/watch/tv/${card.slug}/season-${item.season ?? 1}/episode-${item.episode ?? 1}?t=${Math.floor(position)}`;

  return (
    <div className="group/cw relative w-[260px] shrink-0 sm:w-[300px] lg:w-[330px]">
      <Link
        href={href}
        className="block overflow-hidden rounded-card ring-1 ring-white/[0.07] transition-all duration-300 ease-cinema group-hover/cw:-translate-y-1 group-hover/cw:shadow-lift group-hover/cw:ring-white/25"
        aria-label={`Resume ${card.title}${item.episode ? ` season ${item.season} episode ${item.episode}` : ""} — ${formatClock(remaining)} left`}
      >
        <div className="relative aspect-video bg-ink-850">
          <ArtImage
            src={card.backdrop}
            alt=""
            seed={card.kind === "tv" && item.episode ? `${card.slug}-s${item.season}e${item.episode}` : card.slug}
            title={card.title}
            genres={card.genres}
            variant="still"
            bare
            sizes="330px"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/25 to-transparent" />
          <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover/cw:opacity-100 [@media(hover:none)]:opacity-100">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-mist-50/95 text-ink-950 shadow-lift backdrop-blur transition-transform duration-200 group-hover/cw:scale-105">
              <IconPlay size={18} className="ml-0.5" />
            </span>
          </div>
          <div className="absolute inset-x-3 bottom-2.5">
            <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-mist-300">
              <span>{pct >= 96 ? "Finishing up" : `${formatClock(remaining)} left`}</span>
              <span className="tabular-nums">{Math.round(pct)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-ember-400 transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-2 flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <Link href={href} className="block truncate text-[13px] font-semibold text-mist-100 hover:text-ember-300">
            {card.title}
          </Link>
          <p className="mt-0.5 truncate text-[11px] text-mist-500">
            {card.kind === "tv" && item.episode ? `S${item.season} · E${item.episode}` : `${card.year}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.key)}
          aria-label={`Remove ${card.title} from Continue Watching`}
          className={cx(
            "grid h-7 w-7 shrink-0 place-items-center rounded-full text-mist-500 transition-colors",
            "hover:bg-white/10 hover:text-white"
          )}
        >
          <IconX size={14} />
        </button>
      </div>
    </div>
  );
}
