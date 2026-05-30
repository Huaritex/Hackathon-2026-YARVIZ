import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NavBar }            from './components/ui/NavBar'
import { HeroSection }       from './components/sections/HeroSection'
import { EcosystemSection }  from './components/sections/EcosystemSection'
import { PricingSection }    from './components/sections/PricingSection'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    // Normalize ScrollTrigger for React
    ScrollTrigger.normalizeScroll(true)
    return () => { ScrollTrigger.normalizeScroll(false) }
  }, [])

  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <EcosystemSection />
        <PricingSection />
      </main>
    </>
  )
}
