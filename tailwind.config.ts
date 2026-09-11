import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050508",
          900: "#0A0A10",
          850: "#101018",
          800: "#16161F",
          700: "#1F1F2B",
          600: "#2C2C3B",
          500: "#3D3D4F",
        },
        mist: {
          50: "#F7F7FA",
          100: "#EDEDF2",
          200: "#D8D8E2",
          300: "#B4B4C4",
          400: "#8A8A9E",
          500: "#6A6A7E",
          600: "#4E4E5F",
        },
        ember: {
          50: "#FFF8EC",
          100: "#FFEDCB",
          200: "#FFDC95",
          300: "#FFC65C",
          400: "#F5A623",
          500: "#E08A0C",
          600: "#B96C06",
          700: "#8C5008",
          800: "#5E3609",
          900: "#331D07",
        },
        // Single accent hue + one supporting signal colour. No multi-hue "rainbow"
        // gradients anywhere in the UI.
        signal: {
          DEFAULT: "#4FD1C5",
          dim: "#2A8C84",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "0.75rem",
        xl2: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245,166,35,0.35), 0 8px 40px -8px rgba(245,166,35,0.35)",
        lift: "0 24px 60px -20px rgba(0,0,0,0.9)",
        card: "0 12px 32px -12px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "hero-scrim":
          "linear-gradient(to top, #050508 0%, rgba(5,5,8,0.92) 22%, rgba(5,5,8,0.55) 48%, rgba(5,5,8,0.15) 72%, rgba(5,5,8,0.35) 100%)",
        "rail-fade-l": "linear-gradient(to right, #050508 0%, rgba(5,5,8,0) 100%)",
        "rail-fade-r": "linear-gradient(to left, #050508 0%, rgba(5,5,8,0) 100%)",
      },
      transitionTimingFunction: {
        cinema: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translate3d(0, 14px, 0)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translate3d(24px, 0, 0)" },
          to: { opacity: "1", transform: "none" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "ken-burns": {
          from: { transform: "scale(1.04) translate3d(0,0,0)" },
          to: { transform: "scale(1.14) translate3d(0,-1.5%,0)" },
        },
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-8px,0)" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.28s cubic-bezier(0.22,1,0.36,1) both",
        "slide-in-right": "slide-in-right 0.45s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.6s linear infinite",
        "ken-burns": "ken-burns 18s ease-out both",
        drift: "drift 7s ease-in-out infinite",
        "spin-slow": "spin-slow 1.1s linear infinite",
      },
      screens: { xs: "420px" },
    },
  },
  plugins: [],
};

export default config;
