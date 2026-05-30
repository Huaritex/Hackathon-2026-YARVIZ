import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { EcosystemSection } from './EcosystemSection'

vi.mock('gsap', async () => {
  const actual = await vi.importActual<typeof import('gsap')>('gsap')
  return {
    ...actual,
    default: {
      ...actual.default,
      registerPlugin: vi.fn(),
      set: vi.fn(),
      timeline: vi.fn(() => ({
        to: vi.fn().mockReturnThis(),
        fromTo: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      })),
    },
  }
})

describe('EcosystemSection', () => {
  it('renders all three feature titles', () => {
    const { getByText } = render(<EcosystemSection />)
    expect(getByText(/Shape YARBIZ/i)).toBeInTheDocument()
    expect(getByText(/It Sounds Like You/i)).toBeInTheDocument()
    expect(getByText(/Create Your Holograms/i)).toBeInTheDocument()
  })

  it('renders section heading', () => {
    const { getByText } = render(<EcosystemSection />)
    expect(getByText(/the ecosystem/i)).toBeInTheDocument()
  })
})
