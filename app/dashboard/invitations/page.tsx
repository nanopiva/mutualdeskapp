"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import InvitationCardExtended from "../components/InvitationCardExtended/InvitationCardExtended";
import styles from "./page.module.css";

interface Invitation {
  id: number;
  sender_id: string;
  receiver_id: string;
  group_id: string | null;
  project_id: string | null;
  status: string;
  role: string | null;
  created_at: string;
  updated_at: string;
  sender: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  receiver: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  group: {
    name: string;
  } | null;
  project: {
    name: string;
  } | null;
}

export default function InvitationsPage() {
  const supabase = createClient();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      setCurrentUserId(user.id);

      const { data: invitationsData, error: invitationsError } = await supabase
        .from("invitations")
        .select(
          `
          *,
          sender: sender_id(email, first_name, last_name),
          receiver: receiver_id(email, first_name, last_name),
          group: group_id(name),
          project: project_id(name)
        `
        )
        .or(
          `and(receiver_id.eq.${user.id},status.eq.pending),and(sender_id.eq.${user.id},status.eq.pending)`
        );

      if (invitationsError) throw invitationsError;

      setInvitations(invitationsData || []);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: number) => {
    try {
      const { data: invitation, error: invitationError } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (invitationError || !invitation) {
        throw invitationError || new Error("Invitation not found");
      }

      if (!invitation.group_id && !invitation.project_id) {
        await handleAcceptFriend(invitation);
      } else if (invitation.group_id) {
        await handleAcceptGroup(invitation);
      } else if (invitation.project_id) {
        await handleAcceptProject(invitation);
      }

      const { error: deleteError } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (deleteError) throw deleteError;

      fetchInvitations();
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError("Failed to accept invitation");
    }
  };
  const handleAcceptFriend = async (invitation: any) => {
    const { error } = await supabase.from("friends_links").insert([
      {
        first_user_id: invitation.sender_id,
        second_user_id: invitation.receiver_id,
      },
    ]);

    if (error) throw error;
  };

  const handleAcceptGroup = async (invitation: any) => {
    const { error } = await supabase.from("group_members").insert([
      {
        group_id: invitation.group_id,
        user_id: invitation.receiver_id,
        role: invitation.role || "member",
      },
    ]);

    if (error) throw error;
  };

  const handleAcceptProject = async (invitation: any) => {
    const { error } = await supabase.from("project_members").insert([
      {
        project_id: invitation.project_id,
        user_id: invitation.receiver_id,
        role: invitation.role || "contributor",
        group_id: invitation.group_id,
      },
    ]);

    if (error) throw error;
  };

  const handleReject = async (invitationId: number) => {
    try {
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      fetchInvitations();
    } catch (err) {
      console.error("Error rejecting invitation:", err);
      setError("Failed to reject invitation");
    }
  };

  const handleCancel = async (invitationId: number) => {
    try {
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      fetchInvitations();
    } catch (err) {
      console.error("Error canceling invitation:", err);
      setError("Failed to cancel invitation");
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const receivedInvitations = invitations.filter(
    (inv: Invitation) =>
      inv.receiver_id === currentUserId && inv.status === "pending"
  );
  const sentInvitations = invitations.filter(
    (inv: Invitation) =>
      inv.sender_id === currentUserId && inv.status === "pending"
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Invitations</h1>
      </header>

      {loading ? (
        <div className={styles.loaderContainer}>
          <div className="loader"></div>
        </div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Received Invitations ({receivedInvitations.length})
            </h2>
            {receivedInvitations.length > 0 ? (
              <div className={styles.invitationsGrid}>
                {receivedInvitations.map((invitation: Invitation) => (
                  <InvitationCardExtended
                    key={`received-${invitation.id}`}
                    invitation={invitation}
                    type="received"
                    onAccept={() => handleAccept(invitation.id)}
                    onReject={() => handleReject(invitation.id)}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                No pending invitations received
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Sent Invitations ({sentInvitations.length})
            </h2>
            {sentInvitations.length > 0 ? (
              <div className={styles.invitationsGrid}>
                {sentInvitations.map((invitation: Invitation) => (
                  <InvitationCardExtended
                    key={`sent-${invitation.id}`}
                    invitation={invitation}
                    type="sent"
                    onCancel={() => handleCancel(invitation.id)}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                No pending invitations sent
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
