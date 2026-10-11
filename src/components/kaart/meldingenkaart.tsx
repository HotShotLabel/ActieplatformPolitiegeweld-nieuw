"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Map as MlMap, Marker, Popup, setWorkerUrl } from "maplibre-gl";
import { luisterNaarKaartpunten, type KaartPunt } from "@/lib/kaartpunten";
import { SOORT_LABEL } from "@/lib/meldingen";
import { CAD_ZAKEN, OPENBARE_ZAKEN } from "@/lib/openbare-zaken";
import { cn } from "@/lib/utils";

// Zelf gehoste worker; anders faalt de worker-load onder Turbopack.
setWorkerUrl("/maplibre-gl-worker.mjs");

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

function naarFeatureCollection(items: Voorziening[]) {
  return {
    type: "FeatureCollection" as const,
    features: items.map((item) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [item.lng, item.lat] },
      properties: { naam: item.naam },
    })),
  };
}

export function MeldingenKaart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersMeldingen = useRef<Marker[]>([]);
  const markersRechtspraak = useRef<Marker[]>([]);
  const markersOverleden = useRef<Marker[]>([]);
  const voorzieningen = useRef<Voorzieningen | null>(null);
  const eersteStijlwissel = useRef(true);
  const toonStand = useRef({
    meldingen: true,
    rechtspraak: true,
    overleden: true,
    politie: true,
    rechtbank: true,
  });
  const [punten, setPunten] = useState<KaartPunt[] | null>(null);
  const [aantallen, setAantallen] = useState<{ politie: number; rechtbank: number } | null>(null);
  const [mislukt, setMislukt] = useState(false);
  const [kaartfout, setKaartfout] = useState(false);
  const [stijlval, setStijlval] = useState(false);
  const [donker, setDonker] = useState(true);
  const [toonMeldingen, setToonMeldingen] = useState(true);
  const [toonRechtspraak, setToonRechtspraak] = useState(true);
  const [toonOverleden, setToonOverleden] = useState(true);
  const [toonPolitie, setToonPolitie] = useState(true);
  const [toonRechtbank, setToonRechtbank] = useState(true);

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

    map.on("error", () => {
      foutTeller += 1;
      if (foutTeller >= 3 && !stijlgewisseld) {
        stijlgewisseld = true;
        map.setStyle(STIJL_NOOD);
        setStijlval(true);
      }
      if (foutTeller >= 15) setKaartfout(true);
    });

    function voegVoorzieningenToe() {
      const data = voorzieningen.current;
      if (!data) return;
      if (!map.getSource("politie")) {
        map.addSource("politie", { type: "geojson", data: naarFeatureCollection(data.politie) });
        map.addLayer({
          id: "politie-cirkels",
          type: "circle",
          source: "politie",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 1.8, 10, 3.5, 14, 6],
            "circle-color": "#8aa0b8",
            "circle-opacity": 0.9,
            "circle-stroke-width": 0.6,
            "circle-stroke-color": "#07090c",
          },
        });
      }
      if (!map.getSource("rechtbank")) {
        map.addSource("rechtbank", { type: "geojson", data: naarFeatureCollection(data.rechtbank) });
        map.addLayer({
          id: "rechtbank-cirkels",
          type: "circle",
          source: "rechtbank",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 2.4, 10, 4.5, 14, 7],
            "circle-color": "#c9a86a",
            "circle-opacity": 0.95,
            "circle-stroke-width": 0.8,
            "circle-stroke-color": "#07090c",
          },
        });
      }
      pasZichtbaarheidToe();
    }

    function pasZichtbaarheidToe() {
      const zet = (laag: string, aan: boolean) => {
        if (map.getLayer(laag)) {
          map.setLayoutProperty(laag, "visibility", aan ? "visible" : "none");
        }
      };
      zet("politie-cirkels", toonStand.current.politie);
      zet("rechtbank-cirkels", toonStand.current.rechtbank);
    }

    map.on("style.load", () => {
      voegVoorzieningenToe();
    });

    // Voorzieningen (politiebureaus, rechtbanken) uit OpenStreetMap.
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
    map.on("click", "politie-cirkels", (event) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const naam = String(feature.properties?.naam ?? "Politielocatie");
      voorzienPopup
        .setLngLat(event.lngLat)
        .setHTML(
          `<strong>${naam}</strong><br><span style="opacity:.7">Politiebureau · bron: OpenStreetMap</span>`
        )
        .addTo(map);
    });
    map.on("click", "rechtbank-cirkels", (event) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const naam = String(feature.properties?.naam ?? "Rechtbank");
      voorzienPopup
        .setLngLat(event.lngLat)
        .setHTML(
          `<strong>${naam}</strong><br><span style="opacity:.7">Rechtbank · bron: OpenStreetMap</span>`
        )
        .addTo(map);
    });
    map.on("mouseenter", "politie-cirkels", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "politie-cirkels", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", "rechtbank-cirkels", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "rechtbank-cirkels", () => {
      map.getCanvas().style.cursor = "";
    });

    // Laag: rechtspraak (openbare uitspraken, per plaats van het incident).
    markersRechtspraak.current = OPENBARE_ZAKEN.map((zaak) =>
      new Marker({ element: maakStip("#f4f5f6", "1.5px solid #07090c", 13) })
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
      new Marker({ element: maakStip("#f4f5f6", "2.5px solid #e5484d", 15) })
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

  useEffect(() => {
    toonStand.current.politie = toonPolitie;
    const map = mapRef.current;
    if (map?.getLayer("politie-cirkels")) {
      map.setLayoutProperty("politie-cirkels", "visibility", toonPolitie ? "visible" : "none");
    }
  }, [toonPolitie]);

  useEffect(() => {
    toonStand.current.rechtbank = toonRechtbank;
    const map = mapRef.current;
    if (map?.getLayer("rechtbank-cirkels")) {
      map.setLayoutProperty("rechtbank-cirkels", "visibility", toonRechtbank ? "visible" : "none");
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
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent" />
          Meldingen ({punten === null && !mislukt ? "…" : aantalMeldingen})
        </button>
        <button type="button" onClick={() => setToonRechtspraak((w) => !w)} aria-pressed={toonRechtspraak} className={chip(toonRechtspraak)}>
          <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-[#07090c] bg-white" />
          Rechtspraak ({OPENBARE_ZAKEN.length})
        </button>
        <button type="button" onClick={() => setToonOverleden((w) => !w)} aria-pressed={toonOverleden} className={chip(toonOverleden)}>
          <span aria-hidden className="h-2.5 w-2.5 rounded-full border-2 border-accent bg-white" />
          Overleden ({CAD_ZAKEN.length})
        </button>
        <button type="button" onClick={() => setToonPolitie((w) => !w)} aria-pressed={toonPolitie} className={chip(toonPolitie)}>
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#8aa0b8]" />
          Politiebureaus ({aantallen ? aantallen.politie : "…"})
        </button>
        <button type="button" onClick={() => setToonRechtbank((w) => !w)} aria-pressed={toonRechtbank} className={chip(toonRechtbank)}>
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#c9a86a]" />
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
          role="application"
          aria-label="Kaart met meldingen, rechtspraak, overledenen, politiebureaus en rechtbanken"
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

      <p className="mt-3 text-xs leading-relaxed text-muted-2">
        Kaart: OpenFreeMap (OpenStreetMap-gegevens), zonder API-sleutel.
        Openbare zaken op stadsniveau; meldingen afgerond op ongeveer een
        kilometer. Politiebureaus en rechtbanken: OpenStreetMap.
      </p>

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
