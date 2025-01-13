"use client";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import ProjectCard from "./components/ProjectCard/ProjectCard";
import styles from "./page.module.css";
import Link from "next/link";
type Project = {
  id: string;
  projectId: string;
  projectGroupId: string | null;
  projectRole: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  author_id?: string;
  content?: any;
  contentSnippet: string;
};

export default function Dashboard() {
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;

  async function userOk() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      redirect("/login");
    }
  }

  async function getPublicProjects() {
    const supabase = await createClient();
    const { data: publicProjectsData, error: publicProjectsError } =
      await supabase.from("projects").select().eq("is_public", true);

    if (publicProjectsError) {
      console.error(publicProjectsError);
      return;
    }

    const processedProjects = publicProjectsData.map((project) => ({
      ...project,
      contentSnippet: extractTextFromContent(project.content),
    }));

    setPublicProjects(processedProjects);
  }

  const extractTextFromContent = (content: any): string => {
    if (!content?.root?.children) return "Empty project";

    const firstParagraph = content.root.children.find(
      (child: any) => child.type === "paragraph"
    );

    if (!firstParagraph?.children) return "Empty project";

    const textNode = firstParagraph.children.find(
      (child: any) => child.type === "text" && child.text
    );

    return textNode?.text?.slice(0, 120) || "Empty project";
  };

  useEffect(() => {
    userOk();
    getPublicProjects();
  }, []);

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = publicProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Public Projects</h1>
      {currentProjects.length > 0 ? (
        <div className={styles.publicProjectsCreatedContainer}>
          <div className={styles.projectGrid}>
            {currentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                role={project.projectRole}
                isGroup={!!project.projectGroupId}
                isPublic={project.is_public}
                contentSnippet={project.contentSnippet}
              />
            ))}
          </div>

          <div className={styles.pagination}>
            {Array.from(
              { length: Math.ceil(publicProjects.length / projectsPerPage) },
              (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activePage : ""}`}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>
        </div>
      ) : (
        <p>There is not a single public project created. Be the first!</p>
      )}
      <div className={styles.infoSection}>
        <h2 className={styles.infoTitle}>Explore More Features</h2>

        <div className={styles.infoCard}>
          <h3 className={styles.infoSubtitle}>Create a New Project</h3>
          <p className={styles.infoText}>
            Start a new project and bring your ideas to life. Share it publicly
            or keep it private.
          </p>
          <Link
            href="/dashboard/my-projects/new-project"
            className={styles.infoLink}
          >
            Get Started
          </Link>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoSubtitle}>Create a New Group</h3>
          <p className={styles.infoText}>
            Collaborate with others by creating a group. Manage projects
            together effortlessly.
          </p>
          <Link
            href="/dashboard/groups/create-group"
            className={styles.infoLink}
          >
            Create Group
          </Link>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoSubtitle}>Add Friends</h3>
          <p className={styles.infoText}>
            Connect with others by sending friend requests. Collaborate and
            share projects easily.
          </p>
          <Link href="/dashboard/friends" className={styles.infoLink}>
            Add Friends
          </Link>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoSubtitle}>Invitations and Requests</h3>
          <p className={styles.infoText}>
            Check if someone has invited you to a group, to a project or if they
            have sent you a friend request. Remember that when you invite
            someone for these purposes, they will also have to accept the
            invitation in this section.
          </p>
          <Link href="/dashboard/invitations" className={styles.infoLink}>
            Manage Invitations
          </Link>
        </div>
      </div>
    </div>
  );
}
