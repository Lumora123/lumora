"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TitleCard } from "@/lib/card";
import { useStore } from "@/lib/store";
import { formatClock, timeAgo, titleLink } from "@/lib/format";
import PageHeader from "@/components/browse/PageHeader";
import ArtImage from "@/components/art/ArtImage";
import ContinueCard, { type ContinueItem } from "@/components/cards/ContinueCard";
import Row, { RowItem } from "@/components/cards/Row";
import { EmptyState } from "@/components/ui/States";
import { IconClock, IconPlay } from "@/components/icons";

export default function HistoryPage() {
  const { ready, history, progress, removeProgress } = useStore();
  const [cards, setCards] = useState<TitleCard[] | null>(null);

  useEffect(() => {
    fetch("/api/titles")
      .then(r => r.json())
      .then(d => setCards(d.items ?? []))
      .catch(() => setCards([]));
  }, []);

  const byId = useMemo(() => new Map((cards ?? []).map(c => [c.id, c])), [cards]);

  const continueItems = useMemo(() => {
    if (!ready) return [];
    return Object.values(progress)
      .map((p): (ContinueItem & { card: TitleCard }) | null => {
        const card = byId.get(p.titleId);
        if (!card || p.duration <= 0) return null;
        const pct = p.position / p.duration;
        if (pct >= 0.96 || pct <= 0.005) return null;
        return { key: p.key, card, season: p.season, episode: p.episode, position: p.position, duration: p.duration };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [ready, progress, byId]);

  const rows = useMemo(() => {
    if (!ready) return [];
    return history
      .map(h => ({ ...h, card: byId.get(h.titleId) }))
      .filter(x => !!x.card)
      .slice(0, 60);
  }, [ready, history, byId]);

  if (!ready || !cards) {
    return (
      <>
        <PageHeader eyebrow="Your activity" title="Watch History" />
        <div className="shell py-10">
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl2" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Your activity"
        title="Watch History"
        description="Titles you've started or finished on Lumora, newest first."
      />
      <div className="shell py-8 lg:py-10">
        {continueItems.length > 0 && (
          <div className="mb-12">
            <Row title="Continue watching" id="history-continue">
              {continueItems.map(item => (
                <RowItem key={item.key}>
                  <ContinueCard item={item} onRemove={removeProgress} />
                </RowItem>
              ))}
            </Row>
          </div>
        )}

        {rows.length === 0 ? (
          <EmptyState
            icon={<IconClock size={22} />}
            title="No history yet"
            body="Press play on anything in the catalog and it will show up here — with your exact position saved for resuming."
            action={<Link href="/" className="btn-ghost btn-md">Start exploring</Link>}
          />
        ) : (
          <ol className="divide-y divide-white/[0.06] overflow-hidden rounded-xl2 border border-white/[0.07] bg-ink-900/40">
            {rows.map((h, i) => {
              const card = h.card!;
              const p = h.kind === "tv" ? undefined : progress[`movie:${card.slug}`];
              return (
                <li key={`${h.titleId}-${i}`}>
                  <Link href={titleLink(card)} className="group flex items-center gap-4 p-3 transition-colors hover:bg-white/[0.04] sm:p-4">
                    <span className="relative hidden h-16 w-11 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10 sm:block">
                      <ArtImage src={card.poster} alt="" seed={card.slug} title={card.title} genres={card.genres} sizes="44px" className="h-full w-full" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-mist-50 group-hover:text-ember-300">{card.title}</span>
                      <span className="mt-0.5 block text-[12px] text-mist-500">
                        {card.kind === "movie" ? "Movie" : "Series"} · {card.year} · watched {timeAgo(h.at)}
                        {p && p.duration > 0 && ` · ${formatClock(p.position)} / ${formatClock(p.duration)}`}
                      </span>
                    </span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-mist-300 transition-colors group-hover:border-ember-400/60 group-hover:text-ember-300">
                      <IconPlay size={13} className="ml-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </>
  );
}
