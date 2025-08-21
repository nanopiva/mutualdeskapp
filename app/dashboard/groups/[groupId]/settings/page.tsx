"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Settings, Trash2, UserPlus, UserMinus, Save, X } from "lucide-react";
import styles from "./page.module.css";

interface GroupData {
  id: string;
  name: string;
  description: string | null;
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

export default function GroupSettings() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError) throw groupError;

      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select("user_id, role, users(email, first_name, last_name)")
        .eq("group_id", groupId);

      if (membersError) throw membersError;

      const normalizedMembers =
        membersData?.map((m) => ({
          ...m,
          user: Array.isArray(m.users) ? m.users[0] : m.users,
        })) || [];

      setGroupData(group);
      setMembers(normalizedMembers);
      setFormData({
        name: group.name,
        description: group.description || "",
      });
    } catch (err) {
      console.error("Error fetching group data:", err);
      setError("Failed to load group data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchGroupData();
  }, [groupId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from("groups")
        .update({
          name: formData.name,
          description: formData.description,
        })
        .eq("id", groupId);

      if (error) throw error;

      setIsEditing(false);
      fetchGroupData();
    } catch (err) {
      console.error("Error updating group:", err);
      setError("Failed to update group");
    }
  };

  const handlePromoteMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .update({ role: "admin" })
        .eq("group_id", groupId)
        .eq("user_id", userId);

      if (error) throw error;

      fetchGroupData();
    } catch (err) {
      console.error("Error promoting member:", err);
      setError("Failed to promote member");
    }
  };

  const handleDemoteAdmin = async (userId: string) => {
    try {
      if (groupData?.creator_id !== currentUserId) return;

      const { error } = await supabase
        .from("group_members")
        .update({ role: "member" })
        .eq("group_id", groupId)
        .eq("user_id", userId);

      if (error) throw error;

      fetchGroupData();
    } catch (err) {
      console.error("Error demoting admin:", err);
      setError("Failed to demote admin");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      if (groupData?.creator_id !== currentUserId) return;

      const { error: deleteMembersError } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId);

      if (deleteMembersError) throw deleteMembersError;

      const { error: deleteGroupError } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (deleteGroupError) throw deleteGroupError;

      router.push("/dashboard/groups");
    } catch (err) {
      console.error("Error deleting group:", err);
      setError("Failed to delete group");
    }
  };

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <div className="loader"></div>
      </div>
    );

  if (error) return <div className={styles.error}>{error}</div>;
  if (!groupData || !currentUserId)
    return <div className={styles.error}>Group not found</div>;

  const isCurrentUserCreator = groupData.creator_id === currentUserId;
  const isCurrentUserAdmin = members.some(
    (m) => m.user_id === currentUserId && m.role === "admin"
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Settings size={24} />
        <h1>Group Settings</h1>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Group Information</h2>
          {(isCurrentUserCreator || isCurrentUserAdmin) &&
            (isEditing ? (
              <div className={styles.editActions}>
                <button
                  onClick={() => setIsEditing(false)}
                  className={styles.cancelButton}
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className={styles.saveButton}
                >
                  <Save size={16} /> Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
              >
                Edit
              </button>
            ))}
        </div>

        {isEditing ? (
          <div className={styles.editForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Group Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={255}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>
        ) : (
          <div className={styles.infoDisplay}>
            <h3>{groupData.name}</h3>
            <p>{groupData.description || "No description provided"}</p>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2>Manage Members</h2>
        <div className={styles.membersList}>
          {members.map((member) => (
            <div key={member.user_id} className={styles.memberItem}>
              <div className={styles.memberInfo}>
                <p className={styles.memberName}>
                  {member.user?.first_name} {member.user?.last_name}
                  {member.user_id === groupData.creator_id && (
                    <span className={styles.creatorBadge}> (Creator)</span>
                  )}
                  {member.role === "admin" &&
                    member.user_id !== groupData.creator_id && (
                      <span className={styles.adminBadge}> (Admin)</span>
                    )}
                </p>
                <p className={styles.memberEmail}>{member.user?.email}</p>
              </div>

              {(isCurrentUserAdmin || isCurrentUserCreator) && (
                <div className={styles.memberActions}>
                  {member.role === "member" && (
                    <button
                      onClick={() => handlePromoteMember(member.user_id)}
                      className={styles.promoteButton}
                      title="Promote to admin"
                    >
                      <UserPlus size={16} />
                    </button>
                  )}
                  {member.role === "admin" &&
                    member.user_id !== groupData.creator_id &&
                    isCurrentUserCreator && (
                      <button
                        onClick={() => handleDemoteAdmin(member.user_id)}
                        className={styles.demoteButton}
                        title="Demote to member"
                      >
                        <UserMinus size={16} />
                      </button>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {isCurrentUserCreator && (
        <section className={`${styles.section} ${styles.dangerZone}`}>
          <h2>Danger Zone</h2>
          <p>Permanently delete this group and all its data.</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={styles.deleteButton}
          >
            <Trash2 size={16} /> Delete Group
          </button>
        </section>
      )}

      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Group</h3>
            <p>
              Are you sure you want to delete this group? This action cannot be
              undone.
            </p>
            <p>
              All projects and data associated with this group will be
              permanently removed.
            </p>

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                className={styles.deleteConfirmButton}
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
