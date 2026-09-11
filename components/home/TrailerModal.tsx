"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Title } from "@/lib/types";
import { cx, episodeLink, isSourceLive } from "@/lib/format";
import { IconPause, IconPlay, IconVolume, IconVolumeOff, IconX } from "@/components/icons";

/**
 * Trailer/preview modal. Trailers are either standalone authorized files or a
 * time window ("clip") of an authorized main source — we never embed third
 * party players or unauthorized cuts.
 */
export default function TrailerModal({ title, onClose }: { title: Title | null; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);

  // Resolve the trailer to a concrete URL + optional clip window.
  let url: string | null = null;
  let clipStart = 0;
  let clipEnd: number | null = null;
  if (title?.trailer) {
    if (title.trailer.kind === "file" && title.trailer.url) {
      url = title.trailer.url;
    } else if (title.trailer.kind === "clip" && title.trailer.sourceId) {
      const pool = title.kind === "movie"
        ? title.streamingSources
        : (title.seasons?.[0]?.episodes?.[0]?.streamingSources ?? []);
      const src = pool.find(s => s.id === title.trailer!.sourceId && isSourceLive(s)) ?? pool.find(isSourceLive) ?? null;
      if (src && src.type === "mp4") {
        url = src.url;
        clipStart = title.trailer.start ?? 0;
        clipEnd = clipStart + (title.trailer.duration ?? 30);
      }
    }
  }

  useEffect(() => {
    setPlaying(false);
    setFailed(false);
    setProgress(0);
  }, [title?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && title) {
        e.preventDefault();
        const v = videoRef.current;
        if (v) (v.paused ? v.play() : v.pause());
      }
    };
    if (title) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [title, onClose]);

  useEffect(() => {
    if (title) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [title]);

  useEffect(() => {
    const v = videoRef.current;
    if (!title || !url || !v) return;
    const load = async () => {
      try {
        let autoplay = true;
        try {
          const prefs = JSON.parse(window.localStorage.getItem("lumora.prefs.v1") ?? "{}");
          autoplay = !prefs.reducedTrailers;
        } catch {}
        if (clipStart > 0) {
          v.currentTime = clipStart;
        }
        if (!autoplay) return;
        await v.play();
        setPlaying(true);
      } catch {
        // autoplay blocked — user can press play
        setPlaying(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title?.id, url]);

  if (!title) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`${title.title} trailer`}>
      <div className="absolute inset-0 animate-fade-in bg-ink-950/90 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-4xl animate-scale-in overflow-hidden rounded-xl2 border border-white/10 bg-ink-900 shadow-lift">
        <div className="relative aspect-video bg-black">
          {url ? (
            <video
              ref={videoRef}
              key={url}
              className="h-full w-full"
              playsInline
              muted={muted}
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setFailed(true)}
              onTimeUpdate={e => {
                const v = e.currentTarget;
                if (clipEnd != null && v.currentTime >= clipEnd) {
                  v.pause();
                  v.currentTime = clipStart;
                }
                const total = clipEnd != null ? clipEnd - clipStart : v.duration || 1;
                setProgress(Math.min(1, Math.max(0, (v.currentTime - clipStart) / total)));
              }}
            >
              <source src={url} type="video/mp4" />
            </video>
          ) : (
            <div className="grid h-full place-items-center p-8 text-center">
              <div>
                <p className="font-display text-lg font-bold text-mist-50">Trailer unavailable</p>
                <p className="mt-2 text-sm text-mist-400">
                  No authorized preview asset is configured for this title yet. You can still open the full title page.
                </p>
              </div>
            </div>
          )}

          {failed && (
            <div className="absolute inset-0 grid place-items-center bg-ink-950/85 p-8 text-center">
              <div>
                <p className="font-display text-lg font-bold text-mist-50">Preview failed to load</p>
                <p className="mt-2 text-sm text-mist-400">The remote source may be temporarily unavailable. Try again or watch the full feature.</p>
                <button type="button" className="btn-ghost btn-md mt-5" onClick={() => { setFailed(false); videoRef.current?.load(); }}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* top bar */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/70 to-transparent p-3.5">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-ember-300">Preview</p>
              <p className="mt-0.5 font-display text-base font-bold text-white drop-shadow">{title.title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close trailer"
              className="grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-all hover:scale-105 hover:bg-black/80"
            >
              <IconX size={17} />
            </button>
          </div>

          {/* bottom controls */}
          {url && !failed && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3.5">
              <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-ember-400 transition-[width]" style={{ width: `${progress * 100}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    v.paused ? v.play() : v.pause();
                  }}
                  aria-label={playing ? "Pause preview" : "Play preview"}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink-950 transition-transform hover:scale-105"
                >
                  {playing ? <IconPause size={14} /> : <IconPlay size={14} className="ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setMuted(m => !m)}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/80"
                >
                  {muted ? <IconVolumeOff size={16} /> : <IconVolume size={16} />}
                </button>
                <span className="ml-auto text-[11px] font-semibold text-white/70">
                  {clipEnd != null ? "Clip preview · plays a short window of the authorized feature" : "Official preview asset"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] p-4">
          <p className="text-xs text-mist-500 line-clamp-2">{title.synopsis}</p>
          <div className="flex shrink-0 items-center gap-2">
            <Link href={title.kind === "tv" ? episodeLink(title.slug, 1, 1) : `/watch/movie/${title.slug}`} onClick={onClose} className="btn-ember btn-md">
              <IconPlay size={14} /> Watch Now
            </Link>
            <Link href={title.kind === "movie" ? `/movie/${title.slug}` : `/tv/${title.slug}`} onClick={onClose} className={cx("btn-ghost btn-md")}>
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
