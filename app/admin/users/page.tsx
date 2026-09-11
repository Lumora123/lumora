"use client";

import { useEffect, useState } from "react";
import { formatDate, timeAgo } from "@/lib/format";
import { IconShield, IconTrash } from "@/components/icons";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
  watchlistCount: number;
  historyCount: number;
  inProgressCount: number;
}

export default function AdminUsersPage() {
  const [me, setMe] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = () => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setMe(d.user ?? null)).catch(() => {});
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => setUsers(d.users ?? []))
      .catch(() => setUsers([]));
  };
  useEffect(load, []);

  const setRole = async (u: AdminUser, role: "user" | "admin") => {
    setError(null);
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setError(d.error || "Role update failed.");
    setUsers(prev => (prev ?? []).map(x => (x.id === u.id ? { ...x, role } : x)));
  };

  const remove = async (u: AdminUser) => {
    setError(null);
    if (!window.confirm(`Delete ${u.email}? Their watchlist, history and progress will be erased. This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setError(d.error || "Delete failed.");
    setUsers(prev => (prev ?? []).filter(x => x.id !== u.id));
  };

  const filtered = (users ?? []).filter(u => {
    const needle = q.trim().toLowerCase();
    return !needle || u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle);
  });

  return (
    <div className="space-y-6 pb-10">
      <header>
        <h1 className="font-display text-2xl font-extrabold uppercase text-mist-50">Users</h1>
        <p className="mt-1 text-[13px] text-mist-400">
          {users ? `${users.length} account${users.length === 1 ? "" : "s"} · ${users.filter(u => u.role === "admin").length} admin${users.filter(u => u.role === "admin").length === 1 ? "" : "s"}` : "Loading…"}
        </p>
      </header>

      {error && <p className="rounded-lg border border-red-400/25 bg-red-950/40 px-4 py-3 text-[13px] font-semibold text-red-200" role="alert">{error}</p>}

      <input
        type="search"
        className="field max-w-xs"
        placeholder="Find by name or email…"
        value={q}
        onChange={e => setQ(e.target.value)}
        aria-label="Filter users"
      />

      {!users ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl2 border border-white/[0.07]">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[11px] font-extrabold uppercase tracking-[0.14em] text-mist-500">
                <th scope="col" className="px-4 py-3">Account</th>
                <th scope="col" className="px-4 py-3">Role</th>
                <th scope="col" className="px-4 py-3">Activity</th>
                <th scope="col" className="px-4 py-3">Joined</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isMe = u.id === me?.id;
                return (
                  <tr key={u.id} className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.06] font-display text-sm font-extrabold text-mist-200">
                          {u.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-mist-100">
                            {u.name} {isMe && <span className="text-[11px] font-semibold text-mist-500">(you)</span>}
                          </span>
                          <span className="block truncate text-[12px] text-mist-500">{u.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isMe ? (
                        <span className="chip border-ember-400/40 bg-ember-400/10 text-ember-300"><IconShield size={11} /> Admin</span>
                      ) : (
                        <select
                          className="field h-9 w-32"
                          value={u.role}
                          onChange={e => setRole(u, e.target.value as "user" | "admin")}
                          aria-label={`Role for ${u.email}`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-mist-400">
                      {u.watchlistCount} saved · {u.inProgressCount} in progress · {u.historyCount} history
                    </td>
                    <td className="px-4 py-3 text-[12px] text-mist-400">
                      {formatDate(u.createdAt)}<span className="block text-[11px] text-mist-600">{timeAgo(u.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={isMe}
                        onClick={() => remove(u)}
                        className="btn-quiet btn-sm gap-1.5 text-red-300/80 hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <IconTrash size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-mist-500">No accounts match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[12px] leading-relaxed text-mist-600">
        [ASSUMPTION] This build has no email transport, so password resets surface their token to the requester in
        development mode. Account deletion is permanent and also revokes the user's active sessions.
      </p>
    </div>
  );
}
