"use client";
import React, { useEffect, useState } from "react";
import styles from "./MemberInvitation.module.css";
import { getUserById } from "@/app/actions";

interface MemberInvitationProps {
  sender_id: string;
  receiver_id: string;
  role: string;
  created_at: string;
}

const MemberInvitation: React.FC<MemberInvitationProps> = ({
  sender_id,
  receiver_id,
  role,
  created_at,
}) => {
  const [senderName, setSenderName] = useState<string>("Loading...");
  const [receiverName, setReceiverName] = useState<string>("Loading...");
  const [senderEmail, setSenderEmail] = useState<string>("Loading...");
  const [receiverEmail, setReceiverEmail] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        // Obtén los datos del sender
        const sender = await getUserById(sender_id);
        setSenderName(`${sender.first_name} ${sender.last_name}`);
        setSenderEmail(`${sender.email}`);

        // Obtén los datos del receiver
        const receiver = await getUserById(receiver_id);
        setReceiverName(`${receiver.first_name} ${receiver.last_name}`);
        setReceiverEmail(`${receiver.email}`);
      } catch (err) {
        setError("Failed to fetch user information.");
      }
    };

    fetchUserNames();
  }, [sender_id, receiver_id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.invitationCard}>
      <div className={styles.invitationHeader}>
        <h3 className={styles.invitationTitle}>Pending Invitation</h3>
      </div>
      <div className={styles.invitationBody}>
        <p className={styles.invitationDetail}>
          <span className={styles.label}>From:</span>
          {senderName} ({senderEmail})
        </p>
        <p className={styles.invitationDetail}>
          <span className={styles.label}>To:</span>
          {receiverName} ({receiverEmail})
        </p>
        <p className={styles.invitationDetail}>
          <span className={styles.label}>Role:</span> {role}
        </p>
        <p className={styles.invitationDetail}>
          <span className={styles.label}>Sent:</span>{" "}
          {new Date(created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default MemberInvitation;
