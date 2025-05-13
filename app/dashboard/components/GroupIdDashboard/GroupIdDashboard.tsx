"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./GroupIdDashboard.module.css";
import ProfileCard from "../ProfileCard/MemberCard";
import AddMemberPanel from "../AddMemberPanel/AddMemberPanel";
import MemberInvitation from "../MemberInvitation/MemberInvitation";
import ProjectCard from "../ProjectCard/ProjectCard";
import { leaveGroup } from "@/app/actions";
import { redirect } from "next/navigation";

interface GroupData {
  id: string;
  name: string;
  description: string;
  created_at: string;
  creator_id: string;
}

interface GroupMember {
  user_id: string;
  role: string;
}

interface Invitation {
  sender_id: string;
  receiver_id: string;
  role: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  is_public: boolean;
  content: any;
}

interface GroupIdDashboardProps {
  groupData: GroupData;
  groupMembersData: GroupMember[];
  invitationsData: Invitation[];
  groupProjectsData: Project[];
}

export default function GroupIdDashboard({
  groupData,
  groupMembersData,
  invitationsData,
  groupProjectsData,
}: GroupIdDashboardProps) {
  const [creator, setCreator] = useState<{
    first_name: string;
    last_name: string;
    email: string;
  } | null>(null);
  const [members, setMembers] = useState<
    {
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      created_at: Date;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    async function fetchUserDetails() {
      const supabase = createClient();
      try {
        // Fetch current user details
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("User not authenticated");
        }

        setCurrentUserId(user.id);

        // Fetch current user's role in the group
        const { data: currentUserRoleData, error: roleError } = await supabase
          .from("group_members")
          .select("role")
          .eq("group_id", groupData.id)
          .eq("user_id", user.id)
          .single();

        if (roleError) throw new Error(roleError.message);
        setCurrentUserRole(currentUserRoleData?.role || "");

        // Fetch creator details
        const { data: creatorData, error: creatorError } = await supabase
          .from("users")
          .select("first_name, last_name, email")
          .eq("id", groupData.creator_id)
          .single();

        if (creatorError) throw new Error(creatorError.message);
        setCreator(creatorData);

        // Fetch members details
        const membersPromises = groupMembersData.map(async (member) => {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("first_name, last_name, email, created_at")
            .eq("id", member.user_id)
            .single();

          if (userError) throw new Error(userError.message);

          return {
            user_id: member.user_id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            role: member.role,
            created_at: new Date(userData.created_at),
          };
        });

        const membersData = await Promise.all(membersPromises);
        setMembers(membersData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUserDetails();
  }, [groupData.creator_id, groupMembersData, groupData.id]);

  const handleRemoveMember = (userId: string) => {
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.user_id !== userId)
    );
  };

  const extractTextFromContent = (content: any): string => {
    if (!content?.root?.children) return "Empty project";
    const firstParagraph = content.root.children.find(
      (child: any) => child.type === "paragraph"
    );
    if (!firstParagraph?.children) return "Empty project";
    const textNode = firstParagraph.children.find(
      (child: any) => child.type === "text" && child.text
    );
    return textNode?.text?.slice(0, 120) || "Empty project";
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLeaveGroup = async () => {
    const success = await leaveGroup(groupData.id);

    if (success) {
      redirect("/groups");
    } else {
      setError("Failed to leave the group. Please try again.");
    }
  };

  if (loading) {
    return <div className={styles.loader}></div>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{groupData.name}</h1>
          <p className={styles.description}>{groupData.description}</p>
          <p className={styles.meta}>
            Created on: {new Date(groupData.created_at).toLocaleDateString()}
          </p>
          <p className={styles.meta}>
            Creator: {creator?.first_name} {creator?.last_name} (
            {creator?.email})
          </p>
        </div>
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className={styles.leaveGroupButton}
        >
          Leave Group
        </button>
      </div>

      {isLeaveModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Are you sure you want to leave this group?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button
                onClick={handleLeaveGroup}
                className={styles.confirmButton}
              >
                Yes, Leave Group
              </button>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Group Members</h2>
          {currentUserRole === "admin" && (
            <button onClick={openModal} className={styles.addMemberButton}>
              Add Member
            </button>
          )}
        </div>
        {members.length > 0 ? (
          <div className={styles.memberList}>
            {members.map((member) => (
              <ProfileCard
                key={member.user_id}
                firstName={member.first_name}
                lastName={member.last_name}
                email={member.email}
                role={member.role}
                profilePicture={`https://kckpcncvhqcxfvzinkto.supabase.co/storage/v1/object/public/profilepictures/${member?.user_id}/profile.jpg`}
                created_at={member.created_at}
                userId={member.user_id}
                groupId={groupData.id}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
                onRemoveMember={handleRemoveMember}
              />
            ))}
          </div>
        ) : (
          <p className={styles.noData}>No members found.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Projects</h2>
        {groupProjectsData.length > 0 ? (
          <div className={styles.projectGrid}>
            {groupProjectsData.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                role=""
                isPublic={project.is_public}
                contentSnippet={extractTextFromContent(project.content)}
                isGroup={true}
              />
            ))}
          </div>
        ) : (
          <p className={styles.noData}>No projects found.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Pending Invitations</h2>
        {invitationsData.length > 0 ? (
          <div className={styles.invitationList}>
            {invitationsData.map((invitation, index) => (
              <MemberInvitation
                key={index}
                sender_id={invitation.sender_id}
                receiver_id={invitation.receiver_id}
                role={invitation.role}
                created_at={invitation.created_at}
              />
            ))}
          </div>
        ) : (
          <p className={styles.noData}>No pending invitations.</p>
        )}
      </div>
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button onClick={closeModal} className={styles.closeButton}>
              &times;
            </button>
            <AddMemberPanel groupId={groupData.id} />
          </div>
        </div>
      )}
    </div>
  );
}
