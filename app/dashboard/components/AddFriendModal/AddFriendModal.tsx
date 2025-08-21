"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserPlus, X, Search, User, Clock } from "lucide-react";
import styles from "./AddFriendModal.module.css";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Invitation {
  id: number;
  receiver_id: string;
  status: string;
  created_at: string;
}

export default function AddFriendModal({
  currentFriends,
  onClose,
  onSuccess,
}: {
  currentFriends: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Buscar usuarios y cargar invitaciones pendientes
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar invitaciones pendientes del usuario actual
      const { data: invitations } = await supabase
        .from("invitations")
        .select("id, receiver_id, status, created_at")
        .eq("sender_id", user.id)
        .eq("status", "pending");

      setPendingInvitations(invitations || []);
    };

    fetchData();
  }, [supabase]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("users")
          .select("id, email, first_name, last_name")
          .ilike("email", `%${searchQuery}%`)
          .not("id", "in", `(${currentFriends.join(",")})`)
          .not("id", "eq", user.id) // No mostrar el usuario actual
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error("Error searching users:", err);
        setError("Failed to search users");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentFriends, supabase]);

  const handleSendInvitation = async (receiverId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      setLoading(true);
      setError("");

      // Verificar si ya existe una invitación pendiente
      const existingInvitation = pendingInvitations.find(
        (inv) => inv.receiver_id === receiverId
      );

      if (existingInvitation) {
        throw new Error("You already sent an invitation to this user");
      }

      const { error } = await supabase.from("invitations").insert([
        {
          sender_id: user.id,
          receiver_id: receiverId,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Actualizar lista de invitaciones pendientes
      const newInvitation = {
        id: Date.now(), // Temporal hasta que se refresque la lista
        receiver_id: receiverId,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      setPendingInvitations([...pendingInvitations, newInvitation]);

      onSuccess(); // Notificar a la página principal
    } catch (err) {
      console.error("Error sending invitation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  const getInvitationStatus = (userId: string) => {
    const invitation = pendingInvitations.find(
      (inv) => inv.receiver_id === userId
    );
    if (!invitation) return null;

    return {
      status: invitation.status,
      sentAt: new Date(invitation.created_at).toLocaleDateString(),
    };
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Send Friend Request</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchInput}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {loading && <div className={styles.loading}>Searching...</div>}
          {error && <div className={styles.error}>{error}</div>}

          {searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((user) => {
                const invitation = getInvitationStatus(user.id);

                return (
                  <div key={user.id} className={styles.userResult}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        {user.first_name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className={styles.userEmail}>{user.email}</p>
                        {user.first_name && user.last_name && (
                          <p className={styles.userName}>
                            {user.first_name} {user.last_name}
                          </p>
                        )}
                        {invitation && (
                          <p className={styles.invitationStatus}>
                            <Clock size={12} /> Sent on {invitation.sentAt}
                          </p>
                        )}
                      </div>
                    </div>
                    {invitation ? (
                      <span className={styles.pendingBadge}>Pending</span>
                    ) : (
                      <button
                        className={styles.addButton}
                        onClick={() => handleSendInvitation(user.id)}
                        disabled={loading}
                      >
                        <UserPlus size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery.length >= 3 &&
            !loading &&
            searchResults.length === 0 && (
              <div className={styles.noResults}>
                <p>No users found matching "{searchQuery}"</p>
                <p>Make sure you're searching by their email address</p>
              </div>
            )}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
