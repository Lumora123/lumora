import type { Metadata } from "next";
import LegalPage, { H2, P, UL } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Lumora collects, why, where it's stored, and the controls you have over your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="September 2026"
      intro="Lumora collects the minimum needed to make the product work. Here's exactly what that is."
    >
      <H2>What we collect</H2>
      <UL
        items={[
          <><strong className="text-mist-100">Account data</strong> — your name, email address, and a salted, one-way hashed password (scrypt). We never store plaintext passwords.</>,
          <><strong className="text-mist-100">Library data</strong> — your watchlist, playback resume points and watch history. These power Continue Watching, My List and recommendations.</>,
          <><strong className="text-mist-100">Session data</strong> — a random session token in an httpOnly cookie to keep you signed in (30-day expiry).</>,
          <><strong className="text-mist-100">Guest preferences</strong> — stored only in your own browser's localStorage (watchlist, progress, playback settings). We can't read them unless you sign in and merge.</>,
        ]}
      />

      <H2>What we don't collect</H2>
      <UL
        items={[
          <>No third-party advertising trackers, ad networks or cross-site profiling.</>,
          <>No payment information — Lumora has no paid tiers in this build.</>,
          <>No sale or rental of personal data, ever.</>,
        ]}
      />

      <H2>Why we process it</H2>
      <P>
        Account and library data is processed to provide the service you asked for: syncing your list across devices,
        resuming playback where you left off, and generating recommendations from genre/cast overlap in our own
        catalog. Sessions exist solely for authentication.
      </P>

      <H2>Where it lives</H2>
      <P>
        In this deployment, account and library data is stored in a server-side JSON datastore [ASSUMPTION: swappable
        for a managed database in production]. Guest data never leaves your device. Playback files for public-domain
        catalog items are streamed directly from their hosts (e.g. the Internet Archive), so those hosts see ordinary
        media requests from your connection — their privacy policies apply to those requests.
      </P>

      <H2>Your controls</H2>
      <UL
        items={[
          <>Sign out any time from your Profile page; delete your browser's localStorage to clear guest data.</>,
          <>Manage playback preferences (autoplay, data saver, trailer autoplay) on your Profile page.</>,
          <>Remove individual resume points from Continue Watching, or clear your My List entries at any time.</>,
          <>Request account deletion through the Contact page — we erase your account, library and history.</>,
        ]}
      />

      <H2>Security</H2>
      <P>
        Passwords are hashed with scrypt and a per-user salt. Sessions use random 256-bit tokens in httpOnly,
        same-site cookies. Admin areas are role-gated on the server, not just in the UI.
      </P>

      <H2>Children</H2>
      <P>
        Lumora is not directed at children under 13, and we do not knowingly collect their data.
      </P>

      <H2>Changes & contact</H2>
      <P>
        If this policy changes materially, the &ldquo;last updated&rdquo; date above will change. Questions or
        deletion requests: see the Contact page.
      </P>
    </LegalPage>
  );
}
