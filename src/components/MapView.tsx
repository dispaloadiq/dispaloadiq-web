import { useCallback, useRef, useState, useEffect } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polyline,
  DirectionsRenderer,
} from '@react-google-maps/api'

// ── Types ─────────────────────────────────────────────────────────────────────
export type TruckMarker = {
  id: string
  lat: number
  lng: number
  label: string        // driver initials or truck ID
  status: 'in_transit' | 'idle' | 'delivered' | 'parked'
  info?: string        // tooltip text
  heading?: number     // 0-360 degrees
}

export type RouteWaypoint = {
  lat: number
  lng: number
  label: string
  type: 'origin' | 'stop' | 'destination'
}

export type HeatPoint = {
  lat: number
  lng: number
  weight: number   // 0-10
}

export interface MapViewProps {
  /** Fixed height in px (default 400) */
  height?: number
  /** Center of the map */
  center?: { lat: number; lng: number }
  /** Zoom level (default 5) */
  zoom?: number
  /** Truck markers to display */
  trucks?: TruckMarker[]
  /** Route waypoints — draws a polyline between them */
  waypoints?: RouteWaypoint[]
  /** If true, uses Directions API for a turn-by-turn route between waypoints */
  useDirections?: boolean
  /** Dark map style (default false) */
  dark?: boolean
  /** Called when a truck marker is clicked */
  onTruckClick?: (truck: TruckMarker) => void
  /** Extra className */
  className?: string
  /** Show no-key placeholder instead of trying to load */
  forcePlaceholder?: boolean
  /** Hide all map UI controls (zoom buttons, fullscreen) — ideal for mini/embedded maps */
  compact?: boolean
}

// ── Map style: dark / neutral ─────────────────────────────────────────────────
const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',        stylers: [{ color: '#1A2535' }] },
  { elementType: 'labels.text.fill',stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke',stylers:[{ color: '#1a3646' }] },
  { featureType: 'road',            elementType: 'geometry',       stylers: [{ color: '#304a7d' }] },
  { featureType: 'road',            elementType: 'geometry.stroke',stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway',    elementType: 'geometry',       stylers: [{ color: '#2c6675' }] },
  { featureType: 'water',           elementType: 'geometry',       stylers: [{ color: '#0e1626' }] },
  { featureType: 'poi',             stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',         stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
]

const LIGHT_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: 'poi',    stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',stylers: [{ visibility: 'off' }] },
]

// ── Marker icon helpers ───────────────────────────────────────────────────────
const STATUS_COLORS: Record<TruckMarker['status'], string> = {
  in_transit: '#38C770',
  idle:       '#E53E3E',
  delivered:  '#8B5CF6',
  parked:     '#D97706',
}

function makeTruckIcon(status: TruckMarker['status']): google.maps.Symbol {
  const color = STATUS_COLORS[status]
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 11,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2.5,
  }
}

const WAYPOINT_COLORS = { origin: '#0EA5E9', stop: '#F97316', destination: '#22C55E' }

// ── No-key placeholder ────────────────────────────────────────────────────────
function MapPlaceholder({ height }: { height: number }) {
  return (
    <div style={{
      height, borderRadius: 12, overflow: 'hidden',
      background: 'linear-gradient(135deg, #1A2535 0%, #0F172A 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 12, border: '1px solid #2D3748', position: 'relative',
    }}>
      {/* Fake grid lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#4BAED4" strokeWidth="1" />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <line key={`v${i}`} x1={`${i * 7}%`} y1="0" x2={`${i * 7}%`} y2="100%" stroke="#4BAED4" strokeWidth="1" />
        ))}
      </svg>
      {/* Fake route */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <polyline points="80,60 200,120 340,80 480,150 580,100" stroke="#38C770" strokeWidth="2.5" strokeDasharray="8,4" fill="none" opacity="0.5" />
        <circle cx="80"  cy="60"  r="6" fill="#0EA5E9" stroke="#fff" strokeWidth="2" />
        <circle cx="340" cy="80"  r="5" fill="#F97316" stroke="#fff" strokeWidth="2" />
        <circle cx="580" cy="100" r="6" fill="#22C55E" stroke="#fff" strokeWidth="2" />
        <text x="86" y="55" fill="#0EA5E9" fontSize="9" fontFamily="sans-serif">Chicago</text>
        <text x="588" y="95" fill="#22C55E" fontSize="9" fontFamily="sans-serif">Dallas</text>
      </svg>

      <div style={{ zIndex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🗺️</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Google Maps</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', maxWidth: 220, lineHeight: 1.5 }}>
          Вставь API ключ в <code style={{ color: '#4BAED4', background: 'rgba(75,174,212,.15)', padding: '1px 5px', borderRadius: 4 }}>.env</code> для активации карты
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
          VITE_GOOGLE_MAPS_KEY=your_key_here
        </div>
      </div>
    </div>
  )
}

// ── Loader hook — shared across all instances ─────────────────────────────────
const LIBRARIES: ('places' | 'geometry' | 'visualization')[] = ['places', 'geometry']

function useMapLoader() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined
  const hasKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE'

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: hasKey ? apiKey! : '',
    libraries: LIBRARIES,
    preventGoogleFontsLoading: true,
  })

  return { isLoaded: hasKey ? isLoaded : false, loadError, hasKey: !!hasKey }
}

// ── Main MapView component ────────────────────────────────────────────────────
export default function MapView({
  height = 400,
  center = { lat: 39.5, lng: -98.35 },   // center of US
  zoom = 4,
  trucks = [],
  waypoints = [],
  useDirections = false,
  dark = true,
  onTruckClick,
  forcePlaceholder = false,
  compact = false,
}: MapViewProps) {
  const { isLoaded, loadError, hasKey } = useMapLoader()
  const mapRef = useRef<google.maps.Map | null>(null)
  const [selectedTruck, setSelectedTruck] = useState<TruckMarker | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => { mapRef.current = map }, [])
  const onUnmount = useCallback(() => { mapRef.current = null }, [])

  // Fetch directions when waypoints change
  useEffect(() => {
    if (!isLoaded || !useDirections || waypoints.length < 2) return
    const origin = waypoints[0]
    const dest   = waypoints[waypoints.length - 1]
    const stops  = waypoints.slice(1, -1).map(w => ({ location: new google.maps.LatLng(w.lat, w.lng), stopover: true }))

    const svc = new google.maps.DirectionsService()
    svc.route({
      origin:      new google.maps.LatLng(origin.lat, origin.lng),
      destination: new google.maps.LatLng(dest.lat,   dest.lng),
      waypoints:   stops,
      travelMode:  google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK' && result) setDirections(result)
    })
  }, [isLoaded, useDirections, waypoints])

  // Show placeholder if no key or forced
  if (!hasKey || forcePlaceholder) return <MapPlaceholder height={height} />
  if (loadError)  return (
    <div style={{ height, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 28 }}>⚠️</div>
      <div style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>Map failed to load</div>
      <div style={{ fontSize: 11, color: '#A0AEC0' }}>Check your API key and enabled APIs</div>
    </div>
  )
  if (!isLoaded)  return (
    <div style={{ height, borderRadius: 12, background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ fontSize: 20 }}>🗺️</div>
      <div style={{ fontSize: 13, color: '#718096' }}>Loading map...</div>
    </div>
  )

  const mapOptions: google.maps.MapOptions = {
    styles: dark ? DARK_STYLE : LIGHT_STYLE,
    disableDefaultUI: compact,
    zoomControl: !compact,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: !compact,
    clickableIcons: false,
    gestureHandling: 'greedy',
  }

  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Directions route */}
        {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#38C770', strokeWeight: 4 } }} />}

        {/* Simple polyline if no directions */}
        {!useDirections && waypoints.length >= 2 && (
          <Polyline
            path={waypoints.map(w => ({ lat: w.lat, lng: w.lng }))}
            options={{ strokeColor: '#38C770', strokeWeight: 3, strokeOpacity: 0.8, geodesic: true }}
          />
        )}

        {/* Waypoint markers */}
        {waypoints.map((wp, i) => (
          <Marker
            key={`wp-${i}`}
            position={{ lat: wp.lat, lng: wp.lng }}
            label={{ text: wp.type === 'origin' ? 'O' : wp.type === 'destination' ? 'D' : `${i}`, color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: WAYPOINT_COLORS[wp.type],
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            }}
            title={wp.label}
          />
        ))}

        {/* Truck markers */}
        {trucks.map(truck => (
          <Marker
            key={truck.id}
            position={{ lat: truck.lat, lng: truck.lng }}
            icon={makeTruckIcon(truck.status)}
            label={{ text: truck.label.slice(0, 2), color: '#fff', fontSize: '9px', fontWeight: '800' }}
            title={truck.info ?? truck.label}
            onClick={() => { setSelectedTruck(truck); onTruckClick?.(truck) }}
          />
        ))}

        {/* InfoWindow for selected truck */}
        {selectedTruck && (
          <InfoWindow
            position={{ lat: selectedTruck.lat, lng: selectedTruck.lng }}
            onCloseClick={() => setSelectedTruck(null)}
          >
            <div style={{ padding: '4px 8px', minWidth: 140 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>{selectedTruck.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
                  background: STATUS_COLORS[selectedTruck.status] + '22',
                  color: STATUS_COLORS[selectedTruck.status],
                }}>
                  {selectedTruck.status.replace('_', ' ')}
                </span>
              </div>
              {selectedTruck.info && (
                <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>{selectedTruck.info}</div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}

// ── Re-export types for convenience ──────────────────────────────────────────
export { STATUS_COLORS }
