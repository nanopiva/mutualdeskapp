"use client";

import styles from "./AddMemberPanel.module.css";
import { useState } from "react";
import { sendGroupInvitation } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";

export default function AddMemberPanel(props: { groupId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  const handleSubmit = async (formData: FormData) => {
    // Agregar el groupId y el senederId al FormData antes de enviarlo
    const supabase = await createClient();
    const { data: senderUser, error: senderError } =
      await supabase.auth.getUser();
    if (senderError || !senderUser) {
      throw new Error("Usuario no encontrado");
    }
    const senderId = senderUser.user.id;

    formData.append("senderId", senderId);
    formData.append("groupId", props.groupId);
    await sendGroupInvitation(formData); // Llamada a la acción
  };

  return (
    <div className={styles.addMemberFormContainer}>
      <form className={styles.addMemberForm} action={handleSubmit}>
        <label htmlFor="email" className={styles.addMemberLabel}>
          Email
        </label>
        <input
          type="email"
          className={styles.addMemberEmailInput}
          id="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
        ></input>

        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700"
        >
          Role
        </label>
        <select
          id="role"
          name="role"
          onChange={(e) => setRole(e.target.value)}
          className={styles.addMemberSelect}
        >
          <option className={styles.addMemberOption} value="viewer">
            Viewer
          </option>
          <option className={styles.addMemberOption} value="editor">
            Editor
          </option>
          <option className={styles.addMemberOption} value="author">
            Author
          </option>
        </select>

        <button className={styles.addMemberButton} type="submit">
          Send invitation
        </button>
      </form>
    </div>
  );
}
