"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/format";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

/**
 * Horizontal content rail with desktop arrow paging, edge fades, momentum
 * touch scrolling and snap points.
 */
export default function Row({
  title,
  href,
  hrefLabel,
  children,
  className,
  id,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const scroller = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateEdges]);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.86, behavior: "smooth" });
  };

  return (
    <section className={cx("relative", className)} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="shell mb-2.5 flex items-end justify-between gap-4">
        <h2 id={id ? `${id}-title` : undefined} className="section-title">
          {href ? (
            <Link href={href} className="group inline-flex items-center gap-2 transition-colors hover:text-ember-300">
              {title}
              <span className="translate-x-0 text-ember-400 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true">
                <IconChevronRight size={16} />
              </span>
              <span className="sr-only">{hrefLabel ?? "See all"}</span>
            </Link>
          ) : (
            title
          )}
        </h2>
        <div className="hidden items-center gap-1.5 md:flex">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label={`Scroll ${title} left`}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-ink-850/80 text-mist-200 transition-all hover:border-white/30 hover:text-white disabled:opacity-25"
          >
            <IconChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label={`Scroll ${title} right`}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-ink-850/80 text-mist-200 transition-all hover:border-white/30 hover:text-white disabled:opacity-25"
          >
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* edge fades (desktop) */}
        <div className={cx("pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-rail-fade-l transition-opacity duration-300 lg:block hidden", atStart && "opacity-0")} aria-hidden="true" />
        <div className={cx("pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-rail-fade-r transition-opacity duration-300 lg:block hidden", atEnd && "opacity-0")} aria-hidden="true" />

        <ul ref={scroller} onScroll={updateEdges} className="rail-scroll shell pt-1">
          {children}
        </ul>
      </div>
    </section>
  );
}

export function RowItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={cx("list-none", className)}>{children}</li>;
}
