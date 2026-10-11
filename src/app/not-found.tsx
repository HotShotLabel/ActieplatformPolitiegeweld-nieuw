import Link from "next/link";
import { btnGhost, btnPrimary } from "@/lib/ui";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex flex-1 items-center justify-center px-6 py-32"
    >
      <div className="text-center">
        <p className="font-mono text-sm tracking-[0.2em] text-muted-2">404</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
          Deze pagina bestaat niet.
        </h1>
        <p className="mt-4 text-muted">
          Misschien zoek je het meldformulier of de meldingenkaart?
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link href="/melden" className={btnPrimary}>
            Melding doen
          </Link>
          <Link href="/" className={btnGhost}>
            Naar home
          </Link>
        </div>
      </div>
    </main>
  );
}
