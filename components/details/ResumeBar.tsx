"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { formatClock } from "@/lib/format";
import { IconPlay, IconX } from "@/components/icons";

/** Resume banner shown on detail pages when saved progress exists. */
export default function ResumeBar({
  progressKey,
  resumeHref,
  label,
}: {
  progressKey: string;
  resumeHref: string;
  label: string;
}) {
  const { ready, progress, removeProgress } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const entry = ready ? progress[progressKey] : undefined;

  useEffect(() => { setDismissed(false); }, [progressKey]);

  if (!entry || dismissed) return null;
  const pct = Math.min(100, Math.round((entry.position / Math.max(1, entry.duration)) * 100));
  if (pct >= 96) return null;
  const remaining = Math.max(0, entry.duration - entry.position);

  return (
    <div className="glass flex flex-wrap items-center gap-3 rounded-xl2 p-3.5 sm:p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember-400 text-ink-950">
        <IconPlay size={15} className="ml-0.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-mist-50">
          Continue watching — {pct}% done · {formatClock(remaining)} left
        </p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-ember-400" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href={resumeHref} className="btn-ember btn-sm h-10 px-5">{label}</Link>
        <button
          type="button"
          onClick={() => removeProgress(progressKey)}
          className="btn-quiet btn-sm h-10 px-3 text-mist-500 hover:text-white"
          title="Remove playback progress"
        >
          <IconX size={15} />
          <span className="sr-only">Remove progress</span>
        </button>
      </div>
    </div>
  );
}
