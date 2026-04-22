// src/components/Hero/Hero.js
'use client'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import useMagneticButton from '../../hooks/useMagneticButton'
import styles from './hero.module.css'

const StarForeground = dynamic(
  () => import('./ParticleField').then(m => ({ default: m.StarForeground })),
  { ssr: false }
)

const ROLES = ['Software Engineer', 'Full-Stack Developer', 'Problem Solver']

function useTypewriter(words, speed = 100, deleteSpeed = 50, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex]     = useState(0)
  const [isDeleting, setIsDeleting]   = useState(false)
  const [isPaused, setIsPaused]       = useState(false)

  useEffect(() => {
    if (isPaused) return
    const currentWord = words[wordIndex % words.length]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const next = currentWord.slice(0, displayText.length + 1)
        setDisplayText(next)
        if (next === currentWord) {
          setIsPaused(true)
          setTimeout(() => { setIsPaused(false); setIsDeleting(true) }, pauseTime)
        }
      } else {
        const next = currentWord.slice(0, displayText.length - 1)
        setDisplayText(next)
        if (next === '') { setIsDeleting(false); setWordIndex(i => i + 1) }
      }
    }, isDeleting ? deleteSpeed : speed)
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, isPaused, wordIndex, words, speed, deleteSpeed, pauseTime])

  return displayText
}

// delay: seconds before letters begin their spring animation
function AnimatedName({ name, delay = 0 }) {
  const letters = name.split('')
  return (
    <h1 className={styles.name} aria-label={name}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            type    : 'spring',
            stiffness: 200,
            damping : 20,
            delay   : delay + i * 0.03,
          }}
          style={{ display: 'inline-block' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </h1>
  )
}

export default function Hero() {
  const typewriterText  = useTypewriter(ROLES)
  const [showFg, setShowFg] = useState(false)
  const primaryMagnetic = useMagneticButton(0.3)
  const outlineMagnetic = useMagneticButton(0.3)
  const { scrollY }     = useScroll()
  const heroH           = typeof window !== 'undefined' ? window.innerHeight : 800

  const fgStart   = heroH * 0.15
  const fgOpacity = useTransform(scrollY, [fgStart, fgStart + heroH * 6.5], [1, 0])

  // Mount foreground stars after the burst overlay has unmounted (~1.8s)
  useEffect(() => {
    const id = setTimeout(() => setShowFg(true), 1800)
    return () => clearTimeout(id)
  }, [])

  return (
    <section id="home" className={styles.hero}>

      {/* Foreground stars — bright + asteroids, appears after burst */}
      {showFg && (
        <motion.div
          className={styles.canvasFg}
          style={{ opacity: fgOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeIn' }}
        >
          <StarForeground />
        </motion.div>
      )}

      <div className={styles.content}>

        {/* Layer 1 — Name: closest to burst center, sharpens first */}
        <motion.div
          initial={{ filter: 'blur(24px)', scale: 1.04 }}
          animate={{ filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatedName name="James Keenan" delay={0.5} />
        </motion.div>

        {/* Layer 2 — Role / typewriter */}
        <motion.div
          className={styles.typewriterWrapper}
          initial={{ opacity: 0, filter: 'blur(16px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.0, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>{typewriterText}</span>
          <span className={styles.cursor} aria-hidden="true" />
        </motion.div>

        {/* Layer 3 — Tagline */}
        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, filter: 'blur(12px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 1.0, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          Building modern web experiences with clean code and purposeful design.
        </motion.p>

        {/* Layer 4 — Buttons */}
        <motion.div
          className={styles.buttons}
          initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.a
            ref={primaryMagnetic.ref}
            href="#work"
            className={styles.btnPrimary}
            style={{ x: primaryMagnetic.springX, y: primaryMagnetic.springY }}
            onMouseMove={primaryMagnetic.handleMouseMove}
            onMouseLeave={primaryMagnetic.handleMouseLeave}
            data-cursor="button"
          >
            View My Work
          </motion.a>
          <motion.a
            ref={outlineMagnetic.ref}
            href="#contact"
            className={styles.btnOutline}
            style={{ x: outlineMagnetic.springX, y: outlineMagnetic.springY }}
            onMouseMove={outlineMagnetic.handleMouseMove}
            onMouseLeave={outlineMagnetic.handleMouseLeave}
            data-cursor="button"
          >
            Let&apos;s Talk
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollArrow}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >↓</motion.div>

    </section>
  )
}
