"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Mail, Users, FileText, Clock, Check, X } from "lucide-react";
import styles from "./InvitationsPreview.module.css";

interface Invitation {
  id: number;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  group_id: string | null;
  group_name: string | null;
  project_id: string | null;
  project_name: string | null;
  status: string;
  created_at: string;
  role: string | null;
}

interface Group {
  name: string;
}

interface Project {
  name: string;
}

interface Sender {
  first_name: string | null;
  last_name: string | null;
}

interface SupabaseInvitation {
  id: number;
  sender_id: string;
  receiver_id: string;
  group_id: string | null;
  project_id: string | null;
  status: string;
  role: string | null;
  created_at: string;
  groups: Group | null;
  projects: Project | null;
  sender: Sender | null;
}

export default function InvitationsPreview() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("invitations")
          .select(
            `
            id,
            sender_id,
            receiver_id,
            group_id,
            project_id,
            status,
            role,
            created_at,
            groups:group_id(name),
            projects:project_id(name),
            sender:sender_id(first_name, last_name)
          `
          )
          .eq("receiver_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        const processedInvitations: Invitation[] = (
          data as unknown as SupabaseInvitation[]
        ).map((invitation) => {
          const senderName =
            [invitation.sender?.first_name, invitation.sender?.last_name]
              .filter(Boolean)
              .join(" ")
              .trim() || "Unknown user";

          return {
            id: invitation.id,
            sender_id: invitation.sender_id,
            sender_name: senderName,
            receiver_id: invitation.receiver_id,
            group_id: invitation.group_id,
            group_name: invitation.groups?.name || null,
            project_id: invitation.project_id,
            project_name: invitation.projects?.name || null,
            status: invitation.status,
            created_at: invitation.created_at,
            role: invitation.role,
          };
        });

        setInvitations(processedInvitations);
      } catch (error) {
        console.error("Error fetching invitations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const getInvitationType = (invitation: Invitation) => {
    if (invitation.group_id) return "group";
    if (invitation.project_id) return "project";
    return "friend";
  };

  const getInvitationIcon = (invitation: Invitation) => {
    const type = getInvitationType(invitation);
    switch (type) {
      case "group":
        return <Users size={16} />;
      case "project":
        return <FileText size={16} />;
      default:
        return <Mail size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <Check size={16} className={styles.accepted} />;
      case "declined":
        return <X size={16} className={styles.declined} />;
      default:
        return <Clock size={16} className={styles.pending} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInvitationDescription = (invitation: Invitation) => {
    const type = getInvitationType(invitation);
    switch (type) {
      case "group":
        return `Group: ${invitation.group_name || "Unnamed group"}${invitation.role ? ` (${invitation.role})` : ""}`;
      case "project":
        return `Project: ${invitation.project_name || "Unnamed project"}${invitation.role ? ` (${invitation.role})` : ""}`;
      default:
        return "Friend request";
    }
  };

  return (
    <section className={styles.invitationsPreview}>
      <div className={styles.header}>
        <h2 className={styles.title}>Pending Invitations</h2>
        <Link href="/dashboard/invitations" className={styles.viewAll}>
          View all
        </Link>
      </div>

      {loading ? (
        <div className={styles.loaderContainer}>
          <div className="loader"></div>
        </div>
      ) : invitations.length > 0 ? (
        <div className={styles.invitationsGrid}>
          {invitations.map((invitation) => (
            <div key={invitation.id} className={styles.invitationCard}>
              <div className={styles.cardHeader}>
                <div className={styles.invitationIcon}>
                  {getInvitationIcon(invitation)}
                </div>
                <div className={styles.statusIndicator}>
                  {getStatusIcon(invitation.status)}
                  <span className={styles.statusText}>{invitation.status}</span>
                </div>
              </div>

              <div className={styles.invitationDetails}>
                <div className={styles.invitationHeader}>
                  <span className={styles.invitationType}>
                    {getInvitationType(invitation).charAt(0).toUpperCase() +
                      getInvitationType(invitation).slice(1)}{" "}
                    invitation
                  </span>
                  <span className={styles.invitationDate}>
                    {formatDate(invitation.created_at)}
                  </span>
                </div>

                <p className={styles.invitationFrom}>
                  From: {invitation.sender_name}
                </p>

                <p className={styles.invitationInfo}>
                  {getInvitationDescription(invitation)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No pending invitations</p>
        </div>
      )}
    </section>
  );
}
