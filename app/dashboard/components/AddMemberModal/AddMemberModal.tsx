"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, X, Search, UserPlus } from "lucide-react";
import styles from "./AddMemberModal.module.css";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export default function AddMemberModal({
  groupId,
  currentMembers,
  onClose,
  onSuccess,
}: {
  groupId: string;
  currentMembers: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);

      let query = supabase
        .from("users")
        .select("id, email, first_name, last_name")
        .ilike("email", `%${searchQuery}%`)
        .limit(10);

      if (currentMembers.length > 0) {
        query = query.not("id", "in", currentMembers);
      }

      const { data, error } = await query;

      if (!error && data) {
        setSearchResults(data.filter((u) => !currentMembers.includes(u.id)));
      }
      setSearchLoading(false);
    };

    const debounceTimer = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentMembers, supabase]);

  const handleAddUser = (user: User) => {
    if (currentMembers.includes(user.id)) return;
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const invitations = selectedUsers.map((selectedUser) => ({
        sender_id: user.id,
        receiver_id: selectedUser.id,
        group_id: groupId,
        status: "pending",
        role,
      }));

      const { error } = await supabase.from("invitations").insert(invitations);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error sending invitations:", err);
      setError("Failed to send invitations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Add Members to Group</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchInput}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search users by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                <div
                  key={user.id}
                  className={styles.searchResultItem}
                  onClick={() => handleAddUser(user)}
                >
                  <div className={styles.userInfo}>
                    <p className={styles.userEmail}>{user.email}</p>
                    {user.first_name && user.last_name && (
                      <p className={styles.userName}>
                        {user.first_name} {user.last_name}
                      </p>
                    )}
                  </div>
                  <UserPlus size={16} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.roleSelection}>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <div className={styles.selectedUsers}>
            <h4>Selected Users</h4>
            <div className={styles.selectedUsersList}>
              {selectedUsers.map((user) => (
                <div key={user.id} className={styles.selectedUser}>
                  <div className={styles.userInfo}>
                    <p className={styles.userEmail}>{user.email}</p>
                    {user.first_name && user.last_name && (
                      <p className={styles.userName}>
                        {user.first_name} {user.last_name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
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

        <div className={styles.modalActions}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={styles.submitButton}
            disabled={loading || selectedUsers.length === 0}
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
                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                ></div>
                Sending...
              </div>
            ) : (
              "Send Invitations"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
