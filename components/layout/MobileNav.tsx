"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";
import { useStore } from "@/lib/store";
import { IconBookmark, IconFilm, IconHome, IconSearch, IconUser } from "@/components/icons";

/** Bottom tab bar for phones — keeps core navigation thumb-reachable. */
export default function MobileNav({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = usePathname();
  const { user } = useStore();

  const linkCls = (active: boolean) =>
    cx(
      "flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors",
      active ? "text-ember-300" : "text-mist-500 active:text-mist-200"
    );

  return (
    <nav
      aria-label="Mobile"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] pb-safe lg:hidden"
    >
      <ul className="flex items-stretch">
        <li className="flex-1">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={linkCls(pathname === "/")}>
            <IconHome size={21} />
            Home
          </Link>
        </li>
        <li className="flex-1">
          <button type="button" onClick={onOpenSearch} className={cx(linkCls(false), "w-full")} aria-label="Open search">
            <IconSearch size={21} />
            Search
          </button>
        </li>
        <li className="flex-1">
          <Link href="/movies" aria-current={pathname.startsWith("/movie") ? "page" : undefined} className={linkCls(pathname.startsWith("/movie"))}>
            <IconFilm size={21} />
            Movies
          </Link>
        </li>
        <li className="flex-1">
          <Link href="/my-list" aria-current={pathname.startsWith("/my-list") ? "page" : undefined} className={linkCls(pathname.startsWith("/my-list"))}>
            <IconBookmark size={21} />
            My List
          </Link>
        </li>
        <li className="flex-1">
          <Link href={user ? "/profile" : "/login"} aria-current={pathname.startsWith("/profile") || pathname.startsWith("/login") ? "page" : undefined} className={linkCls(pathname.startsWith("/profile") || pathname.startsWith("/login"))}>
            <IconUser size={21} />
            {user ? "Profile" : "Sign In"}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
