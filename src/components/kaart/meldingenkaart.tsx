"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Map as MlMap, Marker, Popup, setWorkerUrl } from "maplibre-gl";
import {
  createElement as lucideElement,
  Gavel,
  HandFist,
  Landmark,
  Newspaper,
  ShieldAlert,
  TriangleAlert,
  type IconNode,
} from "lucide";
import { luisterNaarKaartpunten, type KaartPunt } from "@/lib/kaartpunten";
import { AGENT_ZAKEN } from "@/lib/agent-zaken";
import { GEWELD_ZAKEN } from "@/lib/geweld-zaken";
import { SOORT_LABEL } from "@/lib/meldingen";
import { NL_PLAATSEN } from "@/lib/nl-plaatsen";
import { CAD_ZAKEN, OPENBARE_ZAKEN } from "@/lib/openbare-zaken";
import { cn } from "@/lib/utils";

// Zelf gehoste worker; anders faalt de worker-load onder Turbopack.
setWorkerUrl("/maplibre-gl-worker.mjs");

/* Dichtstbijzijnde plaatsnaam bij een punt (voor politiebureaus e.d.).
   Binnen ongeveer vijf kilometer; anders leeg. */
function dichtstbijzijndePlaats(lat: number, lng: number): string {
  let beste = "";
  let besteAfstand = 0.045 * 0.045;
  for (const [naam, coord] of Object.entries(NL_PLAATSEN)) {
    const dy = coord[0] - lat;
    const dx = (coord[1] - lng) * 0.62;
    const afstand = dy * dy + dx * dx;
    if (afstand < besteAfstand) {
      besteAfstand = afstand;
      beste = naam;
    }
  }
  return beste;
}

const STIJL_DONKER = "https://tiles.openfreemap.org/styles/dark";
const STIJL_LICHT = "https://tiles.openfreemap.org/styles/positron";
const STIJL_NOOD = "https://tiles.openfreemap.org/styles/bright";

interface Voorziening {
  naam: string;
  lat: number;
  lng: number;
}

interface Voorzieningen {
  politie: Voorziening[];
  rechtbank: Voorziening[];
}

/*
  Iconen.
  - Politieauto: het gevulde politieauto-icoon uit Phosphor Icons (MIT),
    goed leesbaar op klein formaat.
  - Graf: een eenvoudige grafsteen (zelf getekend, bewust ingetogen en
    neutraal, geen religieuze symbolen).
  - De rest komt uit Lucide (MIT).
*/
interface Icoon {
  viewBox: string;
  sw: number;
  binnen: (kleur: string) => string;
}

const POLITIE_AUTO_D =
  "M240,104H228.64L201.25,56.06A16,16,0,0,0,187.36,48H68.64a16,16,0,0,0-13.89,8.06L27.36,104H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V184h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V120h8a8,8,0,0,0,0-16ZM68.64,64H187.36l22.85,40H45.79ZM64,200H40V184H64Zm128,0V184h24v16Zm24-32H40V120H216ZM56,144a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H64A8,8,0,0,1,56,144Zm112,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H176A8,8,0,0,1,168,144ZM96,24a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,24Z";

const GRAF_STEEN_D = "M88 216V124a40 40 0 0 1 80 0v92";
const GRAF_GROND_D = "M56 216h144";
const GRAF_LIJN_D = "M108 152h44";

function lucideIcoon(knoop: IconNode, sw: number): Icoon {
  return {
    viewBox: "0 0 24 24",
    sw,
    binnen: () => lucideElement(knoop).innerHTML,
  };
}

const ICOON_HAMER = lucideIcoon(Gavel, 2.2);
const ICOON_VUIST = lucideIcoon(HandFist, 2.2);
const ICOON_SCHILD = lucideIcoon(ShieldAlert, 2.2);
const ICOON_ZUILEN = lucideIcoon(Landmark, 2.2);
const ICOON_DRIEHOEK = lucideIcoon(TriangleAlert, 2.4);
const ICOON_NIEUWS = lucideIcoon(Newspaper, 2.2);

const ICOON_POLITIEAUTO: Icoon = {
  viewBox: "0 0 256 256",
  sw: 0,
  binnen: (kleur) => `<path fill="${kleur}" stroke="none" d="${POLITIE_AUTO_D}"/>`,
};

const ICOON_GRAF: Icoon = {
  viewBox: "0 0 256 256",
  sw: 20,
  binnen: () =>
    `<path d="${GRAF_STEEN_D}"/><path d="${GRAF_GROND_D}"/><path d="${GRAF_LIJN_D}"/>`,
};

function tekenIcoon(
  icoon: Icoon,
  kleur: string,
  maat: number,
  plek?: { x: number; y: number }
) {
  const positie = plek ? ` x="${plek.x}" y="${plek.y}"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg"${positie} width="${maat}" height="${maat}" ` +
    `viewBox="${icoon.viewBox}" fill="none" stroke="${kleur}" stroke-width="${icoon.sw}" ` +
    `stroke-linecap="round" stroke-linejoin="round">${icoon.binnen(kleur)}</svg>`
  );
}

function maakBadgeElement(
  icoon: Icoon,
  badgeKleur: string,
  randKleur: string,
  icoonKleur: string,
  grootte = 26
) {
  const badge = document.createElement("div");
  badge.style.cssText = [
    `width:${grootte}px`,
    `height:${grootte}px`,
    "border-radius:9999px",
    `background:${badgeKleur}`,
    `border:2px solid ${randKleur}`,
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "box-shadow:0 2px 8px rgba(0,0,0,.5)",
    "cursor:pointer",
  ].join(";");
  badge.innerHTML = tekenIcoon(icoon, icoonKleur, Math.round(grootte * 0.6));
  return badge;
}

function badgeSvgMarkup(
  icoon: Icoon,
  badgeKleur: string,
  randKleur: string,
  icoonKleur: string
) {
  const maat = 28;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">` +
    `<circle cx="24" cy="24" r="20" fill="${badgeKleur}" stroke="${randKleur}" stroke-width="3"/>` +
    tekenIcoon(icoon, icoonKleur, maat, { x: (48 - maat) / 2, y: (48 - maat) / 2 }) +
    `</svg>`
  );
}

async function voegIcoonAfbeeldingToe(
  map: MlMap,
  id: string,
  icoon: Icoon,
  badgeKleur: string,
  randKleur: string,
  icoonKleur: string
) {
  if (map.hasImage(id)) return;
  const markup = badgeSvgMarkup(icoon, badgeKleur, randKleur, icoonKleur);
  const blob = new Blob([markup], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const afbeelding = new Image();
    await new Promise<void>((resolve, reject) => {
      afbeelding.onload = () => resolve();
      afbeelding.onerror = () => reject(new Error("icoon laden faalde"));
      afbeelding.src = url;
    });
    if (!map.hasImage(id)) map.addImage(id, afbeelding);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function IcoonChipBadge({
  icoon,
  badgeKleur,
  randKleur,
  icoonKleur,
}: {
  icoon: Icoon;
  badgeKleur: string;
  randKleur: string;
  icoonKleur: string;
}) {
  return (
    <span
      aria-hidden
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
      style={{ background: badgeKleur, borderColor: randKleur }}
      dangerouslySetInnerHTML={{
        __html: tekenIcoon(icoon, icoonKleur, 12),
      }}
    />
  );
}

function escapeHtml(tekst: string) {
  return tekst
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function MeldingenKaart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersMeldingen = useRef<Marker[]>([]);
  const markersRechtspraak = useRef<Marker[]>([]);
  const markersOverleden = useRef<Marker[]>([]);
  const markersNieuws = useRef<Marker[]>([]);
  const markersGeweld = useRef<Marker[]>([]);
  const markersAgenten = useRef<Marker[]>([]);
  const nieuwsUrls = useRef(new Set<string>());
  const voorzieningen = useRef<Voorzieningen | null>(null);
  const eersteStijlwissel = useRef(true);
  const toonStand = useRef({
    meldingen: true,
    rechtspraak: true,
    geweld: true,
    agenten: true,
    overleden: true,
    nieuws: true,
    politie: true,
    rechtbank: true,
  });
  const [punten, setPunten] = useState<KaartPunt[] | null>(null);
  const [nieuwsGepind, setNieuwsGepind] = useState<number | null>(null);
  const [overledenAantal, setOverledenAantal] = useState<number | null>(null);
  const [overledenTotaal, setOverledenTotaal] = useState<number | null>(null);
  const [overledenZonder, setOverledenZonder] = useState<
    { id: string; jaar: string; status: string; bronUrl: string; bronLabel: string }[]
  >([]);
  const [laatsteNieuws, setLaatsteNieuws] = useState<
    { titel: string; bron: string; url: string; datum: string; live: boolean }[]
  >([]);
  const [bijgewerktOp, setBijgewerktOp] = useState("");
  const [aantallen, setAantallen] = useState<{ politie: number; rechtbank: number } | null>(null);
  const [mislukt, setMislukt] = useState(false);
  const [kaartfout, setKaartfout] = useState(false);
  const [stijlval, setStijlval] = useState(false);
  const [donker, setDonker] = useState(true);
  const [toonMeldingen, setToonMeldingen] = useState(true);
  const [toonRechtspraak, setToonRechtspraak] = useState(true);
  const [toonGeweld, setToonGeweld] = useState(true);
  const [toonAgenten, setToonAgenten] = useState(true);
  const [toonOverleden, setToonOverleden] = useState(true);
  const [toonNieuws, setToonNieuws] = useState(true);
  const [toonPolitie, setToonPolitie] = useState(true);
  const [toonRechtbank, setToonRechtbank] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let foutTeller = 0;
    let stijlgewisseld = false;
    let voorzieningenBezig = false;

    const map = new MlMap({
      container: containerRef.current,
      style: STIJL_DONKER,
      center: [5.3, 52.15],
      zoom: 7,
      minZoom: 6,
      maxZoom: 16,
      dragRotate: false,
      touchPitch: false,
    });

    map.on("error", () => {
      foutTeller += 1;
      if (foutTeller >= 3 && !stijlgewisseld) {
        stijlgewisseld = true;
        map.setStyle(STIJL_NOOD);
        setStijlval(true);
      }
      if (foutTeller >= 15) setKaartfout(true);
    });

    function pasZichtbaarheidToe() {
      const zet = (laag: string, aan: boolean) => {
        if (map.getLayer(laag)) {
          map.setLayoutProperty(laag, "visibility", aan ? "visible" : "none");
        }
      };
      zet("politie-iconen", toonStand.current.politie);
      zet("rechtbank-iconen", toonStand.current.rechtbank);
    }

    function voegVoorzieningenToe() {
      const data = voorzieningen.current;
      if (!data || voorzieningenBezig) return;
      if (!map.isStyleLoaded()) return; // style.load/idle proberen het opnieuw
      if (map.getSource("politie") && map.getSource("rechtbank")) return;

      voorzieningenBezig = true;
      (async () => {
        try {
          await voegIcoonAfbeeldingToe(
            map,
            "icoon-politie",
            ICOON_POLITIEAUTO,
            "#e8eef5",
            "#7d97b3",
            "#2f4b66"
          );
          await voegIcoonAfbeeldingToe(
            map,
            "icoon-rechtbank",
            ICOON_ZUILEN,
            "#f7f1e4",
            "#c9a86a",
            "#8a6d35"
          );
          if (mapRef.current !== map) return;
          if (!map.getSource("politie")) {
            map.addSource("politie", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: data.politie.map((item) => ({
                  type: "Feature" as const,
                  geometry: { type: "Point" as const, coordinates: [item.lng, item.lat] },
                  properties: { naam: item.naam },
                })),
              },
            });
            map.addLayer({
              id: "politie-iconen",
              type: "symbol",
              source: "politie",
              layout: {
                "icon-image": "icoon-politie",
                "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.24, 10, 0.3, 14, 0.5],
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
              },
            });
          }
          if (!map.getSource("rechtbank")) {
            map.addSource("rechtbank", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: data.rechtbank.map((item) => ({
                  type: "Feature" as const,
                  geometry: { type: "Point" as const, coordinates: [item.lng, item.lat] },
                  properties: { naam: item.naam },
                })),
              },
            });
            map.addLayer({
              id: "rechtbank-iconen",
              type: "symbol",
              source: "rechtbank",
              layout: {
                "icon-image": "icoon-rechtbank",
                "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.26, 10, 0.34, 14, 0.55],
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
              },
            });
          }
          pasZichtbaarheidToe();
        } catch (fout) {
          console.error("Voorzieningenlaag faalde, opnieuw proberen:", fout);
        } finally {
          voorzieningenBezig = false;
        }
      })();
    }

    map.on("style.load", voegVoorzieningenToe);
    map.on("idle", voegVoorzieningenToe);

    fetch("/voorzieningen.json")
      .then((antwoord) => antwoord.json())
      .then((data: Voorzieningen) => {
        voorzieningen.current = data;
        setAantallen({ politie: data.politie.length, rechtbank: data.rechtbank.length });
        voegVoorzieningenToe();
      })
      .catch(() => {
        // geen voorzieningenlaag; kaart blijft werken
      });

    const voorzienPopup = new Popup({ offset: 10, maxWidth: "280px" });
    map.on("click", "politie-iconen", (event) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const { lat, lng } = event.lngLat;
      const plaats = dichtstbijzijndePlaats(lat, lng);
      voorzienPopup
        .setLngLat(event.lngLat)
        .setHTML(
          `<strong>${String(feature.properties?.naam ?? "Politielocatie")}</strong><br><span style="opacity:.7">Politiebureau${plaats ? ` · ${plaats}` : ""} · bron: OpenStreetMap</span>`
        )
        .addTo(map);
    });
    map.on("click", "rechtbank-iconen", (event) => {
      const feature = event.features?.[0];
      if (!feature) return;
      voorzienPopup
        .setLngLat(event.lngLat)
        .setHTML(
          `<strong>${String(feature.properties?.naam ?? "Rechtbank")}</strong><br><span style="opacity:.7">Rechtbank · bron: rechtspraak.nl</span>`
        )
        .addTo(map);
    });
    for (const laag of ["politie-iconen", "rechtbank-iconen"]) {
      map.on("mouseenter", laag, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", laag, () => {
        map.getCanvas().style.cursor = "";
      });
    }

    // Laag: rechtspraak (openbare uitspraken, per plaats van het incident).
    markersRechtspraak.current = OPENBARE_ZAKEN.map((zaak) =>
      new Marker({
        element: maakBadgeElement(ICOON_HAMER, "#f4f5f6", "#07090c", "#07090c"),
      })
        .setLngLat([zaak.lng, zaak.lat])
        .setPopup(
          new Popup({ offset: 12, maxWidth: "320px" }).setHTML(
            `<strong>${zaak.titel}</strong><br>` +
              `${zaak.jaar} · ${zaak.plaats} · rechtszaak<br>` +
              `<em>${zaak.uitslag}</em><br>` +
              `<a href="${zaak.bronUrl}" target="_blank" rel="noopener noreferrer">${zaak.bronLabel}</a>`
          )
        )
        .addTo(map)
    );

    // Laag: bekend politiegeweld zonder dodelijke afloop (vuist-icoon), uit
    // openbare bronnen (OM, Woo-besluiten, rechtspraak). Er bestaat geen
    // volledig landelijk register; dit zijn de herleidbare zaken.
    markersGeweld.current = GEWELD_ZAKEN.map((zaak) =>
      new Marker({
        element: maakBadgeElement(ICOON_VUIST, "#fff1ec", "#e06b52", "#b23a25"),
      })
        .setLngLat([zaak.lng, zaak.lat])
        .setPopup(
          new Popup({ offset: 12, maxWidth: "320px" }).setHTML(
            `<strong>${escapeHtml(zaak.titel)}</strong><br>` +
              `${zaak.jaar} · ${escapeHtml(zaak.plaats)} · geweld (geen dood)<br>` +
              `<span style="opacity:.85">${escapeHtml(zaak.toelichting)}</span><br>` +
              `<a href="${zaak.bronUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(zaak.bronLabel)}</a>`
          )
        )
        .addTo(map)
    );

    // Laag: politieambtenaren als dader (schild-icoon). Uit de inventaris
    // (rechtszaken, OM, nieuws); plaats is de stad of anders de eenheid.
    markersAgenten.current = AGENT_ZAKEN.map((zaak) =>
      new Marker({
        element: maakBadgeElement(ICOON_SCHILD, "#eef1f5", "#3f5871", "#2f4055"),
      })
        .setLngLat([zaak.lng, zaak.lat])
        .setPopup(
          new Popup({ offset: 12, maxWidth: "330px" }).setHTML(
            `<strong>${escapeHtml(zaak.titel)}</strong><br>` +
              `${zaak.jaar} · ${escapeHtml(zaak.plaats)} · ${escapeHtml(zaak.eenheid)}<br>` +
              `<em>${escapeHtml(zaak.uitkomst)}</em><br>` +
              `<a href="${zaak.bronUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(zaak.bronLabel)}</a>`
          )
        )
        .addTo(map)
    );

    // Laag: overleden onder verantwoordelijkheid van wetshandhavers. De
    // lijst wordt dagelijks automatisch opgehaald uit de openbare database
    // van Controle Alt Delete; de statische kopie dient als terugval.
    // (Bewust zonder namen; naam en verhaal staan bij de bron.)
    interface OverledenZaak {
      id: string;
      jaar: string;
      plaats: string;
      lat: number;
      lng: number;
      naam?: string;
      leeftijd?: string;
      datum?: string;
      tekst?: string;
      foto?: string;
      geweld: string;
      geschoten: string;
      vervolgd: string;
      veroordeeld: string;
      eenheid?: string;
      status: string;
      bronUrl: string;
      bronLabel: string;
    }
    const huidigJaar = String(new Date().getFullYear());
    function maakOverledenMarker(zaak: OverledenZaak) {
      const element = maakBadgeElement(ICOON_GRAF, "#f4f5f6", "#e5484d", "#c93a3f", 28);
      element.classList.add("marker-in");
      if (zaak.jaar === huidigJaar) element.classList.add("marker-brand");
      const marker = new Marker({ element })
        .setLngLat([zaak.lng, zaak.lat])
        .setPopup(
          new Popup({ offset: 12, maxWidth: "320px" }).setHTML(
            `${zaak.foto ? `<img src="${zaak.foto}" alt="" loading="lazy" style="float:right;margin:0 0 8px 10px;width:64px;height:64px;border-radius:10px;object-fit:cover" onerror="this.style.display='none'" />` : ""}` +
              `<strong>${zaak.naam && zaak.naam !== "Onbekend" ? escapeHtml(zaak.naam) : "Overleden na politieoptreden"}${zaak.leeftijd && zaak.leeftijd !== "Onbekend" ? ` (${escapeHtml(zaak.leeftijd)})` : ""}</strong><br>` +
              `${zaak.datum ? escapeHtml(zaak.datum) + " · " : zaak.jaar + " · "}${zaak.plaats}<br>` +
              `Politiegeweld: ${zaak.geweld} · Doodgeschoten: ${zaak.geschoten}<br>` +
              `${zaak.eenheid ? "Eenheid: " + zaak.eenheid + "<br>" : ""}` +
              `${zaak.vervolgd && zaak.vervolgd !== "Onbekend" ? "Agent vervolgd: " + zaak.vervolgd + "<br>" : ""}` +
              `${zaak.veroordeeld && zaak.veroordeeld !== "Onbekend" ? "Agent veroordeeld: " + zaak.veroordeeld + "<br>" : ""}` +
              `${zaak.status && zaak.status !== "Onbekend" ? zaak.status + "<br>" : ""}` +
              `${zaak.tekst && zaak.tekst !== "Toedracht onbekend." ? `<span style="opacity:.85">${escapeHtml(zaak.tekst.slice(0, 240))}${zaak.tekst.length > 240 ? "…" : ""}</span><br>` : ""}` +
              `<a href="${zaak.bronUrl}" target="_blank" rel="noopener noreferrer">Bron: ${zaak.bronLabel}</a>`
          )
        );
      if (toonStand.current.overleden) marker.addTo(map);
      markersOverleden.current.push(marker);
    }
    async function laadOverleden() {
      try {
        const antwoord = await fetch("/api/overleden");
        const data = await antwoord.json();
        if (Array.isArray(data.zaken) && data.zaken.length > 0) {
          data.zaken.forEach(maakOverledenMarker);
          setOverledenAantal(data.zaken.length);
          setOverledenTotaal(Number(data.totaal) || data.zaken.length);
          setOverledenZonder(
            Array.isArray(data.zonderPlaats) ? data.zonderPlaats : []
          );
          return;
        }
        throw new Error("lege lijst");
      } catch {
        CAD_ZAKEN.forEach(maakOverledenMarker);
        setOverledenAantal(CAD_ZAKEN.length);
        setOverledenTotaal(CAD_ZAKEN.length);
        setOverledenZonder([]);
      }
    }
    void laadOverleden();

    // Laag: meldingen van bezoekers (rood, afgerond op ongeveer 1 km).
    const stop = luisterNaarKaartpunten(
      (nieuwePunten) => {
        setPunten(nieuwePunten);
        markersMeldingen.current.forEach((marker) => marker.remove());
        markersMeldingen.current = nieuwePunten.map((punt) => {
          const marker = new Marker({
            element: maakBadgeElement(ICOON_DRIEHOEK, "#d23a3f", "#07090c", "#ffffff", 28),
          })
            .setLngLat([punt.lng, punt.lat])
            .setPopup(
              new Popup({ offset: 12, maxWidth: "280px" }).setHTML(
                `<strong>${SOORT_LABEL[punt.soort] ?? "Melding"}</strong><br>${punt.maand} · locatie bij benadering`
              )
            );
          if (toonStand.current.meldingen) marker.addTo(map);
          return marker;
        });
      },
      () => setMislukt(true)
    );

    // Laag: nieuwsberichten met een bekende plaats. Nieuwe punten komen
    // binnen met een animatie; live berichten pulseren. Elke vijf minuten
    // verversen houdt de kaart levend.
    async function laadNieuws() {
      try {
        const antwoord = await fetch("/api/nieuws");
        if (!antwoord.ok) return;
        const data = (await antwoord.json()) as {
          berichten: {
            titel: string;
            bron: string;
            url: string;
            datum: string;
            live: boolean;
            auteur?: string;
            plaats?: string;
            lat?: number;
            lng?: number;
          }[];
        };
        let toegevoegd = 0;
        for (const bericht of data.berichten) {
          if (bericht.lat === undefined || bericht.lng === undefined) continue;
          if (nieuwsUrls.current.has(bericht.url)) continue;
          nieuwsUrls.current.add(bericht.url);
          const element = maakBadgeElement(
            ICOON_NIEUWS,
            "#f4f5f6",
            bericht.live ? "#e5484d" : "#07090c",
            "#07090c"
          );
          element.classList.add("marker-in");
          // Alleen berichten uit het huidige jaar gloeien (2026).
          const ditJaar = String(new Date().getFullYear());
          const gloeit = bericht.datum.startsWith(ditJaar);
          if (gloeit) element.classList.add("marker-brand");
          if (bericht.live) element.classList.add("marker-brand-live");
          let platform = "";
          try {
            platform = new URL(bericht.url).hostname.replace("www.", "");
          } catch {
            platform = "";
          }
          const datum = bericht.datum
            ? bericht.datum.split("-").reverse().join("-")
            : "";
          const meta = [bericht.bron, bericht.auteur, datum, platform]
            .filter(Boolean)
            .map((deel) => escapeHtml(String(deel)))
            .join(" · ");
          const marker = new Marker({ element })
            .setLngLat([bericht.lng, bericht.lat])
            .setPopup(
              new Popup({ offset: 12, maxWidth: "340px" }).setHTML(
                `<strong>${escapeHtml(bericht.titel)}</strong>` +
                  `<div class="popup-meta">${meta}</div>` +
                  (bericht.plaats
                    ? `<div class="popup-meta">Plaats: ${escapeHtml(bericht.plaats)}</div>`
                    : "") +
                  `<div class="popup-meta"><a href="${encodeURI(bericht.url)}" target="_blank" rel="noopener noreferrer">Lees het bericht</a></div>`
              )
            );
          if (toonStand.current.nieuws) marker.addTo(map);
          markersNieuws.current.push(marker);
          toegevoegd += 1;
        }
        if (toegevoegd > 0) {
          setNieuwsGepind(markersNieuws.current.length);
        }
        setLaatsteNieuws(
          data.berichten.slice(0, 6).map(({ titel, bron, url, datum, live }) => ({
            titel,
            bron,
            url,
            datum,
            live,
          }))
        );
        setBijgewerktOp(
          new Date().toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch {
        // stil: de kaart blijft werken zonder nieuwlaag
      }
    }
    void laadNieuws();
    const nieuwsTimer = setInterval(() => void laadNieuws(), 300_000);

    mapRef.current = map;

    // Debug-haak: hiermee kan de kaart op afstand worden gecontroleerd
    // (lagen, iconen, gerenderde punten) zonder de gebruikerservaring te raken.
    (window as unknown as { __kaart?: MlMap }).__kaart = map;

    return () => {
      stop();
      clearInterval(nieuwsTimer);
      map.remove();
      mapRef.current = null;
      (window as unknown as { __kaart?: MlMap }).__kaart = undefined;
      markersMeldingen.current = [];
      markersRechtspraak.current = [];
      markersGeweld.current = [];
      markersAgenten.current = [];
      markersOverleden.current = [];
      markersNieuws.current = [];
      nieuwsUrls.current.clear();
    };
  }, []);

  useEffect(() => {
    toonStand.current.meldingen = toonMeldingen;
    const map = mapRef.current;
    if (!map) return;
    markersMeldingen.current.forEach((marker) =>
      toonMeldingen ? marker.addTo(map) : marker.remove()
    );
  }, [toonMeldingen]);

  useEffect(() => {
    toonStand.current.rechtspraak = toonRechtspraak;
    const map = mapRef.current;
    if (!map) return;
    markersRechtspraak.current.forEach((marker) =>
      toonRechtspraak ? marker.addTo(map) : marker.remove()
    );
  }, [toonRechtspraak]);

  useEffect(() => {
    toonStand.current.geweld = toonGeweld;
    const map = mapRef.current;
    if (!map) return;
    markersGeweld.current.forEach((marker) =>
      toonGeweld ? marker.addTo(map) : marker.remove()
    );
  }, [toonGeweld]);

  useEffect(() => {
    toonStand.current.agenten = toonAgenten;
    const map = mapRef.current;
    if (!map) return;
    markersAgenten.current.forEach((marker) =>
      toonAgenten ? marker.addTo(map) : marker.remove()
    );
  }, [toonAgenten]);

  useEffect(() => {
    toonStand.current.overleden = toonOverleden;
    const map = mapRef.current;
    if (!map) return;
    markersOverleden.current.forEach((marker) =>
      toonOverleden ? marker.addTo(map) : marker.remove()
    );
  }, [toonOverleden]);

  useEffect(() => {
    toonStand.current.nieuws = toonNieuws;
    const map = mapRef.current;
    if (!map) return;
    markersNieuws.current.forEach((marker) =>
      toonNieuws ? marker.addTo(map) : marker.remove()
    );
  }, [toonNieuws]);

  useEffect(() => {
    toonStand.current.politie = toonPolitie;
    const map = mapRef.current;
    if (map?.getLayer("politie-iconen")) {
      map.setLayoutProperty("politie-iconen", "visibility", toonPolitie ? "visible" : "none");
    }
  }, [toonPolitie]);

  useEffect(() => {
    toonStand.current.rechtbank = toonRechtbank;
    const map = mapRef.current;
    if (map?.getLayer("rechtbank-iconen")) {
      map.setLayoutProperty("rechtbank-iconen", "visibility", toonRechtbank ? "visible" : "none");
    }
  }, [toonRechtbank]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (eersteStijlwissel.current) {
      eersteStijlwissel.current = false;
      return;
    }
    map.setStyle(donker ? STIJL_DONKER : STIJL_LICHT);
  }, [donker]);

  const aantalMeldingen = punten?.length ?? 0;

  const tellingen = new Map<string, number>();
  punten?.forEach((punt) => {
    tellingen.set(punt.soort, (tellingen.get(punt.soort) ?? 0) + 1);
  });

  const chip = (aan: boolean) =>
    cn(
      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
      aan
        ? "border-line-strong bg-white/10 text-foreground"
        : "border-line-strong text-muted-2 hover:text-muted"
    );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setToonMeldingen((waarde) => !waarde)}
          aria-pressed={toonMeldingen}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
            toonMeldingen
              ? "border-accent bg-accent-soft text-foreground"
              : "border-line-strong text-muted-2 hover:text-muted"
          )}
        >
          <IcoonChipBadge icoon={ICOON_DRIEHOEK} badgeKleur="#d23a3f" randKleur="#07090c" icoonKleur="#ffffff" />
          Meldingen ({punten === null && !mislukt ? "…" : aantalMeldingen})
        </button>
        <button type="button" onClick={() => setToonRechtspraak((w) => !w)} aria-pressed={toonRechtspraak} className={chip(toonRechtspraak)}>
          <IcoonChipBadge icoon={ICOON_HAMER} badgeKleur="#f4f5f6" randKleur="#07090c" icoonKleur="#07090c" />
          Rechtspraak ({OPENBARE_ZAKEN.length})
        </button>
        <button type="button" onClick={() => setToonGeweld((w) => !w)} aria-pressed={toonGeweld} className={chip(toonGeweld)}>
          <IcoonChipBadge icoon={ICOON_VUIST} badgeKleur="#fff1ec" randKleur="#e06b52" icoonKleur="#b23a25" />
          Geweld (geen dood) ({GEWELD_ZAKEN.length})
        </button>
        <button type="button" onClick={() => setToonAgenten((w) => !w)} aria-pressed={toonAgenten} className={chip(toonAgenten)}>
          <IcoonChipBadge icoon={ICOON_SCHILD} badgeKleur="#eef1f5" randKleur="#3f5871" icoonKleur="#2f4055" />
          Agenten als dader ({AGENT_ZAKEN.length})
        </button>
        <button type="button" onClick={() => setToonOverleden((w) => !w)} aria-pressed={toonOverleden} className={chip(toonOverleden)}>
          <IcoonChipBadge icoon={ICOON_GRAF} badgeKleur="#f4f5f6" randKleur="#e5484d" icoonKleur="#c93a3f" />
          Overleden ({overledenAantal ?? "…"})
        </button>
        <button type="button" onClick={() => setToonNieuws((w) => !w)} aria-pressed={toonNieuws} className={chip(toonNieuws)}>
          <IcoonChipBadge icoon={ICOON_NIEUWS} badgeKleur="#f4f5f6" randKleur="#07090c" icoonKleur="#07090c" />
          Nieuws ({nieuwsGepind ?? "…"})
        </button>
        <button type="button" onClick={() => setToonPolitie((w) => !w)} aria-pressed={toonPolitie} className={chip(toonPolitie)}>
          <IcoonChipBadge icoon={ICOON_POLITIEAUTO} badgeKleur="#e8eef5" randKleur="#7d97b3" icoonKleur="#2f4b66" />
          Politiebureaus ({aantallen ? aantallen.politie : "…"})
        </button>
        <button type="button" onClick={() => setToonRechtbank((w) => !w)} aria-pressed={toonRechtbank} className={chip(toonRechtbank)}>
          <IcoonChipBadge icoon={ICOON_ZUILEN} badgeKleur="#f7f1e4" randKleur="#c9a86a" icoonKleur="#8a6d35" />
          Rechtbanken ({aantallen ? aantallen.rechtbank : "…"})
        </button>
        <span className="mx-1 hidden h-5 w-px bg-line-strong sm:block" aria-hidden />
        <button type="button" onClick={() => setDonker(true)} aria-pressed={donker} className={chip(donker)}>
          Donker
        </button>
        <button type="button" onClick={() => setDonker(false)} aria-pressed={!donker} className={chip(!donker)}>
          Licht
        </button>
        {stijlval ? (
          <span className="text-xs text-muted-2">· andere stijl geladen</span>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-line">
        <div
          ref={containerRef}
          data-lenis-prevent=""
          role="application"
          aria-label="Kaart met meldingen, rechtspraak, geweld zonder dood, agenten als dader, overledenen, politiebureaus en rechtbanken"
          className="h-[62vh] min-h-[420px] w-full"
        />

        {punten !== null && punten.length === 0 && toonMeldingen ? (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex sm:right-auto">
            <p className="pointer-events-auto rounded-full border border-line bg-background/85 px-4 py-2 text-xs leading-relaxed text-muted backdrop-blur">
              Nog geen meldingen van bezoekers.{" "}
              <Link
                href="/melden"
                className="text-accent underline underline-offset-4"
              >
                Melding doen
              </Link>
            </p>
          </div>
        ) : null}

        {mislukt ? (
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="mx-auto max-w-[440px] rounded-xl border border-line bg-background/90 p-4 text-center text-sm text-muted backdrop-blur">
              De meldingen konden niet worden geladen. Ververs de pagina om het
              opnieuw te proberen.
            </p>
          </div>
        ) : null}

        {kaartfout ? (
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="mx-auto max-w-[440px] rounded-xl border border-line bg-background/90 p-4 text-center text-sm text-muted backdrop-blur">
              De kaarttegels konden niet worden geladen. Ververs de pagina of
              probeer het later nog eens.
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <span
              aria-hidden
              className="animate-pulse-dot h-2 w-2 rounded-full bg-accent"
            />
            Laatste binnen
          </p>
          <p className="font-mono text-xs text-muted-2">
            {bijgewerktOp ? `bijgewerkt om ${bijgewerktOp}` : "laden…"}
          </p>
        </div>
        <ul className="mt-4 space-y-3">
          {laatsteNieuws.map((bericht, index) => (
            <li
              key={bericht.url}
              className="feed-in flex flex-wrap items-baseline gap-x-3 gap-y-1"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="font-mono text-xs text-muted-2">
                {bericht.datum
                  ? bericht.datum.split("-").reverse().join("-")
                  : ""}
              </span>
              <a
                href={bericht.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground underline-offset-4 hover:text-accent hover:underline"
              >
                {bericht.titel}
              </a>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-2">
                {bericht.bron}
              </span>
              {bericht.live ? (
                <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
                  <span
                    aria-hidden
                    className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-accent"
                  />
                  nieuw
                </span>
              ) : null}
            </li>
          ))}
          {laatsteNieuws.length === 0 ? (
            <li className="text-sm text-muted-2">Berichten laden…</li>
          ) : null}
        </ul>
      </div>

      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-2">
        <span>nieuws {nieuwsGepind ?? "…"}</span>
        <span>rechtszaken {OPENBARE_ZAKEN.length}</span>
        <span>overleden {overledenAantal ?? "…"} van {overledenTotaal ?? "…"}</span>
        <span>politiebureaus {aantallen ? aantallen.politie : "…"}</span>
        <span>rechtbanken {aantallen ? aantallen.rechtbank : "…"}</span>
        <span>meldingen {punten === null ? "…" : aantalMeldingen}</span>
      </p>

      <p className="mt-3 text-xs leading-relaxed text-muted-2">
        Elk punt heeft een eigen icoon: politieauto = politiebureau, zuilen =
        rechtbank, hamer = rechterlijke uitspraak, vuist = bekend geweld
        zonder dodelijke afloop, schild = agenten als dader, grafsteen =
        overleden na politieoptreden,
        waarschuwingsdriehoek = melding van geweld, krant =
        nieuwsbericht (live nieuws pulseert; alleen berichten waarvan de
        plaats bekend is staan op de kaart). Alleen het huidige jaar (2026)
        gloeit. Nieuwe berichten verschijnen
        automatisch op de kaart. Kaartmateriaal: OpenStreetMap-bijdragers.
        Openbare zaken op stadsniveau; meldingen afgerond op ongeveer een
        kilometer.
        Politiebureaus: OpenStreetMap. Rechtbanken: de officiële locatielijst
        van rechtspraak.nl (alle locaties), aangevuld met Hoge Raad en Raad
        van State.
      </p>

      {overledenZonder.length > 0 ? (
        <details className="mt-3 rounded-xl border border-line bg-surface p-4">
          <summary className="cursor-pointer text-sm text-muted">
            {overledenZonder.length} mensen zonder bekende plaats in de bron
            (staan daarom niet op de kaart)
          </summary>
          <ul className="mt-3 grid gap-1.5 text-xs leading-relaxed text-muted-2 sm:grid-cols-2 lg:grid-cols-3">
            {overledenZonder.map((zaak, index) => (
              <li
                key={zaak.id || `zonder-${index}`}
                className="flex gap-2"
              >
                <span className="font-mono">{zaak.jaar || "?"}</span>
                <span>{zaak.status || "status onbekend"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-2">
            De bron (database Controle Alt Delete) vermeldt voor deze mensen
            geen plaats. We zetten ze daarom niet op de kaart en verzinnen
            geen locatie. Deze gevallen komen uit de jaarcijfers van het
            Openbaar Ministerie (TSI-onderzoeken); daarin staan geen plaatsen
            of namen. Meer proberen te achterhalen kan via de openbaarheid-
            kanalen van politie en OM:{" "}
            <a
              className="underline"
              href="https://open.overheid.nl"
              target="_blank"
              rel="noopener noreferrer"
            >
              open.overheid.nl
            </a>
            {" · "}
            <a
              className="underline"
              href="https://www.om.nl/onderwerpen/w/wet-open-overheid/woo-documenten"
              target="_blank"
              rel="noopener noreferrer"
            >
              OM (Woo)
            </a>
            {" · "}
            <a
              className="underline"
              href="https://www.politie.nl/wet-open-overheid/woo-verzoeken"
              target="_blank"
              rel="noopener noreferrer"
            >
              politie (Woo)
            </a>
          </p>
        </details>
      ) : null}

      {tellingen.size > 0 ? (
        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          {[...tellingen.entries()].map(([soort, aantalSoort]) => (
            <div key={soort} className="flex items-center gap-2">
              <dt>{SOORT_LABEL[soort] ?? "Anders"}</dt>
              <dd className="font-mono text-foreground">{aantalSoort}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
