// src/components/Header/Header.js
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMagneticButton from '../../hooks/useMagneticButton'
import styles from './header.module.css'

const NAV_LINKS = [
  { label: 'Home',    href: '#home' },
  { label: 'About',   href: '#about' },
  { label: 'Skills',  href: '#skills' },
  { label: 'Work',    href: '#work' },
  { label: 'Contact', href: '#contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const resumeMagnetic = useMagneticButton(0.3)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Active section via Intersection Observer
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { threshold: 0.5 }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  function handleNavClick() {
    setMenuOpen(false)
  }

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <a
          href="#home"
          className={styles.logo}
          onClick={() => window.dispatchEvent(new Event('logo-tap'))}
        >
          James <span>Keenan</span>
        </a>

        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${activeSection === link.href.slice(1) ? styles.active : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <motion.a
          ref={resumeMagnetic.ref}
          href="/resume.pdf"
          download
          className={styles.resumeBtn}
          style={{ x: resumeMagnetic.springX, y: resumeMagnetic.springY }}
          onMouseMove={resumeMagnetic.handleMouseMove}
          onMouseLeave={resumeMagnetic.handleMouseLeave}
          data-cursor="button"
        >
          Resume ↓
        </motion.a>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className={styles.mobileMenu}
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={handleNavClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="/resume.pdf"
              download
              className={styles.resumeBtn}
              onClick={handleNavClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Download Resume
            </motion.a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
