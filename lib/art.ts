/**
 * Deterministic SVG artwork generator (shared: used by the /api/art route).
 *
 * Pure shapes + gradients — all typography is rendered as HTML on top by the
 * TitleArt component, so brand fonts are always real fonts.
 */
import { genreBySlug } from "@/lib/genres";

export type ArtVariant = "poster" | "backdrop" | "still" | "hero";

const DIMS: Record<ArtVariant, { w: number; h: number }> = {
  poster: { w: 600, h: 900 },
  backdrop: { w: 1600, h: 900 },
  still: { w: 640, h: 360 },
  hero: { w: 1920, h: 1080 },
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MOTIFS = ["orbit", "blinds", "peaks", "spotlight", "skyline", "spiral", "waves", "blobs", "stars", "curtain", "mesa", "glitch"] as const;
type Motif = (typeof MOTIFS)[number];

const GENRE_MOTIF: Record<string, Motif[]> = {
  horror: ["spiral", "blinds", "stars"],
  thriller: ["blinds", "skyline", "spiral"],
  mystery: ["blinds", "skyline", "spiral"],
  crime: ["skyline", "blinds", "spotlight"],
  scifi: ["orbit", "stars", "glitch"],
  comedy: ["blobs", "curtain", "waves"],
  romance: ["waves", "spotlight", "curtain"],
  drama: ["spotlight", "peaks", "waves"],
  action: ["peaks", "orbit", "mesa"],
  adventure: ["peaks", "mesa", "orbit"],
  animation: ["blobs", "stars", "waves"],
  family: ["blobs", "curtain", "peaks"],
  documentary: ["peaks", "waves", "skyline"],
  western: ["mesa", "peaks", "spotlight"],
  musical: ["curtain", "spotlight", "waves"],
  fantasy: ["spiral", "orbit", "stars"],
  cult: ["glitch", "spiral", "blobs"],
};

interface ArtSeed {
  hue: number;
  motif: Motif;
  flip: boolean;
  density: number;
  glowX: number;
  glowY: number;
  accent: number;
}

function seedArt(seedStr: string, genres: string[]): ArtSeed {
  const h = hash(seedStr);
  const rnd = mulberry32(h);
  const primary = genreBySlug.get(genres[0] ?? "");
  const baseHue = primary?.hue ?? Math.floor(rnd() * 360);
  const candidates = GENRE_MOTIF[genres[0] ?? ""] ?? [...MOTIFS];
  return {
    hue: (baseHue + (rnd() * 26 - 13) + 360) % 360,
    motif: candidates[Math.floor(rnd() * candidates.length)],
    flip: rnd() > 0.5,
    density: 0.5 + rnd() * 0.5,
    glowX: 20 + rnd() * 60,
    glowY: 12 + rnd() * 40,
    accent: (baseHue + 38 + rnd() * 20) % 360,
  };
}

const n2 = (x: number) => Math.round(x * 10) / 10;

function motifShapes(seed: ArtSeed, s: string, w: number, h: number): string {
  const rnd = mulberry32(hash(s + seed.motif));
  const dark = `hsl(${n2(seed.hue)} 42% 7%)`;
  const mid = `hsl(${n2(seed.hue)} 48% 16%)`;
  const rim = `hsl(${n2(seed.accent)} 85% 62%)`;
  const cy = h * 0.52;
  const cx = w * (seed.flip ? 0.34 : 0.66);
  const unit = Math.min(w, h);
  const out: string[] = [];

  switch (seed.motif) {
    case "orbit": {
      const r = unit * 0.16 * seed.density + unit * 0.06;
      const rot = n2(-16 + rnd() * 10);
      out.push(
        `<g opacity="0.95">`,
        `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r)}" fill="url(#planet-${s})"/>`,
        `<circle cx="${n2(cx - r * 0.4)}" cy="${n2(cy - r * 0.45)}" r="${n2(r * 0.82)}" fill="${dark}" opacity="0.55"/>`,
        `<ellipse cx="${n2(cx)}" cy="${n2(cy)}" rx="${n2(r * 1.9)}" ry="${n2(r * 0.5)}" fill="none" stroke="${rim}" stroke-width="${n2(unit * 0.006)}" opacity="0.7" transform="rotate(${rot} ${n2(cx)} ${n2(cy)})"/>`,
        `<ellipse cx="${n2(cx)}" cy="${n2(cy)}" rx="${n2(r * 2.5)}" ry="${n2(r * 0.68)}" fill="none" stroke="${mid}" stroke-width="${n2(unit * 0.004)}" opacity="0.8" transform="rotate(${rot} ${n2(cx)} ${n2(cy)})"/>`,
        `<circle cx="${n2(cx + r * 1.9)}" cy="${n2(cy - r * 0.5)}" r="${n2(unit * 0.012)}" fill="${rim}" opacity="0.9"/>`,
        `</g>`
      );
      break;
    }
    case "blinds": {
      const count = 5 + Math.floor(rnd() * 3);
      const bandW = w / (count * 1.9);
      const rot = seed.flip ? 16 : -16;
      out.push(`<g opacity="0.85">`);
      for (let i = 0; i < count; i++) {
        const x = n2(-w * 0.2 + i * (bandW * 1.9) + rnd() * bandW * 0.4);
        const bw = n2(bandW * (0.5 + rnd() * 0.8));
        out.push(`<rect x="${x}" y="${n2(-h * 0.1)}" width="${bw}" height="${n2(h * 1.3)}" fill="url(#beam-${s})" transform="rotate(${rot} ${n2(w / 2)} ${n2(h / 2)})" opacity="${n2(0.3 + rnd() * 0.4)}"/>`);
      }
      out.push(`</g>`);
      break;
    }
    case "peaks": {
      out.push(`<g>`);
      for (let i = 0; i < 3; i++) {
        const yBase = h * (0.62 + i * 0.11);
        const pts: string[] = [`0,${n2(h)}`, `0,${n2(yBase)}`];
        const steps = 5 + i;
        for (let j = 0; j <= steps; j++) {
          const x = (w / steps) * j;
          const y = yBase - Math.abs(Math.sin(j * 1.7 + i * 2.2 + rnd())) * unit * (0.16 - i * 0.035);
          pts.push(`${n2(x)},${n2(y)}`);
        }
        pts.push(`${n2(w)},${n2(yBase)}`, `${n2(w)},${n2(h)}`);
        out.push(`<polygon points="${pts.join(" ")}" fill="${i === 0 ? mid : dark}" opacity="${n2(0.55 + i * 0.22)}"/>`);
      }
      out.push(`<circle cx="${n2(w * (seed.flip ? 0.72 : 0.28))}" cy="${n2(h * 0.24)}" r="${n2(unit * 0.07)}" fill="url(#sun-${s})"/>`, `</g>`);
      break;
    }
    case "spotlight": {
      out.push(
        `<g opacity="0.9">`,
        `<polygon points="${n2(w * 0.5)},${n2(-h * 0.1)} ${n2(w * 0.14)},${n2(h * 1.05)} ${n2(w * 0.86)},${n2(h * 1.05)}" fill="url(#spot-${s})" opacity="0.5"/>`,
        `<polygon points="${n2(w * 0.5)},${n2(-h * 0.1)} ${n2(w * 0.32)},${n2(h * 1.05)} ${n2(w * 0.68)},${n2(h * 1.05)}" fill="url(#spot-${s})" opacity="0.55"/>`,
        `<ellipse cx="${n2(w * 0.5)}" cy="${n2(h * 0.92)}" rx="${n2(w * 0.3)}" ry="${n2(unit * 0.03)}" fill="${rim}" opacity="0.16"/>`,
        `</g>`
      );
      break;
    }
    case "skyline": {
      const count = 9 + Math.floor(rnd() * 6);
      const bw = w / count;
      out.push(`<g>`);
      for (let i = 0; i < count; i++) {
        const bh = h * (0.18 + rnd() * 0.38);
        const x = i * bw;
        const lit = rnd() > 0.55;
        out.push(`<rect x="${n2(x + bw * 0.08)}" y="${n2(h - bh)}" width="${n2(bw * 0.84)}" height="${n2(bh)}" fill="${i % 2 ? mid : dark}" opacity="0.9"/>`);
        if (lit) {
          for (let k = 0; k < 3; k++) {
            out.push(`<rect x="${n2(x + bw * (0.22 + (k % 2) * 0.34))}" y="${n2(h - bh + bh * (0.12 + k * 0.22))}" width="${n2(bw * 0.12)}" height="${n2(bh * 0.06)}" fill="${rim}" opacity="0.5"/>`);
          }
        }
      }
      out.push(`<rect x="0" y="${n2(h * 0.97)}" width="${n2(w)}" height="${n2(h * 0.03)}" fill="${dark}"/>`, `</g>`);
      break;
    }
    case "spiral": {
      const rings = 5 + Math.floor(rnd() * 3);
      out.push(`<g opacity="0.9">`);
      for (let i = 0; i < rings; i++) {
        const dash = rnd() > 0.6 ? ` stroke-dasharray="${n2(unit * 0.06)} ${n2(unit * 0.05)}"` : "";
        out.push(`<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(unit * (0.05 + i * 0.055) * seed.density)}" fill="none" stroke="${i % 2 ? rim : mid}" stroke-width="${n2(unit * 0.004)}" opacity="${n2(0.55 - i * 0.05)}"${dash}/>`);
      }
      out.push(`<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(unit * 0.02)}" fill="${rim}" opacity="0.8"/>`, `</g>`);
      break;
    }
    case "waves": {
      out.push(`<g opacity="0.85">`);
      for (let i = 0; i < 6; i++) {
        const y = h * (0.3 + i * 0.11);
        const amp = unit * (0.03 + rnd() * 0.03);
        out.push(`<path d="M 0 ${n2(y)} Q ${n2(w * 0.25)} ${n2(y - amp)} ${n2(w * 0.5)} ${n2(y)} T ${n2(w)} ${n2(y)}" fill="none" stroke="${i % 2 ? rim : mid}" stroke-width="${n2(unit * (0.005 + rnd() * 0.004))}" opacity="${n2(0.5 - i * 0.05)}"/>`);
      }
      out.push(`</g>`);
      break;
    }
    case "blobs": {
      const count = 7 + Math.floor(rnd() * 5);
      out.push(`<g opacity="0.85">`);
      for (let i = 0; i < count; i++) {
        out.push(`<circle cx="${n2(w * (0.12 + rnd() * 0.76))}" cy="${n2(h * (0.15 + rnd() * 0.6))}" r="${n2(unit * (0.02 + rnd() * 0.09))}" fill="${i % 3 === 0 ? rim : mid}" opacity="${n2(0.14 + rnd() * 0.3)}"/>`);
      }
      out.push(`</g>`);
      break;
    }
    case "stars": {
      const count = 46 + Math.floor(rnd() * 40);
      out.push(`<g>`);
      for (let i = 0; i < count; i++) {
        out.push(`<circle cx="${n2(rnd() * w)}" cy="${n2(rnd() * h * 0.85)}" r="${n2(unit * 0.0016 * (0.6 + rnd()))}" fill="${rnd() > 0.7 ? rim : "#fff"}" opacity="${n2(0.25 + rnd() * 0.6)}"/>`);
      }
      out.push(
        `<ellipse cx="${n2(cx)}" cy="${n2(cy)}" rx="${n2(unit * 0.13)}" ry="${n2(unit * 0.13)}" fill="url(#planet-${s})" opacity="0.9"/>`,
        `<path d="M ${n2(w * 0.15)} ${n2(h * 0.18)} l ${n2(unit * 0.09)} ${n2(unit * 0.045)}" stroke="${rim}" stroke-width="${n2(unit * 0.004)}" opacity="0.7" stroke-linecap="round"/>`,
        `</g>`
      );
      break;
    }
    case "curtain": {
      const folds = 6;
      out.push(`<g opacity="0.92">`);
      for (let i = 0; i < folds; i++) {
        out.push(`<path d="M ${n2((w / folds) * i)} 0 Q ${n2((w / folds) * (i + 0.5))} ${n2(h * 0.1)} ${n2((w / folds) * (i + 1))} 0 L ${n2((w / folds) * (i + 1))} ${n2(h)} Q ${n2((w / folds) * (i + 0.5))} ${n2(h * 0.9)} ${n2((w / folds) * i)} ${n2(h)} Z" fill="${i % 2 ? mid : dark}" opacity="${n2(0.5 + (i % 2) * 0.3)}"/>`);
      }
      out.push(`<circle cx="${n2(w * 0.5)}" cy="${n2(h * 0.42)}" r="${n2(unit * 0.09)}" fill="url(#sun-${s})" opacity="0.85"/>`, `</g>`);
      break;
    }
    case "mesa": {
      out.push(
        `<g>`,
        `<circle cx="${n2(w * 0.5)}" cy="${n2(h * 0.4)}" r="${n2(unit * 0.16)}" fill="url(#sun-${s})" opacity="0.95"/>`,
        `<path d="M 0 ${n2(h * 0.78)} L ${n2(w * 0.18)} ${n2(h * 0.78)} L ${n2(w * 0.22)} ${n2(h * 0.58)} L ${n2(w * 0.38)} ${n2(h * 0.58)} L ${n2(w * 0.42)} ${n2(h * 0.78)} L ${n2(w * 0.66)} ${n2(h * 0.78)} L ${n2(w * 0.7)} ${n2(h * 0.5)} L ${n2(w * 0.86)} ${n2(h * 0.5)} L ${n2(w * 0.9)} ${n2(h * 0.78)} L ${n2(w)} ${n2(h * 0.78)} L ${n2(w)} ${n2(h)} L 0 ${n2(h)} Z" fill="${dark}" opacity="0.95"/>`,
        `<rect x="0" y="${n2(h * 0.78)}" width="${n2(w)}" height="${n2(h * 0.02)}" fill="${rim}" opacity="0.25"/>`,
        `</g>`
      );
      break;
    }
    case "glitch": {
      const count = 8 + Math.floor(rnd() * 6);
      out.push(`<g opacity="0.8">`);
      for (let i = 0; i < count; i++) {
        out.push(`<rect x="${n2(rnd() * w * 0.4)}" y="${n2(rnd() * h)}" width="${n2(w * (0.2 + rnd() * 0.7))}" height="${n2(unit * (0.004 + rnd() * 0.02))}" fill="${i % 3 === 0 ? rim : mid}" opacity="${n2(0.2 + rnd() * 0.45)}"/>`);
      }
      out.push(`<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(unit * 0.1)}" fill="none" stroke="${rim}" stroke-width="${n2(unit * 0.006)}" opacity="0.7"/>`, `</g>`);
      break;
    }
  }
  return out.join("");
}

export function buildArtSvg(seedStr: string, genres: string[], variant: ArtVariant, opts?: { typeOpacity?: number }): string {
  const seedKey = `${seedStr}:${variant}`;
  const s = seedKey.replace(/[^a-z0-9:-]/gi, "");
  const art = seedArt(seedStr, genres);
  const { w, h } = DIMS[variant];
  const hue = n2(art.hue);
  const accent = n2(art.accent);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="bg-${s}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="hsl(${hue} 52% 11%)"/>
<stop offset="55%" stop-color="hsl(${hue} 45% 6.5%)"/>
<stop offset="100%" stop-color="hsl(${n2((art.hue + 30) % 360)} 40% 4%)"/>
</linearGradient>
<radialGradient id="glow-${s}" cx="${n2(art.glowX)}%" cy="${n2(art.glowY)}%" r="72%">
<stop offset="0%" stop-color="hsl(${accent} 90% 58%)" stop-opacity="0.34"/>
<stop offset="55%" stop-color="hsl(${hue} 70% 40%)" stop-opacity="0.1"/>
<stop offset="100%" stop-color="hsl(${hue} 70% 40%)" stop-opacity="0"/>
</radialGradient>
<radialGradient id="planet-${s}" cx="34%" cy="30%" r="80%">
<stop offset="0%" stop-color="hsl(${accent} 80% 58%)"/>
<stop offset="60%" stop-color="hsl(${hue} 55% 26%)"/>
<stop offset="100%" stop-color="hsl(${hue} 50% 8%)"/>
</radialGradient>
<radialGradient id="sun-${s}" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="hsl(${accent} 95% 72%)"/>
<stop offset="70%" stop-color="hsl(${accent} 85% 52%)" stop-opacity="0.85"/>
<stop offset="100%" stop-color="hsl(${accent} 80% 45%)" stop-opacity="0"/>
</radialGradient>
<linearGradient id="beam-${s}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="hsl(${accent} 90% 70%)" stop-opacity="0.5"/>
<stop offset="100%" stop-color="hsl(${accent} 90% 70%)" stop-opacity="0"/>
</linearGradient>
<linearGradient id="spot-${s}" x1="0.5" y1="0" x2="0.5" y2="1">
<stop offset="0%" stop-color="hsl(${accent} 92% 76%)" stop-opacity="0.5"/>
<stop offset="100%" stop-color="hsl(${accent} 92% 76%)" stop-opacity="0.04"/>
</linearGradient>
<linearGradient id="vig-${s}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#000" stop-opacity="0.1"/>
<stop offset="55%" stop-color="#000" stop-opacity="0"/>
<stop offset="100%" stop-color="#000" stop-opacity="0.5"/>
</linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#bg-${s})"/>
<rect width="${w}" height="${h}" fill="url(#glow-${s})"/>
${motifShapes(art, s, w, h)}
<rect width="${w}" height="${h}" fill="url(#vig-${s})"/>
</svg>`;
}

export const ART_DIMS = DIMS;
