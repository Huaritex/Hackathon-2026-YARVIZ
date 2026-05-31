import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function FooterSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const content = contentRef.current!

    gsap.set(content, { opacity: 0, y: 50 })

    const st = ScrollTrigger.create({
      trigger: sectionRef.current!,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(content, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      },
    })

    return () => st.kill()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-32 px-6 bg-transparent border-t border-border-subtle"
    >
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-accent-indigo/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-accent-teal/5 rounded-full blur-[100px] pointer-events-none" />

      <div 
        ref={contentRef}
        className="max-w-4xl mx-auto flex flex-col items-center text-center gap-16 select-none"
      >
        {/* Massive Call to Action */}
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs font-bold tracking-[0.4em] uppercase text-accent-indigo">
            HAZLO REALIDAD
          </span>
          <h2 className="font-mono font-black text-4xl sm:text-6xl md:text-7xl text-text-hero leading-tight tracking-tight">
            ¿Listo para construir el futuro en tu cuarto?
          </h2>
          <p className="max-w-lg mx-auto font-mono text-sm sm:text-base text-text-muted leading-relaxed">
            Consigue tus planos 3D, código y tutoriales hoy mismo. Comienza a programar y ensamblar tu propio compañero robótico inteligente.
          </p>
        </div>

        {/* Giant CTA Button */}
        <a
          href="#pricing"
          onClick={(e) => {
            e.preventDefault()
            document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="
            relative px-12 py-6 font-mono font-black text-base sm:text-lg tracking-[0.3em] uppercase rounded-xl
            bg-text-hero text-bg-main border border-text-hero hover:bg-transparent hover:text-text-hero
            hover:border-accent-teal hover:shadow-[0_0_50px_rgba(20,184,166,0.4)]
            hover:scale-105 transition-all duration-300 text-center
           font-black block w-full sm:w-auto
          "
        >
          Adquirir Ahora →
        </a>

        {/* Footer bottom details */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border-subtle pt-12 mt-12">
          <span className="font-mono text-lg font-black tracking-[0.2em] text-text-hero">
            YARVIZ
          </span>

          <div className="flex gap-8 font-mono text-xs text-text-muted">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-accent-indigo transition-colors duration-300">GitHub</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-accent-indigo transition-colors duration-300">Discord</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-accent-indigo transition-colors duration-300">Términos</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-accent-indigo transition-colors duration-300">Privacidad</a>
          </div>

          <span className="font-mono text-[10px] text-text-muted">
            © {new Date().getFullYear()} YARVIZ. Licencia MIT.
          </span>
        </div>
      </div>
    </section>
  )
}
