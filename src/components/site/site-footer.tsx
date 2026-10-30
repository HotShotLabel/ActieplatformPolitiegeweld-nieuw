import Link from "next/link";
import { Logo } from "@/components/site/logo";

const PLATFORM_LINKS = [
  { href: "/melden", label: "Melden" },
  { href: "/kaart", label: "Meldingenkaart" },
  { href: "/uitspraken", label: "Uitspraken" },
  { href: "/overleden", label: "Overleden na politieoptreden" },
  { href: "/cijfers", label: "Politiegeweld in cijfers" },
];

const ONDERZOEK_LINKS = [
  { href: "/nieuws", label: "Nieuws" },
  { href: "/beelden", label: "Beelden (video's)" },
  { href: "/live", label: "Live-uitzendingen" },
  { href: "/agenten", label: "Agenten als dader" },
  { href: "/profielen", label: "Agent-profielen" },
  { href: "/juridisch", label: "Juridische hulp" },
];

const ORGANISATIE_LINKS = [
  { href: "/meedoen", label: "Meedoen" },
  { href: "/chat", label: "Chat" },
  { href: "/privacy", label: "Privacy" },
];

function FooterNav({
  titel,
  links,
}: {
  titel: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={titel}>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-blue">
        {titel}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#07090c]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-3">
              <Logo className="h-12 w-12 rounded-sm border border-brand-blue/25" />
              <span className="font-display text-[15px] font-semibold tracking-tight">
                Actieplatform
                <span className="ml-1.5 font-normal text-muted">Politiegeweld</span>
              </span>
            </p>
            <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-muted">
              Wij documenteren politiegeweld, ondersteunen wie het meemaakt en
              werken aan openbare verantwoording. Meldingen behandelen we
              vertrouwelijk.
            </p>
            <Link
              href="/steun"
              className="mt-5 inline-flex min-h-10 items-center gap-2 border border-[#d8302c]/70 px-4 py-2 text-xs font-semibold text-[#ff9a95] transition-colors hover:bg-[#d8302c] hover:text-white"
            >
              Steun het platform
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <FooterNav titel="Platform" links={PLATFORM_LINKS} />
          <FooterNav titel="Onderzoek" links={ONDERZOEK_LINKS} />
          <div>
            <FooterNav titel="Organisatie" links={ORGANISATIE_LINKS} />
            <a
              href="mailto:label@hot-shot.com"
              className="mt-3 inline-block text-sm text-muted transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-7 text-xs leading-relaxed text-muted-2 md:flex-row md:items-start md:justify-between">
          <p className="max-w-[62ch]">
            © 2026 Actieplatform Politiegeweld. Alle rechten voorbehouden.
            Overnemen van tekst, beeld of data alleen met voorafgaande
            toestemming; citeren mag met bronvermelding.
          </p>
          <p className="max-w-[42ch]">
            Deze site geeft informatie, geen juridisch advies. Raadpleeg bij
            twijfel een jurist of advocaat.
          </p>
        </div>
      </div>
    </footer>
  );
}
