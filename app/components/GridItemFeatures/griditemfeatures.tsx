import styles from "./griditemfeatures.module.css";
import { ReactNode } from "react";

interface GridItemFeaturesProps {
  icon: ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
}

export default function GridItemFeatures({
  icon,
  title,
  description,
  comingSoon = false,
}: GridItemFeaturesProps) {
  return (
    <div
      className={`${styles.gridItem} ${comingSoon ? styles.comingSoon : ""}`}
    >
      <div className={styles.iconContainer}>
        {icon}
        {comingSoon && (
          <span className={styles.comingSoonBadge}>Coming Soon</span>
        )}
      </div>
      <h3 className={styles.gridItemTitle}>{title}</h3>
      <p className={styles.gridItemDescription}>{description}</p>
    </div>
  );
}
