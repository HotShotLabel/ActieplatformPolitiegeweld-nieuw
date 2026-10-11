import Link from "next/link";
import { btnGhost } from "@/lib/ui";

export function PageStub({
  title,
  description,
  note,
  children,
}: {
  title: string;
  description: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          In aanbouw
        </p>
        <h1 className="mt-5 max-w-[24ch] font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
          {description}
        </p>
        {note ? (
          <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-muted-2">
            {note}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
        <div className="mt-12">
          <Link href="/" className={btnGhost}>
            Terug naar home
          </Link>
        </div>
      </div>
    </main>
  );
}
