import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import HeaderShell from "@/components/layout/HeaderShell";
import Footer from "@/components/layout/Footer";
import { popularSearches } from "@/lib/queries";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Lumora — Stories, Illuminated",
    template: "%s · Lumora",
  },
  description:
    "Lumora is an independent streaming platform for legally available cinema: public-domain classics, Creative Commons open movies and original demo showcases. Browse movies and series, watch trailers, and stream with subtitles and quality selection — free, authorized, and beautifully presented.",
  keywords: ["streaming", "public domain movies", "free legal movies", "classic cinema", "open movies", "TV series"],
  openGraph: {
    type: "website",
    siteName: "Lumora",
    title: "Lumora — Stories, Illuminated",
    description:
      "A premium streaming showcase of legally available cinema — public-domain classics, CC-licensed open movies and original demo content.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumora — Stories, Illuminated",
    description: "Premium streaming of legally available cinema.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searches = popularSearches();
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">
        <StoreProvider>
          <HeaderShell popularSearches={searches} />
          <main id="main" className="min-h-[60svh]">
            {children}
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
