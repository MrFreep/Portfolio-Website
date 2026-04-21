// src/__tests__/CinematicIntro.test.js
import { render, act, waitFor } from '@testing-library/react'
import PageLoader from '../components/UI/PageLoader'
import CinematicIntro from '../components/UI/CinematicIntro'

// Mock the dynamic CinematicCanvas import
jest.mock('../components/UI/CinematicCanvas', () => {
  const { useEffect } = require('react')
  return function MockCanvas({ onDone }) {
    useEffect(() => { onDone() }, [onDone])
    return null
  }
})

describe('PageLoader', () => {
  it('renders without crashing', () => {
    const { container } = render(<PageLoader />)
    expect(container).toBeTruthy()
  })
})

describe('CinematicIntro', () => {
  beforeEach(() => {
    // Reset matchMedia to desktop (pointer: fine) by default
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: false }),
    })
  })

  it('fires cinematic-done after cinematic-start on desktop', async () => {
    const fired = []
    window.addEventListener('cinematic-done', () => fired.push(true))

    render(<CinematicIntro />)

    act(() => { window.dispatchEvent(new CustomEvent('cinematic-start')) })

    await waitFor(() => expect(fired.length).toBe(1))
    window.removeEventListener('cinematic-done', () => {})
  })

  it('fires cinematic-done immediately on mobile', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: true }),
    })

    const fired = []
    window.addEventListener('cinematic-done', () => fired.push(true))

    render(<CinematicIntro />)
    await waitFor(() => expect(fired.length).toBe(1))
  })
})
