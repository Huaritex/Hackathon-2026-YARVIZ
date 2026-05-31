import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GLManager } from '../../gl/GLManager'

gsap.registerPlugin(ScrollTrigger)

interface ProblemSectionProps {
  gl: GLManager | null
}

const STEPS = [
  {
    tag: "01 / EL DESAFÍO",
    title: "Aprender tecnología desde cero es abrumador...",
    body: "Tutoriales infinitos, cables sueltos y teoría aburrida sin un propósito real. La mayoría abandona antes de ver su primera línea de código cobrar vida en el mundo físico."
  },
  {
    tag: "02 / EL MÉTODO",
    title: "Por eso creamos una experiencia paso a paso.",
    body: "Con guías visuales ultra-intuitivas y código listo para usar. Aprendes haciendo: montas las piezas, conectas la electrónica y ves resultados tangibles de inmediato."
  },
  {
    tag: "03 / EL FUTURO",
    title: "Desde la impresión 3D hasta integrar ElevenLabs y agentes IA.",
    body: "No es un juguete. Estás construyendo un dispositivo inteligente real con sintetizadores de voz avanzados, conectividad IoT y un cerebro artificial en la nube."
  }
]

export function ProblemSection({ gl }: ProblemSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stepsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gl) return

    const container = containerRef.current!
    const textBlocks = container.querySelectorAll('.problem-text-block')

    const isMobile = window.innerWidth < 768
    const desktopX = 1.3
    const desktopY = 0
    const mobileX = 0
    const mobileY = 0.5
    const baseScale = isMobile ? 0.65 : 1.0

    // Set initial robot setup for this section entry
    gsap.set(textBlocks, { opacity: 0, y: 40 })

    // Timeline 1: Transition robot from center (Hero) to the side (Section 2)
    // Runs as Section 2 scrolls into view (from entering the viewport until it's pinned)
    const entryST = ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        // Interpolate robot position & scale as it enters Section 2
        const targetXVal = gsap.utils.interpolate(0, isMobile ? mobileX : desktopX, p)
        const targetYVal = gsap.utils.interpolate(0, isMobile ? mobileY : desktopY, p)
        const targetScaleVal = gsap.utils.interpolate(1.0, baseScale, p)
        
        gl.setRobotPosition(targetXVal, targetYVal, 0)
        gl.setRobotScale(targetScaleVal)
        gl.setRobotOpacity(1) // Make sure it's visible
      }
    })

    // Timeline 2: Scrollytelling inside the pinned Section 2
    // Pin Section 2 and scroll through the three text steps
    const mainTL = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=250%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Set background scroll progress uniform for vignette/grid effects
          gl.setScrollProgress(self.progress)
        }
      }
    })

    // Step 1 active state
    mainTL.to(textBlocks[0], { opacity: 1, y: 0, duration: 0.8 }, 0)
    mainTL.to({}, { duration: 0.8 }) // Hold step 1 and let user admire the robot
    
    // Transition to Step 2
    mainTL.to(textBlocks[0], { opacity: 0, y: -40, duration: 0.6 }, "+=0.2")
    mainTL.fromTo(textBlocks[1], 
      { opacity: 0, y: 40 }, 
      { opacity: 1, y: 0, duration: 0.8 },
      "<"
    )
    // Rotate robot slightly for Step 2
    mainTL.to({ rot: 0 }, {
      duration: 0.8,
      onUpdate: function() {
        const val = this.targets()[0].rot
        gl.setRobotScrollRotation(val * Math.PI * 0.4)
      }
    }, "<")
    mainTL.to({ rot: 0.4 }, {
      rot: 0.4,
      duration: 0.8
    }) // Hold step 2

    // Transition to Step 3
    mainTL.to(textBlocks[1], { opacity: 0, y: -40, duration: 0.6 }, "+=0.2")
    mainTL.fromTo(textBlocks[2], 
      { opacity: 0, y: 40 }, 
      { opacity: 1, y: 0, duration: 0.8 },
      "<"
    )
    // Rotate robot further for Step 3
    mainTL.to({ rot: 0.4 }, {
      duration: 0.8,
      onUpdate: function() {
        const val = this.targets()[0].rot
        gl.setRobotScrollRotation(val * Math.PI * 0.4)
      }
    }, "<")
    mainTL.to({ rot: 0.8 }, {
      rot: 0.8,
      duration: 0.8
    }) // Hold step 3

    // Exit: Fade out and scale down robot at the end of Section 2
    mainTL.to(textBlocks[2], { opacity: 0, y: -30, duration: 0.6 }, "+=0.2")
    mainTL.to({}, {
      duration: 0.8,
      onUpdate: function() {
        const progress = this.progress()
        gl.setRobotOpacity(1 - progress)
        gl.setRobotScale(baseScale * (1 - progress * 0.5))
      }
    }, "<")

    return () => {
      entryST.kill()
      mainTL.scrollTrigger?.kill()
      mainTL.kill()
    }
  }, [gl])

  return (
    <section 
      ref={containerRef} 
      className="relative z-10 w-full min-h-screen flex items-center bg-transparent border-t border-border-subtle"
    >
      <div className="max-w-6xl mx-auto w-full px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[70vh]">
        {/* Left Column: text container */}
        <div ref={stepsContainerRef} className="relative h-[400px] flex items-center md:pr-12">
          {STEPS.map((step, idx) => (
            <div 
              key={idx} 
              className="problem-text-block absolute inset-x-0 flex flex-col gap-4 text-left pointer-events-none"
            >
              <span className="font-mono text-xs font-bold tracking-[0.3em] text-accent-indigo">
                {step.tag}
              </span>
              <h2 className="font-mono font-black text-3xl md:text-5xl text-text-hero leading-tight">
                {step.title}
              </h2>
              <p className="font-mono text-sm md:text-base text-text-muted leading-relaxed max-w-md">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: Left empty to show the fixed 3D canvas underneath */}
        <div className="hidden md:block h-[500px]" />
      </div>
    </section>
  )
}
