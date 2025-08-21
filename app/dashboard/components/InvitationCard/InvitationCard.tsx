"use client";
import { formatDistanceToNow } from "date-fns";
import styles from "./InvitationCard.module.css";
import { User, X } from "lucide-react";

interface InvitationCardProps {
  id: number;
  email: string;
  name: string;
  role: string;
  sentDate: string;
  onCancel: (invitationId: number) => void;
}

export default function InvitationCard({
  id,
  email,
  name,
  role,
  sentDate,
  onCancel,
}: InvitationCardProps) {
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
        <span className={styles.invitationStatus}>
          Invited {formatDistanceToNow(new Date(sentDate), { addSuffix: true })}
        </span>

        <button
          onClick={() => onCancel(id)}
          className={styles.cancelButton}
          title="Cancel invitation"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
