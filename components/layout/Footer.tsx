import Link from "next/link";
import Logo from "@/components/brand/Logo";

const COLS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Browse",
    links: [
      { href: "/movies", label: "Movies" },
      { href: "/tv", label: "TV Shows" },
      { href: "/genres", label: "All Genres" },
      { href: "/new", label: "New Releases" },
      { href: "/trending", label: "Trending" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    heading: "Your Lumora",
    links: [
      { href: "/my-list", label: "My List" },
      { href: "/history", label: "Watch History" },
      { href: "/profile", label: "Profile" },
      { href: "/login", label: "Sign In" },
      { href: "/signup", label: "Create Account" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Lumora" },
      { href: "/contact", label: "Contact" },
      { href: "/admin", label: "Admin" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/copyright", label: "Copyright & DMCA" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-ink-950/70 pb-28 lg:pb-10">
      <div className="shell py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-mist-500">
              Lumora is an independent streaming showcase of legally available cinema —
              public-domain classics, Creative Commons open movies, and clearly-marked demo
              content. Every stream is served with the authorization of its rights status.
            </p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-mist-600">
              Stories, illuminated.
            </p>
          </div>
          {COLS.map(col => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-mist-300">{col.heading}</h3>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-[13px] text-mist-500 transition-colors hover:text-ember-300">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-6 text-[12px] text-mist-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Lumora Media (demo platform). All streaming rights verified per title.</p>
          <p className="max-w-xl sm:text-right">
            Public-domain films streamed via the Internet Archive. Open movies © Blender Foundation, CC&nbsp;BY&nbsp;3.0.
            Lumora is not affiliated with any third-party streaming service.
          </p>
        </div>
      </div>
    </footer>
  );
}
