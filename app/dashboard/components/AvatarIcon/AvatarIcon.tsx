import React from "react";
import * as Avatar from "@radix-ui/react-avatar";
import styles from "./AvatarIcon.module.css";

interface AvatarIconProps {
  pictureURL: string;
  firstLetterBackup: string;
  secondLetterBackup: string;
  size?: number;
}

const AvatarIcon: React.FC<AvatarIconProps> = ({
  pictureURL,
  firstLetterBackup,
  secondLetterBackup,
  size = 180, // Default size
}) => (
  <Avatar.Root
    className={styles.Root}
    style={{ width: `${size}px`, height: `${size}px` }}
  >
    <Avatar.Image
      key={pictureURL} // 🔹 fuerza re-render cuando cambia la URL
      className={styles.Image}
      src={pictureURL}
      alt="Profile picture"
    />

    <Avatar.Fallback
      className={styles.Fallback}
      delayMs={600}
      style={{ fontSize: `${size / 3}px` }}
    >
      {firstLetterBackup}
      {secondLetterBackup}
    </Avatar.Fallback>
  </Avatar.Root>
);

export default AvatarIcon;
