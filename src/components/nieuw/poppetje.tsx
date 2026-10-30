"use client";

import { useId } from "react";

type Variant = "familie" | "moeder" | "ouder" | "dochter" | "melder" | "onderzoeker";

const LOOK: Record<
  Variant,
  {
    skin: string;
    skinLight: string;
    hair: string;
    top: string;
    long?: boolean;
    bun?: boolean;
    curly?: boolean;
    short?: boolean;
    glasses?: boolean;
    hoodie?: boolean;
  }
> = {
  familie: {
    skin: "#b97850",
    skinLight: "#d99a70",
    hair: "#1b1310",
    top: "#1d3552",
    curly: true,
  },
  moeder: {
    skin: "#d9a077",
    skinLight: "#efbd95",
    hair: "#2a1a14",
    top: "#24364f",
    bun: true,
  },
  ouder: {
    skin: "#e0b08a",
    skinLight: "#f2c8a4",
    hair: "#b9b3aa",
    top: "#4b3b34",
    short: true,
    glasses: true,
  },
  dochter: {
    skin: "#8d5a3b",
    skinLight: "#aa704c",
    hair: "#17100d",
    top: "#2f4f7a",
    long: true,
  },
  melder: {
    skin: "#f0c7a4",
    skinLight: "#ffddbd",
    hair: "#3a2a1c",
    top: "#2f7fd1",
    short: true,
    hoodie: true,
  },
  onderzoeker: {
    skin: "#c98b62",
    skinLight: "#e3a77c",
    hair: "#2a1f19",
    top: "#1b3b5a",
    bun: true,
    glasses: true,
  },
};

function variantVoor(rol: string): Variant {
  if (/moeder/i.test(rol)) return "moeder";
  if (/dochter/i.test(rol)) return "dochter";
  if (/ouder/i.test(rol)) return "ouder";
  if (/melder/i.test(rol)) return "melder";
  if (/onderzoek/i.test(rol)) return "onderzoeker";
  return "familie";
}

export function Poppetje({
  accent,
  rol,
  className = "h-14 w-14",
}: {
  accent: string;
  rol: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const variant = variantVoor(rol);
  const look = LOOK[variant];

  return (
    <span
      className={`inline-flex shrink-0 items-end justify-center overflow-hidden rounded-full border-2 border-[#111]/15 ${className}`}
      style={{ background: accent }}
      aria-label={`Illustratie: ${rol}`}
      title={rol}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-bg`} cx="35%" cy="25%" r="85%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.92" />
            <stop offset="100%" stopColor="#071321" />
          </radialGradient>
          <radialGradient id={`${uid}-skin`} cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor={look.skinLight} />
            <stop offset="68%" stopColor={look.skin} />
            <stop offset="100%" stopColor="#7c4a32" />
          </radialGradient>
          <linearGradient id={`${uid}-hair`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor={look.hair} />
            <stop offset="100%" stopColor="#090706" />
          </linearGradient>
          <linearGradient id={`${uid}-top`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={look.top} />
            <stop offset="100%" stopColor="#0b1724" />
          </linearGradient>
          <linearGradient id={`${uid}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx="60" cy="60" r="60" fill={`url(#${uid}-bg)`} />
        <ellipse cx="60" cy="115" rx="42" ry="9" fill="#000" opacity="0.24" />

        {/* schouders en kleding */}
        <path
          d="M16 121c2-24 17-36 44-36s42 12 44 36"
          fill={`url(#${uid}-top)`}
        />
        {look.hoodie && (
          <path
            d="M35 87c6-9 14-13 25-13s19 4 25 13c-7 4-16 6-25 6s-18-2-25-6Z"
            fill="#0b1724"
            opacity="0.65"
          />
        )}
        <path d="M52 75h16v17c-5 3-11 3-16 0Z" fill={look.skin} opacity="0.9" />

        {/* hoofd en oren */}
        <ellipse cx="34" cy="50" rx="6" ry="9" fill={look.skin} />
        <ellipse cx="86" cy="50" rx="6" ry="9" fill={look.skin} />
        <ellipse cx="60" cy="46" rx="27" ry="31" fill={`url(#${uid}-skin)`} />

        {/* haar */}
        {look.long && (
          <path
            d="M31 47c0-25 14-38 29-38s29 13 29 38v31c-5-5-7-17-9-29-4 9-12 14-20 14s-16-5-20-14c-2 12-4 24-9 29Z"
            fill={`url(#${uid}-hair)`}
          />
        )}
        {look.bun && (
          <>
            <path
              d="M33 45c2-19 14-30 27-30s25 11 27 30c-6-8-15-12-27-12s-21 4-27 12Z"
              fill={`url(#${uid}-hair)`}
            />
            <circle cx="60" cy="11" r="9" fill={`url(#${uid}-hair)`} />
          </>
        )}
        {look.short && (
          <path
            d="M33 45c2-20 15-31 27-31s25 11 27 31c-7-9-16-13-27-13s-20 4-27 13Z"
            fill={`url(#${uid}-hair)`}
          />
        )}
        {look.curly && (
          <>
            <path
              d="M32 45c2-20 15-31 28-31s26 11 28 31c-7-8-16-12-28-12s-21 4-28 12Z"
              fill={`url(#${uid}-hair)`}
            />
            <circle cx="35" cy="30" r="9" fill={`url(#${uid}-hair)`} />
            <circle cx="50" cy="20" r="9" fill={`url(#${uid}-hair)`} />
            <circle cx="70" cy="20" r="9" fill={`url(#${uid}-hair)`} />
            <circle cx="85" cy="30" r="9" fill={`url(#${uid}-hair)`} />
          </>
        )}

        {/* gezicht */}
        <ellipse cx="49" cy="48" rx="4.2" ry="5" fill="#fffaf2" />
        <ellipse cx="71" cy="48" rx="4.2" ry="5" fill="#fffaf2" />
        <circle cx="49.5" cy="48.5" r="2.2" fill="#17100d" />
        <circle cx="70.5" cy="48.5" r="2.2" fill="#17100d" />
        <circle cx="50.2" cy="47.8" r="0.7" fill="#fff" />
        <circle cx="71.2" cy="47.8" r="0.7" fill="#fff" />
        <path d="M43 40c3-2 8-2 11 0M66 40c3-2 8-2 11 0" stroke="#24150f" strokeWidth="2" strokeLinecap="round" />
        <path d="M60 49v8c0 2-2 3-4 3" stroke="#7c4a32" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M53 66c4 3 10 3 14 0" stroke="#5b2e22" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <ellipse cx="42" cy="60" rx="5" ry="3" fill="#c86b58" opacity="0.22" />
        <ellipse cx="78" cy="60" rx="5" ry="3" fill="#c86b58" opacity="0.22" />

        {look.glasses && (
          <g stroke="#111" strokeWidth="2" fill="none" opacity="0.85">
            <circle cx="49" cy="48" r="8" />
            <circle cx="71" cy="48" r="8" />
            <path d="M57 48h6M41 46l-6-2M79 46l6-2" strokeLinecap="round" />
          </g>
        )}

        {/* diepte-highlight */}
        <ellipse cx="47" cy="28" rx="15" ry="9" fill={`url(#${uid}-shine)`} />
      </svg>
    </span>
  );
}
