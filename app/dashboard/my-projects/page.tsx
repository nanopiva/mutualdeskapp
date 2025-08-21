"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProjectCardUser from "../components/ProjectCardUser/ProjectCardUser";
import styles from "./page.module.css";

interface Project {
  id: string;
  name: string;
  role: string;
  group_id: string | null;
  is_public: boolean;
  updated_at: string;
  content?: any;
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc("get_user_projects_with_roles", {
            uid: user.id,
          })
          .order("updated_at", { ascending: false });

        if (error) throw error;

        let filteredData = data || [];
        if (activeFilter === "personal") {
          filteredData = filteredData.filter((p: Project) => !p.group_id);
        } else if (activeFilter === "group") {
          filteredData = filteredData.filter((p: Project) => p.group_id);
        } else if (activeFilter === "public") {
          filteredData = filteredData.filter((p: Project) => p.is_public);
        } else if (activeFilter === "private") {
          filteredData = filteredData.filter((p: Project) => !p.is_public);
        }

        setProjects(filteredData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [activeFilter]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Projects</h1>
        <div className={styles.actions}>
          <Link
            href="/dashboard/my-projects/new-project"
            className={styles.newProjectButton}
          >
            <Plus size={18} />
            <span>New Project</span>
          </Link>
        </div>
      </header>

      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${activeFilter === "all" ? styles.active : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          All Projects
        </button>
        <button
          className={`${styles.filterTab} ${activeFilter === "personal" ? styles.active : ""}`}
          onClick={() => setActiveFilter("personal")}
        >
          Personal
        </button>
        <button
          className={`${styles.filterTab} ${activeFilter === "group" ? styles.active : ""}`}
          onClick={() => setActiveFilter("group")}
        >
          Group
        </button>
        <button
          className={`${styles.filterTab} ${activeFilter === "public" ? styles.active : ""}`}
          onClick={() => setActiveFilter("public")}
        >
          Public
        </button>
        <button
          className={`${styles.filterTab} ${activeFilter === "private" ? styles.active : ""}`}
          onClick={() => setActiveFilter("private")}
        >
          Private
        </button>
      </div>

      {loading ? (
        <div className={styles.loaderContainer}>
          <div className="loader"></div>
        </div>
      ) : projects.length > 0 ? (
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <ProjectCardUser
              key={project.id}
              id={project.id}
              name={project.name}
              role={project.role}
              isGroup={!!project.group_id}
              isPublic={project.is_public}
              updatedAt={project.updated_at}
              content={project.content}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>
            {activeFilter !== "all"
              ? `No ${activeFilter} projects found.`
              : "You don't have any projects yet."}
          </p>
          <Link
            href="/dashboard/my-projects/new-project"
            className={styles.createLink}
          >
            Create your first project
          </Link>
        </div>
      )}
    </div>
  );
}
