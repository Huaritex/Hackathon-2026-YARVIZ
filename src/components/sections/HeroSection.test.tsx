import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { HeroSection } from './HeroSection'

// GLManager is not needed in DOM tests — mock it
vi.mock('../../gl/GLManager', () => ({
  GLManager: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.loadRobotModels = vi.fn().mockResolvedValue(undefined)
    this.setScrollProgress = vi.fn()
    this.setMouse = vi.fn()
    this.tick = vi.fn()
    this.render = vi.fn()
    this.destroy = vi.fn()
  }),
}))

vi.mock('gsap', async () => {
  const actual = await vi.importActual<typeof import('gsap')>('gsap')
  return {
    ...actual,
    default: {
      ...actual.default,
      ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
      registerPlugin: vi.fn(),
      set: vi.fn(),
      timeline: vi.fn(() => ({
        to: vi.fn().mockReturnThis(),
        fromTo: vi.fn().mockReturnThis(),
        kill: vi.fn(),
        scrollTrigger: undefined,
      })),
    },
  }
})

describe('HeroSection', () => {
  it('renders hero container', () => {
    const { getByTestId } = render(<HeroSection />)
    expect(getByTestId('hero-container')).toBeInTheDocument()
  })

  it('renders YARBIZ heading', () => {
    const { getByText } = render(<HeroSection />)
    expect(getByText('YARBIZ')).toBeInTheDocument()
  })

  it('renders CTA link', () => {
    const { getByRole } = render(<HeroSection />)
    expect(getByRole('link', { name: /get your kit/i })).toBeInTheDocument()
  })
})
