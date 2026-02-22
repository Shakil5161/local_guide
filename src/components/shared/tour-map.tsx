"use client";

/**
 * TourMap
 * ───────
 * Interactive map powered by Leaflet + OpenStreetMap (no API key required).
 * Geocodes the tour's city/country or meetingPoint to get coordinates.
 *
 * Usage:
 *   <TourMap city="Dhaka" country="Bangladesh" meetingPoint="Ahsan Manzil" />
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourMapProps {
  city: string;
  country: string;
  meetingPoint?: string;
  title?: string;
}

interface Coords {
  lat: number;
  lon: number;
  displayName: string;
}

// ─── Geocoder (Nominatim / OpenStreetMap) ─────────────────────────────────────

async function geocode(query: string): Promise<Coords | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=1&addressdetails=0`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en" },
    });
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}

// ─── Inner map (lazy-loaded so Leaflet doesn't break SSR) ─────────────────────

interface LeafletMapProps {
  coords: Coords;
  title: string;
  meetingPoint?: string;
}

// We use dynamic import to avoid SSR errors with Leaflet
const LeafletMapInner = dynamic(
  () =>
    import("./leaflet-map-inner").then((mod) => mod.LeafletMapInner),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TourMap({ city, country, meetingPoint, title }: TourMapProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const query = meetingPoint
      ? `${meetingPoint}, ${city}, ${country}`
      : `${city}, ${country}`;

    geocode(query)
      .then((c) => {
        if (!c) {
          // Fallback: try just city + country
          return geocode(`${city}, ${country}`);
        }
        return c;
      })
      .then((c) => {
        if (c) setCoords(c);
        else setError(true);
      })
      .finally(() => setLoading(false));
  }, [city, country, meetingPoint]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    meetingPoint ? `${meetingPoint}, ${city}` : `${city}, ${country}`
  )}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <MapPin className="h-4 w-4 text-sky-500" />
          Meeting Point
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline"
        >
          Open in Maps <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Location label */}
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-sm text-slate-600">
        📍{" "}
        <span className="font-medium">
          {meetingPoint ? `${meetingPoint}, ` : ""}
          {city}, {country}
        </span>
      </div>

      {/* Map container */}
      <div className="relative h-72 w-full">
        {loading && <MapSkeleton />}
        {error && !loading && (
          <div className="flex h-full flex-col items-center justify-center bg-slate-100 text-center">
            <span className="text-4xl">🗺️</span>
            <p className="mt-2 text-sm text-slate-500">
              Map could not be loaded for this location.
            </p>
          </div>
        )}
        {!loading && !error && coords && (
          <LeafletMapInner
            coords={coords}
            title={title ?? city}
            meetingPoint={meetingPoint}
          />
        )}
      </div>
    </div>
  );
}
