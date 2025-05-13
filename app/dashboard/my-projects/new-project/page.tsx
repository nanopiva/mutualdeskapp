"use client";

import { useState, useEffect } from "react";
import { createProject } from "@/app/actions";
import styles from "./page.module.css";
import { getUserGroups } from "@/app/actions";
import { useRouter } from "next/navigation";
import { getActualUserId, getUserById } from "@/app/actions";

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
  const [groupMembers, setGroupMembers] = useState<
    { user_id: string; role: string }[]
  >([]);
  const [detailedMembers, setDetailedMembers] = useState<
    { user_id: string; display: string }[]
  >([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(
    null
  );
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const groups = await getUserGroups();
        setMyGroups(groups);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError("Failed to load groups. Please try again.");
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!selectedGroup) {
        setGroupMembers([]);
        setDetailedMembers([]);
        setSelectedMembers([]);
        return;
      }

      try {
        setLoadingMembers(true);
        const res = await fetch(`/api/group-members?groupId=${selectedGroup}`);
        const data = await res.json();

        if (!currentUserId) return;

        const filtered = data.filter((m: any) => m.user_id !== currentUserId);
        setGroupMembers(filtered);
        setSelectedMembers(filtered.map((m: any) => m.user_id));

        const enriched = await Promise.all(
          filtered.map(async (member: any) => {
            try {
              const info = await getUserById(member.user_id);
              return {
                user_id: member.user_id,
                display: `${info.first_name} ${info.last_name} (${info.email})`,
              };
            } catch {
              return {
                user_id: member.user_id,
                display: member.user_id,
              };
            }
          })
        );

        setDetailedMembers(enriched);
      } catch (error) {
        console.error("Error fetching group members", error);
        setError("Failed to load group members. Please try again.");
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchGroupMembers();
  }, [selectedGroup, currentUserId]);

  useEffect(() => {
    const fetchMyId = async () => {
      try {
        const id = await getActualUserId();
        setCurrentUserId(id);
      } catch (error) {
        console.error("Error fetching current user id:", error);
      }
    };

    fetchMyId();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { success, projectId } = await createProject(
        projectName,
        projectDescription,
        isPublic,
        selectedGroup,
        selectedMembers
      );
      if (success && projectId) {
        router.push(`/dashboard/my-projects/${projectId}`);
      } else {
        setError("Error creating the project. Please try again.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error creating the project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Create New Project</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="projectName" className={styles.label}>
            Project Name
          </label>
          <input
            id="projectName"
            name="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={styles.input}
            placeholder="My Awesome Project"
            required
            minLength={3}
            maxLength={100}
          />
          <div className={styles.characterCount}>{projectName.length}/100</div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="projectDescription" className={styles.label}>
            Project Description{" "}
            <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className={styles.textarea}
            placeholder="Describe your project..."
            maxLength={500}
          />
          <div className={styles.characterCount}>
            {projectDescription.length}/500
          </div>
        </div>

        <div className={styles.formGroup}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Project Visibility</legend>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="projectType"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className={styles.radioInput}
                />
                <span className={styles.radioCustom}></span>
                <div className={styles.radioText}>
                  <span className={styles.radioTitle}>Public</span>
                  <span className={styles.radioDescription}>
                    Anyone can view this project
                  </span>
                </div>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="projectType"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className={styles.radioInput}
                />
                <span className={styles.radioCustom}></span>
                <div className={styles.radioText}>
                  <span className={styles.radioTitle}>Private</span>
                  <span className={styles.radioDescription}>
                    Only invited members can view
                  </span>
                </div>
              </label>
            </div>
          </fieldset>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="group" className={styles.label}>
            Associate with a Group{" "}
            <span className={styles.optional}>(optional)</span>
          </label>
          {loadingGroups ? (
            <div className={styles.loading}>Loading your groups...</div>
          ) : (
            <select
              id="group"
              name="group"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className={styles.select}
            >
              <option value="">Select a group...</option>
              {myGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedGroup && (
          <div className={styles.formGroup}>
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Invite Group Members</legend>
              {loadingMembers ? (
                <div className={styles.loading}>Loading group members...</div>
              ) : detailedMembers.length > 0 ? (
                <>
                  <div className={styles.memberSelectionHeader}>
                    <div className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={
                          selectedMembers.length === detailedMembers.length
                        }
                        onChange={(e) => {
                          setSelectedMembers(
                            e.target.checked
                              ? detailedMembers.map((m) => m.user_id)
                              : []
                          );
                        }}
                        className={styles.checkboxInput}
                      />
                      <span>Select All</span>
                    </div>
                  </div>
                  <div className={styles.memberList}>
                    {detailedMembers.map((member) => (
                      <label key={member.user_id} className={styles.memberItem}>
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.user_id)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...selectedMembers, member.user_id]
                              : selectedMembers.filter(
                                  (id) => id !== member.user_id
                                );
                            setSelectedMembers(updated);
                          }}
                          className={styles.checkboxInput}
                        />
                        <span className={styles.memberName}>
                          {member.display.split(" (")[0]}
                        </span>
                        <span className={styles.memberEmail}>
                          {member.display.match(/\((.*?)\)/)?.[1]}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.infoMessage}>
                  No other members in this group to invite.
                </div>
              )}
            </fieldset>
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className={styles.buttonLoader}></span>
          ) : (
            "Create Project"
          )}
        </button>
      </form>
    </div>
  );
}
