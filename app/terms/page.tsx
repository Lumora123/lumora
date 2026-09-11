import type { Metadata } from "next";
import LegalPage, { H2, P, UL } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Lumora — accounts, acceptable use, content licensing and disclaimers.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="September 2026"
      intro="The rules for using Lumora. Please read them — they're short, and they exist to keep the catalog legal and the community safe."
    >
      <H2>1. Acceptance of terms</H2>
      <P>
        By accessing or using Lumora (&ldquo;the Service&rdquo;), you agree to these Terms of Service. If you do not
        agree, do not use the Service. We may update these terms; material changes will be reflected in the
        &ldquo;last updated&rdquo; date above.
      </P>

      <H2>2. Accounts</H2>
      <UL
        items={[
          <>You may browse and play content as a guest. An account is only needed to sync your list, progress and history across devices.</>,
          <>You are responsible for keeping your credentials secret and for all activity under your account.</>,
          <>One account per person. Accounts may not be sold, transferred or shared commercially.</>,
          <>We may suspend or terminate accounts that violate these terms.</>,
        ]}
      />

      <H2>3. The catalog and its licensing</H2>
      <P>
        Every title on Lumora is offered under one of the following rights bases, declared per streaming source and
        visible on each title's detail page:
      </P>
      <UL
        items={[
          <><strong className="text-mist-100">Public domain</strong> — works whose copyright has expired or was never renewed (e.g. pre-1930 features hosted on the Internet Archive).</>,
          <><strong className="text-mist-100">Creative Commons / open licenses</strong> — works published by their rights holders under CC or equivalent terms, with attribution shown in the player as the license requires.</>,
          <><strong className="text-mist-100">Original or authorized-partner content</strong> — works we produced or hold written streaming authorization for.</>,
          <><strong className="text-mist-100">Demo content</strong> — clearly labeled test media used to demonstrate platform features.</>,
        ]}
      />
      <P>
        Where we cannot establish an authorized source for a work, we do not stream it. Such titles display
        &ldquo;Streaming unavailable&rdquo; — this is deliberate and will never be bypassed.
      </P>

      <H2>4. Acceptable use</H2>
      <UL
        items={[
          <>Don't attempt to download, rip, re-host, redistribute or commercially exploit any media through the Service beyond what the underlying license permits.</>,
          <>Don't probe, scan or attack the Service's infrastructure, or attempt to bypass access controls.</>,
          <>Don't use the Service to distribute unlawful, infringing, hateful or harmful content.</>,
          <>Respect license terms: some catalog works are hosted by third parties (e.g. the Internet Archive) whose own terms apply to their copies.</>,
        ]}
      />

      <H2>5. Personalization & data</H2>
      <P>
        Watchlists, resume points and history are features, not surveillance. How we handle your data is described in
        our Privacy Policy. Guest data lives in your browser's local storage until you sign in and choose to merge it.
      </P>

      <H2>6. Disclaimers & limitation of liability</H2>
      <P>
        The Service is provided &ldquo;as is&rdquo;. We do not warrant uninterrupted playback, and third-party hosts
        (such as the Internet Archive) control the availability of their files. To the maximum extent permitted by
        law, Lumora is not liable for indirect, incidental or consequential damages arising from use of the Service.
      </P>

      <H2>7. Changes to the catalog</H2>
      <P>
        Titles may be added, updated or removed at any time — including when a rights basis changes or a hosting
        source expires. Expiring sources are hidden automatically and the title honestly reports unavailability.
      </P>

      <H2>8. Contact</H2>
      <P>
        Questions about these terms? See our Contact page. Copyright concerns have a dedicated, faster path described
        in the Copyright &amp; DMCA policy.
      </P>
    </LegalPage>
  );
}
