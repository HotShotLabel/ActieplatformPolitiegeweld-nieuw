import type { Metadata } from "next";
import { PageStub } from "@/components/site/page-stub";

export const metadata: Metadata = {
  title: "Rechterlijke uitspraken",
  description:
    "Doorzoekbare databank met uitspraken over het optreden van de politie.",
};

export default function UitsprakenPage() {
  return (
    <PageStub
      title="Rechterlijke uitspraken"
      description="We bouwen een databank met uitspraken waarin het optreden van de politie is onderzocht of veroordeeld. Zoekbaar op rechtbank, jaar en onderwerp."
      note="Hiermee zien slachtoffers, advocaten en onderzoekers wat eerder is beslist in vergelijkbare zaken."
    />
  );
}
