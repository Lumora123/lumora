import { genreBySlug } from "@/lib/genres";
import { cx } from "@/lib/format";

/**
 * LUMORA procedural artwork slot.
 *
 * The abstract art layer is a deterministically generated SVG served from
 * /api/art (immutable, CDN-cacheable, never broken, zero copyright risk).
 * Typography is real HTML text on top, so brand fonts always render.
 */

export type ArtVariant = "poster" | "backdrop" | "still" | "hero";

export interface TitleArtProps {
  seed: string;
  title: string;
  genres: string[];
  year?: number;
  variant?: ArtVariant;
  className?: string;
  /** Hide the typographic layer (used when the page overlays its own text). */
  bare?: boolean;
  demo?: boolean;
  priority?: boolean;
}

export function artUrl(seed: string, genres: string[], variant: ArtVariant): string {
  return `/api/art/${variant}/${encodeURIComponent(seed)}?g=${genres.map(encodeURIComponent).join(",")}`;
}

const RATIOS: Record<ArtVariant, { w: number; h: number }> = {
  poster: { w: 600, h: 900 },
  backdrop: { w: 1600, h: 900 },
  still: { w: 640, h: 360 },
  hero: { w: 1920, h: 1080 },
};

export default function TitleArt({ seed, title, genres, year, variant = "poster", className, bare, demo, priority }: TitleArtProps) {
  const showType = !bare && variant === "poster";
  const len = title.length;
  const titleSize = len > 26 ? "clamp(0.9rem, 6.2cqw, 1.5rem)" : len > 18 ? "clamp(1rem, 7.2cqw, 1.8rem)" : len > 12 ? "clamp(1.05rem, 8.4cqw, 2.1rem)" : "clamp(1.1rem, 9.8cqw, 2.4rem)";
  const ratio = RATIOS[variant];

  return (
    <div
      className={cx("relative overflow-hidden bg-ink-900 [container-type:inline-size]", className)}
      role="img"
      aria-label={`${title}${year ? ` (${year})` : ""} artwork`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={artUrl(seed, genres, variant)}
        alt=""
        width={ratio.w}
        height={ratio.h}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />
      {showType && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-[0.6cqw] p-[6%]">
            <div className="flex items-center gap-2">
              <span className="h-px w-[8%] min-w-4 bg-ember-400/80" />
              <span className="text-[0.55rem] font-bold uppercase tracking-[0.28em] text-ember-300/90">
                {demo ? "Demo" : "Lumora"}
              </span>
            </div>
            <h3
              className="font-display font-extrabold uppercase leading-[0.95] text-mist-50"
              style={{ fontSize: titleSize, letterSpacing: "-0.015em", textShadow: "0 2px 22px rgba(0,0,0,0.65)" }}
            >
              {title}
            </h3>
            <div className="flex items-center gap-2 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-mist-300/85">
              {year && <span>{year}</span>}
              {year && genres[0] && <span className="text-mist-500">•</span>}
              {genres[0] && <span>{genreBySlug.get(genres[0])?.name ?? genres[0]}</span>}
            </div>
          </div>
        </>
      )}
      {!bare && variant !== "poster" && (
        <span className="absolute right-3 top-3 font-display text-[0.55rem] font-bold uppercase tracking-[0.34em] text-white/25">
          Lumora
        </span>
      )}
    </div>
  );
}
