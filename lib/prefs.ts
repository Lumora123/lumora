"use client";

/**
 * Viewer preferences — device-local by design (they're presentation choices,
 * not account data). Stored in localStorage with safe SSR fallbacks.
 */
export interface Prefs {
  autoplayNext: boolean;
  dataSaver: boolean; // prefer the lowest-bitrate authorized source at start
  reducedTrailers: boolean; // don't auto-play trailer modal previews
}

const KEY = "lumora.prefs.v1";

export const defaultPrefs: Prefs = {
  autoplayNext: true,
  dataSaver: false,
  reducedTrailers: false,
};

export function getPrefs(): Prefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export function setPrefs(patch: Partial<Prefs>): Prefs {
  const next = { ...getPrefs(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}
