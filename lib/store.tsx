"use client";

/**
 * Global client store: session, watchlist, playback progress and history.
 *
 * Signed-out visitors keep everything in localStorage (so the product is fully
 * usable without an account). Signed-in users read/write through the API, and
 * on login the guest state is merged into the account once.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PublicUser } from "@/lib/types";

export interface ClientProgress {
  key: string;
  titleId: string;
  kind: "movie" | "tv";
  slug: string;
  season?: number;
  episode?: number;
  position: number;
  duration: number;
  updatedAt: string;
}

interface StoreShape {
  ready: boolean;
  user: PublicUser | null;
  watchlist: string[];
  progress: Record<string, ClientProgress>;
  history: { titleId: string; kind: "movie" | "tv"; slug: string; at: string }[];
  inWatchlist: (id: string) => boolean;
  toggleWatchlist: (id: string) => Promise<void>;
  saveProgress: (p: Omit<ClientProgress, "updatedAt">) => Promise<void>;
  removeProgress: (key: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreShape | null>(null);

const LS = {
  watchlist: "lumora.watchlist.v1",
  progress: "lumora.progress.v1",
  history: "lumora.history.v1",
  merged: "lumora.merged.v1",
};

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* private mode */ }
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try { const j = await res.json(); if (j?.error) message = j.error; } catch {}
    throw new Error(message);
  }
  return res.json();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, ClientProgress>>({});
  const [history, setHistory] = useState<StoreShape["history"]>([]);
  const userRef = useRef<PublicUser | null>(null);
  userRef.current = user;

  const applyState = useCallback((s: { watchlist: string[]; progress: Record<string, ClientProgress>; history: StoreShape["history"] }) => {
    setWatchlist(s.watchlist ?? []);
    setProgress(s.progress ?? {});
    setHistory(s.history ?? []);
  }, []);

  const loadGuest = useCallback(() => {
    applyState({
      watchlist: readLS<string[]>(LS.watchlist, []),
      progress: readLS<Record<string, ClientProgress>>(LS.progress, {}),
      history: readLS<StoreShape["history"]>(LS.history, []),
    });
  }, [applyState]);

  const refresh = useCallback(async () => {
    try {
      const me = await api("/api/auth/me");
      if (me.user) {
        setUser(me.user);
        const state = await api("/api/user/state");
        applyState(state);
      } else {
        setUser(null);
        loadGuest();
      }
    } catch {
      setUser(null);
      loadGuest();
    } finally {
      setReady(true);
    }
  }, [applyState, loadGuest]);

  useEffect(() => { refresh(); }, [refresh]);

  const mergeGuestState = useCallback(async () => {
    const mergedFor = readLS<string | null>(LS.merged, null);
    if (!userRef.current || mergedFor === userRef.current.id) return;
    const guest = {
      watchlist: readLS<string[]>(LS.watchlist, []),
      progress: readLS<Record<string, ClientProgress>>(LS.progress, {}),
      history: readLS<StoreShape["history"]>(LS.history, []),
    };
    if (guest.watchlist.length || Object.keys(guest.progress).length || guest.history.length) {
      try { await api("/api/user/merge", { method: "POST", body: JSON.stringify(guest) }); } catch {}
    }
    writeLS(LS.merged, userRef.current.id);
  }, []);

  const persistLocal = useCallback((next: { watchlist?: string[]; progress?: Record<string, ClientProgress>; history?: StoreShape["history"] }) => {
    if (next.watchlist) writeLS(LS.watchlist, next.watchlist);
    if (next.progress) writeLS(LS.progress, next.progress);
    if (next.history) writeLS(LS.history, next.history);
  }, []);

  const toggleWatchlist = useCallback(async (id: string) => {
    const current = userRef.current ? watchlist : readLS<string[]>(LS.watchlist, []);
    const has = current.includes(id);
    const next = has ? current.filter(x => x !== id) : [id, ...current];
    setWatchlist(next);
    if (userRef.current) {
      try { await api("/api/user/watchlist", { method: "POST", body: JSON.stringify({ titleId: id, add: !has }) }); }
      catch { setWatchlist(current); }
    } else {
      persistLocal({ watchlist: next });
    }
  }, [watchlist, persistLocal]);

  const saveProgress = useCallback(async (p: Omit<ClientProgress, "updatedAt">) => {
    const entry: ClientProgress = { ...p, updatedAt: new Date().toISOString() };
    setProgress(prev => {
      const next = { ...prev, [entry.key]: entry };
      if (!userRef.current) persistLocal({ progress: next });
      return next;
    });
    if (userRef.current) {
      try { await api("/api/user/progress", { method: "POST", body: JSON.stringify(entry) }); } catch {}
    }
    setHistory(prev => {
      const h = [{ titleId: p.titleId, kind: p.kind, slug: p.slug, at: entry.updatedAt }, ...prev.filter(x => x.titleId !== p.titleId)].slice(0, 60);
      if (!userRef.current) persistLocal({ history: h });
      return h;
    });
  }, [persistLocal]);

  const removeProgress = useCallback(async (key: string) => {
    setProgress(prev => {
      const next = { ...prev };
      delete next[key];
      if (!userRef.current) persistLocal({ progress: next });
      return next;
    });
    if (userRef.current) {
      try { await api("/api/user/progress", { method: "DELETE", body: JSON.stringify({ key }) }); } catch {}
    }
  }, [persistLocal]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const r = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      setUser(r.user);
      writeLS(LS.merged, r.user.id);
      await mergeGuestState();
      const state = await api("/api/user/state");
      applyState(state);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, [applyState, mergeGuestState]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const r = await api("/api/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) });
      setUser(r.user);
      await mergeGuestState();
      const state = await api("/api/user/state");
      applyState(state);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, [applyState, mergeGuestState]);

  const logout = useCallback(async () => {
    try { await api("/api/auth/logout", { method: "POST" }); } catch {}
    setUser(null);
    loadGuest();
  }, [loadGuest]);

  const value = useMemo<StoreShape>(() => ({
    ready, user, watchlist, progress, history,
    inWatchlist: id => watchlist.includes(id),
    toggleWatchlist, saveProgress, removeProgress, login, signup, logout, refresh,
  }), [ready, user, watchlist, progress, history, toggleWatchlist, saveProgress, removeProgress, login, signup, logout, refresh]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreShape {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
