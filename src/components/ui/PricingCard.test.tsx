import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PricingCard } from './PricingCard'

const baseProps = {
  tier: 'Starter' as const,
  price: 10,
  features: ['3D printing blueprints', 'Hardware list'],
  featured: false,
}

describe('PricingCard', () => {
  it('renders tier name and price', () => {
    const { getByText } = render(<PricingCard {...baseProps} />)
    expect(getByText('Starter')).toBeInTheDocument()
    expect(getByText('$10')).toBeInTheDocument()
  })

  it('renders all feature items', () => {
    const { getByText } = render(<PricingCard {...baseProps} />)
    expect(getByText('3D printing blueprints')).toBeInTheDocument()
    expect(getByText('Hardware list')).toBeInTheDocument()
  })

  it('shows MOST POPULAR badge when featured', () => {
    const { getByText } = render(<PricingCard {...baseProps} featured />)
    expect(getByText('MOST POPULAR')).toBeInTheDocument()
  })

  it('does not show badge when not featured', () => {
    const { queryByText } = render(<PricingCard {...baseProps} />)
    expect(queryByText('MOST POPULAR')).not.toBeInTheDocument()
  })
})
