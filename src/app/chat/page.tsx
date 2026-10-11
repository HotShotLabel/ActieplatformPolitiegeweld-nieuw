import type { Metadata } from "next";
import { PageStub } from "@/components/site/page-stub";

export const metadata: Metadata = {
  title: "Vraagbaak",
  description:
    "Stel je vraag in gewone taal en krijg hulp bij de stappen die je kunt zetten.",
};

export default function ChatPage() {
  return (
    <PageStub
      title="De vraagbaak"
      description="Hier komt een assistent die je in gewone taal wegwijs maakt: welke stappen kun je zetten, welke termijnen gelden, en waar vind je de juiste hulp."
      note="Wat je typt blijft van jou. De vraagbaak is geen advocaat en geen vervanging van juridisch advies."
    />
  );
}
