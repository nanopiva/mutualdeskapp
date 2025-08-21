"use client";

import { UserX, UserCheck, User } from "lucide-react";
import styles from "./FriendCard.module.css";

interface FriendCardProps {
  friend: {
    user_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
  };
  status: "friend" | "sent" | "received";
  onAccept?: () => void;
  onRemove: () => void;
}

export default function FriendCard({
  friend,
  status,
  onAccept,
  onRemove,
}: FriendCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          {friend.first_name?.[0] || friend.email[0].toUpperCase()}
        </div>
        <div>
          <h3 className={styles.name}>
            {friend.first_name} {friend.last_name}
          </h3>
          <p className={styles.email}>{friend.email}</p>
          {status === "friend" && (
            <p className={styles.friendsSince}>
              Friends since {new Date(friend.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {status === "received" && onAccept && (
          <button
            onClick={onAccept}
            className={styles.acceptButton}
            title="Accept friend request"
          >
            <UserCheck size={16} />
          </button>
        )}
        <button
          onClick={onRemove}
          className={styles.removeButton}
          title={status === "friend" ? "Remove friend" : "Cancel request"}
        >
          <UserX size={16} />
        </button>
      </div>
    </div>
  );
}
