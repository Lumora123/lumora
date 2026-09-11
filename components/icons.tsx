import type { SVGProps } from "react";

/**
 * Original Lumora icon set — 24px grid, 1.8 stroke, rounded caps.
 * Hand-authored paths (no third-party icon font/library).
 */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...p }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...p}
    >
      {children}
    </svg>
  );
}

export const IconPlay = (p: P) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M7 4.8c0-.94 1.03-1.51 1.82-1.02l11.05 6.9a1.2 1.2 0 0 1 0 2.03l-11.05 6.9A1.2 1.2 0 0 1 7 18.6V4.8Z" />
  </svg>
);
export const IconPause = (p: P) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <rect x="5.5" y="4" width="4.5" height="16" rx="1.4" />
    <rect x="14" y="4" width="4.5" height="16" rx="1.4" />
  </svg>
);
export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const IconCheck = (p: P) => <Svg {...p}><path d="m4.5 12.5 5 5 10-11" /></Svg>;
export const IconInfo = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.6v.6" /></Svg>;
export const IconSearch = (p: P) => <Svg {...p}><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.6 15.6 4 4" /></Svg>;
export const IconX = (p: P) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const IconChevronLeft = (p: P) => <Svg {...p}><path d="m14.5 5-7 7 7 7" /></Svg>;
export const IconChevronRight = (p: P) => <Svg {...p}><path d="m9.5 5 7 7-7 7" /></Svg>;
export const IconChevronDown = (p: P) => <Svg {...p}><path d="m5 9 7 7 7-7" /></Svg>;
export const IconChevronUp = (p: P) => <Svg {...p}><path d="m5 15 7-7 7 7" /></Svg>;
export const IconStar = (p: P) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="m12 2.8 2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.8l-5.6 3.2 1.3-6.3-4.8-4.3 6.4-.7L12 2.8Z" />
  </svg>
);
export const IconVolume = (p: P) => <Svg {...p}><path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4a.8.8 0 0 1-.8-.8v-3.4a.8.8 0 0 1 .8-.8Z" /><path d="M15.4 9.2a4 4 0 0 1 0 5.6M17.8 6.8a7.4 7.4 0 0 1 0 10.4" /></Svg>;
export const IconVolumeOff = (p: P) => <Svg {...p}><path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4a.8.8 0 0 1-.8-.8v-3.4a.8.8 0 0 1 .8-.8Z" /><path d="m16 9.8 4.5 4.4M20.5 9.8 16 14.2" /></Svg>;
export const IconFullscreen = (p: P) => <Svg {...p}><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" /></Svg>;
export const IconFullscreenExit = (p: P) => <Svg {...p}><path d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M15 4v3.5A1.5 1.5 0 0 0 16.5 9H20M20 15h-3.5a1.5 1.5 0 0 0-1.5 1.5V20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20" /></Svg>;
export const IconPip = (p: P) => <Svg {...p}><rect x="3.2" y="5" width="17.6" height="14" rx="2" /><rect x="12" y="11.5" width="7" height="5.5" rx="1.2" fill="currentColor" stroke="none" /></Svg>;
export const IconSettings = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="3.1" /><path d="M19.6 14.2a1.6 1.6 0 0 0 .32 1.77l.06.06a1.94 1.94 0 1 1-2.75 2.75l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.47v.17a1.94 1.94 0 0 1-3.88 0v-.09a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06a1.94 1.94 0 1 1-2.75-2.75l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-.97h-.17a1.94 1.94 0 0 1 0-3.88h.09a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06a1.94 1.94 0 1 1 2.75-2.75l.06.06a1.6 1.6 0 0 0 1.77.32h.08a1.6 1.6 0 0 0 .97-1.47v-.17a1.94 1.94 0 0 1 3.88 0v.09a1.6 1.6 0 0 0 .97 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a1.94 1.94 0 1 1 2.75 2.75l-.06.06a1.6 1.6 0 0 0-.32 1.77v.08a1.6 1.6 0 0 0 1.47.97h.17a1.94 1.94 0 0 1 0 3.88h-.09a1.6 1.6 0 0 0-1.47.97Z" /></Svg>;
export const IconCaptions = (p: P) => <Svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.4" /><path d="M9.6 10.2a2.6 2.6 0 1 0 0 3.6M17 10.2a2.6 2.6 0 1 0 0 3.6" /></Svg>;
export const IconMenu = (p: P) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Svg>;
export const IconUser = (p: P) => <Svg {...p}><circle cx="12" cy="8.4" r="3.9" /><path d="M4.8 20c.9-3.4 3.8-5.4 7.2-5.4s6.3 2 7.2 5.4" /></Svg>;
export const IconHome = (p: P) => <Svg {...p}><path d="m3.8 10.6 7.3-6a1.4 1.4 0 0 1 1.8 0l7.3 6A1.4 1.4 0 0 1 20.7 12H20v6.4a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 18.4V12h-.7a1.4 1.4 0 0 1-.9-2.5Z" /></Svg>;
export const IconFilm = (p: P) => <Svg {...p}><rect x="3" y="4.5" width="18" height="15" rx="2" /><path d="M7.5 4.5v15M16.5 4.5v15M3 12h18M3 8.2h4.5M3 15.8h4.5M16.5 8.2H21M16.5 15.8H21" /></Svg>;
export const IconTv = (p: P) => <Svg {...p}><rect x="3" y="7" width="18" height="12.5" rx="2" /><path d="m8.5 3.5 3.2 3M15.5 3.5l-3.2 3" /></Svg>;
export const IconClock = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8.6" /><path d="M12 7.4V12l3.2 2" /></Svg>;
export const IconBookmark = (p: P) => <Svg {...p}><path d="M6.4 4.8h11.2c.66 0 1.2.54 1.2 1.2v13.6c0 .9-.96 1.48-1.75 1.05L12 17.4l-5.05 3.25c-.8.43-1.75-.16-1.75-1.05V6c0-.66.54-1.2 1.2-1.2Z" /></Svg>;
export const IconShare = (p: P) => <Svg {...p}><path d="M12 15.5V4m0 0L8.2 7.8M12 4l3.8 3.8" /><path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" /></Svg>;
export const IconSkipBack = (p: P) => <Svg {...p}><path d="M11.5 5.5 5 12l6.5 6.5" /><path d="M5.5 12H14a4.8 4.8 0 0 1 0 9.6h-.6" strokeWidth={0} fill="none" /><path d="M19 12a7 7 0 1 1-7-7" /><text x="12" y="15.6" textAnchor="middle" fontSize="7.2" fontWeight="800" fill="currentColor" stroke="none" fontFamily="inherit">10</text></Svg>;
export const IconSkipForward = (p: P) => <Svg {...p}><path d="M12.5 5.5 19 12l-6.5 6.5" /><path d="M5 12a7 7 0 1 0 7-7" /><text x="12" y="15.6" textAnchor="middle" fontSize="7.2" fontWeight="800" fill="currentColor" stroke="none" fontFamily="inherit">10</text></Svg>;
export const IconArrowLeft = (p: P) => <Svg {...p}><path d="M19 12H5m0 0 6-6m-6 6 6 6" /></Svg>;
export const IconFilter = (p: P) => <Svg {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Svg>;
export const IconTrash = (p: P) => <Svg {...p}><path d="M4.8 6.8h14.4M9.5 6.8V5.2c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2v1.6M6.6 6.8l.8 12c.05.8.7 1.4 1.5 1.4h6.2c.8 0 1.45-.6 1.5-1.4l.8-12M10.2 10.6v6M13.8 10.6v6" /></Svg>;
export const IconEdit = (p: P) => <Svg {...p}><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="m14.5 6 3 3" /></Svg>;
export const IconLogout = (p: P) => <Svg {...p}><path d="M15 5.5V4a1.5 1.5 0 0 0-1.5-1.5h-8A1.5 1.5 0 0 0 4 4v16a1.5 1.5 0 0 0 1.5 1.5h8A1.5 1.5 0 0 0 15 20v-1.5" /><path d="M10 12h11m0 0-3.4-3.4M21 12l-3.4 3.4" /></Svg>;
export const IconShield = (p: P) => <Svg {...p}><path d="M12 3 5 5.8v5.4c0 4.3 2.9 8.2 7 9.6 4.1-1.4 7-5.3 7-9.6V5.8L12 3Z" /><path d="m9 12 2.2 2.2L15.4 10" /></Svg>;
export const IconSpark = (p: P) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2c.4 4.8 2.2 7.4 7.4 8.9-5.2 1.5-7 4.1-7.4 8.9-.4-4.8-2.2-7.4-7.4-8.9C9.8 9.4 11.6 6.8 12 2Z" opacity=".95" />
    <path d="M19 14c.2 2.3 1 3.6 3.4 4.3-2.4.7-3.2 2-3.4 4.3-.2-2.3-1-3.6-3.4-4.3 2.4-.7 3.2-2 3.4-4.3Z" opacity=".6" />
  </svg>
);
export const IconCalendar = (p: P) => <Svg {...p}><rect x="3.8" y="5" width="16.4" height="15.5" rx="2" /><path d="M3.8 9.8h16.4M8.4 3v4M15.6 3v4" /></Svg>;
export const IconGlobe = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8.8" /><path d="M3.4 9.8h17.2M3.4 14.2h17.2M12 3.2c-4.4 4.7-4.4 12.9 0 17.6 4.4-4.7 4.4-12.9 0-17.6Z" /></Svg>;
export const IconAudio = (p: P) => <Svg {...p}><path d="M4 10v4M7.4 7.5v9M10.8 4.5v15M14.2 8v8M17.6 5.5v13M21 10v4" /></Svg>;
export const IconMail = (p: P) => <Svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></Svg>;
export const IconLock = (p: P) => <Svg {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" /></Svg>;
export const IconEye = (p: P) => <Svg {...p}><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3.2" /></Svg>;
export const IconAlert = (p: P) => <Svg {...p}><path d="M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4.4M12 16.8v.4" /></Svg>;
export const IconGrid = (p: P) => <Svg {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></Svg>;
export const IconList = (p: P) => <Svg {...p}><path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20M4 6.5h.01M4 12h.01M4 17.5h.01" strokeWidth={2.2} /></Svg>;
export const IconTrophy = (p: P) => <Svg {...p}><path d="M7 4.5h10v4.8a5 5 0 0 1-10 0V4.5Z" /><path d="M7 6H4.4v1.6A3.4 3.4 0 0 0 7 10.9M17 6h2.6v1.6a3.4 3.4 0 0 1-2.6 3.3M9.8 19.5h4.4M12 14.3v5.2" /></Svg>;
export const IconDownload = (p: P) => <Svg {...p}><path d="M12 3.5v10m0 0 4-4m-4 4-4-4M4.5 17v2a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2" /></Svg>;
