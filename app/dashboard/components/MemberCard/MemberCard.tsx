"use client";
import styles from "./MemberCard.module.css";
import { User, X } from "lucide-react";

interface MemberCardProps {
  userId: string;
  email: string;
  name: string;
  role: string;
  isCurrentUserAdmin: boolean;
  onRemove: (userId: string) => void;
}

export default function MemberCard({
  userId,
  email,
  name,
  role,
  isCurrentUserAdmin,
  onRemove,
}: MemberCardProps) {
  const getRoleBadge = () => {
    switch (role.toLowerCase()) {
      case "admin":
        return { text: "Admin", color: "var(--strong-green)" };
      default:
        return { text: "Member", color: "var(--light-green)" };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className={styles.card}>
      <div className={styles.userInfo}>
        <div className={styles.userIcon}>
          <User size={20} />
        </div>
        <div>
          <p className={styles.userName}>{name}</p>
          <p className={styles.userEmail}>{email}</p>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span
          className={styles.roleBadge}
          style={{ backgroundColor: roleBadge.color }}
        >
          {roleBadge.text}
        </span>

        {isCurrentUserAdmin && role.toLowerCase() === "member" && (
          <button
            onClick={() => onRemove(userId)}
            className={styles.removeButton}
            title="Remove member"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
