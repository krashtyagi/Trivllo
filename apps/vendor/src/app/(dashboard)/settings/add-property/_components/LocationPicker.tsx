"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom modern Leaflet marker
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [center, map]);

  return null;
}

function MapClickHandler({ onChange }: { onChange: (coords: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

interface LocationPickerProps {
  value: [number, number]; // [lat, lng]
  onChange: (coords: [number, number]) => void;
  className?: string;
}

export default function LocationPicker({
  value,
  onChange,
  className = "h-[320px] w-full",
}: LocationPickerProps) {
  const center: [number, number] =
    value && value[0] && value[1] ? value : [19.076, 72.8777];

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border shadow-inner ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        <MapClickHandler onChange={onChange} />
        <Marker
          position={center}
          icon={customIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onChange([position.lat, position.lng]);
            },
          }}
        />
      </MapContainer>

      {/* Subtle overlay hint */}
      <div className="absolute bottom-2 left-2 z-[400] bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-muted-foreground border border-border shadow-xs pointer-events-none">
        Click or drag the pin to set exact property location
      </div>
    </div>
  );
}
