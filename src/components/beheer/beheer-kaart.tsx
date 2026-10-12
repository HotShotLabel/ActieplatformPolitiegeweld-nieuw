"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds, Map as MlMap, Marker, setWorkerUrl } from "maplibre-gl";

setWorkerUrl("/maplibre-gl-worker.mjs");

export interface BeheerPunt {
  lat: number;
  lng: number;
  label: string;
}

/* Klein overzichtskaartje in beheer: alle meldpunten in één blik. */
export function BeheerKaart({ punten }: { punten: BeheerPunt[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const puntenRef = useRef(punten);
  puntenRef.current = punten;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new MlMap({
      container: containerRef.current,
      style: "/api/kaartstijl?stijl=donker",
      center: [5.3, 52.15],
      zoom: 7,
      minZoom: 5,
      maxZoom: 14,
      dragRotate: false,
      touchPitch: false,
      attributionControl: false,
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers: Marker[] = [];

    function teken() {
      const kaart = mapRef.current;
      if (!kaart) return;
      markers.forEach((marker) => marker.remove());
      markers.length = 0;
      const huidige = puntenRef.current;
      for (const punt of huidige) {
        const element = document.createElement("div");
        element.style.cssText =
          "height:14px;width:14px;border-radius:9999px;border:2px solid #f4f5f6;background:#e5484d;box-shadow:0 2px 6px rgba(0,0,0,.4);";
        markers.push(
          new Marker({ element })
            .setLngLat([punt.lng, punt.lat])
            .addTo(kaart)
        );
      }
      if (huidige.length > 0) {
        const grenzen = new LngLatBounds();
        huidige.forEach((punt) => grenzen.extend([punt.lng, punt.lat]));
        kaart.fitBounds(grenzen, { padding: 48, maxZoom: 12, duration: 0 });
      }
    }

    if (map.isStyleLoaded()) teken();
    map.on("load", teken);
    return () => {
      map.off("load", teken);
      markers.forEach((marker) => marker.remove());
    };
  }, [punten]);

  return (
    <div
      ref={containerRef}
      className="h-72 w-full overflow-hidden rounded-lg border border-line"
      role="img"
      aria-label="Kaart met meldpunten"
    />
  );
}
