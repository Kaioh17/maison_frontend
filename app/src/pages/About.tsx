import { Link } from 'react-router-dom'

export default function About() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white" style={{ fontFamily: "'DM Sans', 'Work Sans', sans-serif" }}>
      <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Maison
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-full bg-[#7c5cfc] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7c3aed]"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Get Started
          </Link>
        </div>

        <article className="rounded-2xl border border-gray-800 bg-[#11111a] p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <p
            className="mb-3 text-sm uppercase tracking-[0.18em] text-[#a78bfa]"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Founder&apos;s Vision
          </p>
          <h1
            id="founders-vision"
            className="mb-6 text-3xl font-light leading-tight md:text-5xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            It started with my dad&apos;s business.
          </h1>

          <div className="space-y-5 text-sm leading-relaxed text-gray-300 md:text-base">
            <p>
              I&apos;m a computer science student from Chicago. A couple months ago, I needed to build a simple booking
              site for my dad&apos;s limo business, something that would make managing rides, drivers, and customers less
              of a headache. What I built was rough, but it worked. Somewhere in that process, I started noticing
              something.
            </p>
            <p>
              Operators across the US were dealing with the same problem. Either they were paying large sums just to
              get a basic booking site off the ground, or they were stuck with rigid multi-tenant platforms that took
              a cut and gave them nothing in return. Many were still running their businesses on a WhatsApp and Excel
              combo, not because they wanted to, but because nothing affordable and purpose-built existed for them.
            </p>

            <blockquote className="rounded-xl border border-[#7c5cfc]/40 bg-[#151425] px-5 py-4 text-base font-medium text-white md:text-lg">
              Professional chauffeurs and independent operators deserve the same tools as any serious business, without
              the tax.
            </blockquote>

            <p>
              The limo and black car industry is growing. Chicago, select cities across the US, and international
              markets are all seeing steady demand for premium ground transportation. The operators running these
              businesses are professionals. They just need the right infrastructure to match the level of service they
              already provide.
            </p>
            <p>
              Maison is not finished. It may never be, software rarely is. But with every operator who signs up and
              every piece of feedback we receive, we get closer to something that genuinely changes how this industry
              runs. If you&apos;re still on spreadsheets, or paying too much for too little, this was built for you.
            </p>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6">
            <p className="text-sm font-semibold text-white">MO</p>
            <p className="mt-1 text-base text-white">Mubaraq Odumeso</p>
            <p className="mt-1 text-sm text-gray-400">Founder, Maison, Chicago, IL</p>
          </div>
        </article>
      </section>
    </main>
  )
}
