import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NavBar }            from './components/ui/NavBar'
import { HeroSection }       from './components/sections/HeroSection'
import { ProblemSection }    from './components/sections/ProblemSection'
import { EcosystemSection }  from './components/sections/EcosystemSection'
import { PricingSection }    from './components/sections/PricingSection'
import { FooterSection }     from './components/sections/FooterSection'
import { GLManager }         from './gl/GLManager'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gl, setGl] = useState<GLManager | null>(null)

  useEffect(() => {
    // Normalize ScrollTrigger for React
    ScrollTrigger.normalizeScroll(true)

    const canvas = canvasRef.current!
    const glInstance = new GLManager(canvas)
    setGl(glInstance)

    glInstance.loadRobotModels().catch((err: unknown) => {
      console.error('[YARVIZ] Robot model load failed:', err)
    })

    // GSAP ticker drives GL loop
    const onTick = (_time: number, deltaTime: number) => {
      glInstance.tick(deltaTime)
      glInstance.render()
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // Mouse positioning
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = -(e.clientY / window.innerHeight - 0.5) * 2
      glInstance.setMouse(x, y)
    }
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      ScrollTrigger.normalizeScroll(false)
      gsap.ticker.remove(onTick)
      window.removeEventListener('mousemove', onMouseMove)
      glInstance.destroy()
    }
  }, [])

  return (
    <>
      {/* Background WebGL canvas shared across Hero & Section 2 */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ pointerEvents: 'none' }}
      />
      <NavBar />
      <main className="relative z-10 bg-transparent">
        <HeroSection gl={gl} />
        <ProblemSection gl={gl} />
        <EcosystemSection />
        <PricingSection />
        <FooterSection />
      </main>
    </>
  )
}
