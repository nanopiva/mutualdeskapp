"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "./page.module.css";

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
  contentSnippet: string;
};

export default function MyProjects() {
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getProjects = async () => {
    setLoading(true);
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        "No hemos podido corroborar su sesión. Intente logueándose nuevamente."
      );
      setLoading(false);
      return;
    }

    const { data: projectMembersData, error: projectMembersError } =
      await supabase
        .from("project_members")
        .select(`id, project_id, group_id, role`)
        .eq("user_id", user.id);

    if (projectMembersError) {
      setError("Error al obtener los miembros del proyecto");
      setLoading(false);
      return;
    }

    const projectIds = projectMembersData.map((pm) => pm.project_id);
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select(
        `id, name, description, created_at, updated_at, is_public, author_id,content`
      )
      .in("id", projectIds);

    if (projectsError) {
      setError("Error al obtener detalles de los proyectos");
      setLoading(false);
      return;
    }
    const extractTextFromContent = (content: any): string => {
      if (!content?.root?.children) return "Empty project";

      // Intenta obtener el texto del primer párrafo
      const firstParagraph = content.root.children.find(
        (child: any) => child.type === "paragraph"
      );

      if (!firstParagraph?.children) return "Empty project";

      const textNode = firstParagraph.children.find(
        (child: any) => child.type === "text" && child.text
      );

      return textNode?.text?.slice(0, 120) || "Empty project";
    };

    const formattedProjects: Project[] = projectMembersData.map((pm) => {
      const projectDetails = projectsData?.find((p) => p.id === pm.project_id);
      const contentSnippet = extractTextFromContent(projectDetails?.content);
      return {
        id: pm.id,
        projectId: pm.project_id,
        projectGroupId: pm.group_id,
        projectRole: pm.role,
        name: projectDetails?.name,
        description: projectDetails?.description,
        created_at: projectDetails?.created_at,
        updated_at: projectDetails?.updated_at,
        is_public: projectDetails?.is_public,
        author_id: projectDetails?.author_id,
        contentSnippet,
      };
    });

    setUserProjects(formattedProjects);
    setLoading(false);
  };

  useEffect(() => {
    getProjects();
  }, []);

  const groupProjects = userProjects.filter((pro) => pro.projectGroupId);
  const individualProjects = userProjects.filter(
    (pro) => pro.projectGroupId === null
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Proyectos</h1>
        <Link
          href="/dashboard/my-projects/new-project"
          className={styles.newProjectButton}
        >
          <Plus size={20} />
          Nuevo Proyecto
        </Link>
      </div>

      {loading ? (
        <div className={styles.loader}></div>
      ) : (
        <>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Proyectos de Grupo</h2>
            {groupProjects.length > 0 ? (
              <div className={styles.projectGrid}>
                {groupProjects.map((project) => (
                  <ProjectCard
                    key={`${project.projectId}-${project.projectGroupId}`}
                    id={project.projectId}
                    name={project.name}
                    role={project.projectRole}
                    isGroup={true}
                    isPublic={project.is_public}
                    contentSnippet={project.contentSnippet}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.noProjects}>
                No se encontraron proyectos de grupo
              </p>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Proyectos Individuales</h2>
            {individualProjects.length > 0 ? (
              <div className={styles.projectGrid}>
                {individualProjects.map((project) => (
                  <ProjectCard
                    key={`${project.projectId}-${project.id}`}
                    id={project.projectId}
                    name={project.name}
                    role={project.projectRole}
                    isGroup={false}
                    isPublic={project.is_public}
                    contentSnippet={project.contentSnippet}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.noProjects}>
                No se encontraron proyectos individuales
              </p>
            )}
          </div>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
