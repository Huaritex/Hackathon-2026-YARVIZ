import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Feature {
  tag: string
  title: string
  body: string
  symbol: string
  accent: 'cyan' | 'violet'
}

const FEATURES: Feature[] = [
  {
    tag: '01 / DEEP CUSTOMIZATION',
    title: "Shape YARBIZ's Soul",
    body: "Web & mobile app to define behavior prompts. Program YARBIZ to be sarcastic, helpful, mysterious, or motivating. Your assistant, your personality — no limits.",
    symbol: '⬡',
    accent: 'cyan',
  },
  {
    tag: '02 / YOUR VOICE',
    title: 'It Sounds Like You',
    body: 'Native ElevenLabs integration. Choose from thousands of voices or clone your own. YARBIZ speaks exactly how you imagine — every word, every tone.',
    symbol: '◉',
    accent: 'violet',
  },
  {
    tag: '03 / HOLOGRAM STUDIO',
    title: 'Create Your Holograms',
    body: 'Custom animation tool for the holographic display. Design animations, upload GIFs, total creative freedom over what your robot projects into thin air.',
    symbol: '◈',
    accent: 'cyan',
  },
]

export function EcosystemSection() {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const feature1Ref = useRef<HTMLDivElement>(null)
  const feature2Ref = useRef<HTMLDivElement>(null)
  const feature3Ref = useRef<HTMLDivElement>(null)
  const visual1Ref  = useRef<HTMLDivElement>(null)
  const visual2Ref  = useRef<HTMLDivElement>(null)
  const visual3Ref  = useRef<HTMLDivElement>(null)

  const featureRefs = [feature1Ref, feature2Ref, feature3Ref]
  const visualRefs  = [visual1Ref,  visual2Ref,  visual3Ref]

  useEffect(() => {
    const wrapper = wrapperRef.current!
    const f1 = feature1Ref.current!
    const f2 = feature2Ref.current!
    const f3 = feature3Ref.current!
    const v1 = visual1Ref.current!
    const v2 = visual2Ref.current!
    const v3 = visual3Ref.current!

    // Initial states: f1 visible, f2/f3 hidden below
    gsap.set([f2, f3], { opacity: 0, y: 50 })
    gsap.set([v2, v3], { opacity: 0, y: 30 })

    // Total virtual time = 4 units:
    //   0→1  : feature 1 visible (holding)
    //   1→2  : feature 1 exits, feature 2 enters
    //   2→3  : feature 2 visible (holding)
    //   3→4  : feature 2 exits, feature 3 enters
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: '+=300%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    })

    // Hold feature 1 (0→1)
    tl.to({}, { duration: 1 }, 0)

    // Feature 1 exits + Feature 2 enters (1→2)
    tl.to([f1, v1], { opacity: 0, y: -50, duration: 0.5 }, 1)
    tl.fromTo(f2, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 }, 1.2)
    tl.fromTo(v2, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 1.3)

    // Hold feature 2 (2→3)
    tl.to({}, { duration: 1 }, 2)

    // Feature 2 exits + Feature 3 enters (3→4)
    tl.to([f2, v2], { opacity: 0, y: -50, duration: 0.5 }, 3)
    tl.fromTo(f3, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 }, 3.2)
    tl.fromTo(v3, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 3.3)

    // Parallax: visual symbols move at 0.6× scroll speed during hold phases
    // Achieved by additional translateY driven by the same scrubbed tl
    tl.to(v1, { y: -40, ease: 'none', duration: 1 }, 0)
    tl.to(v2, { y: -40, ease: 'none', duration: 1 }, 2)
    tl.to(v3, { y: -40, ease: 'none', duration: 1 }, 3)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill?.()
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative z-10">
      {/* Sticky inner container */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Section label */}
        <p
          className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.4em] uppercase"
          style={{ color: 'var(--text-dim)' }}
        >
          The Ecosystem
        </p>

        {/* Feature panels — all in same absolute space */}
        <div className="relative flex items-center justify-center h-full px-8 max-w-6xl mx-auto w-full">
          {FEATURES.map((feature, i) => {
            const fRef = featureRefs[i]
            const vRef = visualRefs[i]
            const accentColor =
              feature.accent === 'cyan' ? 'var(--accent-cyan)' : 'var(--accent-violet)'

            return (
              <div
                key={feature.tag}
                ref={fRef}
                className="absolute inset-0 flex items-center justify-between gap-16 px-12"
              >
                {/* Text side */}
                <div className="flex-1 max-w-lg">
                  <p
                    className="font-mono text-xs tracking-[0.3em] mb-6"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    {feature.tag}
                  </p>
                  <h2
                    className="font-mono font-black text-4xl md:text-5xl leading-tight mb-6"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {feature.title}
                  </h2>
                  <p
                    className="font-mono text-base leading-relaxed"
                    style={{ color: 'var(--text-dim)', maxWidth: '42ch' }}
                  >
                    {feature.body}
                  </p>
                </div>

                {/* Visual side — parallax layer */}
                <div
                  ref={vRef}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: 320, height: 320 }}
                >
                  <span
                    className="font-mono select-none"
                    style={{
                      fontSize: '14rem',
                      color: accentColor,
                      opacity: 0.15,
                      textShadow: `0 0 80px ${accentColor}`,
                      lineHeight: 1,
                    }}
                  >
                    {feature.symbol}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
