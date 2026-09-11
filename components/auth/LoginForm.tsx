"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { IconAlert, IconLock, IconMail, IconEye } from "@/components/icons";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Login failed.");
      return;
    }
    router.push("/profile");
    router.refresh();
  };

  const fillDemo = (which: "admin" | "viewer") => {
    if (which === "admin") {
      setEmail("admin@lumora.tv");
      setPassword("LumoraAdmin!2026");
    } else {
      setEmail("demo@lumora.tv");
      setPassword("LumoraDemo!2026");
    }
    setError(null);
  };

  return (
    <div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <p className="flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-950/40 px-3.5 py-3 text-[13px] font-semibold text-red-200" role="alert">
            <IconAlert size={15} className="mt-px shrink-0" /> {error}
          </p>
        )}

        <div>
          <label className="label" htmlFor="login-email">Email</label>
          <div className="relative">
            <IconMail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="field pl-10"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0" htmlFor="login-password">Password</label>
            <Link href="/forgot-password" className="text-[12px] font-semibold text-mist-400 transition-colors hover:text-ember-300">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <IconLock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
            <input
              id="login-password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field pl-10 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-mist-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              <IconEye size={15} />
            </button>
          </div>
        </div>

        <button type="submit" disabled={busy} className="btn-ember btn-md mt-2 w-full">
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-ink-950/30 border-t-ink-950" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 rounded-xl2 border border-white/[0.08] bg-ink-900/60 p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-mist-400">Evaluation accounts</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-mist-500">
          This demo ships with two seeded accounts. One tap fills the form.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => fillDemo("viewer")} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left transition-colors hover:border-ember-400/40">
            <span className="block text-[12px] font-bold text-mist-100">Viewer</span>
            <span className="block text-[11px] text-mist-500">demo@lumora.tv</span>
          </button>
          <button type="button" onClick={() => fillDemo("admin")} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left transition-colors hover:border-ember-400/40">
            <span className="block text-[12px] font-bold text-mist-100">Admin</span>
            <span className="block text-[11px] text-mist-500">admin@lumora.tv</span>
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-[13.5px] text-mist-400">
        New to Lumora?{" "}
        <Link href="/signup" className="font-bold text-ember-300 transition-colors hover:text-ember-200">
          Create an account
        </Link>
      </p>
    </div>
  );
}
