"use client";

import { useState } from "react";
import Link from "next/link";
import type { Title } from "@/lib/types";
import { episodeLink, hasPlayableSources } from "@/lib/format";
import WatchlistButton from "@/components/ui/WatchlistButton";
import TrailerModal from "@/components/home/TrailerModal";
import ShareButton from "./ShareButton";
import { IconInfo, IconPlay } from "@/components/icons";

export default function DetailActions({
  title,
  resumeHref,
  resumeLabel,
}: {
  title: Title;
  resumeHref?: string | null;
  resumeLabel?: string;
}) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const playable = title.kind === "movie"
    ? hasPlayableSources(title.streamingSources)
    : (title.seasons ?? []).some(s => s.episodes.some(e => hasPlayableSources(e.streamingSources)));

  const watchHref = resumeHref
    ?? (title.kind === "movie" ? `/watch/movie/${title.slug}` : episodeLink(title.slug, 1, 1));

  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      {playable ? (
        <Link href={watchHref} className="btn-primary btn-lg min-w-[9.5rem] gap-2.5">
          <IconPlay size={17} />
          {resumeHref ? (resumeLabel ?? "Resume") : "Watch Now"}
        </Link>
      ) : (
        <span
          className="btn btn-lg min-w-[9.5rem] cursor-not-allowed border border-white/10 bg-white/[0.04] text-mist-500"
          title="No authorized streaming source is configured for this title."
        >
          <IconInfo size={16} /> Streaming unavailable
        </span>
      )}

      {title.trailer && playable && (
        <button type="button" onClick={() => setTrailerOpen(true)} className="btn-ghost btn-lg">
          <IconPlay size={15} /> Trailer
        </button>
      )}

      <WatchlistButton titleId={title.id} variant="ghost" className="btn-lg" />
      <ShareButton />

      {trailerOpen && <TrailerModal title={title} onClose={() => setTrailerOpen(false)} />}
    </div>
  );
}
