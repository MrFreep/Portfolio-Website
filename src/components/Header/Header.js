import Image from "next/image";
import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <Image
        className={styles.profilePicture}
        src="/Profile.jpg"
        alt="James Keenan"
        width={280}
        height={280}
        loading="eager"
      />

      <nav className={styles.mainNav}>
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#work">Work</a>
        <a href="#contact">Contact</a>
      </nav>

      <div className={styles.ctaSection}>
        <a href="#contact" className={styles.ctaButton}>
          Let&apos;s Talk
        </a>
      </div>
    </header>
  );
}
