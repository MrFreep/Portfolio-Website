// src/components/Skills/Skills.js
'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import useTextScramble from '../../hooks/useTextScramble'
import { skillCategories } from '../../data/skills'
import styles from './skills.module.css'

function SkillItem({ item, index }) {
  const Icon = item.icon

  if (Icon) {
    return (
      <motion.div
        className={`${styles.skillItem} glass`}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
          duration: 0.4,
          delay: index * 0.06,
          ease: [0.16, 1, 0.3, 1],
        }}
        data-cursor="link"
      >
        <Icon
          className={styles.skillIcon}
          style={{ color: item.color || 'var(--fg-muted)' }}
          aria-hidden="true"
        />
        <span>{item.label}</span>
        <span className={styles.tooltip} aria-hidden="true">{item.label}</span>
      </motion.div>
    )
  }

  return (
    <motion.span
      className={styles.skillBadge}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {item.label}
    </motion.span>
  )
}

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-200px' })
  const headingText = useTextScramble('Skills', isInView)

  return (
    <section id="skills" className={styles.skills} ref={ref}>
      <span className="section-number" aria-hidden="true">02</span>

      <h2 className={styles.heading}>{headingText}</h2>

      <div className={styles.categories}>
        {skillCategories.map((category, catIndex) => (
          <div key={category.name} className={styles.category}>
            <motion.h3
              className={styles.categoryName}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.05 }}
            >
              {category.name}
            </motion.h3>
            <div className={styles.items}>
              {category.items.map((item, i) => (
                <SkillItem key={item.label} item={item} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
