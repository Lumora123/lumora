"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/format";
import { useStore } from "@/lib/store";
import Logo from "@/components/brand/Logo";
import { IconBookmark, IconSearch, IconShield, IconUser, IconClock, IconLogout, IconChevronDown } from "@/components/icons";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV Shows" },
  { href: "/genres", label: "Genres" },
  { href: "/new", label: "New Releases" },
  { href: "/trending", label: "Trending" },
];

export default function Header({
  popularSearches,
  onOpenSearch,
}: {
  popularSearches: string[];
  onOpenSearch: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-cinema",
        scrolled || menuOpen
          ? "glass border-b border-white/[0.06] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)]"
          : "bg-gradient-to-b from-ink-950/85 via-ink-950/35 to-transparent border-b border-transparent"
      )}
    >
      <div className="shell flex h-[var(--header-h)] items-center gap-4 lg:gap-8">
        <Logo className="shrink-0" markSize={26} />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cx(
                "relative rounded-md px-3 py-2 text-[13px] font-semibold transition-colors duration-200",
                isActive(item.href) ? "text-mist-50" : "text-mist-400 hover:text-mist-100"
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-ember-400" aria-hidden="true" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={onOpenSearch}
            className="group flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-mist-300 transition-all hover:border-white/25 hover:text-white sm:px-3"
            aria-label="Search titles, people and genres (Ctrl+K)"
          >
            <IconSearch size={17} />
            <span className="hidden text-[13px] font-medium xl:inline">Search</span>
            <kbd className="hidden rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-sans text-[10px] font-bold text-mist-400 xl:inline">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/my-list"
            aria-label="My List"
            className={cx(
              "grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-white/[0.08]",
              pathname.startsWith("/my-list") ? "text-ember-300" : "text-mist-300 hover:text-white"
            )}
          >
            <IconBookmark size={18} />
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(o => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="flex items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-white/[0.08]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-ember-300 to-ember-600 font-display text-[13px] font-extrabold text-ink-950">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <IconChevronDown size={14} className={cx("hidden text-mist-400 transition-transform duration-200 sm:block", menuOpen && "rotate-180")} />
              </button>

              {menuOpen && (
                <div role="menu" className="glass absolute right-0 top-[calc(100%+10px)] w-60 animate-scale-in overflow-hidden rounded-xl2 p-1.5 shadow-lift">
                  <div className="border-b border-white/[0.07] px-3 py-2.5">
                    <p className="truncate text-sm font-bold text-mist-50">{user.name}</p>
                    <p className="truncate text-xs text-mist-400">{user.email}</p>
                  </div>
                  <MenuLink href="/profile" icon={<IconUser size={16} />} label="Profile & Account" />
                  <MenuLink href="/my-list" icon={<IconBookmark size={16} />} label="My List" />
                  <MenuLink href="/history" icon={<IconClock size={16} />} label="Watch History" />
                  {user.role === "admin" && (
                    <MenuLink href="/admin" icon={<IconShield size={16} />} label="Admin Dashboard" />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => { await logout(); setMenuOpen(false); router.push("/"); router.refresh(); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-white"
                  >
                    <IconLogout size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-ember btn-sm h-9 rounded-lg px-4">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-white"
    >
      {icon} {label}
    </Link>
  );
}
