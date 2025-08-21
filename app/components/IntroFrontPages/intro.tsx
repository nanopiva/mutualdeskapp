import styles from "./intro.module.css";

interface IntroProps {
  title: string;
  subtitle: string;
}

export default function IntroFrontPages({ title, subtitle }: IntroProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroSubtitle}>{subtitle}</p>
        <div className={styles.underline}></div>
      </div>
    </div>
  );
}
