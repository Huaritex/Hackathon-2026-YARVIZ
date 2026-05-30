import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GLManager } from '../../gl/GLManager'
import { GlitchText } from '../ui/GlitchText'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const subtitleRef  = useRef<HTMLParagraphElement>(null)
  const ctaRef       = useRef<HTMLAnchorElement>(null)
  const glRef        = useRef<GLManager | null>(null)

  useEffect(() => {
    const canvas    = canvasRef.current!
    const container = containerRef.current!
    const subtitle  = subtitleRef.current!
    const cta       = ctaRef.current!

    // ── GL init (isolated from React) ──────────────────────────────
    const gl = new GLManager(canvas)
    glRef.current = gl
    gl.loadRobotModels()

    // ── GSAP ticker drives GL loop ─────────────────────────────────
    const onTick = (_time: number, deltaTime: number) => {
      gl.tick(deltaTime)
      gl.render()
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // ── Mouse → GL ─────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 2
      const y = -(e.clientY / window.innerHeight - 0.5) * 2
      gl.setMouse(x, y)
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Initial DOM state ──────────────────────────────────────────
    gsap.set(subtitle, { opacity: 0 })
    gsap.set(cta, { opacity: 0, y: 24 })

    // ── ScrollTrigger pin — 300vh total, 3 phases ──────────────────
    //   Phase 0→1 : subtitle fades in
    //   Phase 1→2 : robot assembly (handled by GL via onUpdate)
    //   Phase 2→3 : CTA fades in
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=300%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => gl.setScrollProgress(self.progress),
      },
    })

    tl.to(subtitle, { opacity: 1, duration: 1 }, 0)
    tl.to({}, { duration: 1 })                              // robot phase (GL-only)
    tl.to(cta, { opacity: 1, y: 0, duration: 1 }, '>')

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      gsap.ticker.remove(onTick)
      // Kill only this section's ScrollTrigger — not all global triggers
      tl.scrollTrigger?.kill()
      tl.kill()
      gl.destroy()
    }
  }, [])

  return (
    <>
      {/* GL canvas — fixed behind all sections */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Hero DOM overlay — pinned by ScrollTrigger */}
      <div
        ref={containerRef}
        data-testid="hero-container"
        className="relative z-10 flex flex-col items-center justify-center h-screen"
      >
        <div className="text-center select-none">
          <GlitchText
            text="YARBIZ"
            className="block font-mono font-black tracking-[0.18em]"
            style={{
              fontSize: 'clamp(4rem, 13vw, 11rem)',
              color: 'var(--accent-cyan)',
              textShadow: '0 0 60px rgba(0,240,255,0.4), 0 0 120px rgba(0,240,255,0.15)',
            }}
            duration={1.6}
          />

          <p
            ref={subtitleRef}
            className="mt-5 font-mono text-sm tracking-[0.35em] uppercase"
            style={{ color: 'var(--text-dim)' }}
          >
            Build your own AI holographic assistant
          </p>
        </div>

        <a
          ref={ctaRef}
          href="#pricing"
          className="
            mt-20 px-10 py-4 font-mono font-bold text-sm tracking-[0.25em] uppercase
            transition-all duration-300
          "
          style={{
            backgroundColor: 'var(--accent-cyan)',
            color: 'var(--bg-void)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              'var(--accent-violet)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              'var(--accent-cyan)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--bg-void)'
          }}
        >
          Get Your Kit →
        </a>
      </div>
    </>
  )
}
