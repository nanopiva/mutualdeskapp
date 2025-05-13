"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserById } from "@/app/actions";
import FriendCard from "../components/FriendCard/FriendCard";
import { fetchUserIdByEmail } from "@/app/actions";
import { handleDeleteFriend } from "@/app/actions";

type FriendLinkData = {
  linkId: string;
  linkFUserId: string;
  linkSUserId: string;
  linkData: string;
};

export default function FriendsPanel() {
  const [myFriends, setMyFriends] = useState<FriendLinkData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const fetchLinks = async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("We could not verify your session. Please log in again.");
      return;
    }
    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("friends_links")
      .select(`id,first_user_id,second_user_id,created_at`)
      .or(`first_user_id.eq.${user.id},second_user_id.eq.${user.id}`);

    if (error) {
      console.error("Error fetching friend links:", error);
      setError("Error fetching friend links.");
      return;
    }

    const formattedFriendsLink: FriendLinkData[] = data.map((friend) => ({
      linkId: friend.id,
      linkFUserId: friend.first_user_id,
      linkSUserId: friend.second_user_id,
      linkData: friend.created_at,
    }));

    setMyFriends(formattedFriendsLink);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const deleteFriend = async (friendId: string) => {
    const success = await handleDeleteFriend(friendId);
    if (success) {
      // Remove the deleted friend from the UI
      setMyFriends((prevFriends) =>
        prevFriends.filter(
          (friend) =>
            friend.linkFUserId !== friendId && friend.linkSUserId !== friendId
        )
      );
    }
  };

  const handleAddFriend = async () => {
    if (!email) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("We could not verify your session. Please log in again.");
        return;
      }

      const senderId = user.id;
      const invitedId: string = await fetchUserIdByEmail(email);

      if (!invitedId) {
        setError("No user found with the given email.");
        return;
      }

      // Check for existing invitations
      const { data: sentInvites, error: sentError } = await supabase
        .from("invitations")
        .select("id")
        .eq("sender_id", senderId)
        .eq("receiver_id", invitedId)
        .eq("status", "pending");

      const { data: receivedInvites, error: receivedError } = await supabase
        .from("invitations")
        .select("id")
        .eq("sender_id", invitedId)
        .eq("receiver_id", senderId)
        .eq("status", "pending");

      if (sentError || receivedError) {
        console.error(
          "Error checking invitations:",
          sentError || receivedError
        );
        setError("Error checking existing invitations.");
        return;
      }

      if (sentInvites.length > 0 || receivedInvites.length > 0) {
        setError("There is already a pending invitation.");
        return;
      }

      // Check if already friends
      const { data: friendLinks, error: friendError } = await supabase
        .from("friends_links")
        .select("id, first_user_id, second_user_id")
        .or(`first_user_id.eq.${senderId},second_user_id.eq.${senderId}`)
        .or(`first_user_id.eq.${invitedId},second_user_id.eq.${invitedId}`);

      if (friendError) {
        console.error("Error checking friend links:", friendError);
        setError("Error checking existing friends.");
        return;
      }

      const alreadyFriends = friendLinks.some(
        (friend) =>
          (friend.first_user_id === senderId &&
            friend.second_user_id === invitedId) ||
          (friend.first_user_id === invitedId &&
            friend.second_user_id === senderId)
      );

      if (alreadyFriends) {
        setError("You are already friends.");
        return;
      }

      // Insert new invitation
      const { error: insertError } = await supabase.from("invitations").insert({
        sender_id: senderId,
        receiver_id: invitedId,
        status: "pending",
      });

      if (insertError) {
        console.error("Error inserting invitation:", insertError);
        setError("Error sending friend request.");
        return;
      }

      console.log("Friend request sent to:", email);
      setIsModalOpen(false);
      setEmail("");
    } catch (error) {
      console.error("Error adding friend:", error);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className={styles.friendsPanelContainer}>
      <h1 className={styles.title}>Friends panel</h1>
      <div className={styles.friendsContainer}>
        {myFriends.length > 0 ? (
          myFriends.map((friendLink) => {
            const friendUserId =
              friendLink.linkFUserId === currentUserId
                ? friendLink.linkSUserId
                : friendLink.linkFUserId;

            return (
              <UserDetails
                key={friendLink.linkId}
                userId={friendUserId}
                friendSince={friendLink.linkData}
                onDelete={deleteFriend}
              />
            );
          })
        ) : (
          <p className={styles.noFriends}>You don't have any friends yet.</p>
        )}
      </div>
      <button
        className={styles.addFriendButton}
        onClick={() => setIsModalOpen(true)}
      >
        Add a Friend
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.addAFriendTitle}>Add a Friend</h3>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <input
              type="email"
              placeholder="Enter your friend's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
            />
            <div className={styles.modalActions}>
              <button onClick={handleAddFriend}>Add</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const UserDetails = ({
  userId,
  friendSince,
  onDelete,
}: {
  userId: string;
  friendSince: string;
  onDelete: (friendId: string) => void;
}) => {
  const [userDetails, setUserDetails] = useState<any | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = await getUserById(userId);
      setUserDetails(user);
    };

    fetchUserDetails();
  }, [userId]);

  if (!userDetails) {
    return <p>Loading friend details...</p>;
  }

  return (
    <FriendCard
      firstName={userDetails.first_name}
      lastName={userDetails.last_name}
      email={userDetails.email}
      profilePicture={userDetails.profile_picture || ""}
      created_at={userDetails.created_at}
      friend_since={new Date(friendSince)}
      id={userDetails.id}
      onDelete={onDelete}
    />
  );
};
