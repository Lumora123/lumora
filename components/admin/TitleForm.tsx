"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { AudioTrack, CastMember, Episode, RightsKind, Season, StreamingSource, SubtitleTrack, Title, TrailerSpec } from "@/lib/types";
import { genres } from "@/lib/genres";
import { cx } from "@/lib/format";
import { IconAlert, IconCheck, IconPlus, IconTrash } from "@/components/icons";

const RIGHTS: { value: RightsKind; label: string }[] = [
  { value: "public-domain", label: "Public domain" },
  { value: "cc-licensed", label: "CC licensed" },
  { value: "original", label: "Original (ours)" },
  { value: "authorized-partner", label: "Authorized partner" },
  { value: "demo", label: "Demo asset" },
];

interface FormState {
  title: string;
  slug: string;
  kind: "movie" | "tv";
  tagline: string;
  synopsis: string;
  year: string;
  runtimeMin: string;
  contentRating: string;
  rating: string;
  popularity: string;
  contentTier: "production" | "demo";
  rightsNote: string;
  director: string;
  creators: string;
  languages: string;
  countries: string;
  poster: string;
  backdrop: string;
  trailerKind: "none" | "clip" | "file";
  trailerUrl: string;
  trailerSourceId: string;
  trailerStart: string;
  trailerDuration: string;
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  topRated: boolean;
  lumoraPick: boolean;
  genreSlugs: string[];
  cast: CastMember[];
  sources: StreamingSource[];
  subtitles: SubtitleTrack[];
  audio: AudioTrack[];
  seasons: Season[];
}

const emptyForm: FormState = {
  title: "", slug: "", kind: "movie", tagline: "", synopsis: "", year: String(new Date().getFullYear()),
  runtimeMin: "", contentRating: "NR", rating: "0", popularity: "40", contentTier: "production",
  rightsNote: "", director: "", creators: "", languages: "en", countries: "US", poster: "", backdrop: "",
  trailerKind: "none", trailerUrl: "", trailerSourceId: "", trailerStart: "0", trailerDuration: "90",
  featured: false, trending: false, newRelease: false, topRated: false, lumoraPick: false,
  genreSlugs: [], cast: [], sources: [], subtitles: [], audio: [], seasons: [],
};

function emptySource(id: string): StreamingSource {
  return { id, quality: "720p", height: 720, type: "mp4", url: "", rights: "public-domain", attribution: "" };
}
function emptyEpisode(slug: string, season: number, number: number): Episode {
  return {
    id: `${slug}-s${season}e${number}`, season, number, title: `Episode ${number}`, synopsis: "", runtime: 1500,
    streamingSources: [], subtitles: [], audioTracks: [],
  };
}

export default function TitleForm({ id }: { id: string | null }) {
  const router = useRouter();
  const isNew = !id;
  const [f, setF] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/titles/${id}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error("Title not found."))))
      .then((d: { title: Title }) => {
        const t = d.title;
        setF({
          title: t.title, slug: t.slug, kind: t.kind, tagline: t.tagline ?? "", synopsis: t.synopsis,
          year: String(t.year), runtimeMin: String(Math.round((t.runtime || 0) / 60)), contentRating: t.contentRating,
          rating: String(t.rating), popularity: String(t.popularity), contentTier: t.contentTier,
          rightsNote: t.rightsNote ?? "", director: t.director ?? "", creators: (t.creators ?? []).join(", "),
          languages: (t.languages ?? []).join(", "), countries: (t.countries ?? []).join(", "),
          poster: t.poster ?? "", backdrop: t.backdrop ?? "",
          trailerKind: t.trailer?.kind ?? "none",
          trailerUrl: t.trailer?.url ?? "", trailerSourceId: t.trailer?.sourceId ?? "",
          trailerStart: String(t.trailer?.start ?? 0), trailerDuration: String(t.trailer?.duration ?? 90),
          featured: t.featured, trending: t.trending,
          newRelease: !!t.flags?.newRelease, topRated: !!t.flags?.topRated, lumoraPick: !!t.flags?.lumoraPick,
          genreSlugs: t.genres ?? [], cast: t.cast ?? [],
          sources: t.streamingSources ?? [], subtitles: t.subtitles ?? [], audio: t.audioTracks ?? [],
          seasons: t.seasons ?? [],
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const autoSlug = useMemo(
    () => f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    [f.title]
  );
  const effectiveSlug = slugTouched && f.slug ? f.slug : autoSlug;

  const buildPayload = (): Partial<Title> => {
    const trailer: TrailerSpec | undefined =
      f.trailerKind === "file"
        ? { kind: "file", url: f.trailerUrl }
        : f.trailerKind === "clip"
          ? { kind: "clip", sourceId: f.trailerSourceId || f.sources[0]?.id, start: Number(f.trailerStart) || 0, duration: Number(f.trailerDuration) || 60 }
          : undefined;
    const base = {
      title: f.title.trim(),
      slug: effectiveSlug,
      kind: f.kind,
      tagline: f.tagline.trim() || undefined,
      synopsis: f.synopsis.trim(),
      year: Number(f.year) || new Date().getFullYear(),
      runtime: Math.round((Number(f.runtimeMin) || 0) * 60),
      contentRating: f.contentRating.trim() || "NR",
      rating: Number(f.rating) || 0,
      popularity: Number(f.popularity) || 40,
      contentTier: f.contentTier,
      rightsNote: f.rightsNote.trim() || undefined,
      director: f.director.trim() || undefined,
      creators: f.creators.split(",").map(s => s.trim()).filter(Boolean),
      genres: f.genreSlugs,
      languages: f.languages.split(",").map(s => s.trim()).filter(Boolean),
      countries: f.countries.split(",").map(s => s.trim().toUpperCase()).filter(Boolean),
      poster: f.poster.trim() || undefined,
      backdrop: f.backdrop.trim() || undefined,
      trailer,
      featured: f.featured,
      trending: f.trending,
      flags: { newRelease: f.newRelease, topRated: f.topRated, lumoraPick: f.lumoraPick },
      streamingSources: f.kind === "movie" ? f.sources.filter(s => s.url.trim()) : [],
      subtitles: f.subtitles.filter(s => s.url.trim()),
      audioTracks: f.audio.filter(a => a.lang.trim()),
      seasons: f.kind === "tv"
        ? f.seasons.map(s => ({
            ...s,
            episodes: s.episodes.map(ep => ({
              ...ep,
              id: ep.id || `${effectiveSlug}-s${s.number}e${ep.number}`,
              streamingSources: ep.streamingSources.filter(src => src.url.trim()),
            })),
          }))
        : undefined,
    };
    return base as Partial<Title>;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!f.title.trim()) return setError("A title name is required.");
    if (!effectiveSlug) return setError("Could not derive a slug — enter one manually.");
    const sources = f.kind === "movie" ? f.sources.filter(s => s.url.trim()) : [];
    if (sources.some(s => !s.rights)) return setError("Every streaming source needs a rights declaration.");
    setSaving(true);
    try {
      const res = await fetch(isNew ? "/api/admin/titles" : `/api/admin/titles/${id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      setSaved(true);
      if (isNew) router.push(`/admin/titles/${d.title.id}`);
      else router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl2" />)}</div>;

  return (
    <form onSubmit={submit} className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold uppercase text-mist-50">
            {isNew ? "New title" : f.title || "Edit title"}
          </h1>
          <p className="mt-1 text-[13px] text-mist-400">
            {isNew ? "Add a movie or series to the Lumora catalog." : `id ${id} · slug /${f.kind}/${effectiveSlug}`}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button type="button" onClick={() => router.push("/admin/titles")} className="btn-quiet btn-md">Cancel</button>
          <button type="submit" disabled={saving} className="btn-ember btn-md gap-2">
            {saving ? "Saving…" : <><IconCheck size={15} /> {isNew ? "Create title" : "Save changes"}</>}
          </button>
        </div>
      </header>

      {error && <p className="flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-950/40 px-4 py-3 text-[13px] font-semibold text-red-200" role="alert"><IconAlert size={15} className="mt-px shrink-0" /> {error}</p>}
      {saved && <p className="flex items-center gap-2 rounded-lg border border-signal/25 bg-signal/[0.06] px-4 py-3 text-[13px] font-semibold text-signal" role="status"><IconCheck size={15} /> Saved.</p>}

      <fieldset className="panel">
        <legend className="panel-title">Basics</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title *">
            <input className="field" value={f.title} onChange={e => set("title", e.target.value)} required placeholder="e.g. The General" />
          </Field>
          <Field label="Slug" hint={slugTouched ? undefined : `auto: /${f.kind}/${autoSlug || "…"}`}>
            <div className="flex gap-2">
              <input className="field font-mono text-[12.5px]" value={slugTouched ? f.slug : autoSlug} onChange={e => { setSlugTouched(true); set("slug", e.target.value); }} placeholder="the-general" />
              {slugTouched && <button type="button" className="btn-quiet btn-md shrink-0" onClick={() => { setSlugTouched(false); set("slug", ""); }}>Auto</button>}
            </div>
          </Field>
          <Field label="Kind">
            <select className="field" value={f.kind} onChange={e => set("kind", e.target.value as FormState["kind"])} disabled={!isNew}>
              <option value="movie">Movie</option>
              <option value="tv">TV series</option>
            </select>
            {!isNew && <p className="mt-1.5 text-[11.5px] text-mist-600">Kind is fixed after creation.</p>}
          </Field>
          <Field label="Year">
            <input type="number" className="field" value={f.year} onChange={e => set("year", e.target.value)} min={1880} max={2100} />
          </Field>
          <Field label="Tagline">
            <input className="field" value={f.tagline} onChange={e => set("tagline", e.target.value)} placeholder="A short evocative line" />
          </Field>
          <Field label={f.kind === "tv" ? "Avg episode runtime (min)" : "Runtime (min)"}>
            <input type="number" className="field" value={f.runtimeMin} onChange={e => set("runtimeMin", e.target.value)} min={0} />
          </Field>
          <Field label="Synopsis" full>
            <textarea className="field min-h-[110px] resize-y" value={f.synopsis} onChange={e => set("synopsis", e.target.value)} placeholder="What is this title about?" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="panel">
        <legend className="panel-title">Classification & scoring</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Genres">
            <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-white/10 bg-ink-950/60 p-2.5">
              {genres.map(g => {
                const on = f.genreSlugs.includes(g.slug);
                return (
                  <button
                    key={g.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set("genreSlugs", on ? f.genreSlugs.filter(x => x !== g.slug) : [...f.genreSlugs, g.slug])}
                    className={cx("rounded-md border px-2.5 py-1 text-[11.5px] font-bold transition-colors",
                      on ? "border-ember-400/60 bg-ember-400/15 text-ember-200" : "border-white/10 text-mist-400 hover:text-white")}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Content rating">
            <input className="field" value={f.contentRating} onChange={e => set("contentRating", e.target.value)} placeholder="NR / PG / TV-PG" />
          </Field>
          <Field label="Rating (0–10)">
            <input type="number" step="0.1" min={0} max={10} className="field" value={f.rating} onChange={e => set("rating", e.target.value)} />
          </Field>
          <Field label="Popularity (0–100)">
            <input type="number" min={0} max={100} className="field" value={f.popularity} onChange={e => set("popularity", e.target.value)} />
          </Field>
          <Field label="Languages" hint="comma-separated BCP-47">
            <input className="field" value={f.languages} onChange={e => set("languages", e.target.value)} placeholder="en, fr" />
          </Field>
          <Field label="Countries" hint="comma-separated ISO">
            <input className="field" value={f.countries} onChange={e => set("countries", e.target.value)} placeholder="US, GB" />
          </Field>
          <Field label="Content tier">
            <select className="field" value={f.contentTier} onChange={e => set("contentTier", e.target.value as FormState["contentTier"])}>
              <option value="production">Production (public domain / licensed)</option>
              <option value="demo">Demo (clearly marked test content)</option>
            </select>
          </Field>
          <Field label="Rights note" full hint="shown on the public detail page">
            <input className="field" value={f.rightsNote} onChange={e => set("rightsNote", e.target.value)} placeholder="e.g. Public domain film hosted on the Internet Archive (identifier: …)" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="panel">
        <legend className="panel-title">People</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Director">
            <input className="field" value={f.director} onChange={e => set("director", e.target.value)} />
          </Field>
          <Field label="Creators" hint="comma-separated, TV">
            <input className="field" value={f.creators} onChange={e => set("creators", e.target.value)} />
          </Field>
          <Field label="Cast" full>
            <div className="space-y-2">
              {f.cast.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input className="field flex-1" value={c.name} placeholder="Actor name" onChange={e => {
                    const next = [...f.cast]; next[i] = { ...c, name: e.target.value }; set("cast", next);
                  }} />
                  <input className="field flex-1" value={c.role ?? ""} placeholder="Role / character" onChange={e => {
                    const next = [...f.cast]; next[i] = { ...c, role: e.target.value }; set("cast", next);
                  }} />
                  <RemoveBtn onClick={() => set("cast", f.cast.filter((_, j) => j !== i))} label={`Remove ${c.name || "cast member"}`} />
                </div>
              ))}
              <AddBtn onClick={() => set("cast", [...f.cast, { name: "", role: "" }])} label="Add cast member" />
            </div>
          </Field>
        </div>
      </fieldset>

      <fieldset className="panel">
        <legend className="panel-title">Artwork & trailer</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Poster URL" hint="authorized CDN image; brand art is rendered when empty">
            <input className="field" value={f.poster} onChange={e => set("poster", e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Backdrop URL">
            <input className="field" value={f.backdrop} onChange={e => set("backdrop", e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Trailer">
            <select className="field" value={f.trailerKind} onChange={e => set("trailerKind", e.target.value as FormState["trailerKind"])}>
              <option value="none">No trailer</option>
              <option value="clip">Clip from a streaming source (time window)</option>
              <option value="file">Standalone file</option>
            </select>
          </Field>
          {f.trailerKind === "clip" && (
            <>
              <Field label="Source">
                <select className="field" value={f.trailerSourceId} onChange={e => set("trailerSourceId", e.target.value)}>
                  <option value="">{f.sources[0] ? `First source (${f.sources[0].quality})` : "— no sources yet —"}</option>
                  {f.sources.map(s => <option key={s.id} value={s.id}>{s.quality} · {s.rights}</option>)}
                </select>
              </Field>
              <Field label="Start (s)">
                <input type="number" className="field" value={f.trailerStart} onChange={e => set("trailerStart", e.target.value)} min={0} />
              </Field>
              <Field label="Duration (s)">
                <input type="number" className="field" value={f.trailerDuration} onChange={e => set("trailerDuration", e.target.value)} min={5} />
              </Field>
            </>
          )}
          {f.trailerKind === "file" && (
            <Field label="Trailer file URL" full>
              <input className="field" value={f.trailerUrl} onChange={e => set("trailerUrl", e.target.value)} placeholder="https://…" />
            </Field>
          )}
        </div>
      </fieldset>

      {f.kind === "movie" && (
        <fieldset className="panel">
          <legend className="panel-title">Streaming sources</legend>
          <p className="mb-3 text-[12.5px] text-mist-500">
            Only attach sources you are authorized to serve. Every source needs a rights declaration; expired or
            source-less titles honestly render “Streaming unavailable”.
          </p>
          <div className="space-y-3">
            {f.sources.map((s, i) => (
              <SourceRow
                key={s.id || i}
                src={s}
                onChange={next => { const arr = [...f.sources]; arr[i] = next; set("sources", arr); }}
                onRemove={() => set("sources", f.sources.filter((_, j) => j !== i))}
              />
            ))}
            <AddBtn onClick={() => set("sources", [...f.sources, emptySource(`src-${Date.now()}-${f.sources.length}`)])} label="Add streaming source" />
          </div>
        </fieldset>
      )}

      <fieldset className="panel">
        <legend className="panel-title">Subtitles & audio (title-level)</legend>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-mist-400">Subtitle tracks</h3>
            <div className="space-y-2">
              {f.subtitles.map((s, i) => (
                <div key={s.id || i} className="flex flex-wrap items-center gap-2">
                  <input className="field h-9 w-20" value={s.lang} placeholder="en" aria-label="Language" onChange={e => { const a = [...f.subtitles]; a[i] = { ...s, lang: e.target.value }; set("subtitles", a); }} />
                  <input className="field h-9 w-32" value={s.label} placeholder="Label" aria-label="Label" onChange={e => { const a = [...f.subtitles]; a[i] = { ...s, label: e.target.value }; set("subtitles", a); }} />
                  <input className="field h-9 min-w-[160px] flex-1" value={s.url} placeholder="/subs/….vtt" aria-label="VTT URL" onChange={e => { const a = [...f.subtitles]; a[i] = { ...s, url: e.target.value }; set("subtitles", a); }} />
                  <RemoveBtn onClick={() => set("subtitles", f.subtitles.filter((_, j) => j !== i))} label="Remove subtitle track" />
                </div>
              ))}
              <AddBtn onClick={() => set("subtitles", [...f.subtitles, { id: `sub-${Date.now()}-${f.subtitles.length}`, lang: "en", label: "English", url: "", kind: "subtitles" }])} label="Add subtitle track" />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-mist-400">Audio tracks</h3>
            <div className="space-y-2">
              {f.audio.map((a2, i) => (
                <div key={a2.id || i} className="flex items-center gap-2">
                  <input className="field h-9 w-20" value={a2.lang} placeholder="en" aria-label="Language" onChange={e => { const a = [...f.audio]; a[i] = { ...a2, lang: e.target.value }; set("audio", a); }} />
                  <input className="field h-9 flex-1" value={a2.label} placeholder="Label" aria-label="Label" onChange={e => { const a = [...f.audio]; a[i] = { ...a2, label: e.target.value }; set("audio", a); }} />
                  <RemoveBtn onClick={() => set("audio", f.audio.filter((_, j) => j !== i))} label="Remove audio track" />
                </div>
              ))}
              <AddBtn onClick={() => set("audio", [...f.audio, { id: `aud-${Date.now()}-${f.audio.length}`, lang: "en", label: "English (original)", default: f.audio.length === 0 }])} label="Add audio track" />
            </div>
          </div>
        </div>
      </fieldset>

      {f.kind === "tv" && <SeasonsEditor slug={effectiveSlug} seasons={f.seasons} onChange={s => set("seasons", s)} />}

      <fieldset className="panel">
        <legend className="panel-title">Promotion flags</legend>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          <Check checked={f.featured} onChange={v => set("featured", v)} label="Featured" />
          <Check checked={f.trending} onChange={v => set("trending", v)} label="Trending" />
          <Check checked={f.newRelease} onChange={v => set("newRelease", v)} label="New release" />
          <Check checked={f.topRated} onChange={v => set("topRated", v)} label="Top rated" />
          <Check checked={f.lumoraPick} onChange={v => set("lumoraPick", v)} label="Lumora pick" />
        </div>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-2.5 pb-10">
        <button type="button" onClick={() => router.push("/admin/titles")} className="btn-quiet btn-md">Cancel</button>
        <button type="submit" disabled={saving} className="btn-ember btn-md gap-2">
          {saving ? "Saving…" : <><IconCheck size={15} /> {isNew ? "Create title" : "Save changes"}</>}
        </button>
      </div>
    </form>
  );
}

/* ---------------- sub-editors ---------------- */

function SeasonsEditor({ slug, seasons, onChange }: { slug: string; seasons: Season[]; onChange: (s: Season[]) => void }) {
  const [openSeason, setOpenSeason] = useState<number | null>(seasons[0]?.number ?? null);

  const addSeason = () => {
    const number = (seasons.at(-1)?.number ?? 0) + 1;
    const next = [...seasons, { number, title: `Season ${number}`, episodes: [emptyEpisode(slug, number, 1)] }];
    onChange(next);
    setOpenSeason(number);
  };

  const updateSeason = (idx: number, patch: Partial<Season>) => {
    const next = [...seasons];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <fieldset className="panel">
      <legend className="panel-title">Seasons & episodes</legend>
      <div className="space-y-3">
        {seasons.map((s, si) => {
          const open = openSeason === s.number;
          return (
            <div key={s.number} className="rounded-xl border border-white/[0.08] bg-ink-950/40">
              <div className="flex flex-wrap items-center gap-2 p-3">
                <button type="button" className="flex flex-1 items-center gap-2.5 text-left" onClick={() => setOpenSeason(open ? null : s.number)} aria-expanded={open}>
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-ember-400/12 font-display text-[13px] font-extrabold text-ember-300">{s.number}</span>
                  <span>
                    <span className="block text-[13.5px] font-bold text-mist-100">{s.title || `Season ${s.number}`}</span>
                    <span className="block text-[11.5px] text-mist-500">{s.episodes.length} episode{s.episodes.length === 1 ? "" : "s"}</span>
                  </span>
                </button>
                <RemoveBtn onClick={() => { if (window.confirm(`Delete season ${s.number} and its episodes?`)) onChange(seasons.filter((_, j) => j !== si)); }} label={`Delete season ${s.number}`} />
              </div>
              {open && (
                <div className="space-y-4 border-t border-white/[0.06] p-3.5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Season title"><input className="field h-9" value={s.title ?? ""} onChange={e => updateSeason(si, { title: e.target.value })} /></Field>
                    <Field label="Year"><input type="number" className="field h-9" value={s.year ?? ""} onChange={e => updateSeason(si, { year: Number(e.target.value) || undefined })} /></Field>
                    <Field label="Synopsis"><input className="field h-9" value={s.synopsis ?? ""} onChange={e => updateSeason(si, { synopsis: e.target.value })} /></Field>
                  </div>
                  <div className="space-y-3">
                    {s.episodes.map((ep, ei) => (
                      <div key={ep.id || ei} className="rounded-lg border border-white/[0.07] bg-ink-900/60 p-3">
                        <div className="mb-2.5 flex items-center gap-2">
                          <span className="chip border-ember-400/30 bg-ember-400/10 text-ember-300">S{s.number} · E{ep.number}</span>
                          <span className="flex-1 truncate font-mono text-[11px] text-mist-600">{ep.id || `${slug}-s${s.number}e${ep.number}`}</span>
                          <RemoveBtn onClick={() => updateSeason(si, { episodes: s.episodes.filter((_, j) => j !== ei) })} label={`Delete episode ${ep.number}`} />
                        </div>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <input className="field h-9" value={ep.title} placeholder="Episode title" aria-label="Episode title" onChange={e => { const eps = [...s.episodes]; eps[ei] = { ...ep, title: e.target.value }; updateSeason(si, { episodes: eps }); }} />
                          <input type="number" className="field h-9" value={Math.round(ep.runtime / 60)} min={0} placeholder="Minutes" aria-label="Runtime in minutes" onChange={e => { const eps = [...s.episodes]; eps[ei] = { ...ep, runtime: (Number(e.target.value) || 0) * 60 }; updateSeason(si, { episodes: eps }); }} />
                          <textarea className="field min-h-[54px] resize-y sm:col-span-2" value={ep.synopsis} placeholder="Episode synopsis" aria-label="Episode synopsis" onChange={e => { const eps = [...s.episodes]; eps[ei] = { ...ep, synopsis: e.target.value }; updateSeason(si, { episodes: eps }); }} />
                        </div>
                        <div className="mt-2.5 space-y-2">
                          {ep.streamingSources.map((src, sri) => (
                            <SourceRow
                              key={src.id || sri}
                              compact
                              src={src}
                              onChange={next => {
                                const srcs = [...ep.streamingSources]; srcs[sri] = next;
                                const eps = [...s.episodes]; eps[ei] = { ...ep, streamingSources: srcs };
                                updateSeason(si, { episodes: eps });
                              }}
                              onRemove={() => {
                                const eps = [...s.episodes];
                                eps[ei] = { ...ep, streamingSources: ep.streamingSources.filter((_, j) => j !== sri) };
                                updateSeason(si, { episodes: eps });
                              }}
                            />
                          ))}
                          <AddBtn
                            small
                            onClick={() => {
                              const eps = [...s.episodes];
                              eps[ei] = { ...ep, streamingSources: [...ep.streamingSources, emptySource(`src-${Date.now()}-${sri0(ep)}`)] };
                              updateSeason(si, { episodes: eps });
                            }}
                            label="Add episode source"
                          />
                        </div>
                      </div>
                    ))}
                    <AddBtn onClick={() => {
                      const number = (s.episodes.at(-1)?.number ?? 0) + 1;
                      updateSeason(si, { episodes: [...s.episodes, emptyEpisode(slug, s.number, number)] });
                    }} label="Add episode" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <AddBtn onClick={addSeason} label="Add season" />
      </div>
    </fieldset>
  );
}

const sri0 = (ep: Episode) => ep.streamingSources.length;

function SourceRow({ src, onChange, onRemove, compact }: { src: StreamingSource; onChange: (s: StreamingSource) => void; onRemove: () => void; compact?: boolean }) {
  return (
    <div className={cx("rounded-lg border border-white/[0.07] bg-ink-950/50 p-3", compact && "p-2.5")}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input className="field h-9 lg:col-span-2" value={src.url} placeholder="https://archive.org/download/… (authorized source URL)" aria-label="Source URL" onChange={e => onChange({ ...src, url: e.target.value })} />
        <input className="field h-9" value={src.quality} placeholder="Quality label" aria-label="Quality label" onChange={e => onChange({ ...src, quality: e.target.value })} />
        <div className="flex gap-2">
          <input type="number" className="field h-9 w-full" value={src.height ?? ""} placeholder="Height px" aria-label="Vertical resolution" onChange={e => onChange({ ...src, height: Number(e.target.value) || undefined })} />
          <select className="field h-9 w-24 shrink-0" value={src.type} aria-label="Container type" onChange={e => onChange({ ...src, type: e.target.value as StreamingSource["type"] })}>
            <option value="mp4">mp4</option>
            <option value="hls">hls</option>
            <option value="dash">dash</option>
          </select>
        </div>
        <select className="field h-9" value={src.rights} aria-label="Rights basis" onChange={e => onChange({ ...src, rights: e.target.value as RightsKind })}>
          {RIGHTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <input className="field h-9" value={src.attribution ?? ""} placeholder="Attribution line (CC)" aria-label="Attribution" onChange={e => onChange({ ...src, attribution: e.target.value })} />
        <input className="field h-9" type="date" value={src.expiresAt?.slice(0, 10) ?? ""} aria-label="Expires at" onChange={e => onChange({ ...src, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
        <div className="flex items-center justify-end">
          <RemoveBtn onClick={onRemove} label="Remove source" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- micro components ---------------- */

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={cx("block", full && "sm:col-span-2 lg:col-span-4")}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-mist-600">{hint}</span>}
    </label>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-white/[0.08] bg-ink-950/40 px-3 py-2.5 text-[12.5px] font-bold text-mist-300 transition-colors hover:border-white/20">
      <input type="checkbox" className="h-4 w-4 accent-ember-400" checked={checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function AddBtn({ onClick, label, small }: { onClick: () => void; label: string; small?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cx("btn-ghost w-full justify-center gap-2 border-dashed", small ? "btn-sm" : "btn-md")}>
      <IconPlus size={14} /> {label}
    </button>
  );
}

function RemoveBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="btn-quiet btn-sm shrink-0 text-red-300/80 hover:bg-red-400/10 hover:text-red-200" title={label} aria-label={label}>
      <IconTrash size={14} />
    </button>
  );
}
