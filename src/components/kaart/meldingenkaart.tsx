"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { luisterNaarKaartpunten, type KaartPunt } from "@/lib/kaartpunten";
import { SOORT_LABEL } from "@/lib/meldingen";
import { CAD_ZAKEN, OPENBARE_ZAKEN } from "@/lib/openbare-zaken";
import { cn } from "@/lib/utils";
import { btnPrimary } from "@/lib/ui";

const TILE_CARTO =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTR_CARTO =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
const ATTR_OSM =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export function MeldingenKaart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const laagMeldingenRef = useRef<L.LayerGroup | null>(null);
  const laagRechtspraakRef = useRef<L.LayerGroup | null>(null);
  const laagOverledenRef = useRef<L.LayerGroup | null>(null);
  const [punten, setPunten] = useState<KaartPunt[] | null>(null);
  const [mislukt, setMislukt] = useState(false);
  const [tegelfallback, setTegelfallback] = useState(false);
  const [toonMeldingen, setToonMeldingen] = useState(true);
  const [toonRechtspraak, setToonRechtspraak] = useState(true);
  const [toonOverleden, setToonOverleden] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [52.15, 5.3],
      zoom: 7,
      minZoom: 6,
      maxZoom: 16,
      scrollWheelZoom: true,
    });

    // Kaarttegels: CARTO als het kan, OpenStreetMap als tegels geblokkeerd
    // worden (sommige adblockers weren de CARTO-server).
    let tegelFouten = 0;
    const cartoLaag = L.tileLayer(TILE_CARTO, {
      attribution: ATTR_CARTO,
      subdomains: "abcd",
      maxZoom: 19,
    });
    cartoLaag.on("tileerror", () => {
      tegelFouten += 1;
      if (tegelFouten >= 4 && map.hasLayer(cartoLaag)) {
        map.removeLayer(cartoLaag);
        L.tileLayer(TILE_OSM, { attribution: ATTR_OSM, maxZoom: 19 }).addTo(map);
        setTegelfallback(true);
      }
    });
    cartoLaag.addTo(map);

    // Laag: rechtspraak (openbare uitspraken, per plaats van het incident).
    const laagRechtspraak = L.layerGroup().addTo(map);
    OPENBARE_ZAKEN.forEach((zaak) => {
      L.circleMarker([zaak.lat, zaak.lng], {
        radius: 6.5,
        color: "#07090c",
        weight: 1.5,
        fillColor: "#f4f5f6",
        fillOpacity: 0.95,
      })
        .bindPopup(
          `<strong>${zaak.titel}</strong><br>` +
            `${zaak.jaar} · ${zaak.plaats} · rechtszaak<br>` +
            `<em>${zaak.uitslag}</em><br>` +
            `<a href="${zaak.bronUrl}" target="_blank" rel="noopener noreferrer">${zaak.bronLabel}</a>`
        )
        .addTo(laagRechtspraak);
    });
    laagRechtspraakRef.current = laagRechtspraak;

    // Laag: overleden onder verantwoordelijkheid van wetshandhavers
    // (openbare database Controle Alt Delete; bewust zonder namen).
    const laagOverleden = L.layerGroup().addTo(map);
    CAD_ZAKEN.forEach((zaak) => {
      L.circleMarker([zaak.lat, zaak.lng], {
        radius: 7.5,
        color: "#e5484d",
        weight: 2.5,
        fillColor: "#f4f5f6",
        fillOpacity: 0.95,
      })
        .bindPopup(
          `<strong>Overleden na politieoptreden</strong><br>` +
            `${zaak.jaar} · ${zaak.plaats}<br>` +
            `Politiegeweld: ${zaak.geweld} · Doodgeschoten: ${zaak.geschoten}<br>` +
            `${zaak.status ? zaak.status + "<br>" : ""}` +
            `<a href="${zaak.bronUrl}" target="_blank" rel="noopener noreferrer">Bron: ${zaak.bronLabel}</a><br>` +
            `<span style="opacity:.7">Naam en verhaal staan in de database van Controle Alt Delete.</span>`
        )
        .addTo(laagOverleden);
    });
    laagOverledenRef.current = laagOverleden;

    // Laag: meldingen van bezoekers (rood, afgerond op ongeveer 1 km).
    const laagMeldingen = L.layerGroup().addTo(map);
    laagMeldingenRef.current = laagMeldingen;

    const stop = luisterNaarKaartpunten(
      (nieuwePunten) => {
        setPunten(nieuwePunten);
        laagMeldingen.clearLayers();
        nieuwePunten.forEach((punt) => {
          L.circleMarker([punt.lat, punt.lng], {
            radius: 8,
            color: "#e5484d",
            weight: 1.5,
            fillColor: "#e5484d",
            fillOpacity: 0.5,
          })
            .bindPopup(
              `<strong>${SOORT_LABEL[punt.soort] ?? "Melding"}</strong><br>${punt.maand} · locatie bij benadering`
            )
            .addTo(laagMeldingen);
        });
      },
      () => setMislukt(true)
    );

    mapRef.current = map;

    return () => {
      stop();
      map.remove();
      mapRef.current = null;
      laagMeldingenRef.current = null;
      laagRechtspraakRef.current = null;
      laagOverledenRef.current = null;
    };
  }, []);

  function schakel(
    map: L.Map | null,
    laag: L.LayerGroup | null,
    aan: boolean
  ) {
    if (!map || !laag) return;
    if (aan) {
      laag.addTo(map);
    } else {
      map.removeLayer(laag);
    }
  }

  useEffect(() => {
    schakel(mapRef.current, laagOverledenRef.current, toonOverleden);
  }, [toonOverleden]);

  useEffect(() => {
    schakel(mapRef.current, laagRechtspraakRef.current, toonRechtspraak);
  }, [toonRechtspraak]);

  useEffect(() => {
    schakel(mapRef.current, laagMeldingenRef.current, toonMeldingen);
  }, [toonMeldingen]);

  const aantalMeldingen = punten?.length ?? 0;
  const aantalRechtspraak = OPENBARE_ZAKEN.length;
  const aantalOverleden = CAD_ZAKEN.length;

  const tellingen = new Map<string, number>();
  punten?.forEach((punt) => {
    tellingen.set(punt.soort, (tellingen.get(punt.soort) ?? 0) + 1);
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-3 text-sm">
        <button
          type="button"
          onClick={() => setToonMeldingen((waarde) => !waarde)}
          aria-pressed={toonMeldingen}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition-colors",
            toonMeldingen
              ? "border-accent bg-accent-soft text-foreground"
              : "border-line-strong text-muted-2 hover:text-muted"
          )}
        >
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent" />
          Meldingen ({punten === null && !mislukt ? "…" : aantalMeldingen})
        </button>
        <button
          type="button"
          onClick={() => setToonRechtspraak((waarde) => !waarde)}
          aria-pressed={toonRechtspraak}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition-colors",
            toonRechtspraak
              ? "border-line-strong bg-white/10 text-foreground"
              : "border-line-strong text-muted-2 hover:text-muted"
          )}
        >
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full border border-[#07090c] bg-white"
          />
          Rechtspraak ({aantalRechtspraak})
        </button>
        <button
          type="button"
          onClick={() => setToonOverleden((waarde) => !waarde)}
          aria-pressed={toonOverleden}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition-colors",
            toonOverleden
              ? "border-line-strong bg-white/10 text-foreground"
              : "border-line-strong text-muted-2 hover:text-muted"
          )}
        >
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full border-2 border-accent bg-white"
          />
          Overleden ({aantalOverleden})
        </button>
        <span className="text-xs text-muted-2">
          Openbare zaken op stadsniveau, met bron · meldingen afgerond op
          ongeveer 1 km
        </span>
        {tegelfallback ? (
          <span className="text-xs text-muted-2">
            · tegels van OpenStreetMap geladen
          </span>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-line">
        <div
          ref={containerRef}
          role="application"
          aria-label="Kaart met meldingen, rechtspraak en overledenen rond politieoptreden"
          className="h-[62vh] min-h-[420px] w-full"
        />

        {punten !== null && punten.length === 0 && toonMeldingen ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-5">
            <div className="pointer-events-auto max-w-[460px] rounded-xl border border-line bg-background/90 p-5 text-center backdrop-blur">
              <p className="text-sm leading-relaxed text-muted">
                Nog geen meldingen van bezoekers. De openbare zaken staan al op
                de kaart. Jij kunt de eerste melding toevoegen.
              </p>
              <Link
                href="/melden"
                className={`${btnPrimary} mt-4 h-10 px-4 text-[13px]`}
              >
                Melding doen
              </Link>
            </div>
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
      </div>

      {tellingen.size > 0 ? (
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
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
