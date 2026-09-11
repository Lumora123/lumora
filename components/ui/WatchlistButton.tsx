"use client";

import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import { IconCheck, IconPlus } from "@/components/icons";

export default function WatchlistButton({
  titleId,
  variant = "icon",
  className,
  label = true,
}: {
  titleId: string;
  variant?: "icon" | "solid" | "ghost";
  className?: string;
  label?: boolean;
}) {
  const { ready, inWatchlist, toggleWatchlist } = useStore();
  const added = ready && inWatchlist(titleId);

  const base =
    variant === "icon"
      ? "grid h-9 w-9 place-items-center rounded-full border bg-black/50 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
      : variant === "solid"
        ? "btn-ember h-11 px-5"
        : "btn-ghost h-11 px-5";

  return (
    <button
      type="button"
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        toggleWatchlist(titleId);
      }}
      aria-pressed={added}
      aria-label={added ? "Remove from My List" : "Add to My List"}
      title={added ? "Remove from My List" : "Add to My List"}
      className={cx(
        base,
        variant === "icon" && (added ? "border-ember-400/70 text-ember-300" : "border-white/25 text-mist-100 hover:border-white/60"),
        className
      )}
    >
      {added ? <IconCheck size={variant === "icon" ? 16 : 18} /> : <IconPlus size={variant === "icon" ? 16 : 18} />}
      {label && variant !== "icon" && <span>{added ? "In My List" : "My List"}</span>}
    </button>
  );
}
