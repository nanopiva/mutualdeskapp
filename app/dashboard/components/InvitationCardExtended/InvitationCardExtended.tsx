"use client";

import { User, X, Check, Users, FileText, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import styles from "./InvitationCardExtended.module.css";

interface InvitationCardExtendedProps {
  invitation: {
    id: number;
    sender: {
      email: string;
      first_name: string | null;
      last_name: string | null;
    };
    receiver: {
      email: string;
      first_name: string | null;
      last_name: string | null;
    };
    group?: {
      name: string;
    } | null;
    project?: {
      name: string;
    } | null;
    role?: string | null;
    created_at: string;
  };
  type: "received" | "sent";
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
}

export default function InvitationCardExtended({
  invitation,
  type,
  onAccept,
  onReject,
  onCancel,
}: InvitationCardExtendedProps) {
  const getInvitationType = () => {
    if (invitation.group) {
      return {
        icon: <Users size={18} />,
        text: "Group Invitation",
        name: invitation.group.name,
      };
    } else if (invitation.project) {
      return {
        icon: <FileText size={18} />,
        text: "Project Invitation",
        name: invitation.project.name,
      };
    } else {
      return {
        icon: <Mail size={18} />,
        text: "Friend Request",
        name: "",
      };
    }
  };

  const invitationType = getInvitationType();
  const counterpart =
    type === "received" ? invitation.sender : invitation.receiver;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.invitationType}>
          {invitationType.icon}
          <span>{invitationType.text}</span>
        </div>
        {invitationType.name && (
          <div className={styles.invitationName}>{invitationType.name}</div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.userInfo}>
          <div className={styles.userIcon}>
            <User size={20} />
          </div>
          <div>
            <p className={styles.userName}>
              {counterpart.first_name} {counterpart.last_name}
            </p>
            <p className={styles.userEmail}>{counterpart.email}</p>
          </div>
        </div>

        {invitation.role && (
          <div className={styles.roleInfo}>
            <span>Role:</span>
            <strong>{invitation.role}</strong>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.invitationDate}>
          {formatDistanceToNow(new Date(invitation.created_at), {
            addSuffix: true,
          })}
        </span>

        <div className={styles.actions}>
          {type === "received" ? (
            <>
              <button
                onClick={onAccept}
                className={styles.acceptButton}
                title="Accept invitation"
              >
                <Check size={16} />
              </button>
              <button
                onClick={onReject}
                className={styles.rejectButton}
                title="Reject invitation"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={onCancel}
              className={styles.cancelButton}
              title="Cancel invitation"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
