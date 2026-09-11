"use client";

import { useEffect, useState } from "react";
import type { TitleCard } from "@/lib/card";
import { useStore } from "@/lib/store";
import Row, { RowItem } from "@/components/cards/Row";
import MovieCard from "@/components/cards/MovieCard";
import ContinueCard, { type ContinueItem } from "@/components/cards/ContinueCard";

/** Continue Watching rail — composed client-side from saved playback progress. */
export function ContinueWatchingRail({ allCards }: { allCards: TitleCard[] }) {
  const { ready, progress, removeProgress } = useStore();
  const [items, setItems] = useState<ContinueItem[]>([]);

  useEffect(() => {
    if (!ready) return;
    const byId = new Map(allCards.map(c => [c.id, c]));
    const list: ContinueItem[] = Object.values(progress)
      .map((p): (ContinueItem & { updatedAt: string }) | null => {
        const card = byId.get(p.titleId);
        if (!card || p.duration <= 0) return null;
        const pct = p.position / p.duration;
        if (pct >= 0.96 || pct <= 0.005) return null;
        return { key: p.key, card, season: p.season, episode: p.episode, position: p.position, duration: p.duration, updatedAt: p.updatedAt };
      })
      .filter((x): x is ContinueItem & { updatedAt: string } => !!x)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .slice(0, 12);
    setItems(list);
  }, [ready, progress, allCards]);

  if (items.length === 0) return null;

  return (
    <Row title="Continue Watching" id="continue-watching">
      {items.map(item => (
        <RowItem key={item.key}>
          <ContinueCard item={item} onRemove={key => removeProgress(key)} />
        </RowItem>
      ))}
    </Row>
  );
}

/** Recommended For You — personalized for signed-in users, curated cold-start otherwise. */
export function RecommendedRail({ fallback }: { fallback: TitleCard[] }) {
  const { ready, user, watchlist, progress } = useStore();
  const [items, setItems] = useState<TitleCard[]>(fallback);
  const [personalized, setPersonalized] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setItems(fallback);
      setPersonalized(false);
      return;
    }
    let cancelled = false;
    fetch("/api/recommended")
      .then(r => r.json())
      .then(d => {
        if (!cancelled && Array.isArray(d.items)) {
          setItems(d.items);
          setPersonalized(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // watchlist/progress changes re-personalize the rail
  }, [ready, user, fallback, watchlist, progress]);

  if (items.length === 0) return null;

  return (
    <Row
      title={personalized ? "Recommended For You" : "Because You're Exploring"}
      href={personalized ? undefined : "/trending"}
      id="recommended"
    >
      {items.map(card => (
        <RowItem key={card.id}>
          <MovieCard card={card} />
        </RowItem>
      ))}
    </Row>
  );
}
