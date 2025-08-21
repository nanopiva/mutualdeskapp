"use server";

import { createClient } from "@/utils/supabase/server";
import fetchProject from "@/app/actions/project/fetchProject";

interface ProjectUser {
  id: string;
  name: string;
  avatar: string;
}

type StorageFile = { name: string };

async function getProfilePictureUrl(
  userId: string,
  supabase: any
): Promise<string> {
  try {
    const { data: files, error } = await supabase.storage
      .from("profilepictures")
      .list(userId);

    if (error) {
      console.error("Error listing profile pictures:", error);
      return "";
    }

    const profileFile = (files as StorageFile[] | null)?.find(
      (f) => typeof f?.name === "string" && f.name.startsWith("profile.")
    );

    if (profileFile?.name) {
      return supabase.storage
        .from("profilepictures")
        .getPublicUrl(`${userId}/${profileFile.name}`).data.publicUrl;
    }

    return "";
  } catch (error) {
    console.error("Error getting profile picture URL:", error);
    return "";
  }
}

export default async function getProjectUsers(
  projectId: string
): Promise<ProjectUser[]> {
  const supabase = await createClient();

  try {
    const { data: membersData, error: membersError } = await supabase
      .from("project_members")
      .select("user_id")
      .eq("project_id", projectId);

    if (membersError) throw membersError;

    const project = await fetchProject(projectId);
    const authorId: string | null = project?.author_id ?? null;

    const memberIds = (membersData ?? []).map((m) => m.user_id);
    const uniqueUserIds = new Set<string>(memberIds);
    if (authorId) uniqueUserIds.add(authorId);

    if (uniqueUserIds.size === 0) return [];

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", Array.from(uniqueUserIds));

    if (usersError) throw usersError;
    if (!usersData) return [];

    const projectUsers: ProjectUser[] = await Promise.all(
      usersData.map(async (user) => {
        const firstName = user.first_name || "";
        const lastName = user.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();
        const avatarUrl = await getProfilePictureUrl(user.id, supabase);

        return {
          id: user.id,
          name: fullName || user.email || "Unknown User",
          avatar: avatarUrl,
        };
      })
    );

    return projectUsers;
  } catch (error) {
    console.error("Error fetching project users:", error);
    return [];
  }
}
