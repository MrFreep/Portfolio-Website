// src/components/Footer/Footer.js
import { SiGithub, SiLinkedin } from 'react-icons/si'
import styles from './footer.module.css'

const YOUR_GITHUB = 'https://github.com/jkeenan3403'
const YOUR_LINKEDIN = 'https://linkedin.com/in/james-keenan'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.name}>James Keenan</span>
      <span className={styles.copy}>© {new Date().getFullYear()} James Keenan</span>
      <div className={styles.socials}>
        <a
          href={YOUR_GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub profile"
          data-cursor="link"
        >
          <SiGithub className={styles.socialIcon} aria-hidden="true" />
        </a>
        <a
          href={YOUR_LINKEDIN}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn profile"
          data-cursor="link"
        >
          <SiLinkedin className={styles.socialIcon} aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}
