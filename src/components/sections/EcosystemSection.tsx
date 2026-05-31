import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Brain, Volume2, Sparkles, ShieldCheck } from 'lucide-react'
import { useCursorGlow } from '../../hooks/useCursorGlow'

gsap.registerPlugin(ScrollTrigger)

interface BentoCardProps {
  icon: React.ReactNode
  tag: string
  title: string
  description: string
  className?: string
  accentColor: 'indigo' | 'teal'
}

function BentoCard({ icon, tag, title, description, className = '', accentColor }: BentoCardProps) {
  const cardRef = useCursorGlow<HTMLDivElement>()

  const hoverColor = accentColor === 'indigo' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(20, 184, 166, 0.15)'
  const glowStyle = {
    '--glow-color': hoverColor,
  } as React.CSSProperties

  return (
    <div
      ref={cardRef}
      style={glowStyle}
      className={`
        relative overflow-hidden group p-8 rounded-2xl bg-bg-card border border-border-subtle
        backdrop-blur-md transition-all duration-500 hover:border-accent-${accentColor}/30 hover:scale-[1.01]
        ${className}
      `}
    >
      {/* Radial Gradient Glow on Mouse Over (requires useCursorGlow hook setup) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), var(--glow-color), transparent 70%)`
        }}
      />

      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className="flex flex-col gap-4">
          <div className={`
            self-start p-3 rounded-lg border border-border-subtle bg-bg-main/50
            text-accent-${accentColor} group-hover:scale-110 group-hover:border-accent-${accentColor}/20 transition-all duration-300
          `}>
            {icon}
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted uppercase">
            {tag}
          </span>
          <h3 className="font-mono font-bold text-xl md:text-2xl text-text-hero">
            {title}
          </h3>
        </div>
        <p className="font-mono text-xs md:text-sm text-text-muted leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

export function EcosystemSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const heading = sectionRef.current?.querySelector('.bento-heading')
    const cards = gridRef.current?.children

    if (!heading || !cards) return

    gsap.set([heading, ...Array.from(cards)], { opacity: 0, y: 30 })

    const st = ScrollTrigger.create({
      trigger: sectionRef.current!,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(heading, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
        gsap.to(Array.from(cards), {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          delay: 0.2,
        })
      },
    })

    return () => st.kill()
  }, [])

  return (
    <section
      id="funcionamiento"
      ref={sectionRef}
      className="relative z-10 py-32 px-6 bg-transparent"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        {/* Heading */}
        <div className="bento-heading flex flex-col gap-4 text-center max-w-2xl mx-auto select-none">
          <span className="font-mono text-xs font-bold tracking-[0.4em] uppercase text-text-muted">
            TECNOLOGÍA DE VANGUARDIA
          </span>
          <h2 className="font-mono font-black text-4xl md:text-6xl text-text-hero leading-tight">
            Ecosistema Integrado
          </h2>
          <p className="font-mono text-sm md:text-base text-text-muted">
            Componentes de calidad industrial y algoritmos avanzados combinados en un ecosistema abierto y modificable.
          </p>
        </div>

        {/* Bento Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: Personality */}
          <BentoCard
            accentColor="indigo"
            className="md:col-span-2"
            icon={<Brain size={24} />}
            tag="01 // INTELIGENCIA"
            title="Personalización de Personalidad"
            description="Controla la conducta y valores de tu asistente. Mediante una app integrada, define el tono, los modales e instrucciones generales de comportamiento de la IA."
          />

          {/* Card 2: Voice */}
          <BentoCard
            accentColor="teal"
            icon={<Volume2 size={24} />}
            tag="02 // AUDIO"
            title="Voz ElevenLabs"
            description="Integración de voz ultra realista. Clona tu propia voz o elige entre miles de locutores y voces premium para que tu robot hable con fluidez."
          />

          {/* Card 3: Holographic display */}
          <BentoCard
            accentColor="teal"
            icon={<Sparkles size={24} />}
            tag="03 // DISPLAY"
            title="Animaciones Holográficas"
            description="Una pantalla reflejada en un prisma semitransparente genera un holograma flotante. Diseña animaciones, avatares o emoticonos que reaccionen a la conversación."
          />

          {/* Card 4: Local Storage */}
          <BentoCard
            accentColor="indigo"
            className="md:col-span-2"
            icon={<ShieldCheck size={24} />}
            tag="04 // SEGURIDAD"
            title="Almacenamiento Local Seguro"
            description="Privacidad absoluta en tu propia casa. Las llaves de API, configuraciones personales y registros de audio permanecen cifrados localmente en la memoria flash de tu hardware."
          />
        </div>
      </div>
    </section>
  )
}
