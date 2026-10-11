import type { Metadata } from "next";
import { PageStub } from "@/components/site/page-stub";

export const metadata: Metadata = {
  title: "Juridische hulp",
  description:
    "Modelbrieven en uitleg over klachten, artikel 12 Sv, Woo-verzoeken en schadevergoeding.",
};

export default function JuridischPage() {
  return (
    <PageStub
      title="Juridische hulp en modelbrieven"
      description="Klacht bij de politie, klacht bij de ombudsman, artikel 12 Sv, een Woo-verzoek of een schadeclaim: per stap leggen we uit wat het is en hoe je het aanpakt."
      note="Deze uitleg is algemene informatie, geen juridisch advies. Bij een eigen zaak helpt een jurist of advocaat je verder."
    />
  );
}
