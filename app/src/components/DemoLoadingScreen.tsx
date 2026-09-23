import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MaisonWordmark from './MaisonWordmark'

// Same feel as the landing page's heavy, springy ease (landing-theme.css --landing-ease).
const EASE = [0.32, 0.72, 0, 1] as const

const QUOTES = [
  'Excellence is never an accident, it is the result of intention.',
  'Luxury is in each detail, however small it may seem.',
  'Precision is the courtesy of the punctual.',
  'The finest journeys are the ones you never have to think about.',
] as const

/**
 * Full-screen overlay shown while the "See the demo" auto-login runs. Mount it
 * conditionally and wrap in <AnimatePresence> at the call site so it crossfades
 * out the instant sign-in resolves, rather than popping off.
 */
export default function DemoLoadingScreen() {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: 24,
        textAlign: 'center',
        background: 'var(--bw-bg)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        <MaisonWordmark style={{ fontSize: 22 }} />
      </motion.div>

      <motion.div
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.6, ease: EASE, repeat: Infinity }}
        style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bw-accent)' }}
      />

      <AnimatePresence mode="wait">
        <motion.p
          key={quote}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          style={{
            margin: 0,
            maxWidth: 360,
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 300,
            fontSize: 17,
            lineHeight: 1.5,
            color: 'var(--bw-muted)',
          }}
        >
          {quote}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}
