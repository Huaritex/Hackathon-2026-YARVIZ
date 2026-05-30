import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useCursorGlow } from './useCursorGlow'

function Fixture() {
  const ref = useCursorGlow<HTMLDivElement>()
  return <div ref={ref} data-testid="card" />
}

describe('useCursorGlow', () => {
  it('sets --mouse-x and --mouse-y relative to element on mousemove', () => {
    const { getByTestId } = render(<Fixture />)
    const card = getByTestId('card')

    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 50, right: 400, bottom: 250,
      width: 300, height: 200, x: 100, y: 50,
      toJSON: () => ({}),
    })

    fireEvent.mouseMove(card, { clientX: 250, clientY: 150 })

    expect(card.style.getPropertyValue('--mouse-x')).toBe('150px')
    expect(card.style.getPropertyValue('--mouse-y')).toBe('100px')
  })

  it('removes listener on unmount', () => {
    const removeSpy = vi.spyOn(HTMLDivElement.prototype, 'removeEventListener')
    const { unmount } = render(<Fixture />)
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
  })
})
