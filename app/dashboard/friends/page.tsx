"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserPlus, UserX, UserCheck, User, Search } from "lucide-react";
import FriendCard from "../components/FriendCard/FriendCard";
import AddFriendModal from "../components/AddFriendModal/AddFriendModal";
import styles from "./page.module.css";

interface Friend {
  id: number | null;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  status: "friend" | "sent" | "received";
  invitation_id?: number;
}

export default function FriendsPage() {
  const supabase = createClient();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: friendsData, error: friendsError } = await supabase.rpc(
        "get_friends_with_status",
        { current_user_id: user.id }
      );

      if (friendsError) throw friendsError;

      setFriends(friendsData || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setError("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: existingFriend } = await supabase
        .from("friends_links")
        .select("*")
        .or(
          `and(first_user_id.eq.${user.id},second_user_id.eq.${receiverId}),and(first_user_id.eq.${receiverId},second_user_id.eq.${user.id})`
        )
        .single();

      if (existingFriend) {
        throw new Error("This user is already your friend");
      }

      const { data: existingInvitation } = await supabase
        .from("invitations")
        .select("*")
        .eq("sender_id", user.id)
        .eq("receiver_id", receiverId)
        .eq("status", "pending")
        .is("group_id", null)
        .is("project_id", null)
        .single();

      if (existingInvitation) {
        throw new Error("Friend request already sent");
      }

      const { error } = await supabase.from("invitations").insert([
        {
          sender_id: user.id,
          receiver_id: receiverId,
          status: "pending",
        },
      ]);

      if (error) throw error;

      fetchFriends();
    } catch (err) {
      console.error("Error sending friend request:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send friend request"
      );
    }
  };

  const handleAcceptRequest = async (invitationId: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: invitation, error: invitationError } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (invitationError || !invitation) {
        throw invitationError || new Error("Invitation not found");
      }

      const { data: existingFriend } = await supabase
        .from("friends_links")
        .select("*")
        .or(
          `and(first_user_id.eq.${invitation.sender_id},second_user_id.eq.${invitation.receiver_id}),and(first_user_id.eq.${invitation.receiver_id},second_user_id.eq.${invitation.sender_id})`
        )
        .single();

      if (existingFriend) {
        await supabase
          .from("invitations")
          .update({ status: "accepted", updated_at: new Date().toISOString() })
          .eq("id", invitationId);
      } else {
        const { error: friendError } = await supabase
          .from("friends_links")
          .insert([
            {
              first_user_id: invitation.sender_id,
              second_user_id: invitation.receiver_id,
            },
          ]);

        if (friendError) throw friendError;

        await supabase
          .from("invitations")
          .update({ status: "accepted", updated_at: new Date().toISOString() })
          .eq("id", invitationId);
      }

      fetchFriends();
    } catch (err) {
      console.error("Error accepting friend request:", err);
      setError("Failed to accept friend request");
    }
  };

  const handleCancelRequest = async (invitationId: number) => {
    try {
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      fetchFriends();
    } catch (err) {
      console.error("Error canceling friend request:", err);
      setError("Failed to cancel friend request");
    }
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    try {
      const { error } = await supabase
        .from("friends_links")
        .delete()
        .eq("id", friendshipId);

      if (error) throw error;

      fetchFriends();
    } catch (err) {
      console.error("Error removing friend:", err);
      setError("Failed to remove friend");
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${friend.first_name} ${friend.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const currentFriends = filteredFriends.filter((f) => f.status === "friend");
  const sentRequests = filteredFriends.filter((f) => f.status === "sent");
  const receivedRequests = filteredFriends.filter(
    (f) => f.status === "received"
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Friends</h1>
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddFriendModal(true)}
            className={styles.addButton}
          >
            <UserPlus size={16} />
            <span>Add Friend</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className={styles.loaderContainer}>
          <div className="loader"></div>
        </div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          {receivedRequests.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <UserCheck size={20} /> Pending Requests
              </h2>
              <div className={styles.friendsGrid}>
                {receivedRequests.map((friend) => (
                  <FriendCard
                    key={`received-${friend.invitation_id}`}
                    friend={friend}
                    onAccept={() =>
                      friend.invitation_id &&
                      handleAcceptRequest(friend.invitation_id)
                    }
                    onRemove={() =>
                      friend.invitation_id &&
                      handleCancelRequest(friend.invitation_id)
                    }
                    status="received"
                  />
                ))}
              </div>
            </section>
          )}

          {sentRequests.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <UserCheck size={20} /> Sent Requests
              </h2>
              <div className={styles.friendsGrid}>
                {sentRequests.map((friend) => (
                  <FriendCard
                    key={`sent-${friend.invitation_id}`}
                    friend={friend}
                    onRemove={() =>
                      friend.invitation_id &&
                      handleCancelRequest(friend.invitation_id)
                    }
                    status="sent"
                  />
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <User size={20} /> My Friends ({currentFriends.length})
            </h2>
            {currentFriends.length > 0 ? (
              <div className={styles.friendsGrid}>
                {currentFriends.map((friend) => (
                  <FriendCard
                    key={`friend-${friend.id}`}
                    friend={friend}
                    onRemove={() => friend.id && handleRemoveFriend(friend.id)}
                    status="friend"
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>You don't have any friends yet. Add some!</p>
              </div>
            )}
          </section>
        </>
      )}

      {showAddFriendModal && (
        <AddFriendModal
          currentFriends={friends.map((f) => f.user_id)}
          onClose={() => setShowAddFriendModal(false)}
          onSuccess={fetchFriends}
        />
      )}
    </div>
  );
}
