import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisode, getTitleBySlug } from "@/lib/queries";
import { moreLikeThis } from "@/lib/recommend";
import { toCard } from "@/lib/card";
import { episodeLink, formatRuntime, playableSources } from "@/lib/format";
import VideoPlayer, { type PlayerConfig } from "@/components/player/VideoPlayer";
import Row, { RowItem } from "@/components/cards/Row";
import MovieCard from "@/components/cards/MovieCard";
import { EmptyState } from "@/components/ui/States";
import { IconAlert } from "@/components/icons";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Watch",
  robots: { index: false, follow: false },
};

interface WatchParams {
  params: { path: string[] };
  searchParams: { src?: string; t?: string };
}

function Unavailable({ title, backHref, backLabel }: { title: string; backHref: string; backLabel: string }) {
  return (
    <div className="shell py-16">
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<IconAlert size={22} />}
          title="Streaming unavailable"
          body={`“${title}” does not currently have a legally authorized playback source configured on Lumora. We never substitute unauthorized streams — when rights are secured, playback will appear here automatically.`}
          action={<Link href={backHref} className="btn-ghost btn-md">{backLabel}</Link>}
        />
      </div>
    </div>
  );
}

export default function WatchPage({ params, searchParams }: WatchParams) {
  const path = params.path ?? [];
  const startAt = Math.max(0, Number(searchParams.t) || 0);
  const initialSourceId = searchParams.src || undefined;

  /* ------------------------------- movies ------------------------------- */
  if (path[0] === "movie" && path[1]) {
    const t = getTitleBySlug(path[1], "movie");
    if (!t) notFound();
    const sources = playableSources(t.streamingSources);
    const backHref = `/movie/${t.slug}`;

    if (sources.length === 0) {
      return <Unavailable title={t.title} backHref={backHref} backLabel="Back to movie details" />;
    }

    const cfg: PlayerConfig = {
      sources,
      subtitles: t.subtitles,
      audioTracks: t.audioTracks,
      title: t.title,
      contextLabel: `${t.year} · ${formatRuntime(t.runtime)} · ${t.contentRating}`,
      backHref,
      backLabel: "Back to details",
      progressKey: `movie:${t.slug}`,
      titleId: t.id,
      kind: "movie",
      slug: t.slug,
      startAt: startAt || undefined,
      attribution: sources.find(s => s.attribution)?.attribution,
      rightsNote: t.contentTier === "demo" ? t.rightsNote : undefined,
      initialSourceId: sources.some(s => s.id === initialSourceId) ? initialSourceId : undefined,
      onNext: null,
    };

    const related = moreLikeThis(t, 12).map(toCard);
    return (
      <WatchShell>
        <div className="shell">
          <VideoPlayer {...cfg} />
        </div>
        <div className="shell mt-10 space-y-10 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-bold text-mist-50">{t.title}</h1>
              <p className="mt-1 text-[13px] text-mist-400">
                {t.year} · {formatRuntime(t.runtime)} · <Link href={backHref} className="font-semibold text-ember-300 hover:underline">Movie details</Link>
              </p>
            </div>
          </div>
          <Row title="More Like This" id="watch-related">
            {related.map(card => (
              <RowItem key={card.id}><MovieCard card={card} /></RowItem>
            ))}
          </Row>
        </div>
      </WatchShell>
    );
  }

  /* ------------------------------ tv episodes ---------------------------- */
  if (path[0] === "tv" && path[1]) {
    const season = Number(String(path[2] ?? "").replace("season-", ""));
    const epNum = Number(String(path[3] ?? "").replace("episode-", ""));
    if (!Number.isFinite(season) || !Number.isFinite(epNum)) notFound();
    const found = getEpisode(path[1], season, epNum);
    if (!found) notFound();
    const { show, episode } = found;

    const seasonObj = show.seasons!.find(s => s.number === season)!;
    const idx = seasonObj.episodes.findIndex(e => e.number === epNum);
    let nextEp = idx < seasonObj.episodes.length - 1 ? seasonObj.episodes[idx + 1] : null;
    let nextSeason = season;
    if (!nextEp) {
      const ns = show.seasons!.find(s => s.number === season + 1);
      if (ns?.episodes.length) { nextEp = ns.episodes[0]; nextSeason = ns.number; }
    }

    const sources = playableSources(episode.streamingSources);
    const epBackHref = episodeLink(show.slug, season, epNum);

    if (sources.length === 0) {
      return <Unavailable title={`${show.title} — S${season}E${epNum} ${episode.title}`} backHref={epBackHref} backLabel="Back to episode" />;
    }

    const cfg: PlayerConfig = {
      sources,
      subtitles: episode.subtitles.length ? episode.subtitles : show.subtitles,
      audioTracks: episode.audioTracks.length ? episode.audioTracks : show.audioTracks,
      title: show.title,
      contextLabel: `S${season} · E${epNum} — ${episode.title}`,
      backHref: `/tv/${show.slug}`,
      backLabel: show.title,
      progressKey: `tv:${show.slug}:s${season}e${epNum}`,
      titleId: show.id,
      kind: "tv",
      slug: show.slug,
      season,
      episode: epNum,
      startAt: startAt || undefined,
      attribution: sources.find(s => s.attribution)?.attribution,
      initialSourceId: sources.some(s => s.id === initialSourceId) ? initialSourceId : undefined,
      onNext: nextEp
        ? { label: `E${nextEp.number} — ${nextEp.title}`, href: episodeLink(show.slug, nextSeason, nextEp.number).replace("/tv/", "/watch/tv/") }
        : null,
    };

    const restOfSeason = seasonObj.episodes.filter(e => e.number !== epNum).slice(0, 14);
    const related = moreLikeThis(show, 12).map(toCard);

    return (
      <WatchShell>
        <div className="shell">
          <VideoPlayer {...cfg} />
        </div>
        <div className="shell mt-10 space-y-10 pb-4">
          <div>
            <h1 className="font-display text-xl font-bold text-mist-50">
              <Link href={`/tv/${show.slug}`} className="hover:text-ember-300">{show.title}</Link>
              <span className="text-mist-500"> — </span>
              S{season} · E{epNum} “{episode.title}”
            </h1>
            <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-mist-400">{episode.synopsis}</p>
            <p className="mt-2 text-[13px] text-mist-500">
              {formatRuntime(episode.runtime)} ·{" "}
              <Link href={epBackHref} className="font-semibold text-ember-300 hover:underline">Episode details</Link>
            </p>
          </div>

          {restOfSeason.length > 0 && (
            <section aria-label={`More from season ${season}`}>
              <h2 className="section-title mb-4">More from Season {season}</h2>
              <ol className="grid gap-2 sm:grid-cols-2">
                {restOfSeason.map(ep => (
                  <li key={ep.number}>
                    <Link
                      href={`/watch/tv/${show.slug}/season-${season}/episode-${ep.number}`}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-900/50 p-3 transition-colors hover:border-ember-400/30 hover:bg-ink-850"
                    >
                      <span className="w-7 shrink-0 text-center font-mono text-[12px] font-bold text-mist-500">{ep.number}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-mist-100">{ep.title}</span>
                        <span className="block truncate text-[11.5px] text-mist-500">{formatRuntime(ep.runtime)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <Row title="More Like This" id="watch-related-tv">
            {related.map(card => (
              <RowItem key={card.id}><MovieCard card={card} /></RowItem>
            ))}
          </Row>
        </div>
      </WatchShell>
    );
  }

  notFound();
}

function WatchShell({ children }: { children: React.ReactNode }) {
  return <div className="pt-[calc(var(--header-h)+1rem)] lg:pt-[calc(var(--header-h)+1.5rem)]">
    {children}
  </div>;
}
