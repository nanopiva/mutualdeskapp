"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ProjectCardUser from "../ProjectCardUser/ProjectCardUser";
import styles from "./RecentProjects.module.css";

interface Project {
  id: string;
  name: string;
  role: string;
  is_public: boolean;
  group_id: string | null;
  updated_at: string;
  content?: any;
}

export default function RecentProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProjects = async () => {
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
          .order("updated_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  return (
    <section className={styles.recentProjects}>
      <h2 className={styles.title}>Recently Updated Projects</h2>

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
          <p>You don't have any projects yet.</p>
          <a
            href="/dashboard/my-projects/new-project"
            className={styles.createLink}
          >
            Create your first project
          </a>
        </div>
      )}
    </section>
  );
}
