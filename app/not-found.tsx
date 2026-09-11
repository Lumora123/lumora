import Link from "next/link";
import { IconFilm, IconSearch, IconTv } from "@/components/icons";

export const metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="relative grid min-h-[80svh] place-items-center overflow-hidden px-4 py-24 text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_0%,rgba(245,166,35,0.10),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative max-w-lg">
        <p className="font-display text-[clamp(5rem,18vw,9rem)] font-extrabold leading-none text-white/[0.08]">404</p>
        <h1 className="-mt-8 font-display text-3xl font-extrabold uppercase tracking-wide text-mist-50 sm:-mt-12">
          This scene didn't make the final cut
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-mist-400">
          The page you're looking for doesn't exist, was moved, or the title was removed from the catalog.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-ember btn-md">Back to home</Link>
          <Link href="/search" className="btn-ghost btn-md gap-2"><IconSearch size={15} /> Search the catalog</Link>
        </div>
        <div className="mt-6 flex justify-center gap-5 text-[13px] font-semibold text-mist-500">
          <Link href="/movies" className="flex items-center gap-1.5 hover:text-ember-300"><IconFilm size={14} /> Movies</Link>
          <Link href="/tv" className="flex items-center gap-1.5 hover:text-ember-300"><IconTv size={14} /> Series</Link>
          <Link href="/genres" className="hover:text-ember-300">Genres</Link>
        </div>
      </div>
    </div>
  );
}
