import styles from "./hero.module.css";

export default function Hero() {
  return (
    <section id="home" className={styles.hero}>
      <h1 className={styles.name}>James Keenan</h1>
      <h2 className={styles.role}>Software Engineer</h2>
      <p className={styles.intro}>Full-stack engineer building modern web applications with clean code and user-focused design.</p>
    </section>
  );
}
