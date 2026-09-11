import type { Metadata } from "next";
import LegalPage, { H2, P, UL } from "@/components/legal/LegalPage";
import ContactForm from "@/components/legal/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Lumora team — playback help, rights requests, partnerships and account questions.",
};

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Support"
      title="Contact"
      updated="September 2026"
      intro="Playback trouble, rights questions, partnership ideas — this is the door."
    >
      <div className="mb-2">
        <ContactForm />
      </div>

      <H2>Who to reach for what</H2>
      <UL
        items={[
          <><strong className="text-mist-100">Playback problems</strong> — mention the title, device/browser and whether subtitles or quality switching misbehaved. Most playback issues trace to the upstream host being briefly unavailable.</>,
          <><strong className="text-mist-100">Copyright Agent</strong> — DMCA takedowns and counter-notices (use the checklist on the Copyright page for the fastest handling).</>,
          <><strong className="text-mist-100">Account & privacy</strong> — deletion requests, data questions, security reports.</>,
          <><strong className="text-mist-100">Partnerships</strong> — rights holders who want their CC or public-domain works featured: tell us the work, the license, and where the authorized files live.</>,
        ]}
      />

      <H2>Before you write</H2>
      <P>
        Check the About page for how the catalog works and what &ldquo;Streaming unavailable&rdquo; means — many
        questions are answered there. [ASSUMPTION] This build ships without a ticketing backend; the form confirms
        locally and a production deployment would forward messages to the team inbox.
      </P>
    </LegalPage>
  );
}
