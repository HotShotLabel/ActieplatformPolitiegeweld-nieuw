import type { Metadata } from "next";
import { PageStub } from "@/components/site/page-stub";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Hoe het Actieplatform met meldingen en persoonsgegevens omgaat.",
};

export default function PrivacyPage() {
  return (
    <PageStub
      title="Privacy"
      description="We behandelen meldingen vertrouwelijk en werken volgens dataminimalisatie: we vragen alleen wat nodig is en delen niets zonder toestemming of juridische plicht."
      note="De volledige privacyverklaring verschijnt samen met het nieuwe meldformulier. Vragen? Mail naar label@hot-shot.com."
    />
  );
}
