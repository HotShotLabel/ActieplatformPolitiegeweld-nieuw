/* Scène bij de cijfers: politieauto met zwaailichten en twee agenten,
   zodat in één oogopslag te zien is waar de cijfers over gaan. Puur SVG +
   CSS; licht en beweging volgen de voorkeur voor minder beweging. */

const POLITIE_AUTO_D =
  "M240,104H228.64L201.25,56.06A16,16,0,0,0,187.36,48H68.64a16,16,0,0,0-13.89,8.06L27.36,104H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V184h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V120h8a8,8,0,0,0,0-16ZM68.64,64H187.36l22.85,40H45.79ZM64,200H40V184H64Zm128,0V184h24v16Zm24-32H40V120H216ZM56,144a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H64A8,8,0,0,1,56,144Zm112,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H176A8,8,0,0,1,168,144ZM96,24a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,24Z";

function Agent({
  x,
  schaal,
  klasse,
}: {
  x: number;
  schaal: number;
  klasse: string;
}) {
  return (
    <g transform={`translate(${x}, 0) scale(${schaal})`}>
      <g className={klasse}>
        {/* hoofd + pet */}
        <circle cx="0" cy="128" r="11" fill="#aeb6bf" />
        <path
          d="M-14 124 a14 9 0 0 1 28 0 l-5 2 h-18 z"
          fill="#8f98a3"
        />
        <path d="M10 124 h14 v3 h-14 z" fill="#8f98a3" />
        {/* lijf */}
        <path
          d="M-13 142 h26 c6 0 10 5 10 11 v46 h-46 v-46 c0-6 4-11 10-11 z"
          fill="#aeb6bf"
        />
        {/* armen */}
        <path d="M-13 146 l-10 34 h9 l9 -28 z" fill="#98a1ab" />
        <path d="M13 146 l12 30 h-9 l-11 -26 z" fill="#98a1ab" />
        {/* benen */}
        <path d="M-12 199 h11 v15 h-11 z" fill="#8f98a3" />
        <path d="M1 199 h11 v15 h-11 z" fill="#8f98a3" />
        {/* reflectiestrepen */}
        <path d="M-9 158 h18 v4 h-18 z" fill="#eef1f4" />
        <path d="M-9 168 h18 v4 h-18 z" fill="#eef1f4" />
      </g>
    </g>
  );
}

export function PolitieScene() {
  return (
    <figure className="my-0">
      <div className="overflow-hidden rounded-2xl border border-line bg-[#0b0e13] px-2 py-1">
        <svg
          viewBox="0 0 900 240"
          role="img"
          aria-label="Politieauto met zwaailichten en twee agenten aan de rand van een straat"
          className="h-auto w-full"
        >
          {/* zachte gloed achter de auto */}
          <ellipse cx="640" cy="196" rx="220" ry="26" fill="#e5484d" opacity="0.07" />
          {/* straat */}
          <line x1="30" y1="214" x2="870" y2="214" stroke="#39404a" strokeWidth="3" />
          <line x1="30" y1="222" x2="870" y2="222" stroke="#2a3038" strokeWidth="2" strokeDasharray="26 18" />

          {/* agenten links, kijkend naar de auto */}
          <Agent x={150} schaal={0.95} klasse="agent-sway" />
          <Agent x={225} schaal={1.04} klasse="agent-sway-langzaam" />

          {/* politieauto rechts */}
          <g transform="translate(520,20) scale(0.9)">
            <path d={POLITIE_AUTO_D} fill="#e8eaed" />
            {/* zwaailichten op het dak (rond x=128, y=44) */}
            <circle cx="118" cy="40" r="16" fill="#e5484d" className="sirene-rood" opacity="0.35" />
            <circle cx="138" cy="40" r="16" fill="#3b82f6" className="sirene-blauw" opacity="0.35" />
            <circle cx="118" cy="40" r="7" fill="#e5484d" className="sirene-rood" />
            <circle cx="138" cy="40" r="7" fill="#3b82f6" className="sirene-blauw" />
          </g>

          {/* koplampgloed */}
          <ellipse cx="508" cy="182" rx="26" ry="8" fill="#ffd98a" opacity="0.12" />
        </svg>
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted-2">
        Elk cijfer op deze pagina gaat over dit beeld: politie-inzet met
        geweld, vastgelegd in de eigen registraties van de politie.
      </figcaption>
    </figure>
  );
}
