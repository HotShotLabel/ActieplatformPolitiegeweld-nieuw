export function PoliceFigure({
  side = "left",
  className = "h-[170px] w-auto",
}: {
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 90 170"
      className={`${className} ${side === "right" ? "-scale-x-100" : ""}`}
      aria-hidden="true"
    >
      <ellipse cx="45" cy="165" rx="26" ry="5" fill="#111" opacity="0.2" />
      <path d="M31 108 26 160M59 108l6 52" stroke="#101827" strokeWidth="13" strokeLinecap="round" />
      <path d="M22 164c5-4 12-4 17 0M52 164c5-4 12-4 17 0" stroke="#080d14" strokeWidth="7" strokeLinecap="round" />
      <path d="M27 78c-3 12-2 25 2 34h32c4-9 5-22 2-34-11-5-25-5-36 0Z" fill="#162b45" />
      <path d="M31 82h28v11H31z" fill="#0a1a33" />
      <path d="M35 88h20" stroke="#7fa7d9" strokeWidth="2" strokeDasharray="2 3" />
      <rect x="35" y="95" width="20" height="5" fill="#d8302c" />
      <path d="M27 82 18 116M63 82l9 34" stroke="#162b45" strokeWidth="10" strokeLinecap="round" />
      <circle cx="17" cy="119" r="4" fill="#b97850" />
      <circle cx="73" cy="119" r="4" fill="#b97850" />
      <ellipse cx="45" cy="61" rx="18" ry="21" fill="#b97850" />
      <path d="M27 56c2-16 9-24 18-24s16 8 18 24c-5-6-11-9-18-9s-13 3-18 9Z" fill="#101827" />
      <path d="M25 46h40l-3-9H28z" fill="#0a1a33" />
      <rect x="37" y="37" width="16" height="5" rx="2" fill="#d8302c" />
      <path d="M32 52h8M50 52h8" stroke="#101827" strokeWidth="3" strokeLinecap="round" />
      <circle cx="39" cy="61" r="2" fill="#111" />
      <circle cx="51" cy="61" r="2" fill="#111" />
      <path d="M40 71c3 2 7 2 10 0" stroke="#5b2e22" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PoliceCar({
  side = "left",
  className = "h-[95px] w-[250px]",
}: {
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 250 100"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="125" cy="92" rx="112" ry="7" fill="#111" opacity="0.18" />
      <path d="M14 71V53c0-8 5-14 13-16l58-14c9-2 18-2 27 0l54 14c9 2 15 8 15 16v18z" fill="#eef2f6" stroke="#111" strokeWidth="3" />
      <path d="M52 36h44v25H38zM110 36h42l23 25h-65z" fill="#0a1a33" stroke="#111" strokeWidth="2" />
      <path d="M20 72h210" stroke="#111" strokeWidth="3" />
      <circle cx="62" cy="78" r="15" fill="#111" />
      <circle cx="62" cy="78" r="6" fill="#93a0b9" />
      <circle cx="187" cy="78" r="15" fill="#111" />
      <circle cx="187" cy="78" r="6" fill="#93a0b9" />
      <rect x="104" y="48" width="53" height="10" fill="#162b45" />
      <text x="130" y="56" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#fff" fontWeight="700">POLITIE</text>
      <rect x="86" y="24" width="22" height="7" rx="3" fill="#2f7fd1" />
      <rect x="110" y="24" width="22" height="7" rx="3" fill="#d8302c" />
      <path d="M30 35h12M203 35h12" stroke="#2f7fd1" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PoliceSide({ side }: { side: "left" | "right" }) {
  return (
    <div className={`absolute bottom-[36px] z-30 w-[205px] ${side === "left" ? "left-0" : "right-0"}`}>
      <div className={`relative ${side === "right" ? "text-right" : ""}`}>
        <div className={`absolute bottom-[52px] ${side === "left" ? "left-0" : "right-0"}`}>
          <PoliceCar side={side} />
        </div>
        <div className={`relative flex items-end ${side === "right" ? "justify-end" : ""}`}>
          <PoliceFigure side={side} />
          <PoliceFigure side={side} />
          <PoliceFigure side={side} />
        </div>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#2f7fd1]">
          Politie
        </p>
      </div>
    </div>
  );
}
