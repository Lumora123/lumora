"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconShare } from "@/components/icons";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
    } catch {
      /* user dismissed — fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Link copied to clipboard" : "Share this title"}
      title={copied ? "Link copied!" : "Share"}
      className="btn-ghost btn-lg gap-2"
    >
      {copied ? <IconCheck size={16} className="text-signal" /> : <IconShare size={16} />}
      <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
    </button>
  );
}
