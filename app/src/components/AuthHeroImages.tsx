import { useEffect, useState } from 'react'

const INTERVAL_MS = 7_000

/** Photos that cross-fade inside one rounded frame (see `pages/landing-auth.css`). */
export default function AuthHeroImages() {
  const [urls, setUrls] = useState<string[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('../images/nikita-pishchugin-IdyI9y8BfB4-unsplash.webp'),
      import('../images/login_image.jpg'),
      import('../images/photo-1526289034009-0240ddb68ce3.avif'),
    ]).then((mods) => {
      if (!cancelled) setUrls(mods.map((m) => m.default))
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (urls.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setActive((i) => (i + 1) % urls.length), INTERVAL_MS)
    return () => clearInterval(id)
  }, [urls.length])

  return (
    <div className="landing-auth-hero" aria-hidden>
      {urls.map((url, i) => (
        <div
          key={url}
          className="landing-auth-hero__img"
          style={{ backgroundImage: `url(${url})`, opacity: active === i ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
