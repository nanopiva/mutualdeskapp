"use client";
import Link from "next/link";
import styles from "./ProjectCardPublic.module.css";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardPublicProps {
  id: string;
  name: string;
  description: string | null;
  authorName: string;
  updatedAt: string;
  contentSnippet: string;
}

export default function ProjectCardPublic({
  id,
  name,
  description,
  authorName,
  updatedAt,
  contentSnippet,
}: ProjectCardPublicProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{name}</h3>
        <span className={styles.publicBadge}>Public</span>
      </div>

      {description && (
        <p className={styles.projectDescription}>{description}</p>
      )}

      <p className={styles.projectSnippet}>
        {contentSnippet}
        {contentSnippet.length >= 120 && "..."}
      </p>

      <div className={styles.projectMeta}>
        <span className={styles.author}>By {authorName}</span>
        <span className={styles.updated}>
          Updated{" "}
          {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </span>
      </div>

      {hovered && (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <h4>{name}</h4>
            <span>Public Project</span>
          </div>
          <div className={styles.previewContent}>
            {contentSnippet}
            {contentSnippet.length >= 120 && "..."}
          </div>
          <div className={styles.previewFooter}>
            <span>By {authorName}</span>
          </div>
        </div>
      )}

      <Link href={`/dashboard/my-projects/${id}`} className={styles.viewButton}>
        View Project
      </Link>
    </div>
  );
}
