// src/components/About/About.js
'use client'
import { useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion'
import Image from 'next/image'
import useAnimatedCounter from '../../hooks/useAnimatedCounter'
import useTextScramble from '../../hooks/useTextScramble'
import styles from './about.module.css'

const COUNTERS = [
  { target: 3,  suffix: '+', label: 'Projects Built' },
  { target: 15, suffix: '+', label: 'Technologies' },
  { target: 1,  suffix: '+', label: 'Years Experience' },
]

function CounterItem({ target, suffix, label }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-100px' })
  const { count, start } = useAnimatedCounter(target, 1500)

  useEffect(() => {
    if (isInView) start()
  }, [isInView]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      ref={ref}
      className={`${styles.counter} glass`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className={styles.counterNumber}>{count}{suffix}</span>
      <span className={styles.counterLabel}>{label}</span>
    </motion.div>
  )
}

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-200px' })
  const headingText = useTextScramble('About Me', isInView)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const rawPhotoY  = useTransform(scrollYProgress, [0, 1], [-40, 40])
  const rawBioY    = useTransform(scrollYProgress, [0, 1], [20, -20])
  const photoY = useSpring(rawPhotoY, { stiffness: 60, damping: 20 })
  const bioY   = useSpring(rawBioY,   { stiffness: 60, damping: 20 })

  return (
    <section id="about" className={styles.about} ref={ref}>
      <span className="section-number" aria-hidden="true">01</span>

      <div className={styles.inner}>
        <motion.div
          className={styles.bio}
          style={{ y: bioY }}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: '-150px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className={styles.heading}>{headingText}</h2>

          <p>
            I&apos;m a full-stack software engineer passionate about building things that live on the internet.
            I care about writing clean, maintainable code and creating experiences that actually feel good to use.
          </p>
          <p>
            My background spans the full web stack — from crafting responsive UIs in React to building
            RESTful APIs with Express and working with both SQL and NoSQL databases. I enjoy the entire process,
            from designing a system to shipping the final product.
          </p>
          <p>
            When I&apos;m not coding, I&apos;m exploring new technologies and finding ways to push the boundaries
            of what&apos;s possible on the web.
          </p>

          <div className={`${styles.currentlyCard} glass`}>
            <span className={styles.currentlyDot} />
            <p className={styles.currentlyText}>
              <strong>Currently:</strong> Building this portfolio and sharpening my skills in Three.js and animation.
            </p>
          </div>
        </motion.div>

        <motion.div
          className={styles.photoWrapper}
          style={{ y: photoY }}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: '-150px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <Image
            src="/Profile.jpg"
            alt="James Keenan"
            width={320}
            height={380}
            className={styles.photo}
            priority={false}
          />
        </motion.div>
      </div>

      <div className={styles.counters}>
        {COUNTERS.map(c => (
          <CounterItem key={c.label} {...c} />
        ))}
      </div>
    </section>
  )
}
