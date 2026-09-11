import Link from "next/link";
import { cx } from "@/lib/format";

/**
 * Original Lumora brand mark: a projector "aperture" ring with a play triangle
 * and three light beams leaving it. Paired with the LUMORA wordmark set in the
 * display face with wide tracking.
 */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  const id = "lm-grad";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={id} x1="6" y1="4" x2="30" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFDC95" />
          <stop offset="0.5" stopColor="#F5A623" />
          <stop offset="1" stopColor="#E07A0C" />
        </linearGradient>
      </defs>
      <circle cx="17" cy="20" r="12.4" stroke={`url(#${id})`} strokeWidth="2.6" />
      <path d="M13.6 13.9c0-.9 1-1.47 1.78-.99l9.4 5.9a1.15 1.15 0 0 1 0 1.97l-9.4 5.9a1.15 1.15 0 0 1-1.78-1V13.9Z" fill={`url(#${id})`} />
      <path d="M33.5 12.5h4.2M35.2 20h3.6M33.5 27.5h4.2" stroke={`url(#${id})`} strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export default function Logo({
  withWordmark = true,
  className,
  markSize = 28,
  href = "/",
}: {
  withWordmark?: boolean;
  className?: string;
  markSize?: number;
  href?: string;
}) {
  return (
    <Link href={href} className={cx("group inline-flex items-center gap-2.5", className)} aria-label="Lumora — home">
      <LogoMark size={markSize} className="transition-transform duration-500 ease-cinema group-hover:rotate-[8deg]" />
      {withWordmark && (
        <span className="font-display text-[1.07rem] font-extrabold uppercase tracking-[0.26em] text-mist-50">
          Lumo<span className="text-gradient-ember">ra</span>
        </span>
      )}
    </Link>
  );
}
