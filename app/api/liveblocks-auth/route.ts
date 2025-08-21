import { Liveblocks } from "@liveblocks/node";
import { createClient } from "@/utils/supabase/server";
import { fetchUser } from "@/app/actions/project/fetchUser";
import fetchProject from "@/app/actions/project/fetchProject";
import fetchProjectMembers from "@/app/actions/project/fetchProjectMembers";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

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
  } catch (err) {
    console.error("Error getting profile picture URL:", err);
    return "";
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const authedUser = data.user;

  if (!authedUser) {
    return new Response("User not authenticated", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  let room: unknown;
  try {
    const body = await req.json();
    room = body?.room;
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (typeof room !== "string" || room.trim() === "") {
    return new Response("Missing or invalid 'room' id", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const projectId = room;
    const project = await fetchProject(projectId);

    if (!project) {
      return new Response("Project not found", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const isOwner = authedUser.id === project.author_id;

    const projectMembers = await fetchProjectMembers(projectId);
    let isMember = false;

    if (Array.isArray(projectMembers)) {
      const first = projectMembers[0];

      if (typeof first === "string") {
        isMember = projectMembers.includes(authedUser.id);
      } else if (first && typeof first === "object") {
        const ids = projectMembers.map((p: any) => p.user_id ?? p.id ?? p);
        isMember = ids.includes(authedUser.id);
      }
    }

    const name =
      (await fetchUser(authedUser.id)) || authedUser.email || "Unknown User";

    let avatarUrl = await getProfilePictureUrl(authedUser.id, supabase);
    if (!avatarUrl) {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    }

    const userInfo = { name, avatar: avatarUrl };

    if (!isOwner && !isMember && project.is_public) {
      const session = liveblocks.prepareSession(authedUser.id, { userInfo });
      session.allow(projectId, session.READ_ACCESS);
      const { body, status } = await session.authorize();
      return new Response(body, { status });
    }

    if (!isOwner && !isMember) {
      return new Response("Unauthorized", {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const session = liveblocks.prepareSession(authedUser.id, { userInfo });
    session.allow(projectId, session.FULL_ACCESS);
    const { body, status } = await session.authorize();
    return new Response(body, { status });
  } catch (err) {
    console.error("Error in liveblocks auth route:", err);
    return new Response("Bad Request", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
