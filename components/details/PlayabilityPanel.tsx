import type { AudioTrack, StreamingSource, SubtitleTrack } from "@/lib/types";
import { playableSources } from "@/lib/format";
import { IconAudio, IconCaptions, IconAlert, IconShield } from "@/components/icons";

function SourceChip({ s }: { s: StreamingSource }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[12px] font-semibold text-mist-200">
      <span className="font-mono text-[11px] font-bold text-ember-300">{s.quality}</span>
      <span className="text-mist-500">·</span>
      <span className="uppercase text-mist-400 text-[10.5px] tracking-wider">{s.type === "hls" ? "HLS adaptive" : s.type}</span>
    </span>
  );
}

export function PlayabilityPanel({
  sources,
  subtitles,
  audioTracks,
  rightsNote,
  attribution,
}: {
  sources: StreamingSource[];
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
  rightsNote: string;
  attribution?: string;
}) {
  const live = playableSources(sources);

  return (
    <section aria-label="Playback options and rights" className="space-y-5">
      <div className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-5">
        <h3 className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-mist-400">Available on this title</h3>
        <dl className="space-y-3.5 text-sm">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <dt className="flex w-32 shrink-0 items-center gap-2 text-mist-400"><IconShield size={15} className="text-ember-400" /> Qualities</dt>
            <dd className="flex flex-1 flex-wrap gap-2">
              {live.length > 0 ? live.map(s => <SourceChip key={s.id} s={s} />) : (
                <span className="flex items-center gap-2 text-mist-500"><IconAlert size={14} className="text-ember-400" /> Streaming unavailable — no authorized source configured</span>
              )}
            </dd>
          </div>
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <dt className="flex w-32 shrink-0 items-center gap-2 text-mist-400"><IconAudio size={15} className="text-ember-400" /> Audio</dt>
            <dd className="flex-1 text-mist-200">
              {audioTracks.length ? audioTracks.map(a => a.label).join(", ") : "Original audio"}
            </dd>
          </div>
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <dt className="flex w-32 shrink-0 items-center gap-2 text-mist-400"><IconCaptions size={15} className="text-ember-400" /> Subtitles</dt>
            <dd className="flex-1 text-mist-200">
              {subtitles.length > 0
                ? subtitles.map(s => `${s.label}${s.default ? " (default)" : ""}`).join(", ")
                : <span className="text-mist-500">No subtitles for this presentation</span>}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl2 border border-signal/15 bg-signal/[0.04] p-5">
        <h3 className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-signal">
          <IconShield size={14} /> Rights & provenance
        </h3>
        <p className="text-[13px] leading-relaxed text-mist-300">{rightsNote}</p>
        {attribution && <p className="mt-2 text-[12px] font-semibold text-mist-400">{attribution}</p>}
      </div>
    </section>
  );
}
