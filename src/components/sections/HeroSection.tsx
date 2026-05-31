import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GLManager } from '../../gl/GLManager'

gsap.registerPlugin(ScrollTrigger)

interface HeroSectionProps {
  gl: GLManager | null
}

export function HeroSection({ gl }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textContentRef = useRef<HTMLDivElement>(null)
  const ctaContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gl) return

    const container = containerRef.current!
    const textContent = textContentRef.current!
    const ctaContainer = ctaContainerRef.current!

    // Reset initial states
    gl.setRobotAssembly(0)
    gl.setRobotPosition(0, 0, 0)
    gl.setRobotScale(1)
    gl.setRobotOpacity(1)

    // Build timeline for Hero scrollytelling
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=150%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          // As the user scrolls, the robot is assembled from 0.0 to 1.0
          gl.setRobotAssembly(self.progress)
        },
      },
    })

    // Fade and shift elements during scroll
    tl.to(textContent, { opacity: 0.15, scale: 0.95, duration: 1 }, 0)
    tl.to(ctaContainer, { opacity: 0, y: -20, duration: 0.8 }, 0)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [gl])

  return (
    <div
      ref={containerRef}
      data-testid="hero-container"
      className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-transparent px-6"
    >
      {/* Hero content overlay */}
      <div 
        ref={textContentRef}
        className="max-w-4xl text-center select-none flex flex-col items-center gap-6 mt-16"
      >
        <span className="font-mono text-xs font-bold tracking-[0.4em] uppercase text-accent-indigo">
          YARVIZ // PROYECTO ROBÓTICA DIY & IA
        </span>
        
        <h1 
          className="font-mono font-black tracking-tight leading-none text-4xl sm:text-6xl md:text-7xl text-text-hero"
        >
          Tu primer IA Físico. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-indigo via-accent-teal to-accent-indigo bg-[length:200%_auto] animate-[pulse_6s_infinite]">
            Creado por ti.
          </span>
        </h1>

        <p 
          className="max-w-2xl font-mono text-sm sm:text-base text-text-muted leading-relaxed"
        >
          YARVIZ es el kit definitivo para adentrarte al mundo tech. Ensambla, programa y personaliza tu propio robot asistente con interfaz holográfica.
        </p>
      </div>

      {/* Double CTA Buttons */}
      <div 
        ref={ctaContainerRef}
        className="flex flex-col sm:flex-row items-center gap-4 mt-12 w-full max-w-md justify-center z-20"
      >
        {/* Primary glow button */}
        <a
          href="#pricing"
          className="
            relative w-full sm:w-auto px-8 py-4 font-mono font-black text-sm tracking-[0.2em] uppercase rounded-lg
            bg-accent-indigo text-text-hero border border-accent-indigo/20 shadow-[0_0_30px_rgba(99,102,241,0.3)]
            hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:scale-105 transition-all duration-300 text-center
          "
        >
          Comenzar Ahora
        </a>

        {/* Secondary ghost button */}
        <a
          href="#funcionamiento"
          onClick={(e) => {
            e.preventDefault()
            document.querySelector('#funcionamiento')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="
            w-full sm:w-auto px-8 py-4 font-mono font-black text-sm tracking-[0.2em] uppercase rounded-lg
            border border-border-subtle text-text-muted hover:border-accent-teal hover:text-text-hero
            hover:bg-accent-teal/5 transition-all duration-300 text-center
          "
        >
          Ver Funcionamiento
        </a>
      </div>
    </div>
  )
}
