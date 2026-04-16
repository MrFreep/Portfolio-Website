'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoRaf: true,
    })

    return () => lenis.destroy()
  }, [])

  return <>{children}</>
}
