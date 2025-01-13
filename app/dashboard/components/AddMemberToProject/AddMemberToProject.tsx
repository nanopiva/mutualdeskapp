"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./AddMemberToProject.module.css";
import { getUserById, verifyUserRole } from "@/app/actions";

type Friend = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};
interface AddMemberProps {
  projectId: string;
}

export default function AddMemberToProject({ projectId }: AddMemberProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeComponent = async () => {
      console.log(projectId);
      await checkAdminStatus();
      await fetchFriends();
      setIsLoading(false);
    };

    initializeComponent();
  }, [projectId]);

  const checkAdminStatus = async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      console.log("Project desde AddMember:", projectId);
      const isUserAdmin = await verifyUserRole(user.id, projectId);
      setIsAdmin(isUserAdmin === "admin");
    }
  };

  const fetchFriends = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        const { data, error } = await supabase
          .from("friends_links")
          .select("second_user_id")
          .eq("first_user_id", user.id);

        if (error) throw error;

        const friendPromises = data.map(async (item) => {
          const friendData = await getUserById(item.second_user_id);
          return friendData as Friend;
        });

        const friendsData = await Promise.all(friendPromises);
        setFriends(
          friendsData.filter((friend): friend is Friend => friend !== null)
        );
      } catch (error) {
        console.error("Error fetching friends:", error);
        setError("Failed to fetch friends. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isAdmin) {
      setError("You don't have permission to add members to this project.");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to add members.");
      return;
    }

    try {
      // Invite friends
      for (const friendId of selectedFriends) {
        await supabase.from("invitations").insert({
          sender_id: user.id,
          receiver_id: friendId,
          project_id: projectId,
          role: role,
        });
      }

      // Invite by email
      for (const email of inviteEmails) {
        // Here you would typically send an email invitation
        // For now, we'll just log it
        console.log(
          `Invitation sent to ${email} for project ${projectId} with role ${role}`
        );
      }

      setSuccess(true);
      setSelectedFriends([]);
      setInviteEmails([]);
      setRole("viewer");
    } catch (error) {
      setError("Failed to send invitations. Please try again.");
    }
  };

  const handleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddEmail = () => {
    if (newEmail && !inviteEmails.includes(newEmail)) {
      setInviteEmails((prev) => [...prev, newEmail]);
      setNewEmail("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setInviteEmails((prev) => prev.filter((e) => e !== email));
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <p>You don't have permission to view this page.</p>;
  }

  return (
    <div className={styles.addMemberContainer}>
      <h2 className={styles.title}>Add Members to Project</h2>
      {error && <p className={styles.error}>{error}</p>}
      {success && (
        <p className={styles.success}>Invitations sent successfully!</p>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Invite Friends</label>
          <div className={styles.friendsList}>
            {friends.map((friend) => (
              <div key={friend.id} className={styles.friendItem}>
                <input
                  type="checkbox"
                  id={`friend-${friend.id}`}
                  checked={selectedFriends.includes(friend.id)}
                  onChange={() => handleFriendSelection(friend.id)}
                  className={styles.friendCheckbox}
                />
                <label
                  htmlFor={`friend-${friend.id}`}
                  className={styles.friendLabel}
                >
                  <span className={styles.friendName}>
                    {friend.first_name} {friend.last_name}
                  </span>
                  <span className={styles.friendEmail}>{friend.email}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Invite by Email</label>
          <div className={styles.emailInputGroup}>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter email address"
            />
            <button
              type="button"
              onClick={handleAddEmail}
              className={styles.addButton}
            >
              Add
            </button>
          </div>
          <div className={styles.emailList}>
            {inviteEmails.map((email, index) => (
              <div key={index} className={styles.emailItem}>
                <span className={styles.emailText}>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className={styles.removeButton}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={styles.select}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className={styles.submitButton}>
          Send Invitations
        </button>
      </form>
    </div>
  );
}
