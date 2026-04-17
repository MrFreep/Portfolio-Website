// src/components/UI/CustomCursor.js
'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [variant, setVariant] = useState('default') // 'default' | 'link' | 'button' | 'clicked'
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 500, damping: 40 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 40 })

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    function moveCursor(e) {
      cursorX.set(e.clientX - 8)
      cursorY.set(e.clientY - 8)
    }

    function handleMouseOver(e) {
      if (e.target.closest('a') || e.target.closest('[data-cursor="link"]')) {
        setVariant('link')
      } else if (e.target.closest('button') || e.target.closest('[data-cursor="button"]')) {
        setVariant('button')
      } else {
        setVariant('default')
      }
    }

    function handleMouseDown() { setVariant('clicked') }
    function handleMouseUp() { setVariant('default') }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [cursorX, cursorY])

  const variants = {
    default: { width: 16, height: 16, backgroundColor: 'var(--accent-cyan)', opacity: 0.8 },
    link:    { width: 32, height: 32, backgroundColor: 'transparent', border: '2px solid var(--accent-cyan)', opacity: 1 },
    button:  { width: 12, height: 12, backgroundColor: 'var(--accent-orange)', opacity: 1 },
    clicked: { width: 8, height: 8, backgroundColor: 'var(--accent-cyan)', opacity: 1 },
  }

  return (
    <motion.div
      aria-hidden="true"
      animate={variant}
      variants={variants}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      style={{
        position: 'fixed',
        left: springX,
        top: springY,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 10000,
        mixBlendMode: 'difference',
      }}
    />
  )
}
