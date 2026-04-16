import { renderHook, act } from '@testing-library/react'
import useTextScramble from '../hooks/useTextScramble'

describe('useTextScramble', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  test('returns original text before trigger', () => {
    const { result } = renderHook(() => useTextScramble('Hello', false))
    expect(result.current).toBe('Hello')
  })

  test('same length during scramble', () => {
    const { result, rerender } = renderHook(
      ({ trigger }) => useTextScramble('Hello', trigger),
      { initialProps: { trigger: false } }
    )
    act(() => { rerender({ trigger: true }) })
    act(() => jest.advanceTimersByTime(50))
    expect(result.current.length).toBe('Hello'.length)
  })

  test('resolves to original text after animation completes', () => {
    const { result, rerender } = renderHook(
      ({ trigger }) => useTextScramble('Hi', trigger),
      { initialProps: { trigger: false } }
    )
    act(() => { rerender({ trigger: true }) })
    act(() => jest.advanceTimersByTime(2000))
    expect(result.current).toBe('Hi')
  })
})
