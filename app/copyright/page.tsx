import type { Metadata } from "next";
import LegalPage, { H2, P, UL } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Copyright & DMCA",
  description: "How Lumora sources content legally, and how rights holders can request removal of any title.",
};

export default function CopyrightPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Copyright & DMCA"
      updated="September 2026"
      intro="Lumora only streams content it can prove it's allowed to stream. If you believe something here infringes your rights, we'll act fast."
    >
      <H2>Our content policy</H2>
      <P>
        Every playable source in the Lumora catalog carries a machine-readable rights declaration — public domain,
        Creative Commons / open license, original, authorized partner, or clearly-labeled demo media. Titles without
        an established rights basis are not streamed: they display &ldquo;Streaming unavailable&rdquo;. We do not
        scrape, mirror, download or re-host copyrighted works from unauthorized sources, and we do not circumvent
        DRM, paywalls or geo-blocks.
      </P>
      <UL
        items={[
          <>Public-domain features are linked from or hosted by public archives (notably the Internet Archive) under their terms.</>,
          <>CC-licensed works show the license attribution inside the player and on the title's detail page, as the licenses require.</>,
          <>Demo titles are visually separated in the UI and labeled as demonstration content.</>,
        ]}
      />

      <H2>DMCA takedown requests</H2>
      <P>
        If you are a rights holder (or authorized agent) and believe any content accessible through Lumora infringes
        your copyright, send a notification containing:
      </P>
      <UL
        items={[
          <>Identification of the copyrighted work claimed to be infringed.</>,
          <>Identification of the material — the Lumora URL (e.g. /movie/… or /watch/…) is ideal.</>,
          <>Your contact information: name, address, email, phone.</>,
          <>A statement of good-faith belief that the use is unauthorized.</>,
          <>A statement, under penalty of perjury, that the information is accurate and that you are authorized to act for the rights holder.</>,
          <>Your physical or electronic signature.</>,
        ]}
      />
      <P>
        Send it via our Contact page, addressed to <strong className="text-mist-100">Copyright Agent</strong>. We
        acknowledge requests promptly, disable access to the identified material while we review, and remove it
        permanently when a claim is substantiated. Repeat circumstances may lead to termination of related accounts.
      </P>

      <H2>Counter-notification</H2>
      <P>
        If you uploaded or authorized content that was removed and believe the removal was mistaken or the material
        is properly licensed (for example, a public-domain work incorrectly claimed), you may send a
        counter-notification with the same level of detail, including a statement consenting to jurisdiction of your
        local federal district court (or equivalent). We will review and may restore the material.
      </P>

      <H2>Mistakes happen — tell us</H2>
      <P>
        Rights status for older films can be genuinely complicated (renewals, restorations, regional differences). If
        you spot a title whose rights basis looks wrong in either direction, we'd rather hear about it: use the
        Contact page and we'll investigate, annotate or unpublish as appropriate.
      </P>
    </LegalPage>
  );
}
