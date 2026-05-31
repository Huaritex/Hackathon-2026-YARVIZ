import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PricingCard } from '../ui/PricingCard'

gsap.registerPlugin(ScrollTrigger)

const INDIVIDUAL_PRICES = {
  starter: 10,
  builder: 15,
  masterclass: 20,
}

const CLASSROOM_PRICES = {
  starter: 49,
  builder: 79,
  masterclass: 99,
}

const INDIVIDUAL_FEATURES = {
  starter: [
    'Planos de impresión 3D (.STL)',
    'Lista de componentes de hardware y recomendaciones',
    'Guía de compra electrónica y enlaces directos',
  ],
  builder: [
    'Todo lo incluido en Starter',
    'Código fuente completo para ESP32',
    'Diagramas esquemáticos electrónicos',
    'Archivos de diseño PCB para fabricación',
  ],
  masterclass: [
    'Todo lo incluido en Pro Builder',
    'Videos tutoriales de ensamblaje paso a paso',
    'Kit de inicio de animaciones holográficas',
    'Soporte prioritario en Discord VIP',
  ],
}

const CLASSROOM_FEATURES = {
  starter: [
    'Licencia de impresión 3D para toda la escuela',
    'Hojas de trabajo de inventario de hardware',
    'Guía de compra electrónica para compras masivas',
  ],
  builder: [
    'Todo lo incluido en Starter (Aula)',
    'Código fuente multiusuario con plantillas',
    'Presentaciones PPT con diagramas esquemáticos',
    'Planes de lecciones paso a paso (5 horas)',
  ],
  masterclass: [
    'Todo lo incluido en Pro Builder (Aula)',
    'Licencia completa de videoteca de proyectos',
    'Guías de evaluación y rúbricas para el docente',
    'Soporte directo prioritario para educadores',
  ],
}

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsRef   = useRef<HTMLDivElement>(null)
  const [billingType, setBillingType] = useState<'individual' | 'classroom'>('individual')

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

  const prices = billingType === 'individual' ? INDIVIDUAL_PRICES : CLASSROOM_PRICES
  const features = billingType === 'individual' ? INDIVIDUAL_FEATURES : CLASSROOM_FEATURES

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative z-10 py-32 px-6 bg-transparent"
      style={{ minHeight: '100vh' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        {/* Heading */}
        <div ref={headingRef} className="text-center select-none">
          <p
            className="font-mono text-xs tracking-[0.4em] uppercase mb-4 text-text-muted"
          >
            elige tu punto de partida
          </p>
          <h2
            className="font-mono font-black text-4xl md:text-6xl text-text-hero"
          >
            Planes de Crecimiento
          </h2>
          <p
            className="mt-4 font-mono text-sm md:text-base text-text-muted"
          >
            Todos los paquetes incluyen descarga digital instantánea de planos y archivos de código.
          </p>
        </div>

        {/* Interactive Toggle */}
        <div className="flex justify-center items-center gap-4 mb-6 select-none">
          <span className={`font-mono text-xs transition-colors duration-300 ${billingType === 'individual' ? 'text-accent-indigo font-bold' : 'text-text-muted'}`}>
            Licencia Individual
          </span>
          <button
            onClick={() => setBillingType(billingType === 'individual' ? 'classroom' : 'individual')}
            className="relative w-14 h-7 rounded-full bg-bg-card border border-border-subtle p-1 transition-colors duration-300"
          >
            <div
              className={`w-5 h-5 rounded-full bg-accent-indigo transition-transform duration-300 ${
                billingType === 'classroom' ? 'translate-x-7 bg-accent-teal' : ''
              }`}
            />
          </button>
          <span className={`font-mono text-xs transition-colors duration-300 ${billingType === 'classroom' ? 'text-accent-teal font-bold' : 'text-text-muted'}`}>
            Educadores / Aula
          </span>
        </div>

        {/* Cards grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          <PricingCard
            tier="Starter"
            price={prices.starter}
            features={features.starter}
          />
          <PricingCard
            tier="Pro Builder"
            price={prices.builder}
            features={features.builder}
            featured
          />
          <PricingCard
            tier="Masterclass"
            price={prices.masterclass}
            features={features.masterclass}
          />
        </div>

        {/* Footer note */}
        <p
          className="text-center mt-6 font-mono text-xs tracking-widest text-text-muted"
        >
          Todos los niveles — Descarga instantánea · Código abierto · Sin suscripción
        </p>
      </div>
    </section>
  )
}
