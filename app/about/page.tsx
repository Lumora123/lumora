import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/browse/BrowseView";
import { IconCheck, IconFilm, IconPlay, IconShield, IconSpark, IconTv } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Lumora",
  description:
    "Lumora is a streaming catalog built entirely on legally authorized content — public-domain classics, Creative Commons works and clearly-labeled demos.",
};

export const dynamic = "force-dynamic";

const PRINCIPLES = [
  {
    icon: IconShield,
    title: "Every stream has a rights basis",
    body: "Each playable source carries a machine-readable rights declaration — public domain, Creative Commons, original, authorized partner, or clearly-marked demo. The player shows attribution where licenses require it. No source, no stream.",
  },
  {
    icon: IconFilm,
    title: "The golden age, preserved",
    body: "Much of our feature catalog is the public-domain canon: Nosferatu, The Cabinet of Dr. Caligari, Buster Keaton's The General, His Girl Friday, Charade, Night of the Living Dead — films that belong to everyone, streamed from public archives.",
  },
  {
    icon: IconTv,
    title: "Serials and classic TV",
    body: "Dragnet (1951), the Flash Gordon serial, The Phantom Creeps and golden-age cartoons — episode pages, seasons and resume points work exactly like a modern streaming service.",
  },
  {
    icon: IconSpark,
    title: "Open-license showcases",
    body: "Big Buck Bunny, Sintel, Tears of Steel and Elephants Dream — the Blender Foundation's open movies, CC-licensed, power our demo tier with multi-bitrate HLS, subtitles and speed controls.",
  },
];

export default function AboutPage() {
  const d = db();
  const movies = d.titles.filter(t => t.kind === "movie").length;
  const shows = d.titles.filter(t => t.kind === "tv");
  const episodes = shows.reduce((a, t) => a + (t.seasons?.reduce((b, s) => b + s.episodes.length, 0) ?? 0), 0);
  const playable = d.titles.filter(t =>
    t.kind === "movie"
      ? t.streamingSources.some(s => s.url)
      : (t.seasons ?? []).some(s => s.episodes.some(ep => ep.streamingSources.some(src => src.url)))
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="About Lumora"
        description="A premium streaming experience built entirely on content we're actually allowed to stream."
      />
      <div className="shell py-10 lg:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-[16px] leading-[1.8] text-mist-300">
            Lumora began with a simple frustration: the internet's greatest freely-licensed films are scattered across
            archives, hard to browse and painful to watch. We built the service those films deserve — rich
            discovery, honest metadata, a real player with quality switching, subtitles, speeds and resume — pointed
            entirely at <strong className="text-mist-100">public-domain classics, Creative Commons works and
            authorized partners</strong>.
          </p>
          <p className="mt-5 text-[16px] leading-[1.8] text-mist-300">
            When we can't establish a rights basis for a work, we say so. Those titles stay in the catalog with their
            history intact but show <em className="font-semibold not-italic text-mist-100">Streaming unavailable</em> —
            because the honest answer is better than an infringing one.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={movies} label="Feature films" />
          <Stat value={shows.length} label="Series & serials" />
          <Stat value={episodes} label="Episodes" />
          <Stat value={playable} label="Titles with authorized sources" />
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {PRINCIPLES.map(p => (
            <section key={p.title} className="glass rounded-xl2 p-6">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-ember-400/12 text-ember-300">
                <p.icon size={20} />
              </span>
              <h2 className="font-display text-[15px] font-extrabold uppercase tracking-wide text-mist-50">{p.title}</h2>
              <p className="mt-2 text-[13.5px] leading-[1.75] text-mist-400">{p.body}</p>
            </section>
          ))}
        </div>

        <section className="mx-auto mt-14 max-w-3xl rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-6 sm:p-8">
          <h2 className="flex items-center gap-2.5 font-display text-[15px] font-extrabold uppercase tracking-wide text-mist-50">
            <IconCheck size={16} className="text-signal" /> What we will never do
          </h2>
          <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-mist-300">
            {[
              "Scrape, mirror or re-host copyrighted movies or episodes from unauthorized sources.",
              "Bypass DRM, paywalls or regional restrictions of any service.",
              "Ship a title without a declared rights basis just to pad the catalog.",
              "Sell or rent your viewing data to advertisers.",
            ].map(x => (
              <li key={x} className="flex gap-2.5">
                <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/movies" className="btn-ember btn-lg gap-2"><IconFilm size={16} /> Browse movies</Link>
          <Link href="/tv" className="btn-ghost btn-lg gap-2"><IconTv size={16} /> Browse series</Link>
          <Link href="/trending" className="btn-quiet btn-lg gap-2"><IconPlay size={14} /> What's trending</Link>
        </div>
      </div>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-5 text-center">
      <span className="block font-display text-3xl font-extrabold text-ember-300">{value}</span>
      <span className="mt-1 block text-[12px] font-semibold text-mist-500">{label}</span>
    </div>
  );
}
