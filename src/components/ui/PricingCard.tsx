import { CSSProperties } from 'react'
import gsap from 'gsap'
import { useCursorGlow } from '../../hooks/useCursorGlow'

interface PricingCardProps {
  tier: 'Starter' | 'Builder' | 'Pro'
  price: number
  features: string[]
  featured?: boolean
}

export function PricingCard({ tier, price, features, featured = false }: PricingCardProps) {
  const cardRef = useCursorGlow<HTMLDivElement>()

  const borderColor = featured ? 'var(--accent-violet)' : 'rgba(0,240,255,0.18)'
  const glowColor   = featured ? 'var(--glow-violet)'   : 'var(--glow-cyan)'
  const cardClass   = `pricing-card${featured ? ' pricing-card--featured' : ''}`

  const handleMouseEnter = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: 1.03,
      boxShadow: `0 0 48px ${glowColor}`,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: 1,
      boxShadow: '0 0 0px transparent',
      duration: 0.35,
      ease: 'power2.out',
    })
  }

  const cardStyle: CSSProperties = {
    background: 'rgba(13,13,31,0.65)',
    backdropFilter: 'blur(12px) saturate(140%)',
    border: `1px solid ${borderColor}`,
    borderRadius: 16,
    transform: featured ? 'translateY(-10px)' : 'none',
  }

  return (
    <div
      ref={cardRef}
      className={`${cardClass} p-8 flex flex-col gap-6`}
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Badge */}
      {featured && (
        <span
          className="self-start font-mono text-xs font-bold tracking-[0.3em] px-3 py-1"
          style={{
            color: 'var(--accent-violet)',
            border: '1px solid var(--accent-violet)',
            borderRadius: 4,
          }}
        >
          MOST POPULAR
        </span>
      )}

      {/* Tier + Price */}
      <div>
        <p
          className="font-mono text-xs tracking-[0.3em] uppercase mb-2"
          style={{ color: featured ? 'var(--accent-violet)' : 'var(--text-dim)' }}
        >
          {tier}
        </p>
        <p
          className="font-mono font-black text-5xl"
          style={{ color: featured ? 'var(--accent-violet)' : 'var(--accent-cyan)' }}
        >
          ${price}
        </p>
      </div>

      {/* Feature list */}
      <ul className="flex flex-col gap-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: featured ? 'var(--accent-violet)' : 'var(--accent-cyan)', marginTop: 2 }}>
              ▸
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="#"
        className="block w-full text-center font-mono font-bold text-sm py-3 tracking-[0.2em] uppercase transition-all duration-300"
        style={
          featured
            ? { backgroundColor: 'var(--accent-violet)', color: '#fff', borderRadius: 8 }
            : { border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', borderRadius: 8 }
        }
        onMouseEnter={(e) => {
          const el = e.currentTarget
          if (featured) {
            el.style.backgroundColor = 'var(--accent-cyan)'
          } else {
            el.style.backgroundColor = 'var(--accent-cyan)'
            el.style.color = 'var(--bg-void)'
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          if (featured) {
            el.style.backgroundColor = 'var(--accent-violet)'
            el.style.color = '#fff'
          } else {
            el.style.backgroundColor = 'transparent'
            el.style.color = 'var(--accent-cyan)'
          }
        }}
      >
        Get This Kit →
      </a>
    </div>
  )
}
