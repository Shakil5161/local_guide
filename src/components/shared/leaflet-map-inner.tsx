"use client";

/**
 * LeafletMapInner
 * ────────────────
 * This file is ONLY loaded client-side (via dynamic import in tour-map.tsx).
 * It renders the actual Leaflet map.
 *
 * StrictMode fix: after map.remove() we also delete _leaflet_id from the
 * container div so Leaflet doesn't complain on the second mount.
 */

import { useEffect, useRef } from "react";

interface Coords {
  lat: number;
  lon: number;
  displayName: string;
}

interface Props {
  coords: Coords;
  title: string;
  meetingPoint?: string;
}

export function LeafletMapInner({ coords, title, meetingPoint }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // Store the Leaflet map instance so we can clean it up properly
  const mapInstanceRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Guard against double-initialisation (React StrictMode re-runs effects)
    // Leaflet stamps a _leaflet_id onto the container div; if it's already
    // there the map was already created — skip.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mapRef.current as any)._leaflet_id) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      // Double-check after async gap
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) return;

      // Fix default icon paths broken by webpack
      // @ts-expect-error - Leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [coords.lat, coords.lon],
        zoom: 14,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const label = meetingPoint
        ? `<strong>${meetingPoint}</strong><br/>${title}`
        : `<strong>${title}</strong>`;

      L.marker([coords.lat, coords.lon])
        .addTo(map)
        .bindPopup(label)
        .openPopup();

      mapInstanceRef.current = map;
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // Also remove Leaflet's internal stamp from the DOM node so that if the
      // component remounts (React StrictMode) it can re-initialise cleanly.
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (mapRef.current as any)._leaflet_id;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={mapRef} className="h-full w-full" />
    </>
  );
}
