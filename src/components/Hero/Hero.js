// src/components/Hero/Hero.js
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useMagneticButton from '../../hooks/useMagneticButton'
import styles from './hero.module.css'

const ROLES = ['Software Engineer', 'Full-Stack Developer', 'Problem Solver']

function useTypewriter(words, speed = 100, deleteSpeed = 50, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const currentWord = words[wordIndex % words.length]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const next = currentWord.slice(0, displayText.length + 1)
        setDisplayText(next)
        if (next === currentWord) {
          setIsPaused(true)
          setTimeout(() => {
            setIsPaused(false)
            setIsDeleting(true)
          }, pauseTime)
        }
      } else {
        const next = currentWord.slice(0, displayText.length - 1)
        setDisplayText(next)
        if (next === '') {
          setIsDeleting(false)
          setWordIndex(i => i + 1)
        }
      }
    }, isDeleting ? deleteSpeed : speed)
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, isPaused, wordIndex, words, speed, deleteSpeed, pauseTime])

  return displayText
}

function AnimatedName({ name }) {
  const letters = name.split('')
  return (
    <h1 className={styles.name} aria-label={name}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.8 + i * 0.04,
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
  const typewriterText = useTypewriter(ROLES)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })
  const primaryMagnetic = useMagneticButton(0.3)
  const outlineMagnetic = useMagneticButton(0.3)
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setSpotlight({ x, y })
  }

  return (
    <section
      id="home"
      className={styles.hero}
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight effect */}
      <div
        className={styles.spotlight}
        style={{
          background: `radial-gradient(600px circle at ${spotlight.x}% ${spotlight.y}%, rgba(34, 211, 238, 0.07), transparent 50%)`,
        }}
      />

      {/* Hero content */}
      <div className={styles.content}>
        <AnimatedName name="James Keenan" />

        <motion.div
          className={styles.typewriterWrapper}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <span>{typewriterText}</span>
          <span className={styles.cursor} aria-hidden="true" />
        </motion.div>

        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Building modern web experiences with clean code and purposeful design.
        </motion.p>

        <motion.div
          className={styles.buttons}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
      <div className={styles.scrollArrow} aria-hidden="true">↓</div>
    </section>
  )
}
