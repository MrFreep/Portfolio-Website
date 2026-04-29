// src/components/Header/Header.js
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useMagneticButton from "../../hooks/useMagneticButton";
import styles from "./header.module.css";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [ready, setReady] = useState(false);
  const {
    ref: resumeRef,
    springX: resumeSpringX,
    springY: resumeSpringY,
    handleMouseMove: resumeOnMouseMove,
    handleMouseLeave: resumeOnMouseLeave,
  } = useMagneticButton(0.3);

  useEffect(() => {
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const delay = isMobile ? 400 : 1500;
    const id = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active section: scroll-based, checks which section's top is above the
  // viewport centre. Works for sections taller than the viewport.
  useEffect(() => {
    const getSections = () =>
      Array.from(document.querySelectorAll("section[id]"));

    function findActive() {
      const sections = getSections();
      if (!sections.length) return;
      const midY = window.innerHeight / 2;
      let active = sections[0].id;
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= midY) active = s.id;
      }
      setActiveSection(active);
    }

    findActive();
    window.addEventListener("scroll", findActive, { passive: true });
    return () => window.removeEventListener("scroll", findActive);
  }, []);

  function handleNavClick() {
    setMenuOpen(false);
  }

  return (
    <>
      <motion.header
        className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
        initial={{ y: -72, opacity: 0, filter: "blur(8px)" }}
        animate={
          ready
            ? { y: 0, opacity: 1, filter: "blur(0px)" }
            : { y: -72, opacity: 0, filter: "blur(8px)" }
        }
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <a
          href="#home"
          className={styles.logo}
          onClick={() => window.dispatchEvent(new Event("logo-tap"))}
        >
          James <span>Keenan</span>
        </a>

        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${activeSection === link.href.slice(1) ? styles.active : ""}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <motion.a
          ref={resumeRef}
          href="/James%20Keenans%20Resume.pdf"
          download="James-Keenan-Resume.pdf"
          className={styles.resumeBtn}
          style={{ x: resumeSpringX, y: resumeSpringY }}
          onMouseMove={resumeOnMouseMove}
          onMouseLeave={resumeOnMouseLeave}
          data-cursor="button"
        >
          Resume ↓
        </motion.a>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </motion.header>

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
              href="/James%20Keenans%20Resume.pdf"
              download="James-Keenan-Resume.pdf"
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
  );
}
