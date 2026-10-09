import maisonIcon from '../../images/maison_icon.png'
import maisonPin from '../../images/maison_pin.webp'
import MaisonWordmark from '@components/MaisonWordmark'
import { ArrowUpRight } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { QUESTIONS_FORM_URL, fadeIn, fadeInUp, smoothScrollToSection, staggerChildren } from './shared'

// Slide 8: Conclusion & Footer
export default function ConclusionSlide() {
  const linkClass = 'landing-link text-[13px]'

  return (
    <section
      id="footer"
      className="landing-snap-section landing-snap-section--scroll landing-ambient landing-ambient--c flex flex-col"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center py-10 pt-20 md:py-14 md:pt-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="mx-auto w-full max-w-[min(100%,56rem)] box-border px-5 text-center"
        >
          <motion.h2 variants={fadeInUp} className="landing-h2 mx-auto mb-6 max-w-[18ch] md:mb-8">
            Built for operators who don&apos;t compromise.
          </motion.h2>
          <motion.figure variants={fadeInUp} className="landing-bezel mx-auto mb-6 max-w-2xl text-left md:mb-8">
            <div className="landing-bezel__core !p-5 md:!p-6">
              <blockquote className="m-0 text-[15px] font-medium leading-snug tracking-[-0.01em] text-white sm:text-base md:text-lg">
                &ldquo;Professional chauffeurs and independent operators deserve the same tools as any serious
                business, without the tax.&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-[13px] text-[color:var(--landing-fg-faint)]">
                Mubaraq Odumeso, Founder{' · '}
                <Link to="/about" className="landing-accent-text underline-offset-4 hover:underline">
                  Read the vision
                </Link>
              </figcaption>
            </div>
          </motion.figure>
          <motion.p variants={fadeInUp} className="landing-lead mx-auto mb-7 md:mb-9">
            Your brand. Your riders. Your drivers. All in one place, without giving up control. Join while we&apos;re
            still early: your feedback shapes the product.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link to="/signup" className="landing-btn landing-btn--primary landing-btn--icon">
              Start free today
              <span className="landing-btn__icon">
                <ArrowUpRight size={16} weight="bold" aria-hidden />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.footer
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeIn}
        className="shrink-0 border-t border-[color:var(--landing-hairline)]"
      >
        <div className="box-border w-full px-5 pb-6 pt-8 md:px-[60px] md:pb-8 md:pt-12">
          <div className="mb-6 md:mb-8 md:grid md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:items-start md:gap-x-12">
            <div className="mb-6 hidden md:mb-0 md:block">
              <img
                src={maisonPin}
                width={152}
                height={332}
                alt="Maison"
                className="block"
                style={{ height: 'clamp(2rem, 4vw, 2.5rem)', width: 'auto' }}
              />
              <p className="mt-3.5 max-w-xs text-[14px] leading-[1.55] tracking-[-0.01em] text-[color:var(--landing-fg-muted)]">
                Built for operators who run their business like a brand.
              </p>
              <span className="landing-chip mt-4 !py-1 !text-[11px]">slug.usemaison.io</span>
            </div>

            <div className="grid grid-cols-3 gap-x-5 text-left sm:gap-x-8 md:contents">
              <nav className="min-w-0" aria-label="Product">
                <h3 className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--landing-fg-faint)] md:text-[11px]">
                  Product
                </h3>
                <ul className="m-0 list-none space-y-1.5 p-0 md:space-y-2">
                  <li>
                    <a
                      href="#platform"
                      onClick={(e) => {
                        e.preventDefault()
                        smoothScrollToSection('platform')
                      }}
                      className={linkClass}
                    >
                      Overview
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pricing"
                      onClick={(e) => {
                        e.preventDefault()
                        smoothScrollToSection('pricing')
                      }}
                      className={linkClass}
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <Link to="/signup" className={linkClass}>
                      Get started
                    </Link>
                  </li>
                </ul>
              </nav>

              <nav className="min-w-0" aria-label="Company">
                <h3 className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--landing-fg-faint)] md:text-[11px]">
                  Company
                </h3>
                <ul className="m-0 list-none space-y-1.5 p-0 md:space-y-2">
                  <li>
                    <a href="/about" target="_blank" rel="noopener noreferrer" className={linkClass}>
                      About
                    </a>
                  </li>
                  <li>
                    <a href="/about#founders-vision" target="_blank" rel="noopener noreferrer" className={linkClass}>
                      Founder&apos;s vision
                    </a>
                  </li>
                  <li>
                    <a href="mailto:mubaraqodumeso@gmail.com" className={linkClass}>
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href={QUESTIONS_FORM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      Questions
                    </a>
                  </li>
                </ul>
              </nav>

              <nav className="min-w-0" aria-label="Legal">
                <h3 className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--landing-fg-faint)] md:text-[11px]">
                  Legal
                </h3>
                <ul className="m-0 list-none space-y-1.5 p-0 md:space-y-2">
                  <li>
                    <Link to="/privacy" className={linkClass}>
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className={linkClass}>
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link to="/subprocessors" className={linkClass}>
                      Subprocessors
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[color:var(--landing-hairline)] pt-4">
            <p className="m-0 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-[color:var(--landing-fg-faint)] md:hidden">
              <span>© 2026</span>
              <MaisonWordmark
                color="var(--landing-fg-faint)"
                className="shrink-0"
                style={{ fontSize: 12 }}
              />
              <span>. All rights reserved.</span>
            </p>
            <p className="m-0 hidden text-xs text-[color:var(--landing-fg-faint)] md:block">
              © 2026 Maison. All rights reserved.
            </p>
            <img src={maisonIcon} alt="" aria-hidden width={28} height={28} className="ml-auto block h-7 w-7 shrink-0" />
          </div>
        </div>
      </motion.footer>
    </section>
  )
}
