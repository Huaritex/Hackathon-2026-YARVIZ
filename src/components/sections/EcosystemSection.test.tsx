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
        kill: vi.fn(),
        scrollTrigger: null,
      })),
    },
  }
})

describe('EcosystemSection', () => {
  it('renders bento features', () => {
    const { getByText } = render(<EcosystemSection />)
    expect(getByText(/Personalización de Personalidad/i)).toBeInTheDocument()
    expect(getByText(/Voz ElevenLabs/i)).toBeInTheDocument()
    expect(getByText(/Animaciones Holográficas/i)).toBeInTheDocument()
    expect(getByText(/Almacenamiento Local Seguro/i)).toBeInTheDocument()
  })

  it('renders section heading', () => {
    const { getByText } = render(<EcosystemSection />)
    expect(getByText(/Ecosistema Integrado/i)).toBeInTheDocument()
  })
})
