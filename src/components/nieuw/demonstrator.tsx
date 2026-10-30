"use client";

import { useId } from "react";

type Pose = 0 | 1 | 2 | 3 | 4 | 5;

const LOOKS = [
  { skin: "#b97850", light: "#d99a70", hair: "#1b1310", top: "#1d3552", pants: "#16202e" },
  { skin: "#d9a077", light: "#efbd95", hair: "#2a1a14", top: "#2b3f58", pants: "#111923" },
  { skin: "#8d5a3b", light: "#aa704c", hair: "#17100d", top: "#2f4f7a", pants: "#172333" },
  { skin: "#e0b08a", light: "#f2c8a4", hair: "#b9b3aa", top: "#4b3b34", pants: "#1c2530" },
  { skin: "#c98b62", light: "#e3a77c", hair: "#2a1f19", top: "#23415e", pants: "#131d29" },
  { skin: "#f0c7a4", light: "#ffddbd", hair: "#3a2a1c", top: "#2f7fd1", pants: "#172536" },
];

export function Demonstrator({
  rol,
  pose = 0,
  sign,
  className = "h-[240px] w-[120px]",
}: {
  rol: string;
  pose?: Pose;
  sign?: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const look = LOOKS[pose % LOOKS.length];
  const longHair = pose === 2 || pose === 5;
  const bun = pose === 1 || pose === 4;
  const shortHair = pose === 3 || pose === 0;
  const signLeft = pose % 2 === 0;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      aria-label={`Illustratie: ${rol}`}
      title={rol}
    >
      <svg viewBox="0 0 120 240" className="h-full w-full" role="img" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-skin`} cx="38%" cy="28%" r="76%">
            <stop offset="0%" stopColor={look.light} />
            <stop offset="70%" stopColor={look.skin} />
            <stop offset="100%" stopColor="#6f402b" />
          </radialGradient>
          <linearGradient id={`${uid}-hair`} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor={look.hair} />
            <stop offset="100%" stopColor="#080605" />
          </linearGradient>
          <linearGradient id={`${uid}-top`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={look.top} />
            <stop offset="100%" stopColor="#0a121d" />
          </linearGradient>
          <linearGradient id={`${uid}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="60" cy="232" rx="38" ry="6" fill="#111" opacity="0.2" />

        {/* benen */}
        <path d="M46 143 L42 220" stroke={look.pants} strokeWidth="15" strokeLinecap="round" />
        <path d="M74 143 L78 220" stroke={look.pants} strokeWidth="15" strokeLinecap="round" />
        <path d="M34 224c5-5 15-5 20 0" stroke="#0b1118" strokeWidth="8" strokeLinecap="round" />
        <path d="M66 224c5-5 15-5 20 0" stroke="#0b1118" strokeWidth="8" strokeLinecap="round" />

        {/* lichaam */}
        <path
          d="M39 103c-5 12-5 31-3 48h48c2-17 2-36-3-48-13-6-29-6-42 0Z"
          fill={`url(#${uid}-top)`}
        />
        <path d="M51 94h18v18c-5 3-13 3-18 0Z" fill={look.skin} />

        {/* linkerarm */}
        {pose === 3 || pose === 5 ? (
          <path d="M40 108c-8 14-8 24-2 32" stroke={look.skin} strokeWidth="9" strokeLinecap="round" fill="none" />
        ) : signLeft ? (
          <path d="M40 108c-10 5-13 18-10 28" stroke={look.skin} strokeWidth="9" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M40 108c-8 12-9 26-4 36" stroke={look.skin} strokeWidth="9" strokeLinecap="round" fill="none" />
        )}
        <circle cx={signLeft ? 30 : 37} cy={signLeft ? 138 : 144} r="5" fill={look.skin} />

        {/* rechterarm, opgeheven of met bord */}
        {sign ? (
          <path d="M81 108c9-4 12-16 8-27" stroke={look.skin} strokeWidth="9" strokeLinecap="round" fill="none" />
        ) : pose === 1 || pose === 4 ? (
          <path d="M81 108c11-12 10-27 3-39" stroke={look.skin} strokeWidth="9" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M81 108c9 11 10 25 5 36" stroke={look.skin} strokeWidth="9" strokeLinecap="round" fill="none" />
        )}
        <circle cx={sign ? 90 : 84} cy={sign ? 78 : 70} r="5.5" fill={look.skin} />

        {/* hoofd */}
        <ellipse cx="60" cy="71" rx="21" ry="24" fill={`url(#${uid}-skin)`} />
        <ellipse cx="41" cy="74" rx="4" ry="6" fill={look.skin} />
        <ellipse cx="79" cy="74" rx="4" ry="6" fill={look.skin} />

        {/* haar */}
        {longHair && (
          <path
            d="M38 69c0-19 10-29 22-29s22 10 22 29v23c-4-4-5-13-7-22-3 7-9 11-15 11s-12-4-15-11c-2 9-3 18-7 22Z"
            fill={`url(#${uid}-hair)`}
          />
        )}
        {bun && (
          <>
            <path d="M39 67c2-16 10-25 21-25s20 9 21 25c-5-7-12-11-21-11s-16 4-21 11Z" fill={`url(#${uid}-hair)`} />
            <circle cx="60" cy="39" r="8" fill={`url(#${uid}-hair)`} />
          </>
        )}
        {shortHair && (
          <path d="M39 67c2-17 11-27 21-27s20 10 22 27c-6-8-13-11-22-11s-16 3-21 11Z" fill={`url(#${uid}-hair)`} />
        )}

        {/* gezicht */}
        <ellipse cx="52" cy="71" rx="3.4" ry="4" fill="#fffaf2" />
        <ellipse cx="68" cy="71" rx="3.4" ry="4" fill="#fffaf2" />
        <circle cx="52.4" cy="71.4" r="1.8" fill="#17100d" />
        <circle cx="67.6" cy="71.4" r="1.8" fill="#17100d" />
        <circle cx="53" cy="70.8" r="0.55" fill="#fff" />
        <circle cx="68.2" cy="70.8" r="0.55" fill="#fff" />
        <path d="M47 64c2-1.5 6-1.5 8 0M65 64c2-1.5 6-1.5 8 0" stroke="#24150f" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M60 72v6c0 1.5-1.5 2.4-3 2.4" stroke="#7c4a32" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        <path d="M54 85c3 2 9 2 12 0" stroke="#5b2e22" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {pose === 4 && (
          <g stroke="#111" strokeWidth="1.6" fill="none" opacity="0.85">
            <circle cx="52" cy="71" r="6" />
            <circle cx="68" cy="71" r="6" />
            <path d="M58 71h4M46 69l-4-1M74 69l4-1" strokeLinecap="round" />
          </g>
        )}

        <ellipse cx="48" cy="57" rx="12" ry="7" fill={`url(#${uid}-shine)`} />

        {sign && (
          <g transform={signLeft ? "translate(4 42) rotate(-4)" : "translate(84 42) rotate(4)"}>
            <rect width="32" height="28" fill="#f7f2e8" stroke="#111" strokeWidth="1.5" />
            <text x="16" y="18" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#111">
              {sign}
            </text>
            <path d="M16 28v24" stroke="#111" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}
