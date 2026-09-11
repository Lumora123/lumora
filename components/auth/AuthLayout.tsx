import Link from "next/link";
import Logo from "@/components/brand/Logo";
import TitleArt from "@/components/art/TitleArt";

export default function AuthLayout({
  heading,
  sub,
  children,
  asideSeed = "auth-panel",
}: {
  heading: string;
  sub?: string;
  children: React.ReactNode;
  asideSeed?: string;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* form side */}
      <div className="flex flex-col px-4 pb-16 pt-6 sm:px-10 lg:justify-center">
        <div className="mb-10 lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-extrabold uppercase leading-tight text-mist-50">
            {heading}
          </h1>
          {sub && <p className="mt-2.5 text-[14px] leading-relaxed text-mist-400">{sub}</p>}
          <div className="mt-8">{children}</div>
          <p className="mt-10 text-center text-[12px] text-mist-600">
            By continuing you agree to Lumora&apos;s{" "}
            <Link href="/terms" className="text-mist-400 underline-offset-2 hover:text-ember-300 hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-mist-400 underline-offset-2 hover:text-ember-300 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* brand side */}
      <div className="relative hidden overflow-hidden lg:block" aria-hidden="true">
        <TitleArt seed={asideSeed} title="Lumora" genres={["drama"]} variant="backdrop" bare className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/45 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Logo />
          <div className="max-w-md">
            <p className="font-display text-3xl font-extrabold leading-tight text-mist-50">
              Stories, <span className="text-gradient-ember">illuminated.</span>
            </p>
            <p className="mt-4 text-[14.5px] leading-relaxed text-mist-300">
              One account for watchlists, resume-anywhere playback and recommendations
              across a catalog of legally streamable cinema — from silent-era masterpieces
              to open-movie animation.
            </p>
            <ul className="mt-6 space-y-2 text-[13px] font-semibold text-mist-300">
              <li className="flex items-center gap-2.5"><Dot /> Continue watching on any device</li>
              <li className="flex items-center gap-2.5"><Dot /> My List synced to your account</li>
              <li className="flex items-center gap-2.5"><Dot /> Recommendations tuned to your taste</li>
            </ul>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-mist-600">
            Public domain · Creative Commons · Authorized streams only
          </p>
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-ember-400" />;
}
