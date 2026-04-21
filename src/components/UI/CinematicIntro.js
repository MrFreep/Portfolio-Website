// src/components/UI/CinematicIntro.js
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

const CinematicCanvas = dynamic(() => import('./CinematicCanvas'), { ssr: false })

export default function CinematicIntro() {
  const [phase, setPhase] = useState('waiting') // 'waiting'|'playing'|'fading'|'done'

  useEffect(() => {
    // Skip on touch/mobile devices — fire cinematic-done immediately
    if (window.matchMedia('(pointer: coarse)').matches) {
      window.dispatchEvent(new CustomEvent('cinematic-done'))
      return
    }

    function onStart() { setPhase('playing') }
    window.addEventListener('cinematic-start', onStart)
    return () => window.removeEventListener('cinematic-start', onStart)
  }, [])

  function handleSequenceDone() {
    setPhase('fading')
  }

  function handleFadeComplete() {
    window.dispatchEvent(new CustomEvent('cinematic-done'))
    setPhase('done')
  }

  if (phase === 'done' || phase === 'waiting') return null

  return (
    <AnimatePresence onExitComplete={phase === 'fading' ? handleFadeComplete : undefined}>
      {phase === 'playing' && (
        <motion.div
          key="cinematic"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            pointerEvents: 'none',
          }}
        >
          <CinematicCanvas onDone={handleSequenceDone} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
