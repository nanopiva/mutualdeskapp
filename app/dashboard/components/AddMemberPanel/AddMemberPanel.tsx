"use client";

import styles from "./AddMemberPanel.module.css";
import { useState } from "react";
import { sendGroupInvitationForm } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";

export default function AddMemberPanel(props: { groupId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  const handleSubmit = async (formData: FormData) => {
    const supabase = await createClient();
    const { data: senderUser, error: senderError } =
      await supabase.auth.getUser();
    if (senderError || !senderUser) {
      throw new Error("Usuario no encontrado");
    }
    const senderId = senderUser.user.id;

    formData.append("senderId", senderId);
    formData.append("groupId", props.groupId);
    await sendGroupInvitationForm(formData);
  };

  return (
    <div className={styles.addMemberFormContainer}>
      <h2 className={styles.formTitle}>Invite a New Member</h2>
      <form className={styles.addMemberForm} action={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.addMemberLabel}>
            Email
          </label>
          <input
            type="email"
            className={styles.addMemberInput}
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="role" className={styles.addMemberLabel}>
            Role
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={styles.addMemberSelect}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="author">Author</option>
          </select>
        </div>

        <button className={styles.addMemberButton} type="submit">
          Send Invitation
        </button>
      </form>
    </div>
  );
}
