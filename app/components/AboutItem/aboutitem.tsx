import styles from "./aboutitem.module.css";
import type { JSX, ReactNode } from "react";

interface AboutItemProps {
  icon: ReactNode;
  title: string;
  description: JSX.Element;
}

export default function AboutItem({
  icon,
  title,
  description,
}: AboutItemProps) {
  return (
    <section className={styles.aboutItemContainer}>
      <div className={styles.aboutItemContent}>
        <div className={styles.aboutItemText}>
          <h2 className={styles.aboutItemTitle}>{title}</h2>
          <div className={styles.aboutItemDescription}>{description}</div>
        </div>
        <div className={styles.aboutItemIconWrapper}>{icon}</div>
      </div>
    </section>
  );
}
