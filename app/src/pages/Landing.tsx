import './landing-theme.css'
import './landing-pricing.css'
import './landing-snap-nav.css'
import maisonWordmark from '../images/maison_wordmark.webp'
import { getTenantAppUrl } from '@config/host'
import { List, SignIn, X } from '@phosphor-icons/react'
import { MotionConfig } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import HeroSlide from './landing/HeroSlide'
import PlatformSlide from './landing/PlatformSlide'
import HowItWorksSlide from './landing/HowItWorksSlide'
import DriverExperienceSlide from './landing/DriverExperienceSlide'
import RiderBookingSlide from './landing/RiderBookingSlide'
import PricingSlide from './landing/PricingSlide'
import MissionValuesSlide from './landing/MissionValuesSlide'
import ConclusionSlide from './landing/ConclusionSlide'
import { QUESTIONS_FORM_URL, smoothScrollToSection } from './landing/shared'

const SNAP_SECTION_LABELS = [
  'Hero',
  'Platform',
  'How it works',
  'Drivers',
  'Rider experience',
  'Mission',
  'Pricing',
  'Get started',
] as const

const PRICING_SECTION_INDEX = SNAP_SECTION_LABELS.indexOf('Pricing')

const MISSION_SECTION_INDEX = SNAP_SECTION_LABELS.indexOf('Mission')

const FOOTER_SECTION_INDEX = SNAP_SECTION_LABELS.indexOf('Get started')

// Main Landing Component
export default function Landing() {
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollToTop = useCallback(() => {
    scrollRootRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToSnapIndex = useCallback((index: number) => {
    const root = scrollRootRef.current
    if (!root) return
    const sections = root.querySelectorAll<HTMLElement>('.landing-snap-section')
    const section = sections[index]
    if (!section) return
    const top =
      section.getBoundingClientRect().top -
      root.getBoundingClientRect().top +
      root.scrollTop
    root.scrollTo({ top, behavior: 'smooth' })
  }, [])

  const scrollToSectionById = useCallback((id: string) => {
    smoothScrollToSection(id)
    setMenuOpen(false)
  }, [])

  useEffect(() => {
    const root = scrollRootRef.current
    if (!root) return
    const sections = root.querySelectorAll<HTMLElement>('.landing-snap-section')
    if (!sections.length) return

    const pickPrimary = (entries: IntersectionObserverEntry[]) => {
      const candidates = entries.filter((e) => e.isIntersecting && e.intersectionRatio >= 0.6)
      if (!candidates.length) return
      const best = candidates.reduce((a, b) =>
        a.intersectionRatio >= b.intersectionRatio ? a : b
      )
      const index = [...sections].indexOf(best.target as HTMLElement)
      if (index < 0) return
      setActiveSection(index)
    }

    const observer = new IntersectionObserver(pickPrimary, {
      root,
      threshold: [0, 0.25, 0.5, 0.6, 0.75, 1],
    })
    sections.forEach((s) => observer.observe(s))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // The mobile pricing slide is a short teaser, so floating chrome stays; only the desktop grid needs the room.
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const hideFloatingChromeOnPricing = isDesktop && activeSection === PRICING_SECTION_INDEX
  // On the first (Hero) slide, we want Login visible in the top-right,
  // but keep the existing "Get Started" CTA out of the way (it's already in-page).
  const ctaHidden = hideFloatingChromeOnPricing

  // Which top-nav link owns the section currently in view.
  const activeNavKey =
    activeSection >= 1 && activeSection <= 4
      ? 'platform'
      : activeSection === MISSION_SECTION_INDEX
        ? 'mission'
        : activeSection === PRICING_SECTION_INDEX
          ? 'pricing'
          : activeSection === FOOTER_SECTION_INDEX
            ? 'footer'
            : null

  const navLinks = [
    { id: 'platform', label: 'Product' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'mission', label: 'About' },
    { id: 'footer', label: 'Company' },
  ] as const

  return (
    <MotionConfig reducedMotion="user">
      <main className="landing-root relative overflow-x-hidden">
        <div ref={scrollRootRef} className="landing-snap-page scroll-smooth">
          <HeroSlide />
          <PlatformSlide />
          <HowItWorksSlide />
          <DriverExperienceSlide />
          <RiderBookingSlide />
          <MissionValuesSlide />
          <PricingSlide />
          <ConclusionSlide />
        </div>

        <div className="landing-snap-brand-row">
          <button
            type="button"
            className="landing-snap-menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            tabIndex={hideFloatingChromeOnPricing ? -1 : undefined}
            onClick={() => setMenuOpen(true)}
            style={{
              opacity: hideFloatingChromeOnPricing ? 0 : 1,
              pointerEvents: hideFloatingChromeOnPricing ? 'none' : 'auto',
            }}
          >
            <List className="h-7 w-7" weight="light" aria-hidden />
          </button>
          <button
            type="button"
            className="landing-snap-logo"
            aria-label="Maison, back to top"
            tabIndex={hideFloatingChromeOnPricing ? -1 : undefined}
            onClick={scrollToTop}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'clamp(0.75rem, 2.2vw, 1rem)',
              opacity: hideFloatingChromeOnPricing ? 0 : 1,
              pointerEvents: hideFloatingChromeOnPricing ? 'none' : 'auto',
            }}
          >
            <img
              src={maisonWordmark}
              width={220}
              height={72}
              alt="Maison"
              // translateY centers the letters (not the i-dot ascender) on the menu icon
              style={{ height: 'clamp(1.65rem, 3.5vw, 2.05rem)', width: 'auto', display: 'block', transform: 'translateY(-16.9%)' }}
            />
          </button>
        </div>

        <div
          className="landing-snap-actions"
          style={{
            opacity: ctaHidden ? 0 : 1,
            pointerEvents: ctaHidden ? 'none' : 'auto',
          }}
        >
          <a href={getTenantAppUrl('app', '/tenant/login')} className="landing-snap-login-cta" aria-label="Log in">
            <SignIn className="h-4 w-4" weight="regular" aria-hidden />
          </a>
          {activeSection !== 0 ? (
            <Link to="/signup" className="landing-btn landing-btn--primary landing-snap-cta">
              Get started
            </Link>
          ) : null}
        </div>

        <nav
          className="landing-snap-top-links"
          aria-label="Primary"
          style={{
            opacity: hideFloatingChromeOnPricing ? 0 : 1,
            pointerEvents: hideFloatingChromeOnPricing ? 'none' : 'auto',
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              aria-current={activeNavKey === link.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                scrollToSectionById(link.id)
              }}
            >
              {link.label}
            </a>
          ))}
          <a href={QUESTIONS_FORM_URL} target="_blank" rel="noopener noreferrer">
            Questions
          </a>
        </nav>

        <nav className="landing-snap-dot-nav" aria-label="Section navigation">
          {SNAP_SECTION_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`landing-snap-dot-nav__btn${i === activeSection ? ' active' : ''}`}
              data-index={i}
              aria-label={label}
              aria-current={i === activeSection ? 'true' : undefined}
              onClick={() => scrollToSnapIndex(i)}
            />
          ))}
        </nav>

        {menuOpen ? (
          <div className="landing-snap-menu-overlay" role="dialog" aria-modal="true" aria-label="Site menu">
            <div className="landing-snap-menu-overlay__top">
              <button
                type="button"
                className="landing-snap-menu-close"
                aria-label="Close menu"
                autoFocus
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-8 w-8" weight="light" aria-hidden />
              </button>
            </div>
            <nav className="landing-snap-menu-overlay__nav" aria-label="Secondary">
              <a
                href={getTenantAppUrl('app', '/tenant/login')}
                style={{ '--i': 0 } as CSSProperties}
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </a>
              {navLinks.map((link, i) =>
                link.id === 'pricing' ? (
                  <Link
                    key={link.id}
                    to="/pricing"
                    style={{ '--i': i + 1 } as CSSProperties}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    style={{ '--i': i + 1 } as CSSProperties}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSectionById(link.id)
                    }}
                  >
                    {link.label}
                  </a>
                ),
              )}
              <a
                href={QUESTIONS_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ '--i': navLinks.length + 1 } as CSSProperties}
                onClick={() => setMenuOpen(false)}
              >
                Questions
              </a>
              <div className="landing-snap-menu-overlay__divider" aria-hidden />
              <Link
                to="/signup"
                style={{ '--i': navLinks.length + 2 } as CSSProperties}
                onClick={() => setMenuOpen(false)}
              >
                Get started
              </Link>
            </nav>
          </div>
        ) : null}
      </main>
    </MotionConfig>
  )
}
