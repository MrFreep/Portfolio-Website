// src/components/Contact/Contact.js
'use client'
import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { SiGithub } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'
import useTextScramble from '../../hooks/useTextScramble'
import useMagneticButton from '../../hooks/useMagneticButton'
import styles from './contact.module.css'

const YOUR_EMAIL = 'james.keenan3403@gmail.com'
const YOUR_GITHUB = 'https://github.com/jkeenan3403'
const YOUR_LINKEDIN = 'https://linkedin.com/in/james-keenan'

export default function Contact() {
  const formRef = useRef(null)
  const sectionRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [copyLabel, setCopyLabel] = useState('Copy')
  const isInView = useInView(sectionRef, { once: true, margin: '-200px' })
  const headingText = useTextScramble("Let's Talk", isInView)
  const submitMagnetic = useMagneticButton(0.2)

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      )
      setStatus('success')
      formRef.current.reset()
    } catch {
      setStatus('error')
    }
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(YOUR_EMAIL)
      setCopyLabel('Copied!')
      setTimeout(() => setCopyLabel('Copy'), 2000)
    } catch {
      // Clipboard API unavailable — let user copy manually
      setCopyLabel('Failed')
      setTimeout(() => setCopyLabel('Copy'), 2000)
    }
  }

  return (
    <section id="contact" className={styles.contact} ref={sectionRef}>
      <span className="section-number" aria-hidden="true">04</span>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-150px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className={styles.heading}>{headingText}</h2>
        <p className={styles.subheading}>
          Have a project in mind or want to work together?<br />
          Send me a message and I&apos;ll get back to you.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="from_name" className={styles.label}>Name</label>
            <input
              id="from_name"
              name="from_name"
              type="text"
              className={styles.input}
              placeholder="Your name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="from_email" className={styles.label}>Email</label>
            <input
              id="from_email"
              name="from_email"
              type="email"
              className={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>Message</label>
            <textarea
              id="message"
              name="message"
              className={styles.textarea}
              placeholder="Tell me about your project..."
              required
            />
          </div>

          {status === 'success' && (
            <p role="status" className={`${styles.feedback} ${styles.feedbackSuccess}`}>
              Message sent! I&apos;ll get back to you soon.
            </p>
          )}
          {status === 'error' && (
            <p role="alert" className={`${styles.feedback} ${styles.feedbackError}`}>
              Something went wrong. Please try again or email me directly.
            </p>
          )}

          <motion.button
            ref={submitMagnetic.ref}
            type="submit"
            className={styles.submitBtn}
            disabled={status === 'sending'}
            style={{ x: submitMagnetic.springX, y: submitMagnetic.springY }}
            onMouseMove={submitMagnetic.handleMouseMove}
            onMouseLeave={submitMagnetic.handleMouseLeave}
            data-cursor="button"
          >
            {status === 'sending' ? 'Sending...' : 'Send Message →'}
          </motion.button>
        </form>

        <hr className={styles.divider} />

        <div className={styles.emailRow}>
          <span className={styles.emailAddress}>{YOUR_EMAIL}</span>
          <button
            className={styles.copyBtn}
            onClick={handleCopyEmail}
            type="button"
            aria-label="Copy email address"
          >
            {copyLabel}
          </button>
        </div>

        <div className={styles.socialLinks}>
          <a
            href={YOUR_GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            data-cursor="link"
          >
            <SiGithub className={styles.socialIcon} aria-hidden="true" />
            GitHub
          </a>
          <a
            href={YOUR_LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            data-cursor="link"
          >
            <FaLinkedin className={styles.socialIcon} aria-hidden="true" />
            LinkedIn
          </a>
        </div>
      </motion.div>
    </section>
  )
}
