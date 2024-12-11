import styles from "./intro.module.css";

interface IntroProps {
  title: string;
  subtitle: string;
}

export default function IntroFrontPages({ title, subtitle }: IntroProps) {
  return (
    <div className={styles.introContainer}>
      <div className={styles.titleIntroContainer}>
        <h2 className={styles.titleIntro}>{title}</h2>
        <p className={styles.subtitleIntro}>{subtitle}</p>
      </div>
    </div>
  );
}
