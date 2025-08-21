"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Plus, Settings, UserPlus } from "lucide-react";
import ProjectCardUser from "@/app/dashboard/components/ProjectCardUser/ProjectCardUser";
import MemberCard from "../../components/MemberCard/MemberCard";
import InvitationCard from "../../components/InvitationCard/InvitationCard";
import AddMemberModal from "../../components/AddMemberModal/AddMemberModal";
import styles from "./page.module.css";

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  creator_id: string;
}

interface Member {
  user_id: string;
  role: string;
  user?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

interface Invitation {
  id: number;
  sender_id: string;
  receiver_id: string;
  role: string;
  created_at: string;
  receiver?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

interface Project {
  id: string;
  name: string;
  is_public: boolean;
  updated_at: string;
  content?: any;
}

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const supabase = createClient();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("");

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError) throw groupError;

      const { data: userRole, error: roleError } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

      if (roleError) throw roleError;
      setCurrentUserRole(userRole?.role || "");

      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select("user_id, role, users(email, first_name, last_name)")
        .eq("group_id", groupId);

      if (membersError) throw membersError;

      const { data: invitationsData, error: invitationsError } = await supabase
        .from("invitations")
        .select(
          `
            id, 
            sender_id, 
            receiver_id, 
            role, 
            created_at,
            receiver:receiver_id (email, first_name, last_name)
          `
        )
        .eq("group_id", groupId)
        .eq("status", "pending");

      if (invitationsError) throw invitationsError;

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name, is_public, updated_at, content")
        .eq("group_id", groupId);

      if (projectsError) throw projectsError;

      setGroupData(group);

      const normalizedMembers =
        membersData?.map((m) => ({
          ...m,
          user: Array.isArray(m.users) ? m.users[0] : m.users,
        })) || [];

      setMembers(normalizedMembers);

      const normalizedInvitations =
        invitationsData?.map((inv) => ({
          ...inv,
          receiver: inv.receiver
            ? Array.isArray(inv.receiver)
              ? inv.receiver[0]
              : inv.receiver
            : undefined,
        })) || [];

      setInvitations(normalizedInvitations);
      setProjects(projectsData || []);
    } catch (err) {
      console.error("Error fetching group data:", err);
      setError("Failed to load group data");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (currentUserRole !== "admin") return;

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .eq("role", "member");

      if (error) throw error;
      fetchGroupData();
    } catch (err) {
      console.error("Error removing member:", err);
      setError("Failed to remove member");
    }
  };

  const handleCancelInvitation = async (invitationId: number) => {
    try {
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
      fetchGroupData();
    } catch (err) {
      console.error("Error canceling invitation:", err);
      setError("Failed to cancel invitation");
    }
  };

  useEffect(() => {
    if (groupId) fetchGroupData();
  }, [groupId]);

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <div className="loader"></div>
      </div>
    );

  if (error) return <div className={styles.error}>{error}</div>;
  if (!groupData) return <div className={styles.error}>Group not found</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.groupName}>{groupData.name}</h1>
          <p className={styles.groupDescription}>{groupData.description}</p>
          <p className={styles.groupMeta}>
            Created on {new Date(groupData.created_at).toLocaleDateString()} •{" "}
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        {currentUserRole === "admin" && (
          <div className={styles.actions}>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className={styles.addMemberButton}
            >
              <UserPlus size={16} />
              <span>Add Member</span>
            </button>
            <Link
              href={`/dashboard/groups/${groupId}/settings`}
              className={styles.settingsButton}
            >
              <Settings size={16} />
              <span>Settings</span>
            </Link>
          </div>
        )}
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Group Projects</h2>
          <Link
            href={{
              pathname: "/dashboard/my-projects/new-project",
              query: { groupId: groupId },
            }}
            className={styles.newProjectButton}
          >
            <Plus size={16} />
            <span>New Project</span>
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className={styles.projectsGrid}>
            {projects.map((project) => (
              <ProjectCardUser
                key={project.id}
                id={project.id}
                name={project.name}
                role="contributor"
                isGroup={true}
                isPublic={project.is_public}
                updatedAt={project.updated_at}
                content={project.content}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No projects in this group yet</p>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Members</h2>
        <div className={styles.membersGrid}>
          {members.map((member) => (
            <MemberCard
              key={member.user_id}
              userId={member.user_id}
              email={member.user?.email || ""}
              name={
                member.user?.first_name + " " + member.user?.last_name || ""
              }
              role={member.role}
              isCurrentUserAdmin={currentUserRole === "admin"}
              onRemove={handleRemoveMember}
            />
          ))}
        </div>
      </section>

      {currentUserRole === "admin" && invitations.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pending Invitations</h2>
          <div className={styles.invitationsGrid}>
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                id={invitation.id}
                email={invitation.receiver?.email || ""}
                name={
                  invitation.receiver?.first_name +
                    " " +
                    invitation.receiver?.last_name || ""
                }
                role={invitation.role}
                sentDate={invitation.created_at}
                onCancel={handleCancelInvitation}
              />
            ))}
          </div>
        </section>
      )}

      {showAddMemberModal && (
        <AddMemberModal
          groupId={groupId}
          currentMembers={members.map((m) => m.user_id)}
          onClose={() => setShowAddMemberModal(false)}
          onSuccess={fetchGroupData}
        />
      )}
    </div>
  );
}
