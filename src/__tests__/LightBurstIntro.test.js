// src/__tests__/LightBurstIntro.test.js
import { render, act } from '@testing-library/react'
import LightBurstIntro from '../components/UI/LightBurstIntro'

describe('LightBurstIntro', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the burst overlay on desktop', async () => {
    const { container } = render(<LightBurstIntro />)
    await act(async () => {})
    expect(container.firstChild).not.toBeNull()
  })

  it('unmounts after 1500ms on desktop', () => {
    const { container } = render(<LightBurstIntro />)
    act(() => { jest.advanceTimersByTime(1500) })
    expect(container.firstChild).toBeNull()
  })

  it('does not render on mobile (pointer: coarse)', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() }),
    })
    const { container } = render(<LightBurstIntro />)
    await act(async () => {})
    expect(container.firstChild).toBeNull()
  })
})
