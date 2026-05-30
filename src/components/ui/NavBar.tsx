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
          backgroundColor: 'rgba(4, 4, 10, 0.85)',
          backdropFilter: 'blur(14px)',
          borderBottomColor: 'rgba(0, 240, 255, 0.12)',
          duration: 0.4,
          ease: 'power2.out',
        }),
      onLeaveBack: () =>
        gsap.to(nav, {
          backgroundColor: 'rgba(4, 4, 10, 0)',
          backdropFilter: 'blur(0px)',
          borderBottomColor: 'rgba(0, 240, 255, 0)',
          duration: 0.3,
        }),
    })

    return () => st.kill()
  }, [])

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b"
      style={{
        backgroundColor: 'rgba(4, 4, 10, 0)',
        borderBottomColor: 'rgba(0, 240, 255, 0)',
      }}
    >
      <span
        className="font-mono text-xl font-black tracking-[0.2em]"
        style={{ color: 'var(--accent-cyan)' }}
      >
        YARBIZ
      </span>

      <a
        href="#pricing"
        className="
          px-5 py-2 font-mono text-xs font-bold tracking-[0.2em] uppercase
          border transition-all duration-300
        "
        style={{
          borderColor: 'var(--accent-cyan)',
          color: 'var(--accent-cyan)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            'var(--accent-cyan)'
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--bg-void)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            'transparent'
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-cyan)'
        }}
      >
        Get Your Kit →
      </a>
    </nav>
  )
}
