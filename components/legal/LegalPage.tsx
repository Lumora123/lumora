import Link from "next/link";
import PageHeader from "@/components/browse/PageHeader";

const SECTIONS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/copyright", label: "Copyright & DMCA" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About Lumora" },
];

export default function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={intro} />
      <div className="shell grid gap-8 py-8 lg:grid-cols-[200px_1fr] lg:py-12">
        <nav aria-label="Legal documents" className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {SECTIONS.map(s => (
            <Link
              key={s.href}
              href={s.href}
              className="shrink-0 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-mist-400 transition-colors hover:bg-white/[0.04] hover:text-mist-100 lg:w-full aria-[current=page]:bg-white/[0.07] aria-[current=page]:text-mist-50"
              aria-current={s.label === title ? "page" : undefined}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <article className="prose-legal min-w-0">
          <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.18em] text-mist-500">Last updated {updated}</p>
          {children}
        </article>
      </div>
    </>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-9 font-display text-lg font-extrabold uppercase tracking-wide text-mist-50 first:mt-0">{children}</h2>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[14px] leading-[1.75] text-mist-300">{children}</p>;
}

export function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2 text-[14px] leading-[1.7] text-mist-300">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400" aria-hidden="true" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
