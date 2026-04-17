// src/components/UI/EasterEgg.js
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECRET = 'hire'

export function detectSequence(typed, secret) {
  return typed.slice(-secret.length) === secret
}

export default function EasterEgg() {
  const [triggered, setTriggered] = useState(false)
  const typedRef = useRef('')
  const tapCountRef = useRef(0)
  const tapTimeoutRef = useRef(null)
  const triggerTimeoutRef = useRef(null)

  function triggerEffect() {
    setTriggered(true)
    clearTimeout(triggerTimeoutRef.current)
    triggerTimeoutRef.current = setTimeout(() => setTriggered(false), 3000)
  }

  useEffect(() => {
    function handleKeydown(e) {
      if (e.key.length !== 1) return
      typedRef.current = (typedRef.current + e.key).slice(-SECRET.length * 2)
      if (detectSequence(typedRef.current, SECRET)) {
        typedRef.current = ''
        triggerEffect()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  const handleLogoTap = useCallback(() => {
    tapCountRef.current += 1
    clearTimeout(tapTimeoutRef.current)
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0
      triggerEffect()
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        tapCountRef.current = 0
      }, 2000)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('logo-tap', handleLogoTap)
    return () => window.removeEventListener('logo-tap', handleLogoTap)
  }, [handleLogoTap])

  useEffect(() => {
    return () => {
      clearTimeout(tapTimeoutRef.current)
      clearTimeout(triggerTimeoutRef.current)
    }
  }, [])

  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            style={{
              background: 'var(--surface)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              borderRadius: 24,
              padding: '40px 64px',
              textAlign: 'center',
              boxShadow: '0 0 60px rgba(34, 211, 238, 0.3)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>
              You found it!
            </p>
            <p style={{ fontSize: 16, color: 'var(--accent-cyan)' }}>
              Let&apos;s work together
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
