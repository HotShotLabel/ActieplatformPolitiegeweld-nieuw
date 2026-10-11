import type { Metadata } from "next";
import { PageStub } from "@/components/site/page-stub";

export const metadata: Metadata = {
  title: "Meedoen",
  description:
    "Sluit je aan als jurist, onderzoeker, vertaler of vrijwilliger.",
};

export default function MeedoenPage() {
  return (
    <PageStub
      title="Meedoen"
      description="Dit platform groeit met mensen die willen bijdragen: juristen, onderzoekers, vertalers en vrijwilligers. Ook als je geen zaak wilt starten, is je verhaal welkom."
      note="Mail naar label@hot-shot.com en vertel kort wie je bent en wat je wilt doen. Je krijgt binnen een paar dagen antwoord."
    />
  );
}
