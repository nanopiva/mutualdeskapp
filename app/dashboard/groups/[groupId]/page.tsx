import { createClient } from "@/utils/supabase/server";
import GroupIdDashboard from "../../components/GroupIdDashboard/GroupIdDashboard";
import styles from "./page.module.css";

type Params = Promise<{ groupId: string }>;

export default async function GroupPage(props: { params: Params }) {
  const params = await props.params;
  const groupId = params.groupId;
  const supabase = await createClient();

  try {
    const [groupData, groupMembersData, invitationsData, groupProjectsData] =
      await Promise.all([
        supabase
          .from("groups")
          .select("id, name, description, created_at, creator_id")
          .eq("id", groupId)
          .single(),
        supabase
          .from("group_members")
          .select("user_id, role")
          .eq("group_id", groupId),
        supabase
          .from("invitations")
          .select("sender_id, receiver_id, role, created_at")
          .eq("group_id", groupId)
          .is("project_id", null)
          .eq("status", "pending"),
        supabase
          .from("projects")
          .select("id, name, is_public, content")
          .eq("group_id", groupId),
      ]);

    if (groupData.error) throw new Error(groupData.error.message);
    if (groupMembersData.error) throw new Error(groupMembersData.error.message);
    if (invitationsData.error) throw new Error(invitationsData.error.message);
    if (groupProjectsData.error)
      throw new Error(groupProjectsData.error.message);

    return (
      <GroupIdDashboard
        groupData={groupData.data}
        groupMembersData={groupMembersData.data || []}
        invitationsData={invitationsData.data || []}
        groupProjectsData={groupProjectsData.data || []}
      />
    );
  } catch (error) {
    console.error("Error fetching group data:", error);
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>
          An error occurred while fetching group information. Please try again
          later.
        </p>
      </div>
    );
  }
}
