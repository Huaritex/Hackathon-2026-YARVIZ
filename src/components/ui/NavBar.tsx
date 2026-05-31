import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function NavBar() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const st = ScrollTrigger.create({
      start: 'top -60',
      onEnter: () =>
        gsap.to(nav, {
          backgroundColor: 'rgba(9, 9, 11, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottomColor: 'var(--border-subtle)',
          duration: 0.4,
          ease: 'power2.out',
        }),
      onLeaveBack: () =>
        gsap.to(nav, {
          backgroundColor: 'rgba(9, 9, 11, 0)',
          backdropFilter: 'blur(0px)',
          borderBottomColor: 'rgba(255, 255, 255, 0)',
          duration: 0.3,
        }),
    })

    return () => st.kill()
  }, [])

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b"
      style={{
        backgroundColor: 'rgba(9, 9, 11, 0)',
        borderBottomColor: 'rgba(255, 255, 255, 0)',
      }}
    >
      <span
        className="font-mono text-xl font-black tracking-[0.2em] text-text-hero"
      >
        YARVIZ
      </span>

      <a
        href="#pricing"
        className="
          px-5 py-2 font-mono text-xs font-bold tracking-[0.2em] uppercase rounded-lg
          border transition-all duration-300
        "
        style={{
          borderColor: 'var(--accent-indigo)',
          color: 'var(--accent-indigo)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            'var(--accent-indigo)'
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-hero)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            'transparent'
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-indigo)'
        }}
      >
        Adquirir Kit →
      </a>
    </nav>
  )
}
