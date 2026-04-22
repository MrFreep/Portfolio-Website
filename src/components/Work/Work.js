// src/components/Work/Work.js
'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup, useInView } from 'framer-motion'
import useTextScramble from '../../hooks/useTextScramble'
import { projects } from '../../data/projects'
import ProjectRow from './ProjectRow'
import styles from './work.module.css'

// Exported so it can be unit tested
export function filterProjects(projectList, activeFilter) {
  if (activeFilter === 'All') return projectList
  return projectList.filter(p => p.tech.includes(activeFilter))
}

function getFilterTags(projectList) {
  const allTags = new Set()
  projectList.forEach(p => p.tech.forEach(t => allTags.add(t)))
  return ['All', ...Array.from(allTags).sort()]
}

export default function Work() {
  const [activeFilter, setActiveFilter] = useState('All')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-200px' })
  const headingText = useTextScramble('My Work', isInView)

  const filterTags = getFilterTags(projects)
  const filtered = filterProjects(projects, activeFilter)

  return (
    <section id="work" className={styles.work} ref={ref}>
      <span className="section-number" aria-hidden="true">03</span>

      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, filter: 'blur(16px)', y: 30 }}
        whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        viewport={{ once: false, margin: '-150px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {headingText}
      </motion.h2>

      <motion.div
        className={styles.filters}
        initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
        whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        viewport={{ once: false, margin: '-150px' }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        role="group"
        aria-label="Filter projects by technology"
      >
        {filterTags.map(tag => (
          <button
            key={tag}
            className={`${styles.filterBtn} ${activeFilter === tag ? styles.active : ''}`}
            onClick={() => setActiveFilter(tag)}
            aria-pressed={activeFilter === tag}
          >
            {tag}
          </button>
        ))}
      </motion.div>

      <LayoutGroup>
        <motion.div className={styles.projects} layout>
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                className={styles.empty}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No projects match this filter yet.
              </motion.p>
            ) : (
              filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProjectRow project={project} index={i} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </section>
  )
}
