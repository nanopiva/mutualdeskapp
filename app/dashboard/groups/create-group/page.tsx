"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./page.module.css";
import { createGroup, getUserById } from "@/app/actions";

type Friend = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  // Eliminar esta línea
  //const [groupType, setGroupType] = useState("public");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    setError(null);
  }, [selectedFriends]);

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

    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    const formData = new FormData();
    formData.append("groupName", groupName);
    formData.append("description", description);
    // Eliminar esta línea
    //formData.append("groupType", groupType);
    formData.append("selectedFriends", JSON.stringify(selectedFriends));
    formData.append("inviteEmails", JSON.stringify(inviteEmails));

    try {
      await createGroup(formData);
      setSuccess(true);
      setGroupName("");
      setDescription("");
      //setGroupType("public");
      setSelectedFriends([]);
      setInviteEmails([]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  const handleFriendSelection = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (friend && inviteEmails.includes(friend.email)) {
      setError(`${friend.email} has already been added manually.`);
      return;
    }
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddEmail = () => {
    if (newEmail && !inviteEmails.includes(newEmail)) {
      const isSelectedFriendEmail = friends.some(
        (friend) =>
          friend.email === newEmail && selectedFriends.includes(friend.id)
      );

      if (isSelectedFriendEmail) {
        setError("This email belongs to a friend you've already selected.");
        return;
      }

      const friendWithEmail = friends.find(
        (friend) => friend.email === newEmail
      );
      if (friendWithEmail) {
        setError(
          `${newEmail} belongs to your friend ${friendWithEmail.first_name} ${friendWithEmail.last_name}. Please select them from the friends list instead.`
        );
        return;
      }

      setInviteEmails((prev) => [...prev, newEmail]);
      setNewEmail("");
      setError(null);
    }
  };

  const handleRemoveEmail = (email: string) => {
    setInviteEmails((prev) => prev.filter((e) => e !== email));
    setError(null);
  };

  return (
    <div className={styles.createGroupContainer}>
      <h2 className={styles.title}>Create a New Group</h2>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>Group created successfully!</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="groupName" className={styles.label}>
            Group Name *
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
          />
        </div>

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
                  disabled={inviteEmails.includes(friend.email)}
                />
                <label
                  htmlFor={`friend-${friend.id}`}
                  className={`${styles.friendLabel} ${inviteEmails.includes(friend.email) ? styles.disabledFriend : ""}`}
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
        <button type="submit" className={styles.submitButton}>
          Create Group
        </button>
      </form>
    </div>
  );
}
