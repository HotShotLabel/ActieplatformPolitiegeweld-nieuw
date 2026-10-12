import Link from "next/link";

const PLATFORM_LINKS = [
  { href: "/melden", label: "Melden" },
  { href: "/kaart", label: "Meldingenkaart" },
  { href: "/uitspraken", label: "Uitspraken" },
  { href: "/overleden", label: "Overleden na politieoptreden" },
  { href: "/cijfers", label: "Politiegeweld in cijfers" },
  { href: "/nieuws", label: "Nieuws" },
  { href: "/live", label: "Live-uitzendingen" },
  { href: "/agenten", label: "Agenten als dader" },
  { href: "/juridisch", label: "Juridische hulp" },
];

const ORGANISATIE_LINKS = [
  { href: "/meedoen", label: "Meedoen" },
  { href: "/chat", label: "Chat" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-tight">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent" />
              Actieplatform Politiegeweld
            </p>
            <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-muted">
              Wij documenteren politiegeweld, ondersteunen wie het meemaakt en
              werken aan openbare verantwoording. Meldingen behandelen we
              vertrouwelijk.
            </p>
          </div>

          <nav aria-label="Platform">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
              Platform
            </h2>
            <ul className="mt-4 space-y-2.5">
              {PLATFORM_LINKS.map((link) => (
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

          <nav aria-label="Organisatie">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
              Organisatie
            </h2>
            <ul className="mt-4 space-y-2.5">
              {ORGANISATIE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:label@hot-shot.com"
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-8 text-xs text-muted-2 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 Actieplatform Politiegeweld. Alle rechten voorbehouden.
            Overnemen van tekst, beeld of data alleen met voorafgaande
            toestemming; citeren mag met bronvermelding.
          </p>
          <p>
            Deze site geeft informatie, geen juridisch advies. Raadpleeg bij
            twijfel een jurist of advocaat.
          </p>
        </div>
      </div>
    </footer>
  );
}
