"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";
import { IconFilm, IconGrid, IconShield, IconSpark, IconUser } from "@/components/icons";

const LINKS = [
  { href: "/admin", label: "Overview", icon: IconGrid, exact: true },
  { href: "/admin/titles", label: "Titles", icon: IconFilm, exact: false },
  { href: "/admin/featured", label: "Featured & Sections", icon: IconSpark, exact: false },
  { href: "/admin/users", label: "Users", icon: IconUser, exact: false },
];

export default function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside aria-label="Admin navigation">
      <div className="mb-5 flex items-center gap-2.5 rounded-xl2 border border-ember-400/25 bg-ember-400/[0.06] p-3.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ember-400/15 text-ember-300">
          <IconShield size={17} />
        </span>
        <span className="min-w-0">
          <span className="block text-[12.5px] font-extrabold uppercase tracking-[0.14em] text-ember-300">Admin</span>
          <span className="block truncate text-[11.5px] text-mist-400">{userName}</span>
        </span>
      </div>
      <nav className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {LINKS.map(l => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[13px] font-bold transition-colors lg:w-full",
                active ? "bg-white/[0.08] text-mist-50" : "text-mist-400 hover:bg-white/[0.04] hover:text-mist-100"
              )}
            >
              <Icon size={16} className={active ? "text-ember-300" : ""} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-6 hidden text-[11.5px] leading-relaxed text-mist-600 lg:block">
        Changes persist to the platform&apos;s JSON datastore immediately. Streaming sources must carry a rights
        declaration — the player refuses to serve anything without one.
      </p>
    </aside>
  );
}
