"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { luisterNaarKaartpunten, type KaartPunt } from "@/lib/kaartpunten";
import { SOORT_LABEL } from "@/lib/meldingen";
import { btnPrimary } from "@/lib/ui";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function MeldingenKaart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const laagRef = useRef<L.LayerGroup | null>(null);
  const [punten, setPunten] = useState<KaartPunt[] | null>(null);
  const [mislukt, setMislukt] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [52.15, 5.3],
      zoom: 7,
      minZoom: 6,
      maxZoom: 16,
      scrollWheelZoom: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    laagRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const stop = luisterNaarKaartpunten(
      (nieuwePunten) => {
        setPunten(nieuwePunten);
        const laag = laagRef.current;
        if (!laag) return;
        laag.clearLayers();
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
            .addTo(laag);
        });
      },
      () => setMislukt(true)
    );

    return () => {
      stop();
      map.remove();
      mapRef.current = null;
      laagRef.current = null;
    };
  }, []);

  const aantal = punten?.length ?? 0;

  const tellingen = new Map<string, number>();
  punten?.forEach((punt) => {
    tellingen.set(punt.soort, (tellingen.get(punt.soort) ?? 0) + 1);
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-2 animate-pulse-dot rounded-full bg-accent" />
          {punten === null && !mislukt
            ? "Kaart laden…"
            : `${aantal} ${aantal === 1 ? "melding" : "meldingen"} op de kaart`}
        </span>
        <span className="text-muted-2">
          Locaties zijn afgerond op ongeveer een kilometer
        </span>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-line">
        <div
          ref={containerRef}
          role="application"
          aria-label="Kaart met meldingen van politiegeweld"
          className="h-[62vh] min-h-[420px] w-full"
        />

        {punten !== null && punten.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-5">
            <div className="pointer-events-auto max-w-[420px] rounded-xl border border-line bg-background/90 p-6 text-center backdrop-blur">
              <p className="font-display text-lg font-semibold tracking-tight">
                Nog geen meldingen op de kaart.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Elke melding met een punt verschijnt hier, als de melder dat
                wil. Jij kunt de eerste zijn.
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
            <p className="mx-auto max-w-[420px] rounded-xl border border-line bg-background/90 p-4 text-center text-sm text-muted backdrop-blur">
              De kaart kon de meldingen niet laden. Ververs de pagina om het
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
