// src/components/Work/ProjectRow.js
'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import styles from './work.module.css'

export default function ProjectRow({ project, index }) {
  const [isHovered, setIsHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)
  const [isTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  )
  const isEven = index % 2 === 0

  function handleMouseMove(e) {
    if (isTouch) return
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15
    setTilt({ x, y })
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <motion.div
      className={`${styles.projectRow} ${isEven ? styles.rowEven : styles.rowOdd}`}
      initial={{ opacity: 0, x: isEven ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Image side */}
      <motion.div
        ref={imgRef}
        className={styles.imageWrapper}
        style={{
          rotateY: tilt.x,
          rotateX: tilt.y,
          transformStyle: 'preserve-3d',
          perspective: 800,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className={`${styles.imageCard} glass`}>
          <Image
            src={isHovered && project.video ? project.video : project.image}
            alt={project.title}
            width={600}
            height={400}
            className={styles.projectImage}
          />
          {project.video && (
            <div className={styles.previewHint}>
              {isHovered ? 'Live Preview' : 'Hover to Preview'}
            </div>
          )}
        </div>
      </motion.div>

      {/* Content side */}
      <div className={styles.projectContent}>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectDescription}>{project.description}</p>

        <div className={styles.techTags}>
          {project.tech.map(tag => (
            <span key={tag} className={styles.techTag}>{tag}</span>
          ))}
        </div>

        <div className={styles.projectLinks}>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkBtn}
              data-cursor="link"
            >
              Live Demo ↗
            </a>
          )}
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.linkBtn} ${styles.linkBtnOutline}`}
            data-cursor="link"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </motion.div>
  )
}
