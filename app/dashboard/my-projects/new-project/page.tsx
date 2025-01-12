"use client";

import { useState, useEffect } from "react";
import { createProject } from "@/app/actions";
import styles from "./page.module.css";
import { getUserGroups } from "@/app/actions";

type GroupData = {
  id: string;
  name: string;
};

export default function ProjectForm() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [myGroups, setMyGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await getUserGroups();
      setMyGroups(groups);
    };

    fetchGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await createProject(
        projectName,
        projectDescription,
        isPublic,
        selectedGroup
      );
      // Reset form or show success message
      setProjectName("");
      setProjectDescription("");
      setIsPublic(true); // Restablecer a 'true'
      setSelectedGroup("");
      setError(null);
    } catch (error) {
      setError("Error creating the project. Please try again.");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Create new project</h2>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.formGroup}>
        <label htmlFor="projectName" className={styles.label}>
          Project Name:
        </label>
        <input
          id="projectName"
          name="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className={styles.input}
          placeholder="Enter the project name"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="projectDescription" className={styles.label}>
          Project Description (optional):
        </label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className={styles.textarea}
          placeholder="Enter a description"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Project Type:</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="projectType"
              checked={isPublic}
              onChange={() => setIsPublic(true)}
              className={styles.radioInput}
            />
            Public
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="projectType"
              checked={!isPublic}
              onChange={() => setIsPublic(false)}
              className={styles.radioInput}
            />
            Private
          </label>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="group" className={styles.label}>
          Select Group (optional):
        </label>
        <select
          id="group"
          name="group"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className={styles.select}
        >
          <option value="">None</option>
          {myGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className={styles.submitButton}>
        Create Project
      </button>
    </form>
  );
}
