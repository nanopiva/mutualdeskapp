import Link from "next/link";
import { FolderOpen } from "lucide-react";
import styles from "./ProjectCard.module.css";
import groupIcon from "../Sidebar/group-svgrepo-com.svg";
import individualIcon from "./user-svgrepo-com.svg";
import Image from "next/image";
import { group } from "console";
interface ProjectCardProps {
  id: string;
  name: string | undefined;
  role: string;
  isGroup: boolean;
}

export default function ProjectCard({
  id,
  name,
  role,
  isGroup,
}: ProjectCardProps) {
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className={`${styles.card} ${styles.cardClickable}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{name}</h3>
        <FolderOpen size={30} color="var(--gray)" />
      </div>
      <div className={styles.cardContent}>
        <div className={styles.badgeContainer}>
          <span
            className={`${styles.badge} ${isGroup ? styles.groupBadge : styles.individualBadge}`}
          >
            {isGroup ? (
              <Image
                src={groupIcon}
                alt="Group project logo"
                width={30}
                height={30}
              />
            ) : (
              <Image
                src={individualIcon}
                alt="Individual project logo"
                width={30}
                height={30}
              />
            )}{" "}
            {isGroup ? "Group project" : "Individual project"}
          </span>
          <span className={`${styles.badge} ${styles.roleBadge}`}>
            {capitalizedRole}
          </span>
        </div>
        <Link
          href={`/dashboard/my-projects/${id}`}
          className={styles.button}
          aria-label={`Ver proyecto: ${name}`}
        >
          Ver Proyecto
        </Link>
      </div>
    </div>
  );
}
