import styles from "./aboutitem.module.css";
import Image, { StaticImageData } from "next/image";
import type { JSX } from "react";
interface AboutItemProps {
  image: StaticImageData;
  alt: string;
  title: string;
  description: JSX.Element;
}

export default function OurGoal({
  image,
  alt,
  title,
  description,
}: AboutItemProps) {
  return (
    <div className={styles.AboutitemContainer}>
      <div className={styles.AboutitemTextImageContainer}>
        <div className={styles.AboutitemTextContainer}>
          <h2 className={styles.AboutitemTitle}>{title}</h2>
          <div className={styles.AboutitemParagraph}>{description}</div>
        </div>
        <div className={styles.AboutitemImageContainer}>
          <Image className={styles.AboutitemImage} src={image} alt={alt} />
        </div>
      </div>
    </div>
  );
}
