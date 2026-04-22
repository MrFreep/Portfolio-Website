// src/components/UI/LightBurstIntro.js
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LightBurstIntro() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    setShow(true)
    const id = setTimeout(() => setShow(false), 1500)
    return () => clearTimeout(id)
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position      : 'fixed',
        inset         : 0,
        zIndex        : 99998,
        pointerEvents : 'none',
        overflow      : 'hidden',
        display       : 'flex',
        alignItems    : 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 40, opacity: 0 }}
        transition={{
          scale  : { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 1.1, delay: 0.2, ease: 'easeIn' },
        }}
        style={{
          width       : 60,
          height      : 60,
          borderRadius: '50%',
          background  : 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(34,211,238,0.6) 20%, rgba(249,115,22,0.25) 50%, transparent 70%)',
        }}
      />
    </div>
  )
}
