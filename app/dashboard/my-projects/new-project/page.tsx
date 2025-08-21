"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import styles from "./page.module.css";

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [groupOption, setGroupOption] = useState<"personal" | "group">(
    "personal"
  );
  const [selectedGroup, setSelectedGroup] = useState("");
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const urlGroupId = searchParams.get("groupId");

  useEffect(() => {
    if (urlGroupId) {
      setGroupOption("group");
      fetchGroups().then(() => {
        setSelectedGroup(urlGroupId);
      });
    }
  }, [urlGroupId]);

  const fetchGroups = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("group_members")
      .select("groups(id, name)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching groups:", error);
      return;
    }

    setAvailableGroups(data.map((item) => item.groups));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const projectData: any = {
        name: projectName,
        description: description || null,
        is_public: isPublic,
        author_id: user.id,
      };

      if (groupOption === "group" && selectedGroup) {
        projectData.group_id = selectedGroup;
      }

      const { data: createdProject, error: projectError } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (projectError || !createdProject) throw projectError;

      if (groupOption === "group" && selectedGroup) {
        const { data: groupMembers, error: groupError } = await supabase
          .from("group_members")
          .select("user_id")
          .eq("group_id", selectedGroup);

        if (groupError) throw groupError;

        const membersToInsert = groupMembers
          .filter((member) => member.user_id !== user.id)
          .map((member) => ({
            project_id: createdProject.id,
            user_id: member.user_id,
            group_id: selectedGroup,
            role: "member",
          }));

        membersToInsert.push({
          project_id: createdProject.id,
          user_id: user.id,
          group_id: selectedGroup,
          role: "owner",
        });

        const { error: insertMembersError } = await supabase
          .from("project_members")
          .insert(membersToInsert);

        if (insertMembersError) throw insertMembersError;
      }

      router.push(`/dashboard/my-projects/${createdProject.id}`);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Project</h1>
        <Link href="/dashboard/my-projects" className={styles.backLink}>
          Back to My Projects
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="projectName" className={styles.label}>
            Project Name*
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={styles.input}
            required
            maxLength={100}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            rows={3}
            maxLength={500}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Project Type</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="projectType"
                checked={groupOption === "personal"}
                onChange={() => setGroupOption("personal")}
                className={styles.radioInput}
                disabled={loading}
              />
              <span>Personal Project</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="projectType"
                checked={groupOption === "group"}
                onChange={() => {
                  setGroupOption("group");
                  fetchGroups();
                }}
                className={styles.radioInput}
                disabled={loading}
              />
              <span>Group Project</span>
            </label>
          </div>

          {groupOption === "group" && (
            <div className={styles.selectGroup}>
              <label htmlFor="groupSelect" className={styles.label}>
                Select Group*
              </label>
              <select
                id="groupSelect"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={styles.select}
                required
                disabled={loading}
              >
                <option value="">Select a group</option>
                {availableGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className={styles.checkboxInput}
              disabled={loading}
            />
            <span>Make this project public</span>
          </label>
          <p className={styles.hint}>
            Public projects can be viewed by anyone, but only collaborators can
            edit.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
            aria-label={
              loading ? "Creating project, please wait..." : "Create Project"
            }
          >
            {loading ? (
              <div className={styles.buttonLoader}>
                <div className="loader" aria-hidden="true"></div>
                <span>Creating Project...</span>
              </div>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
