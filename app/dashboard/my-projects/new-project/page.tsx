"use client";

import { useState, useEffect } from "react";
import { createProject } from "@/app/actions";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/client";

type GroupData = {
  groupId: string;
};

export default function ProjectForm() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [myGroups, setMyGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const getUserGroups = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        "No hemos podido corroborar su sesión. Intente logueándose nuevamente."
      );
      return;
    }

    const { data: groupsFound, error: groupsError } = await supabase
      .from("group_members")
      .select(`group_id`)
      .eq("user_id", user.id)
      .in("role", ["author", "admin"]);

    if (groupsError) {
      console.error("Error al obtener los grupos:", groupsError);
      setError("Error al obtener los grupos.");
      return;
    }

    const formattedGroups: GroupData[] = groupsFound.map((group) => ({
      groupId: group.group_id,
    }));

    setMyGroups(formattedGroups);
  };

  useEffect(() => {
    getUserGroups();
  }, []);

  return (
    <form className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="projectName" className={styles.label}>
          Nombre del proyecto:
        </label>
        <input
          id="projectName"
          name="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className={styles.input}
          placeholder="Escribe el nombre del proyecto"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Descripción del proyecto (opcional):
        </label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className={styles.textarea}
          placeholder="Escribe una descripción"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="isPublic" className={styles.label}>
          ¿Es público?
        </label>
        <input
          id="isPublic"
          name="isPublic"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className={styles.checkbox}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="group" className={styles.label}>
          Seleccionar grupo (opcional):
        </label>
        <select
          id="group"
          name="group"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)} // Actualiza el estado local
          className={styles.select}
        >
          <option value="none">Ninguno</option>
          {myGroups.map((group) => (
            <option key={group.groupId} value={group.groupId}>
              {group.groupId}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        formAction={createProject}
      >
        Crear proyecto
      </button>
    </form>
  );
}
