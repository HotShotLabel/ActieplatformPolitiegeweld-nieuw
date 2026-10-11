import { Hero } from "@/components/home/hero";
import { RightsTicker } from "@/components/home/rights-ticker";
import { Mission } from "@/components/home/mission";
import { Tools } from "@/components/home/tools";
import { HowItWorks } from "@/components/home/how-it-works";
import { CtaBand } from "@/components/home/cta-band";

export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <Hero />
      <RightsTicker />
      <Mission />
      <Tools />
      <HowItWorks />
      <CtaBand />
    </main>
  );
}
