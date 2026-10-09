import { useEffect, useRef, useState } from 'react'
import { Car } from '@phosphor-icons/react'

/** Swipeable photo strip with an "n / total" counter; a striped placeholder when there are none. */
export default function VehiclePhotos({ images }: { images?: Record<string, string> | null }) {
  const urls = Object.entries(images ?? {})
    .filter(([, url]) => url && String(url).trim())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => String(url))
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const el = track.current
    if (!el || urls.length < 2) return
    const onScroll = () => setIndex(Math.round(el.scrollLeft / (el.clientWidth || 1)))
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [urls.length])

  if (urls.length === 0) {
    return <div className="rdr-photo"><div className="rdr-photo-empty"><Car size={32} aria-hidden />No photos yet</div></div>
  }
  return (
    <div className="rdr-photo">
      <div className="rdr-photo-track" ref={track}>
        {urls.map(url => <img key={url} src={url} alt="" onError={e => { e.currentTarget.style.visibility = 'hidden' }} />)}
      </div>
      {urls.length > 1 && <span className="rdr-photo-count" aria-hidden>{index + 1} / {urls.length}</span>}
    </div>
  )
}
