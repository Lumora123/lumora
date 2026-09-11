"use client";

import { useState } from "react";
import { IconAlert, IconCheck, IconMail } from "@/components/icons";

const TOPICS = [
  "General question",
  "Playback problem",
  "Copyright / DMCA request",
  "Account or privacy request",
  "Partnership / licensing",
];

export default function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (message.trim().length < 10) {
      setError("Please write a little more so we can help (10+ characters).");
      return;
    }
    // [ASSUMPTION] No email transport is wired in this build; the form validates
    // and confirms locally. A production deployment posts to a mail/CRM endpoint.
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="rounded-xl2 border border-signal/25 bg-signal/[0.05] p-6 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-signal/15 text-signal">
          <IconCheck size={22} />
        </span>
        <h2 className="font-display text-lg font-extrabold text-mist-50">Message received</h2>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-mist-400">
          Thanks, {name || "friend"} — we've logged your {topic.toLowerCase()}. [ASSUMPTION] This demo build has no
          mail transport, so nothing was actually transmitted; in production you'd get a reply at{" "}
          <span className="font-semibold text-mist-200">{email}</span> within 2 business days.
        </p>
        <button type="button" onClick={() => { setStatus("idle"); setMessage(""); }} className="btn-ghost btn-md mt-5">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-5 sm:p-6">
      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-950/40 px-3.5 py-3 text-[13px] font-semibold text-red-200" role="alert">
          <IconAlert size={15} className="mt-px shrink-0" /> {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Topic</span>
          <select className="field" value={topic} onChange={e => setTopic(e.target.value)}>
            {TOPICS.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Your name</span>
          <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" autoComplete="name" />
        </label>
        <label className="block sm:col-span-2">
          <span className="label">Email</span>
          <div className="relative">
            <IconMail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
            <input className="field pl-10" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
        </label>
        <label className="block sm:col-span-2">
          <span className="label">Message</span>
          <textarea className="field min-h-[140px] resize-y" required value={message} onChange={e => setMessage(e.target.value)} placeholder={topic === "Copyright / DMCA request" ? "Identify the work, the Lumora URL, and include the statements required by our DMCA policy…" : "How can we help?"} />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-mist-600">
          DMCA notices are fastest when they follow the checklist on our{" "}
          <a href="/copyright" className="font-semibold text-ember-300 hover:text-ember-200">Copyright page</a>.
        </p>
        <button type="submit" className="btn-ember btn-md">Send message</button>
      </div>
    </form>
  );
}
