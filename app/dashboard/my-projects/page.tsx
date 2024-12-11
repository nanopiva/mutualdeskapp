"use client";

import styles from "./page.module.css";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

type Project = {
  id: string;
  projectId: string;
  projectGroupId: string;
  projectRole: string;
};

export default function MyProjects() {
  const [userProjects, setUserProjects] = useState<Project[]>([]); // Especificar tipo de arreglo
  const [error, setError] = useState<string | null>(null); // Error puede ser string o null

  const getProjects = async () => {
    const supabase = await createClient();

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

    const { data: projectMembersData, error: projectMembersError } =
      await supabase
        .from("project_members")
        .select(`id,project_id,group_id,role`)
        .eq("user_id", user.id)
        .select("id,project_id,group_id,role");

    if (projectMembersError) {
      console.error(
        "Error al obtener los miembros del proyecto: ",
        projectMembersError
      );
      setError("Error al obtener los miembros del proyecto");
      return;
    }

    console.log(
      "Data de los proyectos encontrados del usuario: ",
      projectMembersData
    );

    const formattedProjectMembersData: Project[] = projectMembersData.map(
      (project) => ({
        id: project.id,
        projectId: project.project_id,
        projectGroupId: project.group_id,
        projectRole: project.role,
      })
    );

    setUserProjects(formattedProjectMembersData);
  };
  useEffect(() => {
    getProjects();
  }, []);

  return (
    <div className={styles.projectsContainer}>
      <ProjectCard address="/my-projects/new-project" />
      <div className={styles.groupProjectsContainer}>
        <h2>Proyectos de grupo:</h2>
        {userProjects.filter((pro) => pro.projectId).length > 0 ? (
          userProjects
            .filter((pro) => pro.projectGroupId)
            .map((project) => (
              <ProjectCard
                key={`${project.projectId}-${project.projectGroupId}`}
                address={`/my-projects/${project.id}`}
                name={project.projectId}
              />
            ))
        ) : (
          <p>No se encontraron proyectos de grupo</p>
        )}
      </div>
      <div className={styles.integrantProjectsContainer}>
        <h2>Proyectos en los cuales formo parte</h2>
        {userProjects.filter((pro) => pro.projectId).length > 0 ? (
          userProjects
            .filter(
              (pro) => pro.projectGroupId === null && pro.projectRole != "admin"
            )
            .map((project) => (
              <ProjectCard
                key={`${project.projectId}-${project.id}`}
                address={`/my-projects/${project.id}`}
                name={project.projectId}
              />
            ))
        ) : (
          <p>No se encontraron proyectos en los cuales seas integrante</p>
        )}
      </div>
    </div>
  );
}
