'use client';

import { cn } from '@/lib/utils';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { MapContainer, Marker, TileLayer, useMap, Circle, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

export type MapHotelItem = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  price?: number | null;
  startingPrice?: number | null;
  coordinates?: [number, number]; // [lng, lat]
  location?: any;
  address?: any;
  image?: any;
  images?: any[];
  thumbnail?: string;
  hotelImages?: any[];
  city?: string;
  href?: string;
  distance?: number | null;
};

type Props = {
  className?: string;
  height?: string;
  width?: string;
  cordinates?: [number, number]; // Expected as [lng, lat]
  showRouting?: boolean;
  hotels?: MapHotelItem[];
  interactive?: boolean;
  zoom?: number;
  showRadius?: boolean;
  radiusMeters?: number;
  userCoords?: [number, number] | null; // [lat, lng]
  selectedHotelId?: string | null;
  onSelectHotel?: (id: string) => void;
  fitAllHotels?: boolean;
  cooperativeGestures?: boolean;
};

// --- Icons ---
const destinationIcon = new L.Icon({
  iconUrl: '/map-icons/map_marker2.png',
  iconRetinaUrl: '/map-icons/map_marker2.png',
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -42],
});

const userIcon = new L.Icon({
  iconUrl: '/map-icons/man.png',
  iconRetinaUrl: '/map-icons/man.png',
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -42],
});

// --- Routing Component ---
const RoutingMachine = ({
  userPos,
  destination,
  onRouteFound,
}: {
  userPos: [number, number];
  destination: [number, number];
  onRouteFound?: () => void;
}) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);
  const onRouteFoundRef = useRef(onRouteFound);

  useEffect(() => {
    onRouteFoundRef.current = onRouteFound;
  }, [onRouteFound]);

  useEffect(() => {
    if (!map || !userPos || !destination) return;

    if (!routingControlRef.current) {
      // @ts-expect-error L.Routing.control is missing from the leaflet types
      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userPos[0], userPos[1]),
          L.latLng(destination[0], destination[1]),
        ],
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 4, opacity: 0.75 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        createMarker: () => null,
        routeWhileDragging: false,
        addWaypoints: false,
        show: false,
      })
        .on('routesfound', function () {
          if (onRouteFoundRef.current) onRouteFoundRef.current();
        })
        .on('routingerror', function (e: any) {
          console.error('Routing error:', e);
          if (onRouteFoundRef.current) onRouteFoundRef.current();
        })
        .addTo(map);
    } else {
      routingControlRef.current.setWaypoints([
        L.latLng(userPos[0], userPos[1]),
        L.latLng(destination[0], destination[1]),
      ]);
    }

    return () => {
      if (routingControlRef.current && map) {
        try {
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch {
          // ignore
        }
      }
    };
  }, [map, userPos, destination]);

  return null;
};

// --- Smooth Camera Panning & Bounds Fitting Component ---
const ChangeView = ({
  center,
  zoom,
  hotels,
  fitAllHotels = false,
}: {
  center: [number, number];
  zoom: number;
  hotels?: MapHotelItem[];
  fitAllHotels?: boolean;
}) => {
  const map = useMap();
  const lastHotelsSignature = useRef<string>('');

  useEffect(() => {
    if (!map) return;

    if (fitAllHotels && hotels && hotels.length > 1) {
      const signature = hotels.map((h) => h._id || h.id || '').join(',');
      if (signature !== lastHotelsSignature.current) {
        lastHotelsSignature.current = signature;
        const validPoints: [number, number][] = [];
        hotels.forEach((h) => {
          const pt = getHotelLatLng(h);
          if (pt && !isNaN(pt[0]) && !isNaN(pt[1])) {
            validPoints.push(pt);
          }
        });
        if (validPoints.length > 1) {
          const bounds = L.latLngBounds(
            validPoints.map((p) => L.latLng(p[0], p[1]))
          );
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
          return;
        }
      }
    } else {
      map.setView(center, zoom);
    }
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [center[0], center[1], zoom, map, hotels, fitAllHotels]);

  return null;
};

// --- Google Maps Style Cooperative Gesture Controller ---
const GestureController = ({
  interactive = true,
  enabled = true,
  onShowWarning,
}: {
  interactive?: boolean;
  enabled?: boolean;
  onShowWarning: (msg: string) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !interactive) return;

    if (!enabled) {
      // In full-page or dedicated map views: allow natural 1-finger drag and scroll wheel zoom
      map.scrollWheelZoom.enable();
      map.dragging.enable();
      return;
    }

    const container = map.getContainer();

    // Disable default wheel zoom initially so it requires Ctrl / Cmd
    map.scrollWheelZoom.disable();

    const isMac =
      typeof window !== 'undefined' &&
      /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const scrollMsg = isMac
      ? 'Use ⌘ + scroll to zoom the map'
      : 'Use ctrl + scroll to zoom the map';
    const touchMsg = 'Use two fingers to move the map';

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Prevent default browser window/viewport zoom
        e.preventDefault();
        e.stopPropagation();

        if (typeof (map as any).scrollWheelZoom?._delta !== 'number') {
          (map as any).scrollWheelZoom._delta = 0;
        }

        try {
          (map as any).scrollWheelZoom._onWheelScroll(e);
        } catch {
          if (e.deltaY < 0) {
            map.zoomIn();
          } else if (e.deltaY > 0) {
            map.zoomOut();
          }
        }
      } else {
        map.scrollWheelZoom.disable();
        onShowWarning(scrollMsg);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        map.dragging.disable();
      } else {
        map.dragging.enable();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onShowWarning(touchMsg);
      } else if (e.touches.length >= 2) {
        // Prevent default browser pinch-zoom on touch screens
        e.preventDefault();
        map.dragging.enable();
      }
    };

    const handleTouchEnd = () => {
      map.dragging.enable();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [map, interactive, onShowWarning]);

  return null;
};

// Helper to extract [lat, lng] from various hotel coordinate formats
const getHotelLatLng = (h: MapHotelItem): [number, number] | null => {
  if (Array.isArray(h.coordinates) && h.coordinates.length >= 2) {
    return [Number(h.coordinates[1]), Number(h.coordinates[0])];
  }
  if (Array.isArray(h.location?.coordinates) && h.location.coordinates.length >= 2) {
    return [Number(h.location.coordinates[1]), Number(h.location.coordinates[0])];
  }
  if (Array.isArray(h.address?.location?.coordinates) && h.address.location.coordinates.length >= 2) {
    return [Number(h.address.location.coordinates[1]), Number(h.address.location.coordinates[0])];
  }
  return null;
};

// --- Sub-component for individual hotel marker with auto-opening compact card ---
const HotelMarker = ({
  hotel,
  isOpen,
  onSelect,
}: {
  hotel: MapHotelItem;
  isOpen: boolean;
  onSelect: () => void;
}) => {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const tryOpen = () => {
      try {
        if (!marker.isPopupOpen()) {
          marker.openPopup();
        }
      } catch {
        // ignore
      }
    };

    const t1 = setTimeout(tryOpen, 250);
    const t2 = setTimeout(tryOpen, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hotel._id, hotel.id]);

  const pos = getHotelLatLng(hotel);
  if (!pos) return null;

  const title = hotel.name || hotel.title || 'Hotel';
  const price = hotel.price ?? hotel.startingPrice;
  const rawImg =
    hotel.thumbnail ||
    (typeof hotel.image === 'string' ? hotel.image : hotel.image?.url) ||
    (Array.isArray((hotel as any).hotelImages) && (hotel as any).hotelImages[0]?.url) ||
    (typeof hotel.images?.[0] === 'string'
      ? hotel.images[0]
      : hotel.images?.[0]?.url);
  const img = typeof rawImg === 'string' && rawImg.trim() ? rawImg.trim() : undefined;
  const targetHref =
    hotel.href || (hotel._id || hotel.id ? `/hotels/${hotel._id || hotel.id}` : undefined);

  const queryClient = useQueryClient();
  const hotelId = (hotel._id || hotel.id)?.toString();

  const handlePrefetch = useCallback(() => {
    if (!hotelId) return;
    queryClient.prefetchQuery({
      queryKey: ["hotel_details", hotelId],
      queryFn: async () => {
        const { getHotelDetails } = await import("@/services/hotel/hotel.service");
        return getHotelDetails(hotelId);
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [hotelId, queryClient]);

  return (
    <Marker
      ref={markerRef}
      position={pos}
      icon={destinationIcon}
      eventHandlers={{
        click: (e) => {
          onSelect();
          try {
            e.target.openPopup();
          } catch {
            // ignore
          }
        },
      }}
    >
      <Popup
        autoPan={false}
        autoClose={false}
        closeOnClick={false}
        closeButton={true}
      >
        <div className="w-[170px] font-sans text-xs select-none">
          {img && (
            <div className="relative w-full h-[88px] rounded-lg overflow-hidden mb-1.5 bg-zinc-100 dark:bg-zinc-800">
              <img
                src={img}
                alt={title}
                className="w-full h-full object-cover block"
                loading="eager"
              />
            </div>
          )}
          <h4
            className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 leading-tight truncate"
            title={title}
          >
            {title}
          </h4>
          {hotel.city && (
            <p className="text-zinc-500 text-[10px] truncate mt-0.5">
              {hotel.city}, India
            </p>
          )}

          <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            {price != null && price > 0 ? (
              <div className="flex items-baseline gap-0.5">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                  ₹{Number(price).toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-zinc-400">/nt</span>
              </div>
            ) : (
              <span />
            )}

            {hotel.distance != null && (
              <span className="text-[9px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                {hotel.distance < 1000
                  ? `${Math.round(hotel.distance)}m`
                  : `${(hotel.distance / 1000).toFixed(1)}km`}
              </span>
            )}
          </div>

          {targetHref && (
            <Link
              href={targetHref}
              onMouseEnter={handlePrefetch}
              onPointerDown={handlePrefetch}
              onClick={handlePrefetch}
              className="mt-1.5 flex items-center justify-center w-full h-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-md text-[10px] font-medium transition-colors"
            >
              View Details
            </Link>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

// --- Main Map Component ---
const MapLeaf = ({
  className,
  width,
  height = '400px',
  cordinates,
  showRouting = false,
  hotels,
  interactive = true,
  zoom = 13,
  showRadius = false,
  radiusMeters = 2000,
  userCoords,
  selectedHotelId,
  onSelectHotel,
  fitAllHotels = true,
  cooperativeGestures,
}: Props) => {
  const isCooperative = cooperativeGestures !== undefined ? cooperativeGestures : height !== '100%';
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    userCoords ? [userCoords[0], userCoords[1]] : null
  );
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [showGestureWarning, setShowGestureWarning] = useState(false);
  const [gestureWarningMessage, setGestureWarningMessage] = useState('');
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerGestureWarning = useCallback((msg: string) => {
    setGestureWarningMessage(msg);
    setShowGestureWarning(true);
    if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
    gestureTimeoutRef.current = setTimeout(() => {
      setShowGestureWarning(false);
    }, 1400);
  }, []);

  const [activeHotelId, setActiveHotelId] = useState<string | null>(
    selectedHotelId || (hotels && hotels.length > 0 ? hotels[0]._id || hotels[0].id || '0' : null)
  );

  // Sync activeHotelId when prop or hotels change
  useEffect(() => {
    if (selectedHotelId) {
      setActiveHotelId(selectedHotelId);
    } else if (hotels && hotels.length > 0) {
      setActiveHotelId(hotels[0]._id || hotels[0].id || '0');
    }
  }, [selectedHotelId, hotels]);

  // Sync userLocation if userCoords prop updates
  useEffect(() => {
    if (userCoords) {
      setUserLocation([userCoords[0], userCoords[1]]);
    }
  }, [userCoords]);

  // Get User Location if routing requested and no location yet
  useEffect(() => {
    if (showRouting && !userLocation && !userCoords) {
      setIsRouteLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          },
          (err) => {
            console.error('Location error:', err);
            setIsRouteLoading(false);
          },
          { enableHighAccuracy: true }
        );
      } else {
        setIsRouteLoading(false);
      }
    }
  }, [showRouting, userLocation, userCoords]);

  // Dark Mode Observer
  useEffect(() => {
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  // Target hotel coordinates for camera centering and destination
  const selectedHotel =
    hotels?.find((h, i) => (h._id || h.id || String(i)) === activeHotelId) || hotels?.[0];
  const targetHotelCoord = selectedHotel ? getHotelLatLng(selectedHotel) : null;

  const mapCenter: [number, number] =
    targetHotelCoord ||
    (userCoords ? [userCoords[0], userCoords[1]] : null) ||
    (cordinates ? [cordinates[1], cordinates[0]] : null) ||
    [22.7196, 75.8577];

  const routeOrigin = userLocation || (userCoords ? [userCoords[0], userCoords[1]] : null);
  // Route destination MUST be a valid hotel coordinate, NEVER a fallback default
  const routeDest = targetHotelCoord;
  const canShowRoute =
    Boolean(showRouting) &&
    Boolean(routeOrigin) &&
    Boolean(routeDest) &&
    Boolean(
      routeOrigin &&
      routeDest &&
      (Math.abs(routeOrigin[0] - routeDest[0]) > 0.0001 ||
       Math.abs(routeOrigin[1] - routeDest[1]) > 0.0001)
    );

  return (
    <div className={cn('w-full relative z-0', className)} style={{ height, width }}>
      <style>{`
        .leaflet-bottom.leaflet-right .leaflet-control-zoom {
          margin-bottom: 16px !important;
          margin-right: 16px !important;
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
          overflow: hidden !important;
        }
        .leaflet-control-zoom a {
          background-color: #ffffff !important;
          color: #3c4043 !important;
          width: 32px !important;
          height: 32px !important;
          font-size: 18px !important;
          line-height: 30px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-bottom: 1px solid #ebebeb !important;
        }
        .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f8f9fa !important;
          color: #202124 !important;
        }
        .dark .leaflet-bottom.leaflet-right .leaflet-control-zoom {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.7) !important;
        }
        .dark .leaflet-control-zoom a {
          background-color: #202124 !important;
          color: #e8eaed !important;
          border-bottom: 1px solid #3c4043 !important;
        }
        .dark .leaflet-control-zoom a:hover {
          background-color: #303134 !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.06) !important;
          background: #ffffff !important;
          overflow: hidden !important;
        }
        .dark .leaflet-popup-content-wrapper {
          background: #18181b !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.12) !important;
          color: #f4f4f5 !important;
        }
        .leaflet-popup-content {
          margin: 6px !important;
          line-height: 1.3 !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
          box-shadow: none !important;
        }
        .dark .leaflet-popup-tip {
          background: #18181b !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          top: 6px !important;
          right: 6px !important;
          width: 20px !important;
          height: 20px !important;
          font-size: 13px !important;
          line-height: 20px !important;
          color: #ffffff !important;
          background: rgba(0, 0, 0, 0.55) !important;
          border-radius: 9999px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          backdrop-filter: blur(4px) !important;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          background: rgba(0, 0, 0, 0.8) !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* Loading Overlay */}
      {isRouteLoading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-zinc-900/10 backdrop-blur-[2px] rounded-lg pointer-events-none transition-all duration-300">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-zinc-900 dark:border-white border-t-transparent shadow-md"></div>
        </div>
      )}

      {/* Gesture Handling Warning Overlay (Google Maps Style) */}
      {isCooperative && (
        <div
          className={cn(
            "absolute inset-0 z-[1100] pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-[1px] transition-opacity duration-300 rounded-lg",
            showGestureWarning ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="text-white text-sm sm:text-base md:text-lg font-medium text-center px-6 py-3 drop-shadow-md select-none tracking-wide">
            {gestureWarningMessage}
          </p>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={!isCooperative}
        dragging={interactive}
        zoomControl={false}
        className="h-full w-full rounded-lg"
      >
        <GestureController
          interactive={interactive}
          enabled={isCooperative}
          onShowWarning={triggerGestureWarning}
        />
        {interactive && <ZoomControl position="bottomright" />}
        <ChangeView
          center={mapCenter}
          zoom={zoom}
          hotels={hotels}
          fitAllHotels={fitAllHotels && interactive}
        />
        <TileLayer
          key={isDarkMode ? 'dark' : 'light'}
          className={isDarkMode ? 'invert hue-rotate-180 brightness-95 contrast-90' : ''}
          attribution={tileAttribution}
          url={tileUrl}
        />

        {/* Current Location Marker & Accuracy Circle */}
        {routeOrigin && (
          <>
            <Marker position={routeOrigin} icon={userIcon} />
            <Circle
              center={routeOrigin}
              radius={180}
              pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.12, color: 'transparent' }}
            />
          </>
        )}

        {/* Radar Geospatial Radius Circle (soft blue, non-intrusive) */}
        {showRadius && routeOrigin && (
          <Circle
            center={routeOrigin}
            radius={radiusMeters}
            pathOptions={{
              fillColor: '#3b82f6',
              fillOpacity: 0.07,
              color: '#3b82f6',
              weight: 1.5,
              dashArray: '5, 5',
            }}
          />
        )}

        {/* Road Routing Logic */}
        {canShowRoute && routeOrigin && routeDest && (
          <RoutingMachine
            userPos={routeOrigin}
            destination={routeDest}
            onRouteFound={() => setIsRouteLoading(false)}
          />
        )}

        {/* Hotel Markers with Auto-Open Sleek Card */}
        {hotels && hotels.length > 0 ? (
          hotels.map((h, i) => {
            const hId = h._id || h.id || String(i);
            return (
              <HotelMarker
                key={hId}
                hotel={h}
                isOpen={activeHotelId === hId}
                onSelect={() => {
                  setActiveHotelId(hId);
                  onSelectHotel?.(hId);
                }}
              />
            );
          })
        ) : (
          <Marker position={mapCenter} icon={destinationIcon} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapLeaf;