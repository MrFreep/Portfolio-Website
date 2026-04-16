// src/hooks/useAnimatedCounter.js
import { useState, useEffect, useRef } from 'react'

export default function useAnimatedCounter(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!started) return
    const startTime = Date.now()
    const INTERVAL = 16

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const newCount = Math.floor(eased * target)
      setCount(newCount)
      if (progress >= 1) {
        setCount(target)
        clearInterval(timerRef.current)
      }
    }, INTERVAL)

    return () => clearInterval(timerRef.current)
  }, [started, target, duration])

  return { count, start: () => setStarted(true) }
}
