"use client";

import styles from "./MemberCard.module.css";
import AvatarIcon from "../AvatarIcon/AvatarIcon";
import { useState } from "react";
import { removeMember } from "@/app/actions";

interface MemberCardProps {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePicture: string;
  created_at: Date;
  userId: string;
  groupId: string;
  currentUserRole: string;
  currentUserId: string;
  onRemoveMember: (userId: string) => void;
}

export default function MemberCard({
  firstName,
  lastName,
  email,
  role,
  profilePicture,
  created_at,
  userId,
  groupId,
  currentUserRole,
  currentUserId,
  onRemoveMember,
}: MemberCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const formattedDate = new Date(created_at).toLocaleDateString();

  const handleRemoveMember = async () => {
    const { success, error } = await removeMember(groupId, userId);

    if (success) {
      setMessage({ type: "success", text: "Member removed successfully." });
      onRemoveMember(userId); // Notify the parent component to update the UI
    } else {
      setMessage({
        type: "error",
        text: error || "Failed to remove the member.",
      });
    }

    setShowMenu(false); // Close the menu after the action
  };

  return (
    <div className={styles.card}>
      {/* Dropdown menu for admins */}
      {currentUserRole === "admin" && userId !== currentUserId && (
        <div className={styles.menuContainer}>
          <button
            className={styles.menuButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋮
          </button>
          {showMenu && (
            <div className={styles.menu}>
              <button
                onClick={handleRemoveMember}
                disabled={role === "admin"} // Disable if the member is an admin
              >
                Remove Member
              </button>
            </div>
          )}
        </div>
      )}
      <AvatarIcon
        pictureURL={profilePicture}
        firstLetterBackup={firstName.charAt(0)}
        secondLetterBackup={lastName.charAt(0)}
        size={70}
      />
      <div className={styles.details}>
        <div className={styles.mainDetails}>
          <h3 className={styles.name}>
            {firstName} {lastName}
          </h3>
          <p className={styles.email}>{email}</p>
          <p className={styles.role}>Role: {role}</p>
        </div>
        <div className={styles.memberSinceContainer}>
          <p className={styles.memberSince}>
            Member since: <span className={styles.date}>{formattedDate}</span>
          </p>
        </div>
      </div>
      {/* Feedback message */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
