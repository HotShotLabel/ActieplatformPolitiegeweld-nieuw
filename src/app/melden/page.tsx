import type { Metadata } from "next";
import { PageStub } from "@/components/site/page-stub";
import { btnPrimary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Melden",
  description:
    "Meld een incident met politiegeweld. Het nieuwe formulier komt eraan; tot die tijd kun je het bestaande formulier gebruiken.",
};

export default function MeldenPage() {
  return (
    <PageStub
      title="Melding maken van politiegeweld"
      description="Het nieuwe meldformulier wordt nu gebouwd. Tot het zover is kun je het bestaande formulier gebruiken; je melding komt op dezelfde plek terecht."
      note="Deel alleen wat je kwijt wilt. Je kunt anoniem melden en later altijd iets toevoegen of laten verwijderen."
    >
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLScJosC4PCLMA2c92WrUSxt3ty1LMWdLMtDCtSA7ipzuP44q4g/viewform"
        target="_blank"
        rel="noopener noreferrer"
        className={btnPrimary}
      >
        Open het bestaande formulier
      </a>
    </PageStub>
  );
}
