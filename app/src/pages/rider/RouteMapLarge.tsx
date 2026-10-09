import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_TOKEN } from '@config'

type LngLat = { lat: number; lng: number }
export type MapStop = { label: string; address: string; coords: LngLat }

/** Decodes a precision-5 encoded polyline into [lng, lat] pairs. */
function decodePolyline(str: string): [number, number][] {
  const out: [number, number][] = []
  let i = 0, lat = 0, lng = 0
  const next = () => {
    let shift = 0, result = 0, b: number
    do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    return result & 1 ? ~(result >> 1) : result >> 1
  }
  while (i < str.length) { lat += next(); lng += next(); out.push([lng / 1e5, lat / 1e5]) }
  return out
}

/** Pin with a letter, plus a callout naming the stop and its address (textContent only: addresses are user input). */
function markerEl(letter: string, stop: MapStop) {
  const el = document.createElement('div')
  el.className = 'rdr-pin'
  const call = document.createElement('div')
  call.className = 'rdr-pin-callout'
  const label = document.createElement('strong')
  label.textContent = stop.label
  const addr = document.createElement('span')
  addr.textContent = stop.address
  call.append(label, addr)
  const dot = document.createElement('div')
  dot.className = 'rdr-pin-dot'
  dot.textContent = letter
  el.append(call, dot)
  return el
}

/** Pannable, zoomable route map for the enlarged view. Loaded lazily so mapbox-gl stays out of the main bundle. */
export default function RouteMapLarge({ stops, route }: { stops: MapStop[]; route: string | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const stopsKey = JSON.stringify(stops) // parent rebuilds the array every render; rebuild the map only when its contents change

  useEffect(() => {
    if (!ref.current) return
    const stops: MapStop[] = JSON.parse(stopsKey)
    mapboxgl.accessToken = MAPBOX_TOKEN
    const map = new mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [stops[0].coords.lng, stops[0].coords.lat],
      zoom: 13,
      cooperativeGestures: true,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    const bounds = new mapboxgl.LngLatBounds()
    stops.forEach((s, i) => {
      const pos: [number, number] = [s.coords.lng, s.coords.lat]
      new mapboxgl.Marker({ element: markerEl(String.fromCharCode(65 + i), s), anchor: 'bottom' }).setLngLat(pos).addTo(map)
      bounds.extend(pos)
    })
    const line = route ? decodePolyline(route) : []
    line.forEach(p => bounds.extend(p))
    if (stops.length > 1) map.fitBounds(bounds, { padding: { top: 90, bottom: 50, left: 50, right: 50 }, duration: 0 })

    map.on('load', () => {
      if (line.length < 2) return
      map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: line } } })
      map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#1a1a1a', 'line-width': 4, 'line-opacity': 0.9 } })
    })
    return () => map.remove()
  }, [stopsKey, route])

  return <div ref={ref} className="rdr-map-gl" role="application" aria-label="Interactive route map. Use the buttons to zoom." />
}
