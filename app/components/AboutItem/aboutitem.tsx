import styles from "./aboutitem.module.css";
import Image, { StaticImageData } from "next/image";
import type { JSX } from "react";

interface AboutItemProps {
  image: StaticImageData;
  alt: string;
  title: string;
  description: JSX.Element;
}

export default function AboutItem({
  image,
  alt,
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
        <div className={styles.aboutItemImageWrapper}>
          <Image className={styles.aboutItemImage} src={image} alt={alt} />
        </div>
      </div>
    </section>
  );
}
