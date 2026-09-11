"use client";

/**
 * LUMORA streaming player.
 *
 * Custom controls over a single <video> element. Progressive MP4 sources are
 * played natively; HLS sources go through hls.js (dynamically imported, with
 * Safari's native HLS taking precedence). Quality switching preserves position
 * and play state. No third-party embeds, no DRM circumvention, no unauthorized
 * sources — if nothing playable is configured the host page shows
 * "Streaming unavailable" instead of rendering this player.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AudioTrack, StreamingSource, SubtitleTrack } from "@/lib/types";
import { cx, formatClock } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  IconArrowLeft, IconCaptions, IconAudio, IconCheck, IconChevronRight, IconFullscreen,
  IconFullscreenExit, IconPause, IconPip, IconPlay, IconSettings, IconSkipBack,
  IconSkipForward, IconVolume, IconVolumeOff, IconX,
} from "@/components/icons";

export interface PlayerConfig {
  sources: StreamingSource[];
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
  title: string;
  contextLabel?: string; // e.g. "S1 · E3 — The Human Bomb"
  backHref: string;
  backLabel: string;
  progressKey: string;
  titleId: string;
  kind: "movie" | "tv";
  slug: string;
  season?: number;
  episode?: number;
  startAt?: number;
  attribution?: string;
  rightsNote?: string;
  initialSourceId?: string;
  onNext?: { label: string; href: string } | null;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer(cfg: PlayerConfig) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { saveProgress } = useStore();

  const sources = useMemo(() => cfg.sources, [cfg.sources]);
  const [sourceId, setSourceId] = useState(() => {
    if (cfg.initialSourceId) return cfg.initialSourceId;
    // Data-saver preference: start on the smallest authorized rendition.
    if (typeof window !== "undefined") {
      try {
        const prefs = JSON.parse(window.localStorage.getItem("lumora.prefs.v1") ?? "{}");
        if (prefs.dataSaver && sources.length > 1) {
          const sorted = [...sources].sort((a, b) => (a.height ?? 1e5) - (b.height ?? 1e5));
          if (sorted[0]) return sorted[0].id;
        }
      } catch {}
    }
    return sources[0]?.id;
  });
  const source = sources.find(s => s.id === sourceId) ?? sources[0];

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [menu, setMenu] = useState<null | "main" | "quality" | "speed" | "subs" | "audio">(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [subtitleId, setSubtitleId] = useState<string | null>(cfg.subtitles.find(s => s.default)?.id ?? null);
  const [speed, setSpeed] = useState(1);
  const [hlsLevels, setHlsLevels] = useState<{ index: number; height: number; label: string }[]>([]);
  const [hlsAuto, setHlsAuto] = useState(true);
  const [hlsLevel, setHlsLevel] = useState(-1);
  const [resumeToast, setResumeToast] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);
  const [scrub, setScrub] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<{ x: number; t: number } | null>(null);

  const nextCountdown = useRef<ReturnType<typeof setInterval> | null>(null);
  const [nextIn, setNextIn] = useState<number | null>(null);

  /* ---------------------------- source loading --------------------------- */
  const attachSource = useCallback(async (src: StreamingSource, seekTo?: number) => {
    const video = videoRef.current;
    if (!video) return;
    setFailed(false);
    setLoading(true);
    setHlsLevels([]);

    // teardown previous hls instance
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch {}
      hlsRef.current = null;
    }

    const restoreTime = seekTo ?? video.currentTime ?? 0;
    const wasPlaying = !video.paused;

    if (src.type === "hls") {
      const HlsMod = await import("hls.js").catch(() => null);
      const Hls = HlsMod?.default;
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false, backBufferLength: 90 });
        hlsRef.current = hls;
        hls.loadSource(src.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          const levels = data.levels
            .map((l, i) => ({ index: i, height: l.height ?? 0, label: l.height ? `${l.height}p` : `${Math.round((l.bitrate ?? 0) / 1000)} kbps` }))
            .sort((a, b) => b.height - a.height);
          setHlsLevels(levels);
          if (restoreTime > 1) video.currentTime = restoreTime;
          if (wasPlaying) video.play().catch(() => {});
          setLoading(false);
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setFailed(true);
                setLoading(false);
            }
          }
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
          setHlsLevel(data.level);
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        video.src = src.url;
        video.addEventListener(
          "loadedmetadata",
          () => {
            if (restoreTime > 1) video.currentTime = restoreTime;
            if (wasPlaying) video.play().catch(() => {});
            setLoading(false);
          },
          { once: true }
        );
      } else {
        setFailed(true);
        setLoading(false);
      }
    } else {
      video.src = src.url;
      video.load();
      video.addEventListener(
        "loadedmetadata",
        () => {
          if (restoreTime > 1 && restoreTime < (video.duration || Infinity) - 5) video.currentTime = restoreTime;
          if (wasPlaying) video.play().catch(() => {});
        },
        { once: true }
      );
    }
  }, [hlsAuto]);

  useEffect(() => {
    if (source) attachSource(source, cfg.startAt && source.id === (cfg.initialSourceId ?? sources[0]?.id) ? cfg.startAt : undefined);
    return () => {
      if (hlsRef.current) { try { hlsRef.current.destroy(); } catch {} hlsRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.id]);

  /* ------------------------------ resume UX ------------------------------ */
  useEffect(() => {
    if (cfg.startAt && cfg.startAt > 10) {
      setResumeToast(cfg.startAt);
      const t = setTimeout(() => setResumeToast(null), 7000);
      return () => clearTimeout(t);
    }
  }, [cfg.startAt]);

  /* ------------------------------ core events ---------------------------- */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setTime(v.currentTime);
      if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const onDur = () => { setDuration(v.duration || 0); setLoading(false); };
    const onPlay = () => { setPlaying(true); setEnded(false); };
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => { setLoading(false); setFailed(false); };
    const onError = () => { setFailed(true); setLoading(false); };
    const onEnded = () => { setEnded(true); setPlaying(false); };
    const onVol = () => { setVolume(v.volume); setMuted(v.muted); };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("durationchange", onDur);
    v.addEventListener("loadedmetadata", onDur);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("canplay", onPlaying);
    v.addEventListener("error", onError);
    v.addEventListener("ended", onEnded);
    v.addEventListener("volumechange", onVol);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("durationchange", onDur);
      v.removeEventListener("loadedmetadata", onDur);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("canplay", onPlaying);
      v.removeEventListener("error", onError);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("volumechange", onVol);
    };
  }, []);

  /* --------------------------- progress persistence ---------------------- */
  const persist = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration || v.duration < 10) return;
    saveProgress({
      key: cfg.progressKey,
      titleId: cfg.titleId,
      kind: cfg.kind,
      slug: cfg.slug,
      season: cfg.season,
      episode: cfg.episode,
      position: Math.floor(v.currentTime),
      duration: Math.floor(v.duration),
    });
  }, [cfg.progressKey, cfg.titleId, cfg.kind, cfg.slug, cfg.season, cfg.episode, saveProgress]);

  useEffect(() => {
    saveTimer.current = setInterval(() => {
      const v = videoRef.current;
      if (v && !v.paused) persist();
    }, 5000);
    return () => {
      if (saveTimer.current) clearInterval(saveTimer.current);
      persist();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persist]);

  /* ------------------------------- next up ------------------------------- */
  useEffect(() => {
    if (ended && cfg.onNext) {
      let autoplay = true;
      try {
        const prefs = JSON.parse(window.localStorage.getItem("lumora.prefs.v1") ?? "{}");
        autoplay = prefs.autoplayNext !== false;
      } catch {}
      if (!autoplay) { setNextIn(null); return; }
      setNextIn(10);
      nextCountdown.current = setInterval(() => {
        setNextIn(prev => {
          if (prev == null) return prev;
          if (prev <= 1) {
            if (nextCountdown.current) clearInterval(nextCountdown.current);
            window.location.href = cfg.onNext!.href;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (nextCountdown.current) clearInterval(nextCountdown.current); };
    }
    setNextIn(null);
  }, [ended, cfg.onNext]);

  /* ------------------------------ controls ux ---------------------------- */
  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused && !menu) setControlsVisible(false);
    }, 2800);
  }, [menu]);

  useEffect(() => { bumpControls(); }, [menu, bumpControls]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
    bumpControls();
  }, [bumpControls]);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration - 0.5);
    bumpControls();
  }, [bumpControls]);

  const seekTo = useCallback((t: number) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = Math.min(Math.max(0, t), v.duration - 0.5);
    setTime(v.currentTime);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    bumpControls();
  }, [bumpControls]);

  const changeVolume = useCallback((val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = Math.min(1, Math.max(0, val));
    v.muted = v.volume === 0;
    bumpControls();
  }, [bumpControls]);

  const toggleFullscreen = useCallback(async () => {
    const el = shellRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {}
    bumpControls();
  }, [bumpControls]);

  const switchSource = useCallback((id: string) => {
    const v = videoRef.current;
    const current = v?.currentTime ?? 0;
    setSourceId(id);
    // attachSource keeps position via restoreTime; nudge it explicitly for safety
    requestAnimationFrame(() => {
      if (v && current > 1) v.currentTime = current;
    });
    setMenu(null);
  }, []);

  const switchHlsLevel = useCallback((index: number) => {
    setHlsAuto(index === -1);
    const hls = hlsRef.current as unknown as { levels: unknown[]; currentLevel: number } | null;
    if (hls && "currentLevel" in hls) hls.currentLevel = index;
    setMenu(null);
  }, []);

  /* ------------------------------- subtitles ----------------------------- */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tracks = Array.from(v.textTracks);
    tracks.forEach(tr => {
      const match = cfg.subtitles.find(s => s.id === tr.id);
      tr.mode = match && match.id === subtitleId ? "showing" : "disabled";
    });
  }, [subtitleId, cfg.subtitles, sourceId]);

  const cycleSubtitles = useCallback(() => {
    if (cfg.subtitles.length === 0) return;
    const ids = [null, ...cfg.subtitles.map(s => s.id)];
    const idx = ids.indexOf(subtitleId);
    setSubtitleId(ids[(idx + 1) % ids.length]);
    bumpControls();
  }, [cfg.subtitles, subtitleId, bumpControls]);

  /* -------------------------------- speed -------------------------------- */
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed, sourceId]);

  /* ------------------------------ keyboard ------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      const v = videoRef.current;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "ArrowRight": e.preventDefault(); seekBy(10); break;
        case "ArrowLeft": e.preventDefault(); seekBy(-10); break;
        case "l": seekBy(10); break;
        case "j": seekBy(-10); break;
        case "ArrowUp": e.preventDefault(); changeVolume((v?.volume ?? 0) + 0.1); break;
        case "ArrowDown": e.preventDefault(); changeVolume((v?.volume ?? 0) - 0.1); break;
        case "m": toggleMute(); break;
        case "f": toggleFullscreen(); break;
        case "c": cycleSubtitles(); break;
        case "p": togglePip(); break;
        case "Escape": setMenu(null); break;
        default:
          if (/^[0-9]$/.test(e.key) && v?.duration) {
            seekTo((Number(e.key) / 10) * v.duration);
            bumpControls();
          }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seekBy, changeVolume, toggleMute, toggleFullscreen, cycleSubtitles, togglePip, seekTo, bumpControls]);

  /* -------------------------------- scrub -------------------------------- */
  const barRef = useRef<HTMLDivElement>(null);
  const pctFromEvent = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const onBarPointerDown = (e: React.PointerEvent) => {
    if (!duration) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setScrub(pctFromEvent(e.clientX) * duration);
  };
  const onBarPointerMove = (e: React.PointerEvent) => {
    if (!duration) return;
    const t = pctFromEvent(e.clientX) * duration;
    setHoverTime({ x: pctFromEvent(e.clientX), t });
    if (scrub != null) setScrub(t);
  };
  const onBarPointerUp = () => {
    if (scrub != null) { seekTo(scrub); setScrub(null); bumpControls(); }
  };

  const displayTime = scrub ?? time;
  const pct = duration ? (displayTime / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;

  const qualityLabel = source?.type === "hls"
    ? hlsAuto
      ? "Auto"
      : (hlsLevels.find(l => l.index === hlsLevel)?.label ?? "Auto")
    : source?.quality ?? "—";

  const activeSub = cfg.subtitles.find(s => s.id === subtitleId);
  const pipSupported = typeof document !== "undefined" && document.pictureInPictureEnabled;

  return (
    <div className="relative w-full bg-black">
      {/* top bar (outside fullscreen chrome) */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link href={cfg.backHref} className="btn-quiet btn-sm h-10 gap-2 px-3 text-mist-200">
          <IconArrowLeft size={16} /> <span className="max-w-[40vw] truncate sm:max-w-none">{cfg.backLabel}</span>
        </Link>
        <div className="min-w-0 text-right">
          <p className="truncate font-display text-sm font-bold text-mist-50 sm:text-base">{cfg.title}</p>
          {cfg.contextLabel && <p className="truncate text-[11.5px] font-semibold text-mist-500">{cfg.contextLabel}</p>}
        </div>
      </div>

      <div
        ref={shellRef}
        className={cx(
          "group/player relative aspect-video w-full overflow-hidden rounded-xl2 bg-black ring-1 ring-white/10",
          fullscreen && "rounded-none ring-0"
        )}
        onMouseMove={bumpControls}
        onMouseLeave={() => { if (playing && !menu) setControlsVisible(false); }}
        onTouchStart={bumpControls}
      >
        <video
          ref={videoRef}
          className="h-full w-full"
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
        >
          {cfg.subtitles.map(s => (
            <track key={s.id} id={s.id} src={s.url} kind={s.kind ?? "subtitles"} srcLang={s.lang} label={s.label} default={s.default} />
          ))}
        </video>

        {/* loading / failed / ended overlays */}
        {loading && !failed && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="h-14 w-14 animate-spin-slow rounded-full border-[3px] border-white/15 border-t-ember-400" aria-label="Buffering" role="status" />
          </div>
        )}

        {failed && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-ink-950/92 p-6 text-center" role="alert">
            <div className="max-w-md">
              <p className="font-display text-lg font-bold text-mist-50">Playback problem</p>
              <p className="mt-2 text-sm leading-relaxed text-mist-400">
                This authorized source could not be reached. The provider may be temporarily unavailable, or the source link may have expired.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <button type="button" className="btn-ember btn-md" onClick={() => source && attachSource(source)}>
                  Retry playback
                </button>
                {sources.length > 1 && (
                  <button
                    type="button"
                    className="btn-ghost btn-md"
                    onClick={() => {
                      const idx = sources.findIndex(s => s.id === source?.id);
                      switchSource(sources[(idx + 1) % sources.length].id);
                    }}
                  >
                    Try another quality
                  </button>
                )}
                <Link href={cfg.backHref} className="btn-quiet btn-md">Back to details</Link>
              </div>
            </div>
          </div>
        )}

        {ended && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-ink-950/90 p-6">
            <div className="max-w-sm text-center">
              <p className="font-display text-xl font-bold text-mist-50">{cfg.onNext ? "Episode finished" : "Finished"}</p>
              {cfg.onNext ? (
                <>
                  <p className="mt-2 text-sm text-mist-400">
                    Up next: <span className="font-bold text-mist-100">{cfg.onNext.label}</span>
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                    <Link href={cfg.onNext.href} className="btn-ember btn-md gap-2">
                      <IconPlay size={13} /> Play now{nextIn != null ? ` (${nextIn})` : ""}
                    </Link>
                    <button type="button" className="btn-ghost btn-md" onClick={() => { if (nextCountdown.current) clearInterval(nextCountdown.current); setNextIn(null); setEnded(false); seekTo(0); }}>
                      <IconX size={13} /> Stay here
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-mist-400">Watch it again, or head back for more.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                    <button type="button" className="btn-ember btn-md gap-2" onClick={() => { setEnded(false); seekTo(0); videoRef.current?.play(); }}>
                      <IconPlay size={13} /> Replay
                    </button>
                    <Link href={cfg.backHref} className="btn-ghost btn-md">{cfg.kind === "tv" ? "All episodes" : "Movie details"}</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* resume toast */}
        {resumeToast != null && !ended && !failed && (
          <div className="absolute left-1/2 top-5 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-ink-950/85 py-2 pl-4 pr-2 backdrop-blur-md animate-fade-up">
            <p className="text-[12.5px] font-semibold text-mist-100">Resuming from {formatClock(resumeToast)}</p>
            <button
              type="button"
              onClick={() => { seekTo(0); setResumeToast(null); }}
              className="rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-bold text-mist-200 transition-colors hover:bg-white/20"
            >
              Start over
            </button>
            <button type="button" onClick={() => setResumeToast(null)} aria-label="Dismiss" className="grid h-7 w-7 place-items-center rounded-full text-mist-400 hover:bg-white/10 hover:text-white">
              <IconX size={12} />
            </button>
          </div>
        )}

        {/* big center play (paused, not ended) */}
        {!playing && !ended && !failed && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Play"
            className="absolute inset-0 z-20 grid place-items-center bg-ink-950/25 transition-opacity"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-mist-50/95 text-ink-950 shadow-lift transition-transform duration-300 ease-cinema hover:scale-110">
              <IconPlay size={30} className="ml-1" />
            </span>
          </button>
        )}

        {/* controls */}
        <div
          className={cx(
            "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/92 via-black/55 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 sm:px-4",
            controlsVisible || !playing ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          {/* progress bar */}
          <div
            ref={barRef}
            className="group/bar relative mb-2 cursor-pointer touch-none py-2"
            onPointerDown={onBarPointerDown}
            onPointerMove={onBarPointerMove}
            onPointerUp={onBarPointerUp}
            onPointerLeave={() => { setHoverTime(null); if (scrub != null) onBarPointerUp(); }}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(displayTime)}
            aria-valuetext={`${formatClock(displayTime)} of ${formatClock(duration)}`}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "ArrowRight") { e.preventDefault(); seekBy(5); }
              if (e.key === "ArrowLeft") { e.preventDefault(); seekBy(-5); }
            }}
          >
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20 transition-all duration-200 group-hover/bar:h-2.5">
              <div className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${bufPct}%` }} />
              <div className="absolute inset-y-0 left-0 bg-ember-400" style={{ width: `${pct}%` }} />
            </div>
            <span
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-300 opacity-0 shadow-[0_0_0_4px_rgba(245,166,35,0.25)] transition-opacity group-hover/bar:opacity-100"
              style={{ left: `${pct}%` }}
            />
            {hoverTime && duration > 0 && (
              <span
                className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded-md bg-ink-950/90 px-2 py-1 font-mono text-[11px] font-bold text-mist-100"
                style={{ left: `${hoverTime.x * 100}%` }}
              >
                {formatClock(hoverTime.t)}
              </span>
            )}
          </div>

          {/* buttons row */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <CtrlButton onClick={togglePlay} label={playing ? "Pause (k)" : "Play (k)"}>
              {playing ? <IconPause size={18} /> : <IconPlay size={18} className="ml-0.5" />}
            </CtrlButton>
            <CtrlButton onClick={() => seekBy(-10)} label="Back 10 seconds (j)" className="hidden sm:grid">
              <IconSkipBack size={19} />
            </CtrlButton>
            <CtrlButton onClick={() => seekBy(10)} label="Forward 10 seconds (l)" className="hidden sm:grid">
              <IconSkipForward size={19} />
            </CtrlButton>

            {/* volume */}
            <div className="group/vol flex items-center">
              <CtrlButton onClick={toggleMute} label={muted || volume === 0 ? "Unmute (m)" : "Mute (m)"}>
                {muted || volume === 0 ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
              </CtrlButton>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={e => changeVolume(Number(e.target.value))}
                aria-label="Volume"
                className="range-plain w-0 opacity-0 transition-all duration-300 group-hover/vol:w-20 group-hover/vol:opacity-100 group-focus-within/vol:w-20 group-focus-within/vol:opacity-100 sm:group-hover/vol:w-24"
              />
            </div>

            <span className="ml-1.5 hidden font-mono text-[12px] font-semibold tabular-nums text-mist-200 sm:block">
              {formatClock(displayTime)} <span className="text-mist-600">/ {formatClock(duration)}</span>
            </span>

            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
              {cfg.subtitles.length > 0 && (
                <CtrlButton onClick={cycleSubtitles} label="Cycle subtitles (c)" active={!!activeSub}>
                  <IconCaptions size={19} />
                </CtrlButton>
              )}
              <CtrlButton onClick={togglePip} label="Picture in picture (p)" className={pipSupported ? "hidden sm:grid" : "hidden"}>
                <IconPip size={18} />
              </CtrlButton>

              {/* settings */}
              <div className="relative">
                <CtrlButton onClick={() => setMenu(m => (m ? null : "main"))} label="Playback settings" active={!!menu}>
                  <IconSettings size={19} />
                </CtrlButton>

                {menu && (
                  <div className="glass absolute bottom-[calc(100%+10px)] right-0 w-64 animate-scale-in overflow-hidden rounded-xl p-1.5 shadow-lift">
                    {menu === "main" && (
                      <>
                        <MenuRow icon={<IconSettings size={15} />} label="Quality" value={qualityLabel} onClick={() => setMenu("quality")} />
                        <MenuRow icon={<IconPlay size={13} />} label="Playback speed" value={`${speed}×`} onClick={() => setMenu("speed")} />
                        <MenuRow icon={<IconCaptions size={15} />} label="Subtitles" value={activeSub ? activeSub.label : "Off"} onClick={() => setMenu("subs")} disabled={cfg.subtitles.length === 0} />
                        <MenuRow icon={<IconAudio size={15} />} label="Audio" value={cfg.audioTracks[0]?.label ?? "Original"} onClick={() => setMenu("audio")} />
                        {(cfg.attribution || cfg.rightsNote) && (
                          <p className="mt-1 border-t border-white/[0.07] px-3 pb-1.5 pt-2.5 text-[10.5px] leading-relaxed text-mist-500">
                            {cfg.attribution ?? ""}{cfg.attribution && cfg.rightsNote ? " — " : ""}{cfg.rightsNote ?? ""}
                          </p>
                        )}
                      </>
                    )}

                    {menu === "quality" && (
                      <>
                        <MenuHeader label="Quality" onBack={() => setMenu("main")} />
                        {source?.type === "hls" && hlsLevels.length > 0 && (
                          <>
                            <MenuOption active={hlsAuto} onClick={() => switchHlsLevel(-1)} label="Auto (adaptive HLS)" />
                            {hlsLevels.map(l => (
                              <MenuOption key={l.index} active={!hlsAuto} onClick={() => switchHlsLevel(l.index)} label={l.label} note="HLS level" />
                            ))}
                            <div className="my-1 border-t border-white/[0.07]" />
                          </>
                        )}
                        {sources.map(s => (
                          <MenuOption
                            key={s.id}
                            active={s.id === source?.id}
                            onClick={() => switchSource(s.id)}
                            label={s.quality}
                            note={s.type === "hls" ? "adaptive" : s.rights}
                          />
                        ))}
                      </>
                    )}

                    {menu === "speed" && (
                      <>
                        <MenuHeader label="Playback speed" onBack={() => setMenu("main")} />
                        {SPEEDS.map(sp => (
                          <MenuOption key={sp} active={sp === speed} onClick={() => { setSpeed(sp); setMenu(null); }} label={sp === 1 ? "Normal (1×)" : `${sp}×`} />
                        ))}
                      </>
                    )}

                    {menu === "subs" && (
                      <>
                        <MenuHeader label="Subtitles" onBack={() => setMenu("main")} />
                        <MenuOption active={subtitleId == null} onClick={() => { setSubtitleId(null); setMenu(null); }} label="Off" />
                        {cfg.subtitles.map(s => (
                          <MenuOption key={s.id} active={subtitleId === s.id} onClick={() => { setSubtitleId(s.id); setMenu(null); }} label={s.label} note={s.kind === "captions" ? "CC" : undefined} />
                        ))}
                      </>
                    )}

                    {menu === "audio" && (
                      <>
                        <MenuHeader label="Audio" onBack={() => setMenu("main")} />
                        {cfg.audioTracks.map(a => (
                          <MenuOption key={a.id} active={!!a.default} onClick={() => setMenu(null)} label={a.label} note={a.default ? "default" : undefined} />
                        ))}
                        <p className="px-3 pb-2 pt-1 text-[10.5px] leading-relaxed text-mist-500">
                          Additional dubs become selectable here when an authorized multi-audio source is configured.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <CtrlButton onClick={toggleFullscreen} label={fullscreen ? "Exit fullscreen (f)" : "Fullscreen (f)"}>
                {fullscreen ? <IconFullscreenExit size={18} /> : <IconFullscreen size={18} />}
              </CtrlButton>
            </div>
          </div>
        </div>

        {/* keyboard hint (desktop idle) */}
        <div className="pointer-events-none absolute right-3 top-3 z-20 hidden rounded-lg bg-black/45 px-2.5 py-1.5 text-[10.5px] font-semibold text-mist-300 backdrop-blur-sm transition-opacity duration-500 lg:block"
          style={{ opacity: controlsVisible && !playing ? 0.9 : 0 }}>
          Space play · ←→ ±10s · F fullscreen · C subs · M mute
        </div>
      </div>
    </div>
  );
}

function CtrlButton({
  onClick, label, children, className, active,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cx(
        "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-mist-100 transition-all duration-150 hover:bg-white/15 hover:text-white active:scale-90 sm:h-10 sm:w-10",
        active && "text-ember-300",
        className
      )}
    >
      {children}
    </button>
  );
}

function MenuRow({ icon, label, value, onClick, disabled }: { icon: React.ReactNode; label: string; value: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-white/[0.08]"
      )}
    >
      <span className="text-mist-400">{icon}</span>
      <span className="flex-1 text-[13px] font-semibold text-mist-100">{label}</span>
      <span className="max-w-24 truncate text-[11.5px] font-semibold text-mist-400">{value}</span>
      <IconChevronRight size={13} className="text-mist-600" />
    </button>
  );
}

function MenuHeader({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="mb-1 flex items-center gap-2 border-b border-white/[0.07] px-2 pb-2">
      <button type="button" onClick={onBack} aria-label="Back to settings" className="grid h-7 w-7 place-items-center rounded-md text-mist-300 hover:bg-white/10 hover:text-white">
        <IconArrowLeft size={14} />
      </button>
      <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-mist-300">{label}</span>
    </div>
  );
}

function MenuOption({ active, onClick, label, note }: { active: boolean; onClick: () => void; label: string; note?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.08]"
    >
      <span className={cx("grid h-4 w-4 place-items-center", active ? "text-ember-300" : "text-transparent")}>
        <IconCheck size={13} />
      </span>
      <span className={cx("flex-1 text-[13px] font-semibold", active ? "text-mist-50" : "text-mist-300")}>{label}</span>
      {note && <span className="text-[10.5px] font-semibold uppercase tracking-wide text-mist-600">{note}</span>}
    </button>
  );
}
