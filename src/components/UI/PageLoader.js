// src/components/UI/PageLoader.js
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageLoader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const onCompleteRef = useRef(onComplete)
  const completedRef = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    let timeoutId = null

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (!completedRef.current) {
            completedRef.current = true
            clearInterval(interval)
            timeoutId = setTimeout(() => {
              setDone(true)
              onCompleteRef.current?.()
            }, 400)
          }
          return 100
        }
        return prev + 5
      })
    }, 80)

    return () => {
      clearInterval(interval)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          role="status"
          aria-label="Loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-base)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
          }}
        >
          {/* Geometric particle ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTop: '2px solid var(--accent-cyan)',
              borderRight: '2px solid var(--accent-orange)',
              filter: 'drop-shadow(0 0 8px var(--accent-cyan))',
            }}
          />

          {/* Name */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              color: 'var(--fg-muted)',
              fontSize: '14px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            James Keenan
          </motion.p>

          {/* Progress bar */}
          <div style={{
            width: 200,
            height: 1,
            background: 'var(--border)',
            borderRadius: 1,
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.08, ease: 'linear' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-orange))',
                boxShadow: '0 0 8px var(--accent-cyan)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
