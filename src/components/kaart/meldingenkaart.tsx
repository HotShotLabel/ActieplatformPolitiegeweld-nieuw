"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Map as MlMap,
  Marker,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";

// Zelf gehoste worker; anders faalt de worker-load onder Turbopack.
setWorkerUrl("/maplibre-gl-worker.mjs");
import { luisterNaarKaartpunten, type KaartPunt } from "@/lib/kaartpunten";
import { SOORT_LABEL } from "@/lib/meldingen";
import { CAD_ZAKEN, OPENBARE_ZAKEN } from "@/lib/openbare-zaken";
import { cn } from "@/lib/utils";
import { btnPrimary } from "@/lib/ui";

const STIJL_DONKER = "https://tiles.openfreemap.org/styles/dark";
const STIJL_LICHT = "https://tiles.openfreemap.org/styles/bright";

function maakStip(achtergrond: string, rand: string, grootte: number) {
  const el = document.createElement("div");
  el.style.width = `${grootte}px`;
  el.style.height = `${grootte}px`;
  el.style.borderRadius = "9999px";
  el.style.background = achtergrond;
  el.style.border = rand;
  el.style.boxShadow = "0 1px 6px rgba(0, 0, 0, 0.45)";
  el.style.cursor = "pointer";
  return el;
}

export function MeldingenKaart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersMeldingen = useRef<Marker[]>([]);
  const markersRechtspraak = useRef<Marker[]>([]);
  const markersOverleden = useRef<Marker[]>([]);
  const toonStand = useRef({ meldingen: true, rechtspraak: true, overleden: true });
  const [punten, setPunten] = useState<KaartPunt[] | null>(null);
  const [mislukt, setMislukt] = useState(false);
  const [kaartfout, setKaartfout] = useState(false);
  const [stijlval, setStijlval] = useState(false);
  const [toonMeldingen, setToonMeldingen] = useState(true);
  const [toonRechtspraak, setToonRechtspraak] = useState(true);
  const [toonOverleden, setToonOverleden] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let foutTeller = 0;
    let stijlgewisseld = false;

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

    // Als de donkere stijl niet laadt: eenmalig de lichte stijl proberen.
    // Blijft het fout gaan, dan tonen we een nette melding.
    map.on("error", () => {
      foutTeller += 1;
      if (foutTeller >= 3 && !stijlgewisseld) {
        stijlgewisseld = true;
        map.setStyle(STIJL_LICHT);
        setStijlval(true);
      }
      if (foutTeller >= 15) setKaartfout(true);
    });

    // Laag: rechtspraak (openbare uitspraken, per plaats van het incident).
    markersRechtspraak.current = OPENBARE_ZAKEN.map((zaak) =>
      new Marker({
        element: maakStip("#f4f5f6", "1.5px solid #07090c", 13),
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

    // Laag: overleden onder verantwoordelijkheid van wetshandhavers
    // (openbare database Controle Alt Delete; bewust zonder namen).
    markersOverleden.current = CAD_ZAKEN.map((zaak) =>
      new Marker({
        element: maakStip("#f4f5f6", "2.5px solid #e5484d", 15),
      })
        .setLngLat([zaak.lng, zaak.lat])
        .setPopup(
          new Popup({ offset: 12, maxWidth: "320px" }).setHTML(
            `<strong>Overleden na politieoptreden</strong><br>` +
              `${zaak.jaar} · ${zaak.plaats}<br>` +
              `Politiegeweld: ${zaak.geweld} · Doodgeschoten: ${zaak.geschoten}<br>` +
              `${zaak.status ? zaak.status + "<br>" : ""}` +
              `<a href="${zaak.bronUrl}" target="_blank" rel="noopener noreferrer">Bron: ${zaak.bronLabel}</a><br>` +
              `<span style="opacity:.7">Naam en verhaal staan in de database van Controle Alt Delete.</span>`
          )
        )
        .addTo(map)
    );

    // Laag: meldingen van bezoekers (rood, afgerond op ongeveer 1 km).
    const stop = luisterNaarKaartpunten(
      (nieuwePunten) => {
        setPunten(nieuwePunten);
        markersMeldingen.current.forEach((marker) => marker.remove());
        markersMeldingen.current = nieuwePunten.map((punt) => {
          const marker = new Marker({
            element: maakStip("rgba(229, 72, 77, 0.55)", "1.5px solid #e5484d", 16),
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

    mapRef.current = map;

    return () => {
      stop();
      map.remove();
      mapRef.current = null;
      markersMeldingen.current = [];
      markersRechtspraak.current = [];
      markersOverleden.current = [];
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
    toonStand.current.overleden = toonOverleden;
    const map = mapRef.current;
    if (!map) return;
    markersOverleden.current.forEach((marker) =>
      toonOverleden ? marker.addTo(map) : marker.remove()
    );
  }, [toonOverleden]);

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
          Kaarttegels van OpenFreeMap (OpenStreetMap-gegevens), zonder
          API-sleutel · openbare zaken op stadsniveau, meldingen afgerond op
          ongeveer 1 km
        </span>
        {stijlval ? (
          <span className="text-xs text-muted-2">
            · lichte kaartstijl geladen
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

        {kaartfout ? (
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="mx-auto max-w-[440px] rounded-xl border border-line bg-background/90 p-4 text-center text-sm text-muted backdrop-blur">
              De kaarttegels konden niet worden geladen. Ververs de pagina of
              probeer het later nog eens.
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
