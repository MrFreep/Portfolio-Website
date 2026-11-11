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
    title: 'Curious About Systems',
    text: 'I enjoy understanding how interfaces, APIs, and data fit together to make a product work.',
  },
  {
    icon: FaCheckCircle,
    title: 'People-First Problem Solver',
    text: 'Hospitality taught me to communicate clearly, support a team, and stay calm when things get busy.',
  },
  {
    icon: FaHammer,
    title: "Always Making Things",
    text: 'From web apps and browser tools to hands-on projects, I like turning ideas into something real.',
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

          <div className={`${styles.bioCard} glass`}>
            <p>
              I&apos;m a developer based in Raleigh, North Carolina. I&apos;ve always been curious about how
              systems work and enjoyed making things. Video games were one early spark, but what keeps me
              interested is understanding how things fit together and creating something of my own.
            </p>
            <p>
              I completed Springboard&apos;s Software Engineering Career Track and apply that training in
              personal projects, including a full-stack social platform and a Chrome extension. I enjoy
              working across interfaces, APIs, and data to make useful, thoughtful experiences.
            </p>
            <p>
              I also bring around 12 years of hospitality experience, including lead-server responsibilities,
              training teammates, and resolving guest and operational issues. Away from code, I keep making
              things with 3D printing, Blender, and Unreal Engine.
            </p>

            <div className={styles.currentlyRow}>
              <span className={styles.currentlyDot} />
              <p className={styles.currentlyText}>
                <strong>Open to opportunities</strong> — software development and technology-focused roles.
              </p>
            </div>
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
          <div className={styles.photoFrame}>
            <Image
              src="/ProfilePic.jpg"
              alt="James Keenan"
              width={640}
              height={640}
              unoptimized
              className={styles.photo}
              priority
            />
          </div>
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
