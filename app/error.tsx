"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure for diagnostics; no third-party telemetry in this build.
    console.error("Lumora route error:", error);
  }, [error]);

  return (
    <div className="grid min-h-[70svh] place-items-center px-4 py-24 text-center">
      <div className="max-w-md">
        <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.3em] text-ember-400">Playback interrupted</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-wide text-mist-50">
          Something went wrong
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-mist-400">
          An unexpected error broke this page. Your lists and progress are safe — try again, and if it persists,
          let us know from the contact page.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11.5px] text-mist-600">ref: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-ember btn-md">Try again</button>
          <Link href="/" className="btn-ghost btn-md">Go home</Link>
        </div>
      </div>
    </div>
  );
}
