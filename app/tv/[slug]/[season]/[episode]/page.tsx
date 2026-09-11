import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisode } from "@/lib/queries";
import { db } from "@/lib/db";
import { formatClock, genreName, hasPlayableSources } from "@/lib/format";
import ArtImage from "@/components/art/ArtImage";
import ResumeBar from "@/components/details/ResumeBar";
import { PlayabilityPanel } from "@/components/details/PlayabilityPanel";
import WatchlistButton from "@/components/ui/WatchlistButton";
import ShareButton from "@/components/details/ShareButton";
import { IconArrowLeft, IconChevronLeft, IconChevronRight, IconPlay } from "@/components/icons";

export const revalidate = 0;

function parseSegment(value: string, prefix: string): number | null {
  if (!value.startsWith(prefix)) return null;
  const n = Number(value.slice(prefix.length));
  return Number.isFinite(n) && n > 0 ? n : null;
}

interface Props {
  params: { slug: string; season: string; episode: string };
}

export function generateStaticParams() {
  const out: { slug: string; season: string; episode: string }[] = [];
  for (const t of getTitleList()) {
    for (const s of t.seasons ?? []) {
      for (const e of s.episodes) {
        out.push({ slug: t.slug, season: `season-${s.number}`, episode: `episode-${e.number}` });
      }
    }
  }
  return out;
}

function getTitleList() {
  return db().titles.filter(t => t.kind === "tv" && t.seasons?.length);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = parseSegment(params.season, "season-");
  const e = parseSegment(params.episode, "episode-");
  if (!s || !e) return { title: "Episode not found" };
  const found = getEpisode(params.slug, s, e);
  if (!found) return { title: "Episode not found" };
  const { show, episode } = found;
  const title = `${show.title} S${String(s).padStart(2, "0")}E${String(e).padStart(2, "0")} — ${episode.title}`;
  return {
    title,
    description: episode.synopsis,
    alternates: { canonical: `/tv/${show.slug}/season-${s}/episode-${e}` },
    openGraph: {
      type: "video.episode",
      title: `${title} · Lumora`,
      description: episode.synopsis,
      url: `/tv/${show.slug}/season-${s}/episode-${e}`,
      images: [{ url: `/api/og/tv/${show.slug}`, width: 1200, height: 630 }],
    },
  };
}

export default function EpisodePage({ params }: Props) {
  const s = parseSegment(params.season, "season-");
  const e = parseSegment(params.episode, "episode-");
  if (!s || !e) notFound();
  const found = getEpisode(params.slug, s, e);
  if (!found) notFound();
  const { show, episode } = found;

  const season = show.seasons!.find(x => x.number === s)!;
  const idx = season.episodes.findIndex(x => x.number === e);
  const prev = idx > 0 ? season.episodes[idx - 1] : null;
  const next = idx < season.episodes.length - 1 ? season.episodes[idx + 1] : null;
  const stillSeed = `${show.slug}-s${s}e${e}`;
  const playable = hasPlayableSources(episode.streamingSources);
  const watchHref = `/watch/tv/${show.slug}/season-${s}/episode-${e}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: episode.title,
    episodeNumber: episode.number,
    seasonNumber: s,
    description: episode.synopsis,
    partOfTVSeries: { "@type": "TVSeries", name: show.title, url: `/tv/${show.slug}` },
    timeRequired: `PT${Math.round(episode.runtime / 60)}M`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative">
        <div className="absolute inset-0" aria-hidden="true">
          <ArtImage seed={stillSeed} alt="" title={episode.title} genres={show.genres} variant="backdrop" bare priority sizes="100vw" className="h-full w-full" />
          <div className="absolute inset-0 bg-hero-scrim" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/35 to-transparent" />
        </div>

        <div className="shell relative flex min-h-[70svh] flex-col justify-end pb-10 pt-[calc(var(--header-h)+2rem)]">
          <Link href={`/tv/${show.slug}`} className="mb-5 inline-flex w-fit items-center gap-2 text-[13px] font-semibold text-mist-300 transition-colors hover:text-ember-300">
            <IconArrowLeft size={15} /> Back to {show.title}
          </Link>

          <div className="max-w-2xl">
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.25em] text-ember-300">
              Season {s} · Episode {e}
            </p>
            <h1 className="mt-2 font-display text-[clamp(1.9rem,4.6vw,3.2rem)] font-extrabold uppercase leading-[1.02] text-mist-50 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {episode.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] font-semibold text-mist-300">
              <span>{formatClock(episode.runtime)}</span>
              <span className="text-mist-600" aria-hidden="true">•</span>
              <span>{show.genres.slice(0, 2).map(genreName).join(" · ")}</span>
              <span className="text-mist-600" aria-hidden="true">•</span>
              <span className="rounded border border-white/20 px-1.5 py-px text-[11px] font-bold">{show.contentRating}</span>
            </div>
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-mist-300">{episode.synopsis}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {playable ? (
                <Link href={watchHref} className="btn-primary btn-lg gap-2.5">
                  <IconPlay size={16} /> Watch Episode
                </Link>
              ) : (
                <span className="btn btn-lg cursor-not-allowed border border-white/10 bg-white/[0.04] text-mist-500">
                  Streaming unavailable
                </span>
              )}
              <WatchlistButton titleId={show.id} variant="ghost" className="btn-lg" />
              <ShareButton />
            </div>

            <div className="mt-5">
              <ResumeBar progressKey={`tv:${show.slug}:s${s}e${e}`} resumeHref={watchHref} label="Resume episode" />
            </div>
          </div>
        </div>
      </div>

      <div className="shell py-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-8">
            {/* prev / next */}
            <nav className="grid gap-3 sm:grid-cols-2" aria-label="Episode navigation">
              {prev ? (
                <Link href={`/tv/${show.slug}/season-${s}/episode-${prev.number}`} className="group flex items-center gap-3 rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-4 transition-colors hover:border-white/20">
                  <IconChevronLeft size={17} className="text-mist-500 transition-transform group-hover:-translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-widest text-mist-500">Previous</span>
                    <span className="block truncate text-[13.5px] font-bold text-mist-100 group-hover:text-ember-300">E{prev.number} · {prev.title}</span>
                  </span>
                </Link>
              ) : <span />}
              {next && (
                <Link href={`/tv/${show.slug}/season-${s}/episode-${next.number}`} className="group flex items-center justify-end gap-3 rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-4 text-right transition-colors hover:border-white/20 sm:col-start-2">
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-widest text-mist-500">Next</span>
                    <span className="block truncate text-[13.5px] font-bold text-mist-100 group-hover:text-ember-300">E{next.number} · {next.title}</span>
                  </span>
                  <IconChevronRight size={17} className="text-mist-500 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </nav>

            <section aria-label={`All episodes in season ${s}`}>
              <h2 className="section-title mb-4">All Episodes — Season {s}</h2>
              <ol className="divide-y divide-white/[0.06] overflow-hidden rounded-xl2 border border-white/[0.07] bg-ink-900/40">
                {season.episodes.map(ep => {
                  const active = ep.number === e;
                  return (
                    <li key={ep.number}>
                      <Link
                        href={`/tv/${show.slug}/season-${s}/episode-${ep.number}`}
                        className={`flex items-center gap-4 px-4 py-3 transition-colors ${active ? "bg-ember-400/[0.08]" : "hover:bg-white/[0.04]"}`}
                        aria-current={active ? "page" : undefined}
                      >
                        <span className={`w-8 shrink-0 font-mono text-[12px] font-bold ${active ? "text-ember-300" : "text-mist-500"}`}>
                          {String(ep.number).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-[13.5px] font-bold ${active ? "text-ember-200" : "text-mist-100"}`}>{ep.title}</span>
                          <span className="block truncate text-[12px] text-mist-500">{ep.synopsis}</span>
                        </span>
                        <span className="shrink-0 font-mono text-[11.5px] text-mist-500">{formatClock(ep.runtime)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          <aside className="space-y-6">
            <PlayabilityPanel
              sources={episode.streamingSources}
              subtitles={episode.subtitles}
              audioTracks={episode.audioTracks}
              rightsNote={show.rightsNote}
              attribution={episode.streamingSources.find(x => x.attribution)?.attribution}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
