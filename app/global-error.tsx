"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0b12", color: "#f4f1ea", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center" }}>
          <div style={{ maxWidth: 420 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: "#f5a623" }}>
              Lumora
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, textTransform: "uppercase", margin: "0.6rem 0" }}>
              The projector jammed
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#a8a3b8" }}>
              A critical error took the app shell down. Try resetting — if it keeps happening, reload the page.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={reset}
                style={{ background: "#f5a623", color: "#0b0b12", fontWeight: 800, border: 0, borderRadius: 10, padding: "10px 22px", cursor: "pointer" }}
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{ background: "transparent", color: "#f4f1ea", fontWeight: 700, border: "1px solid #3a3a4a", borderRadius: 10, padding: "10px 22px", cursor: "pointer" }}
              >
                Reload
              </button>
            </div>
            {error.digest && <p style={{ marginTop: 16, fontSize: 11, color: "#6b6780", fontFamily: "monospace" }}>ref: {error.digest}</p>}
          </div>
        </main>
      </body>
    </html>
  );
}
