import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Lumora — public-domain classics and open-license cinema, streaming legally";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Brand OG card — pure vector/typographic (no external assets, no copyrighted
 * imagery), rendered by next/og with its bundled default font.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b0b12 0%, #14141f 55%, #1a1207 100%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          color: "#f4f1ea",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #ffc46b, #f5a623)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
              color: "#0b0b12",
            }}
          >
            L
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: 6 }}>LUMORA</span>
            <span style={{ fontSize: 18, color: "#a8a3b8", letterSpacing: 2 }}>PREMIUM LEGAL STREAMING</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
            The public-domain canon,
            <br />
            <span style={{ color: "#f5a623" }}>streamed like it's 2026.</span>
          </span>
          <span style={{ fontSize: 24, color: "#c9c5d6", lineHeight: 1.5, maxWidth: 900 }}>
            Nosferatu · The General · Charade · Dragnet · Night of the Living Dead — every stream with a declared
            rights basis. No source, no stream.
          </span>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 18, color: "#a8a3b8" }}>
          <span style={{ border: "1px solid #3a3a4a", borderRadius: 999, padding: "8px 20px" }}>4K-ready player</span>
          <span style={{ border: "1px solid #3a3a4a", borderRadius: 999, padding: "8px 20px" }}>Subtitles & speeds</span>
          <span style={{ border: "1px solid #3a3a4a", borderRadius: 999, padding: "8px 20px" }}>Resume anywhere</span>
        </div>
      </div>
    ),
    size
  );
}
