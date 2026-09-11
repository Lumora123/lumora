"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import MobileNav from "./MobileNav";
import SearchOverlay from "@/components/search/SearchOverlay";

export default function HeaderShell({ popularSearches }: { popularSearches: string[] }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
      if (e.key === "/" && !searchOpen) {
        const tag = (document.activeElement?.tagName ?? "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ember-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink-950"
      >
        Skip to content
      </a>
      <Header popularSearches={popularSearches} onOpenSearch={openSearch} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} popularSearches={popularSearches} />
      <MobileNav onOpenSearch={openSearch} />
    </>
  );
}
