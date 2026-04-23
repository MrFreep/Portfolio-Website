// src/components/About/About.js
'use client'
import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion'
import { FaCode, FaCheckCircle, FaHammer } from 'react-icons/fa'
import Image from 'next/image'
import useTextScramble from '../../hooks/useTextScramble'
import styles from './about.module.css'

const PILLARS = [
  {
    icon: FaCode,
    title: 'Full-Stack Thinking',
    text: 'Comfortable across the whole stack — React UIs, REST APIs, and database design.',
  },
  {
    icon: FaCheckCircle,
    title: 'Clean, Tested Code',
    text: 'Readable and maintainable, backed by tests with Jest and Supertest.',
  },
  {
    icon: FaHammer,
    title: "Builder's Mindset",
    text: 'From first commit to shipped product — I love the whole process of making things.',
  },
]

function PillarCard({ item, index }) {
  const Icon = item.icon
  return (
    <motion.div
      className={`${styles.pillar} glass`}
      initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: false, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Icon className={styles.pillarIcon} aria-hidden="true" />
      <h4 className={styles.pillarTitle}>{item.title}</h4>
      <p className={styles.pillarText}>{item.text}</p>
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
  const rawPhotoY = useTransform(scrollYProgress, [0, 1], [-40, 40])
  const rawBioY   = useTransform(scrollYProgress, [0, 1], [20, -20])
  const photoY = useSpring(rawPhotoY, { stiffness: 60, damping: 20 })
  const bioY   = useSpring(rawBioY,   { stiffness: 60, damping: 20 })

  return (
    <section id="about" className={styles.about} ref={ref}>
      <span className="section-number" aria-hidden="true">01</span>

      <div className={styles.inner}>
        <motion.div
          className={styles.bio}
          style={{ y: bioY }}
          initial={{ opacity: 0, filter: 'blur(16px)', y: 30 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: false, margin: '-150px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className={styles.heading}>{headingText}</h2>

          <p>
            I&apos;m a Florida-based full-stack software engineer. Growing up obsessed with video games,
            I was always fascinated by how things worked under the hood — that curiosity eventually led me
            to building things on the web.
          </p>
          <p>
            My background spans the full stack — crafting responsive UIs in React, building RESTful APIs
            with Node and Express, and working with both SQL and NoSQL databases. I care about writing
            clean, maintainable code and creating experiences that feel good to use.
          </p>
          <p>
            Outside of code I&apos;m usually building something — 3D printing, modeling in Blender, or
            tinkering in Unreal Engine. The drive to make things carries into everything I do.
          </p>

          <div className={`${styles.currentlyCard} glass`}>
            <span className={styles.currentlyDot} />
            <p className={styles.currentlyText}>
              <strong>Open to opportunities</strong> — actively looking for full-stack and frontend roles.
            </p>
          </div>
        </motion.div>

        <motion.div
          className={styles.photoWrapper}
          style={{ y: photoY }}
          initial={{ opacity: 0, filter: 'blur(16px)', y: 30 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: false, margin: '-150px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <Image
            src="/ProfilePic.jpg"
            alt="James Keenan"
            width={320}
            height={380}
            className={styles.photo}
            priority={false}
          />
        </motion.div>
      </div>

      <div className={styles.pillars}>
        {PILLARS.map((item, i) => (
          <PillarCard key={item.title} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}
