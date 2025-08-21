"use client";

import { useRouter } from "next/navigation";
import styles from "./EditorHeader.module.css";

interface EditorHeaderProps {
  onBack?: () => void;
  className?: string;
}

export default function EditorHeader({ onBack, className }: EditorHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className={`${styles.editorHeader} ${className || ""}`}>
      <button className={styles.backButton} onClick={handleBack}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="#248232"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.backText}>My Projects</span>
      </button>
    </header>
  );
}
