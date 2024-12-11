import styles from "./griditemfeatures.module.css";
import Image, { StaticImageData } from "next/image";
interface GridItemFeaturesProps {
  image: StaticImageData;
  alt: string;
  title: string;
  description: string;
}

export default function GridItemFeatures({
  image,
  alt,
  title,
  description,
}: GridItemFeaturesProps) {
  return (
    <div className={styles.featuresNowGridItem}>
      <Image
        className={styles.featuresNowGridItemImage}
        src={image}
        alt={alt}
        width={200}
        height={200}
      />
      <span className={styles.featuresNowGridItemTitle}>{title}</span>
      <p className={styles.featuresNowGridItemDescription}>{description}</p>
    </div>
  );
}
