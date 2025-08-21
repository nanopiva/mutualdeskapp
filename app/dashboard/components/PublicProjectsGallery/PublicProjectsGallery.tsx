"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ProjectCardPublic from "../ProjectCardPublic/ProjectCardPublic";
import styles from "./PublicProjectsGallery.module.css";

interface Author {
  first_name: string | null;
  last_name: string | null;
}

interface SupabaseProject {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
  created_at: string;
  author_id: string;
  content: any;
  author: Author | null;
}

interface PublicProject {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
  author_id: string;
  author_name: string;
  contentSnippet: string;
}

export default function PublicProjectsGallery() {
  const [publicProjects, setPublicProjects] = useState<PublicProject[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const projectsPerPage = 8;

  useEffect(() => {
    const fetchPublicProjects = async () => {
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from("projects")
          .select(
            `
            id,
            name,
            description,
            is_public,
            updated_at,
            created_at,
            author_id,
            content,
            author:author_id(first_name, last_name)
          `
          )
          .eq("is_public", true)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        const processedProjects: PublicProject[] = (
          data as unknown as SupabaseProject[]
        ).map((project) => {
          const authorName = project.author
            ? [project.author.first_name, project.author.last_name]
                .filter(Boolean)
                .join(" ")
                .trim() || "Anonymous"
            : "Anonymous";

          return {
            id: project.id,
            name: project.name,
            description: project.description,
            is_public: project.is_public,
            updated_at: project.updated_at,
            author_id: project.author_id,
            author_name: authorName,
            contentSnippet: extractTextFromContent(project.content),
          };
        });

        setPublicProjects(processedProjects);
      } catch (error) {
        console.error("Error fetching public projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProjects();
  }, []);

  const extractTextFromContent = (content: any): string => {
    if (!content?.root?.children) return "Empty project";

    let text = "";
    content.root.children.forEach((child: any) => {
      if (child.children) {
        child.children.forEach((grandchild: any) => {
          if (grandchild.text) text += grandchild.text + " ";
        });
      }
    });

    return text.trim().slice(0, 120) || "Empty project";
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = publicProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <section className={styles.publicProjectsGallery}>
      <h2 className={styles.title}>Explore Public Projects</h2>

      {loading ? (
        <div className={styles.loaderContainer}>
          <div className="loader"></div>
        </div>
      ) : publicProjects.length > 0 ? (
        <>
          <div className={styles.projectsGrid}>
            {currentProjects.map((project) => (
              <ProjectCardPublic
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                authorName={project.author_name}
                updatedAt={project.updated_at}
                contentSnippet={project.contentSnippet}
              />
            ))}
          </div>

          {Math.ceil(publicProjects.length / projectsPerPage) > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.navButton}
              >
                Previous
              </button>

              {Array.from(
                { length: Math.ceil(publicProjects.length / projectsPerPage) },
                (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`${styles.pageButton} ${
                      currentPage === i + 1 ? styles.activePage : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(publicProjects.length / projectsPerPage)
                }
                className={styles.navButton}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <p>No public projects available yet.</p>
          <p>Be the first to create one!</p>
        </div>
      )}
    </section>
  );
}
