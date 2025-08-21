"use client";

import { ReactNode, useEffect, useMemo, useCallback, useState } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";
import fetchProjectUsers from "./liveblocksActions";
import { createClient } from "@/utils/supabase/client";

type User = { id: string; name: string; avatar: string };

type RoomInfo = {
  id: string;
  name?: string;
  metadata?: Record<string, any>;
};

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

    if (files?.length) {
      const profileFile = files.find(
        (f: any) => typeof f?.name === "string" && f.name.startsWith("profile.")
      );
      if (profileFile) {
        return supabase.storage
          .from("profilepictures")
          .getPublicUrl(`${userId}/${profileFile.name}`).data.publicUrl;
      }
    }

    return "";
  } catch (e) {
    console.error("Error getting profile picture URL:", e);
    return "";
  }
}

export function Room({ children }: { children: ReactNode }) {
  const params = useParams();
  const projectId = params.projectId as string;

  const [users, setUsers] = useState<User[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());
  const supabase = createClient();

  const fetchUsers = useMemo(
    () => async () => {
      try {
        const userList = await fetchProjectUsers(projectId);

        const usersWithAvatars: User[] = await Promise.all(
          userList.map(async (user: any) => {
            const avatarUrl = await getProfilePictureUrl(user.id, supabase);
            return {
              id: user.id,
              name: user.name,
              avatar: avatarUrl,
            };
          })
        );

        setUsers(usersWithAvatars);

        const next = new Map<string, User>();
        usersWithAvatars.forEach((u) => next.set(u.id, u));
        setUsersMap(next);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        throw new Error("Failed to fetch users.");
      }
    },
    [projectId, supabase]
  );

  const fetchSingleUser = useCallback(
    async (userId: string): Promise<User | undefined> => {
      try {
        if (usersMap.has(userId)) return usersMap.get(userId);

        const { data: userData, error } = await supabase
          .from("users")
          .select("id, first_name, last_name, email")
          .eq("id", userId)
          .single();

        if (error || !userData) {
          console.error("Error fetching single user:", error);
          return undefined;
        }

        const avatarUrl = await getProfilePictureUrl(userId, supabase);

        const user: User = {
          id: userData.id,
          name:
            userData.first_name || "" || userData.last_name || ""
              ? `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim()
              : userData.email || "Unknown User",
          avatar: avatarUrl,
        };

        setUsersMap((prev) => {
          const next = new Map(prev);
          next.set(userId, user);
          return next;
        });
        setUsers((prev) =>
          prev.find((u) => u.id === userId) ? prev : [...prev, user]
        );

        return user;
      } catch (e) {
        console.error("Error fetching single user:", e);
        return undefined;
      }
    },
    [supabase, usersMap]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <LiveblocksProvider
      throttle={16}
      authEndpoint={async () => {
        const endpoint = "/api/liveblocks-auth";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: projectId }),
        });
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(
            `Auth failed (${response.status}): ${text || "Unknown error"}`
          );
        }
        return await response.json();
      }}
      resolveUsers={async ({ userIds }) => {
        const resolved = await Promise.all(
          userIds.map(async (userId) => {
            let user =
              usersMap.get(userId) || users.find((u) => u.id === userId);
            if (!user) user = await fetchSingleUser(userId);
            if (!user) return undefined;
            return { name: user.name, avatar: user.avatar };
          })
        );
        return resolved;
      }}
      resolveMentionSuggestions={({ text }) => {
        const list = text
          ? users.filter((u) =>
              u.name.toLowerCase().includes(text.toLowerCase())
            )
          : users;
        return list.map((u) => u.id);
      }}
      resolveRoomsInfo={async ({ roomIds }): Promise<RoomInfo[]> => {
        if (!roomIds.length) return [];
        const { data, error } = await supabase
          .from("projects")
          .select("id, name")
          .in("id", roomIds);

        if (error) {
          console.error("Error fetching room info:", error);
          return [];
        }

        return (data || []).map((p) => ({
          id: p.id,
          name: p.name ?? undefined,
        }));
      }}
    >
      <RoomProvider
        id={projectId}
        initialStorage={{ leftMargin: 56, rightMargin: 56 }}
        initialPresence={{}}
      >
        <ClientSideSuspense
          fallback={
            <div
              style={{
                background: "var(--background)",
                color: "var(--gray)",
                borderBottom: "1px solid var(--input-border)",
              }}
              className="w-full text-sm px-4 py-2"
            >
              Loading… project
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
