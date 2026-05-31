import { CSSProperties } from 'react'
import gsap from 'gsap'
import { useCursorGlow } from '../../hooks/useCursorGlow'

interface PricingCardProps {
  tier: 'Starter' | 'Pro Builder' | 'Masterclass'
  price: number
  features: string[]
  featured?: boolean
}

export function PricingCard({ tier, price, features, featured = false }: PricingCardProps) {
  const cardRef = useCursorGlow<HTMLDivElement>()

  const borderColor = featured ? 'var(--accent-indigo)' : 'var(--border-subtle)'
  const glowColor   = featured ? 'var(--glow-cyan)'   : 'rgba(255, 255, 255, 0.03)'
  const cardClass   = `pricing-card${featured ? ' pricing-card--featured' : ''}`

  const handleMouseEnter = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: 1.025,
      borderColor: featured ? 'var(--accent-indigo)' : 'rgba(99, 102, 241, 0.25)',
      boxShadow: featured 
        ? '0 0 40px rgba(99,102,241,0.25)' 
        : '0 0 30px rgba(255,255,255,0.03)',
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: 1,
      borderColor: borderColor,
      boxShadow: 'none',
      duration: 0.35,
      ease: 'power2.out',
    })
  }

  const cardStyle: CSSProperties = {
    background: 'rgba(24, 24, 27, 0.55)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${borderColor}`,
    borderRadius: 16,
    transition: 'border-color 0.3s, transform 0.3s',
  }

  return (
    <div
      ref={cardRef}
      className={`relative ${cardClass} p-8 flex flex-col gap-8 h-full select-none`}
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Radial Hover glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), ${glowColor}, transparent 70%)`
        }}
      />

      {/* Featured Badge */}
      {featured && (
        <span
          className="absolute -top-3 left-6 font-mono text-[9px] font-bold tracking-[0.25em] px-3 py-1 rounded bg-accent-indigo text-text-hero shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          MÁS RECOMENDADO
        </span>
      )}

      {/* Tier + Price */}
      <div className="relative z-10 flex flex-col gap-2">
        <p
          className="font-mono text-[10px] tracking-[0.3em] uppercase"
          style={{ color: featured ? 'var(--accent-indigo)' : 'var(--text-muted)' }}
        >
          {tier}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl text-text-muted">$</span>
          <span
            className="font-mono font-black text-5xl tracking-tight text-text-hero"
          >
            {price}
          </span>
          <span className="font-mono text-[10px] text-text-muted ml-2">/ pago único</span>
        </div>
      </div>

      {/* Feature list */}
      <ul className="relative z-10 flex flex-col gap-4 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 font-mono text-xs text-text-muted leading-relaxed">
            <span 
              className="text-accent-teal mt-0.5 font-bold"
            >
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="
          relative z-10 block w-full text-center font-mono font-bold text-xs py-3.5 tracking-[0.25em] uppercase rounded-lg
          transition-all duration-300
        "
        style={
          featured
            ? { backgroundColor: 'var(--accent-indigo)', color: 'var(--text-hero)', boxShadow: '0 4px 20px rgba(99,102,241,0.25)' }
            : { border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }
        }
        onMouseEnter={(e) => {
          const el = e.currentTarget
          if (featured) {
            el.style.backgroundColor = 'var(--accent-teal)'
            el.style.boxShadow = '0 4px 25px rgba(20,184,166,0.35)'
          } else {
            el.style.borderColor = 'var(--accent-teal)'
            el.style.color = 'var(--text-hero)'
            el.style.backgroundColor = 'rgba(20,184,166,0.05)'
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          if (featured) {
            el.style.backgroundColor = 'var(--accent-indigo)'
            el.style.boxShadow = '0 4px 20px rgba(99,102,241,0.25)'
          } else {
            el.style.borderColor = 'var(--border-subtle)'
            el.style.color = 'var(--text-muted)'
            el.style.backgroundColor = 'transparent'
          }
        }}
      >
        Adquirir Kit →
      </a>
    </div>
  )
}
