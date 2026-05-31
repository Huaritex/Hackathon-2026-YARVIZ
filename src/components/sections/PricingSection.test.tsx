import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PricingSection } from './PricingSection'

describe('PricingSection', () => {
  it('renders all three pricing tiers', () => {
    const { getByText } = render(<PricingSection />)
    expect(getByText('Starter')).toBeInTheDocument()
    expect(getByText('Pro Builder')).toBeInTheDocument()
    expect(getByText('Masterclass')).toBeInTheDocument()
  })

  it('renders correct prices', () => {
    const { getByText, getAllByText } = render(<PricingSection />)
    expect(getByText('10')).toBeInTheDocument()
    expect(getByText('15')).toBeInTheDocument()
    expect(getByText('20')).toBeInTheDocument()
    expect(getAllByText('$').length).toBeGreaterThan(0)
  })

  it('renders section heading', () => {
    const { getByText } = render(<PricingSection />)
    expect(getByText(/Planes de Crecimiento/i)).toBeInTheDocument()
  })
})
