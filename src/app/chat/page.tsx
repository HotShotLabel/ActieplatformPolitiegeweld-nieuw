import type { Metadata } from "next";
import { Vraagbaak } from "@/components/chat/vraagbaak";

export const metadata: Metadata = {
  title: "Vraagbaak",
  description:
    "Stel je vraag in gewone taal. De vraagbaak wijst je de weg naar de juiste stappen na politiegeweld.",
};

export default function ChatPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[840px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          Vraagbaak
        </h1>
        <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
          Stel je vraag in gewone taal. De vraagbaak vertelt welke stappen je
          kunt zetten, verwijst je door en houdt je verhaal buiten de
          openbaarheid.
        </p>
        <div className="mt-10">
          <Vraagbaak />
        </div>
      </div>
    </main>
  );
}
