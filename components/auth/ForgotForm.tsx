"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { IconAlert, IconCheck, IconLock, IconMail } from "@/components/icons";

function ForgotInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const urlToken = sp?.get("token") ?? "";

  const [step, setStep] = useState<"request" | "sent" | "reset">(urlToken ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(urlToken);
  const [password, setPassword] = useState("");
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStep("sent");
      if (data.devResetToken) setDevToken(data.devResetToken);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed.");
      router.push("/login");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {error && (
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-950/40 px-3.5 py-3 text-[13px] font-semibold text-red-200" role="alert">
          <IconAlert size={15} className="mt-px shrink-0" /> {error}
        </p>
      )}

      {step === "request" && (
        <form onSubmit={requestReset} className="space-y-4">
          <div>
            <label className="label" htmlFor="forgot-email">Email</label>
            <div className="relative">
              <IconMail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
              <input id="forgot-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="field pl-10" autoComplete="email" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-ember btn-md w-full">
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      {step === "sent" && (
        <div className="space-y-4">
          <p className="flex items-start gap-2.5 rounded-xl2 border border-signal/20 bg-signal/[0.05] px-4 py-3.5 text-[13.5px] leading-relaxed text-mist-200">
            <IconCheck size={16} className="mt-0.5 shrink-0 text-signal" />
            If an account exists for <span className="font-bold">{email}</span>, a password reset link is on its way.
          </p>
          {devToken && (
            <div className="rounded-xl2 border border-ember-400/25 bg-ember-400/[0.06] px-4 py-3.5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ember-300">Development mode</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-mist-300">
                No email transport is wired in this build, so the reset link is surfaced here instead:
              </p>
              <button
                type="button"
                onClick={() => { setToken(devToken); setStep("reset"); }}
                className="btn-ghost btn-sm mt-3 w-full break-all"
              >
                Open reset form with this token
              </button>
            </div>
          )}
          <button type="button" onClick={() => setStep("request")} className="btn-quiet btn-md w-full">Use a different email</button>
        </div>
      )}

      {step === "reset" && (
        <form onSubmit={doReset} className="space-y-4">
          <div>
            <label className="label" htmlFor="reset-token">Reset token</label>
            <input id="reset-token" type="text" required value={token} onChange={e => setToken(e.target.value)} className="field font-mono text-[12px]" placeholder="token from your reset link" />
          </div>
          <div>
            <label className="label" htmlFor="reset-password">New password</label>
            <div className="relative">
              <IconLock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
              <input id="reset-password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className="field pl-10" autoComplete="new-password" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-ember btn-md w-full">
            {busy ? "Resetting…" : "Set new password"}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-[13.5px] text-mist-400">
        Remembered it? <Link href="/login" className="font-bold text-ember-300 hover:text-ember-200">Back to sign in</Link>
      </p>
    </div>
  );
}

export default function ForgotForm() {
  return (
    <Suspense fallback={<div className="skeleton h-48 w-full rounded-xl2" />}>
      <ForgotInner />
    </Suspense>
  );
}
