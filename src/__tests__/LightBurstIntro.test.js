// src/__tests__/LightBurstIntro.test.js
import { render, act } from '@testing-library/react'
import LightBurstIntro from '../components/UI/LightBurstIntro'

describe('LightBurstIntro', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: false }), // desktop
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the burst overlay on desktop', () => {
    const { container } = render(<LightBurstIntro />)
    act(() => {})
    expect(container.firstChild).not.toBeNull()
  })

  it('unmounts after 1500ms on desktop', () => {
    const { container } = render(<LightBurstIntro />)
    act(() => { jest.advanceTimersByTime(1500) })
    expect(container.firstChild).toBeNull()
  })

  it('does not render on mobile (pointer: coarse)', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: true }),
    })
    const { container } = render(<LightBurstIntro />)
    act(() => {})
    expect(container.firstChild).toBeNull()
  })
})
