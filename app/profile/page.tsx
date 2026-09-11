"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { getPrefs, setPrefs, type Prefs } from "@/lib/prefs";
import { formatDate, timeAgo } from "@/lib/format";
import PageHeader from "@/components/browse/PageHeader";
import { EmptyState } from "@/components/ui/States";
import {
  IconBookmark, IconChevronRight, IconClock, IconLogout, IconShield, IconSpark, IconUser,
} from "@/components/icons";

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 rounded-xl border border-white/[0.06] bg-ink-900/50 p-4 transition-colors hover:border-white/15">
      <span className="min-w-0">
        <span className="block text-[13.5px] font-bold text-mist-100">{label}</span>
        <span className="mt-1 block text-[12.5px] leading-relaxed text-mist-500">{description}</span>
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <span className="block h-6 w-11 rounded-full bg-white/15 transition-colors peer-checked:bg-ember-400" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function ProfilePage() {
  const { ready, user, watchlist, progress, history, logout } = useStore();
  const router = useRouter();
  const [prefs, setPrefsState] = useState<Prefs | null>(null);

  useEffect(() => { setPrefsState(getPrefs()); }, []);

  const updatePref = (patch: Partial<Prefs>) => {
    setPrefsState(setPrefs(patch));
  };

  if (!ready) {
    return (
      <>
        <PageHeader eyebrow="Account" title="Profile" />
        <div className="shell py-10"><div className="skeleton h-72 rounded-xl2" /></div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader eyebrow="Account" title="Profile" />
        <div className="shell max-w-3xl py-10">
          <EmptyState
            icon={<IconUser size={22} />}
            title="You're browsing as a guest"
            body="Your watchlist and progress are being saved on this device. Create a free account to sync them everywhere and unlock personalized recommendations."
            action={
              <div className="flex flex-wrap justify-center gap-2.5">
                <Link href="/signup" className="btn-ember btn-md">Create account</Link>
                <Link href="/login" className="btn-ghost btn-md">Sign in</Link>
              </div>
            }
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat icon={<IconBookmark size={16} />} value={watchlist.length} label="Saved on this device" />
            <Stat icon={<IconClock size={16} />} value={Object.keys(progress).length} label="In progress" />
            <Stat icon={<IconSpark size={16} />} value={history.length} label="Titles touched" />
          </div>
        </div>
      </>
    );
  }

  const activeProgress = Object.values(progress).filter(p => p.duration > 0 && p.position / p.duration < 0.96 && p.position / p.duration > 0.01);

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" />
      <div className="shell py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* account card */}
            <section className="glass flex flex-wrap items-center gap-5 rounded-xl2 p-5 sm:p-6" aria-label="Account">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-ember-300 to-ember-600 font-display text-2xl font-extrabold text-ink-950 shadow-glow">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-display text-xl font-bold text-mist-50">{user.name}</h2>
                  {user.role === "admin" && (
                    <span className="chip border-ember-400/40 bg-ember-400/10 text-ember-300">
                      <IconShield size={11} /> Admin
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[13px] text-mist-400">{user.email}</p>
                <p className="mt-0.5 text-[12px] text-mist-600">Member since {formatDate(user.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={async () => { await logout(); router.push("/"); router.refresh(); }}
                className="btn-ghost btn-md gap-2"
              >
                <IconLogout size={15} /> Sign out
              </button>
            </section>

            {/* stats */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat icon={<IconBookmark size={16} />} value={watchlist.length} label="Titles in My List" href="/my-list" />
              <Stat icon={<IconClock size={16} />} value={activeProgress.length} label="Currently watching" href="/history" />
              <Stat icon={<IconSpark size={16} />} value={history.length} label="Watch history entries" href="/history" />
            </div>

            {/* preferences */}
            <section aria-label="Playback preferences">
              <h2 className="section-title mb-4">Playback preferences</h2>
              <div className="grid gap-3">
                {prefs && (
                  <>
                    <Toggle
                      checked={prefs.autoplayNext}
                      onChange={v => updatePref({ autoplayNext: v })}
                      label="Autoplay next episode"
                      description="When a serial or series episode ends, count down and start the next one automatically."
                    />
                    <Toggle
                      checked={prefs.dataSaver}
                      onChange={v => updatePref({ dataSaver: v })}
                      label="Data saver"
                      description="Start playback on the smallest authorized rendition when multiple qualities exist. You can still switch up in the player."
                    />
                    <Toggle
                      checked={prefs.reducedTrailers}
                      onChange={v => updatePref({ reducedTrailers: v })}
                      label="Don't auto-play previews"
                      description="Trailer modals will open paused and wait for you to press play."
                    />
                  </>
                )}
              </div>
              <p className="mt-3 text-[12px] text-mist-600">
                Preferences are stored on this device. Captions, audio and quality selections live inside the player.
              </p>
            </section>
          </div>

          {/* quick links */}
          <aside className="space-y-3" aria-label="Quick links">
            <QuickLink href="/my-list" icon={<IconBookmark size={17} />} label="My List" sub={`${watchlist.length} saved`} />
            <QuickLink href="/history" icon={<IconClock size={17} />} label="Watch History" sub={`${history.length} entries`} />
            {user.role === "admin" && (
              <QuickLink href="/admin" icon={<IconShield size={17} />} label="Admin Dashboard" sub="Manage catalog & users" highlight />
            )}
            <QuickLink href="/contact" icon={<IconUser size={17} />} label="Help & Contact" sub="Questions about rights or playback" />

            <div className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-5">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-mist-400">Recent activity</h3>
              {history.length === 0 ? (
                <p className="mt-3 text-[13px] text-mist-500">Nothing yet — press play on something.</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {history.slice(0, 5).map((h, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-[13px]">
                      <Link href={h.kind === "movie" ? `/movie/${h.slug}` : `/tv/${h.slug}`} className="truncate font-semibold text-mist-200 hover:text-ember-300">
                        {h.slug.replace(/-/g, " ")}
                      </Link>
                      <span className="shrink-0 text-[11.5px] text-mist-600">{timeAgo(h.at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function Stat({ icon, value, label, href }: { icon: React.ReactNode; value: number; label: string; href?: string }) {
  const inner = (
    <>
      <span className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-ember-400/10 text-ember-300">{icon}</span>
      <span className="block font-display text-2xl font-extrabold text-mist-50">{value}</span>
      <span className="mt-0.5 block text-[12px] font-semibold text-mist-500">{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-4 transition-colors hover:border-ember-400/30">{inner}</Link>
  ) : (
    <div className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-4">{inner}</div>
  );
}

function QuickLink({ href, icon, label, sub, highlight }: { href: string; icon: React.ReactNode; label: string; sub: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3.5 rounded-xl2 border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
        highlight ? "border-ember-400/30 bg-ember-400/[0.06] hover:border-ember-400/60" : "border-white/[0.07] bg-ink-900/50 hover:border-white/20"
      }`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${highlight ? "bg-ember-400/15 text-ember-300" : "bg-white/[0.05] text-mist-300"}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-bold text-mist-50">{label}</span>
        <span className="block truncate text-[12px] text-mist-500">{sub}</span>
      </span>
      <IconChevronRight size={16} className="shrink-0 text-mist-600 transition-transform group-hover:translate-x-0.5 group-hover:text-ember-300" />
    </Link>
  );
}
