import { useEffect, useRef, CSSProperties } from 'react'

const CHARS = '!<>-_\\/[]{}—=+*^?#░▒▓█▀▄ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'

interface GlitchTextProps {
  text: string
  className?: string
  style?: CSSProperties
  duration?: number  // seconds
  delay?: number     // seconds before animation starts
}

export function GlitchText({
  text,
  className,
  style,
  duration = 1.8,
  delay = 0,
}: GlitchTextProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const chars = text.split('')
    const totalFrames = Math.round(duration * 60)
    let frame = 0
    let rafId: ReturnType<typeof requestAnimationFrame>
    let timeoutId: ReturnType<typeof setTimeout>

    const update = () => {
      frame++
      const progress = frame / totalFrames

      const result = chars.map((char, i) => {
        const charProgress = Math.min(
          1,
          (progress - (i / chars.length) * 0.4) / 0.6,
        )
        if (charProgress >= 1 || char === ' ') return char
        if (charProgress < 0) return CHARS[Math.floor(Math.random() * CHARS.length)]
        return Math.random() < charProgress
          ? char
          : CHARS[Math.floor(Math.random() * CHARS.length)]
      })

      el.textContent = result.join('')

      if (frame < totalFrames) {
        rafId = requestAnimationFrame(update)
      } else {
        el.textContent = text
      }
    }

    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(update)
    }, delay * 1000)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(rafId)
      if (el) el.textContent = text
    }
  }, [text, duration, delay])

  return (
    <span ref={ref} className={className} style={style}>
      {text}
    </span>
  )
}
