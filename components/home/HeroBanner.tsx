"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Title } from "@/lib/types";
import { cx, episodeLink, formatRuntime, genreName, languageLabel, qualityBadge, titleLink } from "@/lib/format";
import ArtImage from "@/components/art/ArtImage";
import WatchlistButton from "@/components/ui/WatchlistButton";
import { DemoBadge, QualityBadge } from "@/components/ui/Badges";
import { IconInfo, IconPlay, IconSpark } from "@/components/icons";

export interface HeroSlide {
  title: Title;
}

/**
 * Cinematic rotating hero. Crossfading backdrops with a slow Ken Burns drift,
 * auto-advance (paused on hover / hidden tab / reduced motion) and full
 * metadata + CTAs for the featured title.
 */
export default function HeroBanner({ titles, onPlayTrailer }: { titles: Title[]; onPlayTrailer: (t: Title) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = titles.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIndex(i => (i + 1) % count), 9000);
    return () => clearInterval(t);
  }, [paused, count]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  if (count === 0) return null;

  return (
    <section
      aria-label="Featured titles"
      aria-roledescription="carousel"
      className="relative h-[88svh] min-h-[560px] w-full overflow-hidden lg:h-[92svh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {titles.map((t, i) => {
        const active = i === index;
        const badge = qualityBadge(t.kind === "movie" ? t.streamingSources : t.seasons?.[0]?.episodes?.[0]?.streamingSources ?? []);
        return (
          <div
            key={t.id}
            className={cx(
              "absolute inset-0 transition-opacity duration-[1100ms] ease-cinema",
              active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${t.title}`}
            aria-hidden={!active}
          >
            {/* backdrop */}
            <div className="absolute inset-0">
              <ArtImage
                src={t.backdrop}
                alt=""
                seed={t.slug}
                title={t.title}
                genres={t.genres}
                variant="hero"
                bare
                priority={i === 0}
                sizes="100vw"
                className={cx("h-full w-full", active && "animate-ken-burns")}
              />
            </div>
            <div className="absolute inset-0 bg-hero-scrim" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/25 to-transparent" aria-hidden="true" />

            {/* content */}
            <div className="shell absolute inset-x-0 bottom-0 z-20 pb-24 lg:pb-28">
              <div className={cx("max-w-2xl", active ? "animate-fade-up" : "opacity-0")} style={{ animationDelay: "120ms" }}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-400/15 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-ember-300 ring-1 ring-ember-400/30">
                    <IconSpark size={12} /> {t.kind === "tv" ? "Featured Series" : "Featured Film"}
                  </span>
                  {t.contentTier === "demo" && <DemoBadge className="px-2 py-0.5 text-[10px]" />}
                  {badge.label && <QualityBadge label={badge.label} className="px-1.5 py-0.5 text-[10px]" />}
                </div>

                <h1 className="font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.02em] text-mist-50 drop-shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
                  {t.title}
                </h1>

                {t.tagline && (
                  <p className="mt-2.5 hidden text-[15px] italic text-mist-300 sm:block">“{t.tagline}”</p>
                )}

                <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] font-semibold text-mist-300">
                  <span className="flex items-center gap-1 text-ember-300">
                    <IconSpark size={13} /> {t.rating.toFixed(1)}
                  </span>
                  <span>{t.year}</span>
                  <span className="text-mist-600" aria-hidden="true">•</span>
                  <span>{formatRuntime(t.runtime)}{t.kind === "tv" ? " / ep" : ""}</span>
                  <span className="text-mist-600" aria-hidden="true">•</span>
                  <span>{t.genres.slice(0, 3).map(genreName).join(" · ")}</span>
                  <span className="text-mist-600" aria-hidden="true">•</span>
                  <span>{t.languages.map(languageLabel).join(", ")}</span>
                  <span className="rounded border border-white/20 px-1.5 py-px text-[10px] font-bold text-mist-400">{t.contentRating}</span>
                </div>

                <p className="mt-4 hidden max-w-xl text-[14px] leading-relaxed text-mist-300/95 line-clamp-3 md:block">
                  {t.synopsis}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <Link
                    href={t.kind === "movie" ? `/watch/movie/${t.slug}` : episodeLink(t.slug, 1, 1)}
                    className="btn-primary btn-lg gap-2.5"
                  >
                    <IconPlay size={17} /> Watch Now
                  </Link>
                  {t.trailer && (
                    <button type="button" onClick={() => onPlayTrailer(t)} className="btn-ghost btn-lg">
                      <IconInfo size={16} /> Trailer
                    </button>
                  )}
                  <WatchlistButton titleId={t.id} variant="ghost" className="btn-lg" />
                  <Link
                    href={titleLink(t)}
                    aria-label={`More details about ${t.title}`}
                    className="btn-quiet btn-lg hidden px-3 sm:inline-flex"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* slide controls */}
      <div className="absolute bottom-24 right-4 z-30 flex items-center gap-3 sm:right-8 lg:bottom-28 lg:right-10">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Featured slides">
          {titles.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${t.title}`}
              onClick={() => go(i)}
              className={cx(
                "h-1.5 rounded-full transition-all duration-500 ease-cinema",
                i === index ? "w-8 bg-ember-400" : "w-3 bg-white/30 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
