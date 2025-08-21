import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Project } from "@/app/types";

export default async function fetchProject(
  projectId: string
): Promise<Project | null> {
  const supabase = await createClient();

  try {
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return null;
    }

    return project as Project;
  } catch (error) {
    console.error("Unexpected error fetching project:", error);
    return null;
  }
}
