import { lazy, Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowsOutSimple } from '@phosphor-icons/react'
import { MAPBOX_TOKEN } from '@config'
import Modal from '@components/Modal'
import type { BookingForm } from './bookingForm'
import { tripStops } from './bookingForm'
import type { MapStop } from './RouteMapLarge'

const RouteMapLarge = lazy(() => import('./RouteMapLarge'))

type LngLat = { lat: number; lng: number }
const pt = (c: LngLat) => `${+c.lng.toFixed(5)},${+c.lat.toFixed(5)}`
const MAX_URL = 7500 // Static Images API rejects URLs over 8192 chars

type Route = { geometry: string; distance: number; duration: number }

/** Simplified driving route (encoded polyline, precision 5; meters; seconds), or null if unroutable. */
async function fetchRoute(from: LngLat, to: LngLat): Promise<Route | null> {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pt(from)};${pt(to)}?overview=simplified&geometries=polyline&access_token=${MAPBOX_TOKEN}`
  const res = await fetch(url)
  if (!res.ok) return null
  return (await res.json()).routes?.[0] ?? null
}

function mapUrl(from: LngLat | null, to: LngLat | null, route: string | null, color: string, size = '600x224'): string | null {
  const base = 'https://api.mapbox.com/styles/v1/mapbox/light-v11/static'
  const tail = `${size}@2x?padding=36&access_token=${MAPBOX_TOKEN}`
  if (from && to) {
    const pins = `pin-s-a+${color}(${pt(from)}),pin-s-b+${color}(${pt(to)})`
    const path = route ? `path-4+${color}-0.9(${encodeURIComponent(route)}),` : ''
    const url = `${base}/${path}${pins}/auto/${tail}`
    return url.length <= MAX_URL || !route ? url : `${base}/${pins}/auto/${tail}`
  }
  const only = from ?? to
  return only ? `${base}/pin-s+${color}(${pt(only)})/${pt(only)},13/${tail}` : null
}

/** Route preview for the booking form: pins for the stops, the driving line when both are known. */
export default function RouteMap({ form }: { form: BookingForm }) {
  const { from, to } = tripStops(form)
  const a = from.coords, b = form.service_type === 'hourly' ? null : to.coords
  const { data: routeInfo = null } = useQuery({
    queryKey: ['route', a && pt(a), b && pt(b)],
    queryFn: () => fetchRoute(a!, b!),
    enabled: !!(MAPBOX_TOKEN && a && b),
    staleTime: Infinity,
    retry: false,
  })
  const route = routeInfo?.geometry ?? null
  const [open, setOpen] = useState(false)
  const toIsAirport = form.service_type === 'airport' && form.airport_service === 'to_airport'
  const fromIsAirport = form.service_type === 'airport' && form.airport_service === 'from_airport'
  const stops: MapStop[] = [
    from.coords && { label: fromIsAirport ? 'Airport pickup' : 'Pickup', address: from.address, coords: from.coords },
    b && to.coords && { label: toIsAirport ? 'Airport' : 'Dropoff', address: to.address, coords: to.coords },
  ].filter((s): s is MapStop => !!s)
  const src = MAPBOX_TOKEN ? mapUrl(a, b, route, '1a1a1a') : null
  if (!src) return <div className="rdr-map" aria-hidden><span>Pick an address to see the map</span></div>
  return (
    <>
      <button type="button" className="rdr-map is-tappable" aria-label="Enlarge map" onClick={() => setOpen(true)}>
        <img key={src} src={src} alt="Map of your route" />
        <ArrowsOutSimple className="rdr-map-hint" size={18} aria-hidden />
      </button>
      {open && (
        <Modal title="Your route" width={720} onClose={() => setOpen(false)}>
          {routeInfo && (
            <p className="rdr-map-summary">
              {(routeInfo.distance / 1609.344).toFixed(1)} mi · about {Math.max(1, Math.round(routeInfo.duration / 60))} min drive
            </p>
          )}
          <Suspense fallback={<div className="rdr-map-gl" aria-busy />}>
            <RouteMapLarge stops={stops} route={route} />
          </Suspense>
        </Modal>
      )}
    </>
  )
}
