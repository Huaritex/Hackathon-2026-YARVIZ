import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NavBar } from './NavBar'

describe('NavBar', () => {
  it('renders YARVIZ brand name', () => {
    const { getByText } = render(<NavBar />)
    expect(getByText('YARVIZ')).toBeInTheDocument()
  })

  it('renders CTA link pointing to #pricing', () => {
    const { getByRole } = render(<NavBar />)
    const link = getByRole('link', { name: /adquirir kit/i })
    expect(link).toHaveAttribute('href', '#pricing')
  })
})
