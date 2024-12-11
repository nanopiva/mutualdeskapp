"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { createGroup } from "@/app/actions";

const CreateGroupForm = () => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState<"public" | "private">("public");

  {
    /*
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const groupData = {
      name: groupName,
      description,
      type: groupType,
    };

    console.log("Datos del grupo:", groupData);

    // Aquí podrías enviar los datos a la API
  };
  */
  }

  return (
    <form className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="groupName" className={styles.label}>
          Nombre del grupo:
        </label>
        <input
          id="groupName"
          name="groupName"
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className={styles.input}
          placeholder="Escribe el nombre del grupo"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Descripción (opcional):
        </label>
        <textarea
          id="description"
          name="groupDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          placeholder="Escribe una descripción"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Tipo de grupo:</label>
        <div className={styles.radioGroup}></div>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        formAction={createGroup}
      >
        Crear grupo
      </button>
    </form>
  );
};

export default CreateGroupForm;
