"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { IconAlert, IconCheck, IconLock, IconMail, IconUser } from "@/components/icons";

export default function SignupForm() {
  const router = useRouter();
  const { signup } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signup(name, email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Sign up failed.");
      return;
    }
    router.push("/profile");
    router.refresh();
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
          <label className="label" htmlFor="signup-name">Name</label>
          <div className="relative">
            <IconUser size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
            <input id="signup-name" type="text" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="field pl-10" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="signup-email">Email</label>
          <div className="relative">
            <IconMail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
            <input id="signup-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="field pl-10" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="signup-password">Password</label>
          <div className="relative">
            <IconLock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="field pl-10"
              aria-describedby="pw-strength"
            />
          </div>
          {password && (
            <div id="pw-strength" className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map(i => (
                  <span key={i} className={`h-1 w-8 rounded-full ${i <= strength ? (strength <= 2 ? "bg-red-400/80" : strength === 3 ? "bg-ember-400" : "bg-signal") : "bg-white/10"}`} />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-mist-500">
                {strength <= 2 ? "Weak" : strength === 3 ? "Okay" : "Strong"}
              </span>
            </div>
          )}
        </div>

        <ul className="space-y-1 text-[12px] text-mist-500">
          <li className="flex items-center gap-2"><IconCheck size={12} className="text-signal" /> Watchlist & history synced across devices</li>
          <li className="flex items-center gap-2"><IconCheck size={12} className="text-signal" /> Resume playback anywhere</li>
        </ul>

        <button type="submit" disabled={busy} className="btn-ember btn-md mt-2 w-full">
          {busy ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13.5px] text-mist-400">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-ember-300 transition-colors hover:text-ember-200">Sign in</Link>
      </p>
    </div>
  );
}
