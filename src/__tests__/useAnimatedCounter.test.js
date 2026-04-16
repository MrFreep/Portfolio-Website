import { renderHook, act } from '@testing-library/react'
import useAnimatedCounter from '../hooks/useAnimatedCounter'

describe('useAnimatedCounter', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  test('starts at 0', () => {
    const { result } = renderHook(() => useAnimatedCounter(100))
    expect(result.current.count).toBe(0)
  })

  test('does not animate before start() is called', () => {
    const { result } = renderHook(() => useAnimatedCounter(100))
    act(() => jest.advanceTimersByTime(500))
    expect(result.current.count).toBe(0)
  })

  test('reaches target after animation completes', () => {
    const { result } = renderHook(() => useAnimatedCounter(100, 500))
    act(() => { result.current.start() })
    act(() => jest.advanceTimersByTime(600))
    expect(result.current.count).toBe(100)
  })
})
