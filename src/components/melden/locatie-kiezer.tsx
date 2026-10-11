"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function LocatieKiezer({
  positie,
  onKies,
}: {
  positie: { lat: number; lng: number } | null;
  onKies: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const onKiesRef = useRef(onKies);

  useEffect(() => {
    onKiesRef.current = onKies;
  }, [onKies]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [52.15, 5.3],
      zoom: 8,
      minZoom: 7,
      maxZoom: 18,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      onKiesRef.current(event.latlng.lat, event.latlng.lng);
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
      markerRef.current.setLatLng([positie.lat, positie.lng]);
    } else {
      markerRef.current = L.circleMarker([positie.lat, positie.lng], {
        radius: 9,
        color: "#e5484d",
        weight: 2,
        fillColor: "#e5484d",
        fillOpacity: 0.5,
      }).addTo(map);
    }
    map.panTo([positie.lat, positie.lng], { animate: true });
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
