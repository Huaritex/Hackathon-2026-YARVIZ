import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { GlitchText } from './GlitchText'

describe('GlitchText', () => {
  afterEach(() => vi.useRealTimers())

  it('renders the target text immediately (initial state shows text)', () => {
    const { container } = render(<GlitchText text="YARVIZ" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('resolves to exact target text after animation completes', () => {
    vi.useFakeTimers()
    const { getByText } = render(<GlitchText text="YARVIZ" duration={0.1} />)
    act(() => { vi.advanceTimersByTime(300) })
    expect(getByText('YARVIZ')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <GlitchText text="TEST" className="custom-class" />
    )
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
