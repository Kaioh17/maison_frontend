import heroOverviewPhone from '../../images/app_view/overview_phone view.png'
import { useEffect, useRef, useState } from 'react'

// Heavy, springy ease shared with the CSS (--landing-ease)
export const EASE = [0.32, 0.72, 0, 1] as const

// Animation variants. `transition` lives inside `animate` so it applies both
// when spread onto an element and when used as `variants` under a stagger parent.
export const fadeInUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
}

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
}

/** True when the device is likely using mouse/trackpad hover (not primary touch). */
export function useFinePointerHover() {
  const [value, setValue] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setValue(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return value
}

export const QUESTIONS_FORM_URL = 'https://forms.gle/eJDkYht52iGe5dgm7'

export const smoothScrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const snapContainer = el.closest('.landing-snap-page')
  if (snapContainer instanceof HTMLElement) {
    const top =
      el.getBoundingClientRect().top -
      snapContainer.getBoundingClientRect().top +
      snapContainer.scrollTop
    snapContainer.scrollTo({ top, behavior: 'smooth' })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export type HeroParticle = {
  x: number
  y: number
  vx: number
  vy: number
  targetVx: number
  targetVy: number
  radius: number
  pulsePhase: number
  pulseSpeed: number
  isAnchor: boolean
}

export function HeroParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    if (mediaQuery.matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let animationFrame = 0
    let particles: HeroParticle[] = []
    let lastTime = 0
    const maxLinksDistance = 100
    const targetFrameInterval = 1000 / 60
    const easing = 0.03
    const fieldRightPadding = 36
    const horizontalMargin = 18
    const verticalMargin = 18
    const baseVelocityRange: [number, number] = [0.3, 0.6]

    const random = (min: number, max: number) => Math.random() * (max - min) + min
    const pickVelocity = (sign: number) => random(baseVelocityRange[0], baseVelocityRange[1]) * sign

    const initializeParticles = () => {
      const particleCount = Math.floor(random(60, 81))
      const anchorCount = Math.floor(random(4, 7))
      const anchorIndices = new Set<number>()

      while (anchorIndices.size < anchorCount) {
        anchorIndices.add(Math.floor(Math.random() * particleCount))
      }

      const safeMaxX = Math.max(horizontalMargin, width - fieldRightPadding)

      particles = Array.from({ length: particleCount }, (_, idx) => {
        const signX = Math.random() < 0.5 ? -1 : 1
        const signY = Math.random() < 0.5 ? -1 : 1
        const isAnchor = anchorIndices.has(idx)

        return {
          x: random(horizontalMargin, safeMaxX),
          y: random(verticalMargin, Math.max(verticalMargin, height - verticalMargin)),
          vx: pickVelocity(signX),
          vy: pickVelocity(signY),
          targetVx: pickVelocity(signX),
          targetVy: pickVelocity(signY),
          radius: isAnchor ? 4 : random(1.5, 2.5),
          pulsePhase: random(0, Math.PI * 2),
          pulseSpeed: random(0.0006, 0.0012),
          isAnchor,
        }
      })
    }

    const resize = () => {
      width = Math.floor(window.innerWidth * 0.55)
      height = Math.floor(window.innerHeight)
      dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initializeParticles()
    }

    const draw = (time: number) => {
      animationFrame = window.requestAnimationFrame(draw)

      if (time - lastTime < targetFrameInterval) return
      lastTime = time

      ctx.clearRect(0, 0, width, height)

      const safeMaxX = Math.max(horizontalMargin, width - fieldRightPadding)
      const safeMaxY = Math.max(verticalMargin, height - verticalMargin)

      for (const particle of particles) {
        if (particle.x <= horizontalMargin && particle.targetVx < 0) {
          particle.targetVx = pickVelocity(1)
        } else if (particle.x >= safeMaxX && particle.targetVx > 0) {
          particle.targetVx = pickVelocity(-1)
        }

        if (particle.y <= verticalMargin && particle.targetVy < 0) {
          particle.targetVy = pickVelocity(1)
        } else if (particle.y >= safeMaxY && particle.targetVy > 0) {
          particle.targetVy = pickVelocity(-1)
        }

        particle.vx += (particle.targetVx - particle.vx) * easing
        particle.vy += (particle.targetVy - particle.vy) * easing
        particle.x += particle.vx
        particle.y += particle.vy

        const pulse = 0.5 + 0.5 * Math.sin(time * particle.pulseSpeed + particle.pulsePhase)
        const opacity = 0.3 + pulse * 0.4
        const alpha = particle.isAnchor ? Math.min(0.9, opacity + 0.15) : opacity

        ctx.beginPath()
        ctx.fillStyle = `rgba(169, 156, 242, ${alpha.toFixed(3)})`
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distance = Math.hypot(dx, dy)
          if (distance > maxLinksDistance) continue

          const proximity = 1 - distance / maxLinksDistance
          const phase = (i * 0.21 + j * 0.13) % (Math.PI * 2)
          const linkPulse = 0.5 + 0.5 * Math.sin(time * 0.001 + phase)
          const alpha = proximity * linkPulse * 0.15
          if (alpha < 0.01) continue

          ctx.beginPath()
          ctx.strokeStyle = `rgba(169, 156, 242, ${alpha.toFixed(3)})`
          ctx.lineWidth = 1
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    resize()
    animationFrame = window.requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-0 hidden h-[var(--app-h)] w-[55vw] md:block"
      style={{
        maskImage:
          'linear-gradient(to right, black 40%, transparent 75%), radial-gradient(90% 100% at 30% 50%, black 45%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, black 40%, transparent 75%), radial-gradient(90% 100% at 30% 50%, black 45%, transparent 100%)',
      }}
    />
  )
}

/** iPhone-style frame with real overview screenshot + titanium bezel. */
export function HeroIPhoneMockup({ className }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto ${className ?? ''}`}
      style={{
        aspectRatio: '393 / 852',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        filter:
          'drop-shadow(0 28px 56px rgba(0,0,0,0.42)) drop-shadow(0 14px 32px rgba(0,0,0,0.28)) drop-shadow(0 0 48px rgba(110,91,216,0.16))',
      }}
    >
      {/* Side buttons (subtle, scaled with device) */}
      <div
        className="pointer-events-none absolute left-[-3px] top-[22%] z-20 h-8 w-[3px] rounded-[2px]"
        style={{
          background: 'linear-gradient(90deg, #2b2b32, #15151a)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 2px 0 3px rgba(0,0,0,0.35)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[-3px] top-[calc(22%+2.25rem)] z-20 h-8 w-[3px] rounded-[2px]"
        style={{
          background: 'linear-gradient(90deg, #2b2b32, #15151a)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 2px 0 3px rgba(0,0,0,0.35)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-3px] top-[26%] z-20 h-14 w-[3px] rounded-[2px]"
        style={{
          background: 'linear-gradient(-90deg, #2b2b32, #15151a)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), -2px 0 3px rgba(0,0,0,0.35)',
        }}
        aria-hidden
      />

      <div
        className="box-border h-full w-full"
        style={{
          borderRadius: '2.75rem',
          padding: '10px 10px 13px',
          boxSizing: 'border-box',
          background:
            'linear-gradient(168deg, #3a3a42 0%, #1c1c22 20%, #121218 52%, #0e0e14 82%, #25252c 100%)',
          boxShadow:
            'inset 0 2px 2px rgba(255,255,255,0.12), inset 0 -3px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.55)',
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden bg-black"
          style={{
            borderRadius: '2.15rem',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            boxSizing: 'border-box',
          }}
        >
          <img
            src={heroOverviewPhone}
            alt="Maison tenant dashboard on mobile"
            className="h-full w-full object-cover object-top"
            width={786}
            height={1704}
            decoding="async"
            // React 18 warns on camelCase fetchPriority; the lowercase attribute is what the DOM wants.
            {...{ fetchpriority: 'high' }}
          />
        </div>
      </div>
    </div>
  )
}
