"use client";
import Link from "next/link";
import styles from "./GroupCard.module.css";
import { Users, Settings, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GroupCardProps {
  id: string;
  name: string;
  description: string | null;
  role: string;
  updatedAt: string;
  createdAt: string;
}

export default function GroupCard({
  id,
  name,
  description,
  role,
  updatedAt,
  createdAt,
}: GroupCardProps) {
  const getRoleBadge = () => {
    switch (role.toLowerCase()) {
      case "admin":
        return { text: "Admin", color: "var(--strong-green)" };
      case "member":
        return { text: "Member", color: "var(--light-green)" };
      default:
        return { text: role, color: "var(--gray)" };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.groupIcon}>
          <Users size={20} />
        </div>
        <div className={styles.groupInfo}>
          <h3 className={styles.groupName}>{name}</h3>
          <span
            className={styles.roleBadge}
            style={{ backgroundColor: roleBadge.color }}
          >
            {roleBadge.text}
          </span>
        </div>
      </div>

      {description && <p className={styles.groupDescription}>{description}</p>}

      <div className={styles.groupMeta}>
        <div className={styles.metaItem}>
          <Calendar size={14} />
          <span>
            Created{" "}
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <Link href={`/dashboard/groups/${id}`} className={styles.viewButton}>
          View Group
        </Link>
        {role.toLowerCase() === "admin" && (
          <Link
            href={`/dashboard/groups/${id}/settings`}
            className={styles.settingsButton}
          >
            <Settings size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
