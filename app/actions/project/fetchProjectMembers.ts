import { createClient } from "@/utils/supabase/server";
async function fetchProjectMembers(projectId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("project_members")
      .select("user_id")
      .eq("project_id", projectId);

    if (error) {
      throw error;
    }

    return data.map((member) => member.user_id);
  } catch (error) {
    console.error("Error fetching project members:", error);
    throw error;
  }
}

export default fetchProjectMembers;
