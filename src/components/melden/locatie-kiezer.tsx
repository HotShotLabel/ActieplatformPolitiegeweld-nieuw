"use client";

import { useEffect, useRef } from "react";
import { Map as MlMap, Marker, setWorkerUrl } from "maplibre-gl";

// Zelf gehoste worker; anders faalt de worker-load onder Turbopack.
setWorkerUrl("/maplibre-gl-worker.mjs");

export function LocatieKiezer({
  positie,
  onKies,
}: {
  positie: { lat: number; lng: number } | null;
  onKies: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onKiesRef = useRef(onKies);

  useEffect(() => {
    onKiesRef.current = onKies;
  }, [onKies]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MlMap({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: [5.3, 52.15],
      zoom: 8,
      minZoom: 7,
      maxZoom: 18,
      dragRotate: false,
      touchPitch: false,
    });

    map.on("click", (event) => {
      onKiesRef.current(event.lngLat.lat, event.lngLat.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !positie) return;

    if (markerRef.current) {
      markerRef.current.setLngLat([positie.lng, positie.lat]);
    } else {
      const el = document.createElement("div");
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "9999px";
      el.style.background = "rgba(229, 72, 77, 0.5)";
      el.style.border = "2px solid #e5484d";
      el.style.boxShadow = "0 1px 6px rgba(0, 0, 0, 0.45)";
      markerRef.current = new Marker({ element: el })
        .setLngLat([positie.lng, positie.lat])
        .addTo(map);
    }
    map.easeTo({ center: [positie.lng, positie.lat], duration: 400 });
  }, [positie]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Kies de plek op de kaart"
      className="h-64 w-full overflow-hidden rounded-lg border border-line"
    />
  );
}
