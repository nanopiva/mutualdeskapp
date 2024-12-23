import Image, { ImageProps } from "next/image";
import styles from "./griditemfeatures.module.css";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface GridItemFeaturesProps {
  image: StaticImport;
  alt: string;
  title: string;
  description: string;
  imageSize?: number;
}

export default function GridItemFeatures({
  image,
  alt,
  title,
  description,
  imageSize = 150,
}: GridItemFeaturesProps) {
  return (
    <div className={styles.featuresNowGridItem}>
      <Image
        className={styles.featuresNowGridItemImage}
        src={image}
        alt={alt}
        width={imageSize}
        height={imageSize}
      />
      <span className={styles.featuresNowGridItemTitle}>{title}</span>
      <p className={styles.featuresNowGridItemDescription}>{description}</p>
    </div>
  );
}
