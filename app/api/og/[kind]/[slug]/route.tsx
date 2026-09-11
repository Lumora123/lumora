import { ImageResponse } from "next/og";
import { getTitleBySlug } from "@/lib/queries";
import { genreNames } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const W = 1200;
const H = 630;

/**
 * Per-title Open Graph card. Pure typography + brand gradient — no third-party
 * artwork, no actor likenesses, nothing we don't have rights to render.
 */
export async function GET(_req: Request, { params }: { params: { kind: string; slug: string } }) {
  const kind = params.kind === "tv" ? "tv" : "movie";
  const t = getTitleBySlug(params.slug, kind);

  if (!t) {
    return new ImageResponse(
      (
        <Shell eyebrow="LUMORA" heading="Title not found" sub="This title is not in the Lumora catalog." chips={[]} />
      ),
      { width: W, height: H }
    );
  }

  const chips = [
    `${t.year}`,
    kind === "movie" ? "Movie" : t.seasons ? `${t.seasons.length} season${t.seasons.length === 1 ? "" : "s"}` : "Series",
    `Rating ${t.rating.toFixed(1)}/10`,
    t.contentRating,
    genreNames(t.genres),
  ].filter(Boolean);

  return new ImageResponse(
    (
      <Shell
        eyebrow={t.contentTier === "demo" ? "LUMORA · DEMO SHOWCASE" : "LUMORA · LEGALLY STREAMING"}
        heading={t.title}
        sub={t.tagline || t.synopsis.slice(0, 168)}
        chips={chips}
      />
    ),
    { width: W, height: H }
  );
}

function Shell({ eyebrow, heading, sub, chips }: { eyebrow: string; heading: string; sub: string; chips: string[] }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #0b0b12 0%, #15151f 50%, #1d1408 100%)",
        padding: "64px 72px",
        fontFamily: "sans-serif",
        color: "#f4f1ea",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 13,
            background: "linear-gradient(135deg, #ffc46b, #f5a623)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 800,
            color: "#0b0b12",
          }}
        >
          L
        </div>
        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: 4, color: "#a8a3b8" }}>{eyebrow}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: heading.length > 26 ? 58 : 70, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1 }}>
          {heading}
        </span>
        <span style={{ fontSize: 23, color: "#c9c5d6", lineHeight: 1.5, maxWidth: 940 }}>{sub}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {chips.map(c => (
          <span
            key={c}
            style={{
              display: "flex",
              border: "1px solid #3a3a4a",
              borderRadius: 999,
              padding: "8px 18px",
              fontSize: 17,
              color: "#c9c5d6",
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
