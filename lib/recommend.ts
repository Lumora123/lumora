import "server-only";
import { db, ensureUserData } from "@/lib/db";
import type { ProgressEntry, Title } from "@/lib/types";
import { playableSources } from "@/lib/format";

/**
 * Metadata-based recommendation engine (v1).
 *
 * Scoring = genre overlap + creator/cast overlap + era proximity + quality and
 * popularity priors. The interface is deliberately tiny (profile in, ranked
 * list out) so a collaborative/embeddings engine can replace the scorer later
 * without touching UI code.
 */

interface Profile {
  genreWeights: Record<string, number>;
  people: Set<string>;
  eras: number[];
  tiers: Set<string>;
  exclude: Set<string>;
}

function emptyProfile(): Profile {
  return { genreWeights: {}, people: new Set(), eras: [], tiers: new Set(), exclude: new Set() };
}

function addTitle(p: Profile, t: Title, weight = 1) {
  for (const g of t.genres) p.genreWeights[g] = (p.genreWeights[g] ?? 0) + weight;
  if (t.director) t.director.split(",").forEach(d => p.people.add(d.trim().toLowerCase()));
  t.creators?.forEach(c => p.people.add(c.toLowerCase()));
  t.cast.slice(0, 4).forEach(c => p.people.add(c.name.toLowerCase()));
  p.eras.push(t.year);
  p.tiers.add(t.contentTier);
  p.exclude.add(t.id);
}

function score(p: Profile, t: Title): number {
  let s = 0;
  for (const g of t.genres) s += (p.genreWeights[g] ?? 0) * 3.2;
  const people = new Set([
    ...(t.director ? t.director.split(",").map(d => d.trim().toLowerCase()) : []),
    ...(t.creators ?? []).map(c => c.toLowerCase()),
    ...t.cast.slice(0, 4).map(c => c.name.toLowerCase()),
  ]);
  for (const person of people) if (p.people.has(person)) s += 5;
  if (p.eras.length) {
    const avgEra = p.eras.reduce((a, b) => a + b, 0) / p.eras.length;
    const gap = Math.abs(t.year - avgEra);
    if (gap <= 8) s += 2.5;
    else if (gap <= 20) s += 1.2;
  }
  if (p.tiers.has(t.contentTier)) s += 0.8;
  s += t.rating * 0.35 + t.popularity * 0.02;
  if (playableSources(t.kind === "movie" ? t.streamingSources : t.seasons?.[0]?.episodes?.[0]?.streamingSources ?? []).length === 0 && t.kind === "movie") s -= 6;
  return s;
}

function rank(p: Profile, pool: Title[], n: number): Title[] {
  return pool
    .filter(t => !p.exclude.has(t.id))
    .map(t => ({ t, s: score(p, t) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map(x => x.t);
}

export function moreLikeThis(t: Title, n = 12): Title[] {
  const p = emptyProfile();
  addTitle(p, t, 1.6);
  return rank(p, db().titles, n);
}

export function recommendedForYou(userId: string | null, n = 16): Title[] {
  const all = db().titles;
  if (!userId) {
    // cold start: curated blend of trending + top rated + demo showcases
    const p = emptyProfile();
    for (const t of all.filter(x => x.featured)) addTitle(p, t, 0.6);
    const recs = rank(p, all, Math.ceil(n / 2));
    const rest = all
      .filter(t => !recs.includes(t))
      .sort((a, b) => b.rating * 10 + b.popularity - (a.rating * 10 + a.popularity))
      .slice(0, n - recs.length);
    return [...recs, ...rest].slice(0, n);
  }
  const ud = ensureUserData(userId);
  const p = emptyProfile();
  for (const key of Object.keys(ud.progress)) {
    const entry = ud.progress[key];
    const t = all.find(x => x.id === entry.titleId);
    if (t) addTitle(p, t, 1.2);
  }
  for (const h of ud.history.slice(0, 10)) {
    const t = all.find(x => x.id === h.titleId);
    if (t) addTitle(p, t, 0.8);
  }
  for (const id of ud.watchlist) {
    const t = all.find(x => x.id === id);
    if (t) addTitle(p, t, 1.0);
  }
  const recs = rank(p, all, n);
  if (recs.length < n) {
    const extra = all
      .filter(t => !recs.includes(t))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, n - recs.length);
    recs.push(...extra);
  }
  return recs.slice(0, n);
}

export interface ContinueItem extends ProgressEntry {
  title: Title;
  percent: number;
}

export function continueWatching(userId: string | null): ContinueItem[] {
  if (!userId) return [];
  const ud = ensureUserData(userId);
  const all = db().titles;
  return Object.values(ud.progress)
    .map(entry => {
      const title = all.find(t => t.id === entry.titleId);
      if (!title) return null;
      const percent = entry.duration > 0 ? Math.min(100, Math.round((entry.position / entry.duration) * 100)) : 0;
      return { ...entry, title, percent };
    })
    .filter((x): x is ContinueItem => !!x && x.percent < 96 && x.percent > 0)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function watchHistory(userId: string): { title: Title; at: string }[] {
  const ud = ensureUserData(userId);
  const all = db().titles;
  return ud.history
    .map(h => {
      const title = all.find(t => t.id === h.titleId);
      return title ? { title, at: h.at } : null;
    })
    .filter((x): x is { title: Title; at: string } => !!x);
}
