"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserById } from "@/app/actions";
import FriendCard from "../components/FriendCard/FriendCard";
import { fetchUserIdByEmail } from "@/app/actions";

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
        console.error("We could not verify your session. Please log in again.");
        setError("We could not verify your session. Please log in again.");
        return;
      }

      const invitedId: string = await fetchUserIdByEmail(email);

      if (!invitedId || invitedId.length === 0) {
        console.error("No user found with the given email.");
        setError("No user found with the given email.");
        return;
      }

      const receiverId = invitedId;
      const { error: errorData } = await supabase.from("invitations").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: "pending",
      });

      if (errorData) {
        console.error("Error inserting invitation:", errorData);
        setError("Error sending friend request.");
      }

      console.log("Friend request sent to:", email);
      setIsModalOpen(false);
      setEmail(""); // Clear the input after submission
    } catch (error) {
      console.error("Error adding friend:", error);
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
            <h3>Add a Friend</h3>
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
}: {
  userId: string;
  friendSince: string;
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
    />
  );
};
