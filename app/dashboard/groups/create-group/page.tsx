"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Plus, X, Search, UserPlus, UserCheck } from "lucide-react";
import styles from "./page.module.css";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Friend extends User {
  isFriend: true;
}

interface Invitation {
  email: string;
  role: string;
  user_id?: string;
}

export default function CreateGroupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Invitation[]>([]);
  const [currentRole, setCurrentRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: friendsData, error } = await supabase.rpc(
        "get_user_friends",
        {
          user_id: user.id,
        }
      );

      if (!error && friendsData) {
        setFriends(friendsData.map((f: any) => ({ ...f, isFriend: true })));
      }
      setFriendsLoading(false);
    };

    fetchFriends();
  }, [supabase]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, email, first_name, last_name")
        .ilike("email", `%${searchQuery}%`)
        .limit(10);

      if (!error && data) {
        const currentUser = (await supabase.auth.getUser()).data.user?.id;
        setSearchResults(
          data.filter(
            (user) =>
              !selectedMembers.some((m) => m.user_id === user.id) &&
              user.id !== currentUser
          )
        );
      }
      setSearchLoading(false);
    };

    const debounceTimer = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedMembers, supabase]);

  const handleAddMember = (user: User, role: string) => {
    if (selectedMembers.some((m) => m.user_id === user.id)) return;

    setSelectedMembers([
      ...selectedMembers,
      {
        email: user.email,
        role,
        user_id: user.id,
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveMember = (user_id: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.user_id !== user_id));
  };

  const handleRoleChange = (user_id: string, newRole: string) => {
    setSelectedMembers(
      selectedMembers.map((m) =>
        m.user_id === user_id ? { ...m, role: newRole } : m
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: groupName,
          description: description || null,
          creator_id: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      if (selectedMembers.length > 0) {
        const invitations = selectedMembers.map((member) => ({
          sender_id: user.id,
          receiver_id: member.user_id!,
          group_id: group.id,
          status: "pending",
          role: member.role,
        }));

        const { error: inviteError } = await supabase
          .from("invitations")
          .insert(invitations);

        if (inviteError) throw inviteError;
      }

      router.push(`/dashboard/groups/${group.id}`);
      router.refresh();
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Group</h1>
        <Link href="/dashboard/groups" className={styles.backLink}>
          Back to Groups
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="groupName" className={styles.label}>
            Group Name*
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className={styles.input}
            required
            maxLength={255}
          />
          <p className={styles.hint}>Maximum 255 characters</p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            rows={3}
            maxLength={500}
          />
          <p className={styles.hint}>Maximum 500 characters</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Add Members</label>

          <div className={styles.searchContainer}>
            <div className={styles.searchInput}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.input}
              />
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className={styles.roleSelect}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {searchLoading && (
              <div className={styles.searchLoading}>
                <div
                  className="loader"
                  style={{ width: "20px", height: "20px" }}
                ></div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((user) => (
                  <div key={user.id} className={styles.searchResultItem}>
                    <div className={styles.userInfo}>
                      <span className={styles.userEmail}>{user.email}</span>
                      {user.first_name && user.last_name && (
                        <span className={styles.userName}>
                          {user.first_name} {user.last_name}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddMember(user, currentRole)}
                      className={styles.addButton}
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.friendsList}>
            <h4 className={styles.friendsTitle}>Your Friends</h4>
            {friendsLoading ? (
              <div className={styles.loadingContainer}>
                <div
                  className="loader"
                  style={{ width: "24px", height: "24px" }}
                ></div>
              </div>
            ) : friends.length === 0 ? (
              <p className={styles.noFriends}>
                You don't have any friends yet.
              </p>
            ) : (
              <div className={styles.friendsGrid}>
                {friends
                  .filter(
                    (friend) =>
                      !selectedMembers.some((m) => m.email === friend.email)
                  )
                  .map((friend) => (
                    <div key={friend.id} className={styles.friendItem}>
                      <div className={styles.userInfo}>
                        <span className={styles.userEmail}>{friend.email}</span>
                        {friend.first_name && friend.last_name && (
                          <span className={styles.userName}>
                            {friend.first_name} {friend.last_name}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddMember(friend, currentRole)}
                        className={styles.addButton}
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {selectedMembers.length > 0 && (
          <div className={styles.selectedMembers}>
            <h4 className={styles.selectedTitle}>Selected Members</h4>
            <div className={styles.membersList}>
              {selectedMembers.map((member) => (
                <div key={member.user_id} className={styles.memberItem}>
                  <span className={styles.memberEmail}>{member.email}</span>
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.user_id!, e.target.value)
                    }
                    className={styles.memberRole}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.user_id!)}
                    className={styles.removeButton}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !groupName}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  className="loader"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                ></div>
                Creating Group...
              </div>
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
