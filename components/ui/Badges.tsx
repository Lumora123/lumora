import { cx, languageLabel } from "@/lib/format";
import { IconStar } from "@/components/icons";

export function RatingBadge({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-bold text-ember-300 backdrop-blur-sm",
        className
      )}
      title={`Community rating ${rating.toFixed(1)} / 10`}
    >
      <IconStar size={11} className="shrink-0" />
      {rating.toFixed(1)}
    </span>
  );
}

export function QualityBadge({ label, className }: { label: "4K" | "HD" | string | null; className?: string }) {
  if (!label || label === "Adaptive") return null;
  return (
    <span
      className={cx(
        "rounded border border-ember-400/60 bg-black/55 px-1 py-px text-[9px] font-extrabold uppercase tracking-widest text-ember-300 backdrop-blur-sm",
        className
      )}
      title={`Best available quality: ${label}`}
    >
      {label}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "rounded border border-signal/50 bg-black/55 px-1.5 py-px text-[9px] font-extrabold uppercase tracking-widest text-signal backdrop-blur-sm",
        className
      )}
      title="Demo content — CC-licensed showcase title, separated from the production catalog"
    >
      Demo
    </span>
  );
}

export function LanguageBadge({ lang, className }: { lang: string; className?: string }) {
  return (
    <span className={cx("rounded bg-black/55 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-mist-300 backdrop-blur-sm", className)}>
      {lang === "en" ? "ENG" : languageLabel(lang).slice(0, 3).toUpperCase()}
    </span>
  );
}

export function MetaDot() {
  return <span className="text-mist-600" aria-hidden="true">•</span>;
}
