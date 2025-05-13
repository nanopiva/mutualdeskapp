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
  const [existingMembers, setExistingMembers] = useState<string[]>([]);
  const [existingInvitations, setExistingInvitations] = useState<string[]>([]);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const initializeComponent = async () => {
      await checkAdminStatus();
      await fetchExistingMembers();
      await fetchExistingInvitations();
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
      const isUserAdmin = await verifyUserRole(user.id, projectId);
      setIsAdmin(isUserAdmin === "admin");
    }
  };

  const fetchExistingMembers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_members")
      .select("user_id")
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching existing members:", error);
      setError("Failed to fetch existing project members.");
      return;
    }

    const memberIds = data.map((member) => member.user_id);
    setExistingMembers(memberIds);
  };

  const fetchExistingInvitations = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("invitations")
      .select("receiver_id")
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching existing invitations:", error);
      setError("Failed to fetch existing invitations.");
      return;
    }

    const invitationIds = data.map((invitation) => invitation.receiver_id);
    setExistingInvitations(invitationIds);
  };

  const fetchFriends = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        const { data: firstUserData, error: firstUserError } = await supabase
          .from("friends_links")
          .select("second_user_id")
          .eq("first_user_id", user.id);

        if (firstUserError) {
          console.error(
            "Error fetching friends_links (first_user_id):",
            firstUserError
          );
          throw firstUserError;
        }

        const { data: secondUserData, error: secondUserError } = await supabase
          .from("friends_links")
          .select("first_user_id")
          .eq("second_user_id", user.id);

        if (secondUserError) {
          console.error(
            "Error fetching friends_links (second_user_id):",
            secondUserError
          );
          throw secondUserError;
        }

        const allFriendIds = [
          ...(firstUserData?.map((item) => item.second_user_id) || []),
          ...(secondUserData?.map((item) => item.first_user_id) || []),
        ];

        const friendPromises = allFriendIds.map(async (friendId) => {
          const friendData = await getUserById(friendId);
          return friendData as Friend;
        });

        const friendsData = await Promise.all(friendPromises);
        const validFriends = friendsData.filter(
          (friend): friend is Friend => friend !== null
        );

        setFriends(validFriends);
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
    setInfo("");

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
      const emailToUserId: Record<string, string> = {};
      let duplicateCount = 0;
      const alreadyInvitedUsers: string[] = [];
      const successfullyInvited: string[] = [];

      // Map emails to user IDs
      for (const email of inviteEmails) {
        const { data: emailUser, error: emailError } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .eq("email", email)
          .single();

        if (emailError || !emailUser) {
          throw new Error(`No user found with email: ${email}`);
        }

        emailToUserId[email] = emailUser.id;
      }

      // Check all potential users for existing invitations
      const allUserIdsToCheck = [
        ...selectedFriends,
        ...Object.values(emailToUserId),
      ];

      const { data: existingInvites } = await supabase
        .from("invitations")
        .select("receiver_id")
        .in("receiver_id", allUserIdsToCheck)
        .eq("project_id", projectId);

      const existingInviteIds =
        existingInvites?.map((inv) => inv.receiver_id) || [];

      // Process selected friends
      for (const friendId of selectedFriends) {
        if (existingMembers.includes(friendId)) {
          continue;
        }

        if (existingInviteIds.includes(friendId)) {
          alreadyInvitedUsers.push(friendId);
          continue;
        }

        const { error: friendError } = await supabase
          .from("invitations")
          .insert({
            sender_id: user.id,
            receiver_id: friendId,
            project_id: projectId,
            role: role,
            status: "pending", // Still required by schema but ignored in logic
          });

        if (friendError) {
          throw new Error(
            `Error inviting user ${friendId}: ${friendError.message}`
          );
        }
        successfullyInvited.push(friendId);
      }

      // Process email invites
      for (const [email, userId] of Object.entries(emailToUserId)) {
        if (selectedFriends.includes(userId)) {
          duplicateCount++;
          continue;
        }
        if (existingMembers.includes(userId)) continue;
        if (existingInviteIds.includes(userId)) {
          alreadyInvitedUsers.push(userId);
          continue;
        }

        const { error: inviteError } = await supabase
          .from("invitations")
          .insert({
            sender_id: user.id,
            receiver_id: userId,
            project_id: projectId,
            role: role,
            status: "pending", // Still required by schema but ignored in logic
          });

        if (inviteError) {
          throw new Error(
            `Error inviting by email (${userId}): ${inviteError.message}`
          );
        }
        successfullyInvited.push(userId);
      }

      // Prepare info messages
      let infoMessages: string[] = [];

      if (successfullyInvited.length > 0) {
        infoMessages.push("Invitations sent successfully!");
      }

      if (alreadyInvitedUsers.length > 0) {
        // Get names of already invited users
        const { data: usersData } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .in("id", alreadyInvitedUsers);

        const userNames =
          usersData?.map((u) => `${u.first_name} ${u.last_name}`) || [];

        infoMessages.push(
          `These users already have pending invitations: ${userNames.join(", ")}`
        );
      }

      if (duplicateCount > 0) {
        infoMessages.push(
          `${duplicateCount} user(s) were in both friends list and email list - invited only once.`
        );
      }

      setInfo(infoMessages.join("\n"));
      setSuccess(successfullyInvited.length > 0);
      setSelectedFriends([]);
      setInviteEmails([]);
      setRole("viewer");

      // Refresh existing invitations after successful submission
      await fetchExistingInvitations();

      setTimeout(() => {
        setSuccess(false);
        setInfo("");
      }, 8000);
    } catch (error) {
      console.error("Error sending invitations:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send invitations. Please try again."
      );
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
      {error && <p className={styles.error}>Error: {error}</p>}
      {success && (
        <p className={styles.success}>Invitations sent successfully!</p>
      )}
      {info && <p className={styles.info}>{info}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Invite Friends</label>
          <div className={styles.friendsList}>
            {friends.map((friend) => {
              const isAlreadyMember = existingMembers.includes(friend.id);
              const isAlreadyInvited = existingInvitations.includes(friend.id);
              const isDisabled = isAlreadyMember || isAlreadyInvited;

              return (
                <div key={friend.id} className={styles.friendItem}>
                  <input
                    type="checkbox"
                    id={`friend-${friend.id}`}
                    checked={selectedFriends.includes(friend.id)}
                    onChange={() =>
                      !isDisabled && handleFriendSelection(friend.id)
                    }
                    className={styles.friendCheckbox}
                    disabled={isDisabled}
                  />
                  <label
                    htmlFor={`friend-${friend.id}`}
                    className={styles.friendLabel}
                  >
                    <span className={styles.friendName}>
                      {friend.first_name} {friend.last_name}
                    </span>
                    <span className={styles.friendEmail}>{friend.email}</span>
                    {isAlreadyMember && (
                      <span className={styles.alreadyMember}>
                        (Already a member)
                      </span>
                    )}
                    {isAlreadyInvited && !isAlreadyMember && (
                      <span className={styles.alreadyInvited}>
                        (Pending invitation)
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
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
