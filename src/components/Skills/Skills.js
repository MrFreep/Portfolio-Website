// src/components/Skills/Skills.js
'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import useTextScramble from '../../hooks/useTextScramble'
import { skillCategories } from '../../data/skills'
import styles from './skills.module.css'

// Flatten all categories into one array, carrying category name
const allSkills = skillCategories.flatMap(cat =>
  cat.items.map(item => ({ ...item, category: cat.name }))
)

function TextIcon({ abbrev, color }) {
  return (
    <span className={styles.textIcon} style={{ color, borderColor: 'currentColor' }}>
      {abbrev}
    </span>
  )
}

function SkillCard({ item, index }) {
  const Icon = item.icon
  const iconColor = item.color || 'var(--accent-cyan)'

  return (
    <motion.div
      className={styles.skillCard}
      style={{ '--icon-color': iconColor }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.18 } }}
      viewport={{ once: false, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.iconWrap}>
        {Icon
          ? <Icon style={{ color: iconColor }} aria-hidden="true" />
          : <TextIcon abbrev={item.abbrev || item.label.slice(0, 3).toUpperCase()} color={iconColor} />
        }
      </div>
      <span className={styles.label}>{item.label}</span>
      <span className={styles.category}>{item.category}</span>
    </motion.div>
  )
}

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-200px' })
  const headingText = useTextScramble('Skills', isInView)

  return (
    <section id="skills" className={styles.skills} ref={ref}>
      <span className="section-number" aria-hidden="true">02</span>

      <h2 className={styles.heading}>{headingText}</h2>

      <div className={styles.grid}>
        {allSkills.map((item, i) => (
          <SkillCard key={item.label} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}
