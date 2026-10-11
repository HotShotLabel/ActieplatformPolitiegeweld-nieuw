import type { Metadata } from "next";
import { PageStub } from "@/components/site/page-stub";

export const metadata: Metadata = {
  title: "Meldingenkaart",
  description:
    "De meldingenkaart toont waar incidenten met politiegeweld zich voordoen.",
};

export default function KaartPage() {
  return (
    <PageStub
      title="De meldingenkaart"
      description="We bouwen een eigen kaart die meldingen toont: zonder externe trackers en met oog voor de privacy van melders."
      note="Meldingen verschijnen pas op de kaart als de melder daar toestemming voor geeft, en nooit met meer details dan nodig."
    />
  );
}
