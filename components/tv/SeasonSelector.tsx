"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cx, formatClock } from "@/lib/format";
import { useStore } from "@/lib/store";
import ArtImage from "@/components/art/ArtImage";
import { IconCheck, IconPlay, IconX } from "@/components/icons";

export interface EpisodeMeta {
  number: number;
  title: string;
  synopsis: string;
  runtime: number;
  hasSources: boolean;
  stillSeed: string;
}
export interface SeasonMeta {
  number: number;
  year?: number;
  episodes: EpisodeMeta[];
}

export default function SeasonSelector({
  slug,
  showTitle,
  genres,
  seasons,
}: {
  slug: string;
  showTitle: string;
  genres: string[];
  seasons: SeasonMeta[];
}) {
  const [selected, setSelected] = useState(seasons[0]?.number ?? 1);
  const { ready, progress, removeProgress } = useStore();
  const season = seasons.find(s => s.number === selected) ?? seasons[0];

  // jump to the season containing the furthest-watched episode on load
  useEffect(() => {
    if (!ready) return;
    const withProgress = seasons.find(s =>
      s.episodes.some(e => {
        const p = progress[`tv:${slug}:s${s.number}e${e.number}`];
        return p && p.position / Math.max(1, p.duration) > 0.02 && p.position / Math.max(1, p.duration) < 0.96;
      })
    );
    if (withProgress) setSelected(withProgress.number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!season) return null;

  return (
    <div>
      {/* season tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Seasons">
        {seasons.map(s => (
          <button
            key={s.number}
            type="button"
            role="tab"
            aria-selected={s.number === selected}
            onClick={() => setSelected(s.number)}
            className={cx(
              "rounded-lg border px-4 py-2 text-[13px] font-bold transition-all duration-200",
              s.number === selected
                ? "border-ember-400/60 bg-ember-400/15 text-ember-200 shadow-[0_0_20px_-8px_rgba(245,166,35,0.6)]"
                : "border-white/10 bg-white/[0.03] text-mist-400 hover:border-white/25 hover:text-white"
            )}
          >
            Season {s.number}
          </button>
        ))}
        <span className="ml-auto hidden text-[12.5px] text-mist-500 sm:block">
          {season.episodes.length} episodes
        </span>
      </div>

      {/* episode list */}
      <ol className="space-y-3" aria-label={`Season ${season.number} episodes`}>
        {season.episodes.map(ep => {
          const key = `tv:${slug}:s${season.number}e${ep.number}`;
          const p = ready ? progress[key] : undefined;
          const pct = p ? Math.min(100, (p.position / Math.max(1, p.duration)) * 100) : 0;
          const watchHref = `/watch/tv/${slug}/season-${season.number}/episode-${ep.number}${p && pct > 2 && pct < 96 ? `?t=${Math.floor(p.position)}` : ""}`;
          const detailHref = `/tv/${slug}/season-${season.number}/episode-${ep.number}`;

          return (
            <li key={ep.number} className="group/ep">
              <div className="flex flex-col gap-4 rounded-xl2 border border-white/[0.06] bg-ink-900/50 p-3 transition-colors duration-300 hover:border-white/15 hover:bg-ink-850/70 sm:flex-row sm:p-4">
                {/* still */}
                <Link href={detailHref} className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 sm:w-56 lg:w-64">
                  <ArtImage
                    seed={ep.stillSeed}
                    alt={`${showTitle} — ${ep.title} still`}
                    title={ep.title}
                    genres={genres}
                    variant="still"
                    bare
                    sizes="(max-width: 640px) 100vw, 256px"
                    className="h-full w-full transition-transform duration-700 ease-cinema group-hover/ep:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-ink-950/40 opacity-0 transition-opacity duration-300 group-hover/ep:opacity-100 [@media(hover:none)]:opacity-100">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-mist-50/95 text-ink-950 shadow-lift">
                      <IconPlay size={16} className="ml-0.5" />
                    </span>
                  </span>
                  <span className="absolute left-2 top-2 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[10px] font-bold text-mist-100 backdrop-blur">
                    E{ep.number}
                  </span>
                  {pct > 0 && (
                    <span className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-white/25">
                      <span className="block h-full rounded-full bg-ember-400" style={{ width: `${pct}%` }} />
                    </span>
                  )}
                </Link>

                {/* meta */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-[15px] font-bold text-mist-50">
                        <Link href={detailHref} className="transition-colors hover:text-ember-300">
                          <span className="mr-2 font-mono text-[12px] font-bold text-mist-500">{ep.number}.</span>
                          {ep.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-[12px] font-semibold text-mist-500">
                        {formatClock(ep.runtime)}
                        {p && pct > 2 && pct < 96 && (
                          <span className="ml-2 text-ember-300">· {formatClock(Math.max(0, ep.runtime - p.position))} left</span>
                        )}
                        {pct >= 96 && <span className="ml-2 flex items-center gap-1 text-signal">· <IconCheck size={11} /> Watched</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {ep.hasSources ? (
                        <Link href={watchHref} className="btn-ember btn-sm h-9 gap-1.5 px-4">
                          <IconPlay size={12} /> {p && pct > 2 && pct < 96 ? "Resume" : "Watch"}
                        </Link>
                      ) : (
                        <span className="btn btn-sm h-9 cursor-not-allowed border border-white/10 bg-white/[0.04] px-4 text-mist-500">
                          Unavailable
                        </span>
                      )}
                      {p && (
                        <button
                          type="button"
                          onClick={() => removeProgress(key)}
                          aria-label={`Remove progress for ${ep.title}`}
                          className="grid h-9 w-9 place-items-center rounded-lg text-mist-600 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <IconX size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-mist-400">{ep.synopsis}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
