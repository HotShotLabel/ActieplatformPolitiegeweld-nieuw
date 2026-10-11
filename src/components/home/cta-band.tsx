import Link from "next/link";
import { Magnetic } from "@/components/site/magnetic";
import { btnGhost, btnPrimary } from "@/lib/ui";

export function CtaBand() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-10 px-6 py-24 md:flex-row md:items-end md:justify-between md:py-28 lg:px-10">
        <div>
          <h2 className="max-w-[20ch] font-display text-3xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Dit bouwen we samen.
          </h2>
          <p className="mt-5 max-w-[48ch] leading-relaxed text-muted">
            Als jurist, onderzoeker, vertaler of vrijwilliger. Elke bijdrage
            maakt het dossier sterker.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Magnetic>
            <Link href="/meedoen" className={btnPrimary}>
              Sluit je aan
            </Link>
          </Magnetic>
          <a href="mailto:label@hot-shot.com" className={btnGhost}>
            Mail ons
          </a>
        </div>
      </div>
    </section>
  );
}
