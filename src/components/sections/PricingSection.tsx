import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PricingCard } from '../ui/PricingCard'

gsap.registerPlugin(ScrollTrigger)

const STARTER_FEATURES = [
  '3D printing blueprints',
  'Hardware parts list & recommendations',
  'Component sourcing guide',
]

const BUILDER_FEATURES = [
  'Everything in Starter',
  'Full ESP32 source code',
  'Electronic schematic diagrams',
  'PCB layout files',
]

const PRO_FEATURES = [
  'Everything in Builder',
  'Step-by-step assembly video tutorials',
  'Hologram animation starter pack',
  'Priority customer support & Discord access',
]

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const heading = headingRef.current!
    const cards   = cardsRef.current!

    gsap.set([heading, cards], { opacity: 0, y: 40 })

    const st = ScrollTrigger.create({
      trigger: sectionRef.current!,
      start: 'top 70%',
      onEnter: () => {
        gsap.to(heading, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        gsap.to(cards,   { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' })
      },
    })

    return () => st.kill()
  }, [])

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative z-10 py-32 px-8"
      style={{ minHeight: '100vh' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-20">
          <p
            className="font-mono text-xs tracking-[0.4em] uppercase mb-4"
            style={{ color: 'var(--text-dim)' }}
          >
            Choose your starting point
          </p>
          <h2
            className="font-mono font-black text-4xl md:text-6xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Get Your Kit
          </h2>
          <p
            className="mt-4 font-mono text-base"
            style={{ color: 'var(--text-dim)' }}
          >
            Every tier ships with instant digital delivery.
          </p>
        </div>

        {/* Cards grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
        >
          <PricingCard
            tier="Starter"
            price={10}
            features={STARTER_FEATURES}
          />
          <PricingCard
            tier="Builder"
            price={15}
            features={BUILDER_FEATURES}
            featured
          />
          <PricingCard
            tier="Pro"
            price={20}
            features={PRO_FEATURES}
          />
        </div>

        {/* Footer note */}
        <p
          className="text-center mt-12 font-mono text-xs tracking-widest"
          style={{ color: 'var(--text-dim)' }}
        >
          All tiers — instant download · No subscription · Yours forever
        </p>
      </div>
    </section>
  )
}
