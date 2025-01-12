"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/client";
import {
  getUserById,
  acceptInvitation,
  declineInvitation,
  getGroupName,
} from "@/app/actions";

type Invitation = {
  invitationId: string;
  invitationSenderId: string;
  invitationReceiverId: string;
  invitationGroupId: string | null;
  invitationProjectId: string | null;
  invitationDate: string;
  invitationRole: string;
};

type User = {
  first_name: string;
  last_name: string;
  email: string;
};

export default function Invitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [userDetails, setUserDetails] = useState<Record<string, User>>({});
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("We couldn't verify your session. Please log in again.");
      return;
    }

    const { data, error } = await supabase
      .from("invitations")
      .select(`id,sender_id,receiver_id,group_id,project_id,created_at,role`)
      .eq("receiver_id", user.id);

    if (error) {
      console.error("Error fetching invitations:", error);
      setError("Error fetching invitations.");
      return;
    }

    const formattedInvitations: Invitation[] = data.map((invitation) => ({
      invitationId: invitation.id,
      invitationSenderId: invitation.sender_id,
      invitationReceiverId: invitation.receiver_id,
      invitationGroupId: invitation.group_id,
      invitationProjectId: invitation.project_id,
      invitationDate: invitation.created_at,
      invitationRole: invitation.role,
    }));

    setInvitations(formattedInvitations);

    // Fetch details of the users involved
    const uniqueSenderIds = [...new Set(data.map((inv) => inv.sender_id))];
    const userFetchPromises = uniqueSenderIds.map((id) => getUserById(id));

    try {
      const users = await Promise.all(userFetchPromises);
      const userMap = users.reduce(
        (acc, user) => {
          acc[user.id] = user;
          return acc;
        },
        {} as Record<string, User>
      );
      setUserDetails(userMap);
    } catch (fetchError) {
      console.error("Error fetching user data:", fetchError);
      setError("Error loading user data.");
    }

    // Fetch group names
    const uniqueGroupIds = [
      ...new Set(data.map((inv) => inv.group_id).filter(Boolean)),
    ];
    const groupFetchPromises = uniqueGroupIds.map((id) => getGroupName(id));

    try {
      const groups = await Promise.all(groupFetchPromises);
      const groupMap = uniqueGroupIds.reduce(
        (acc, id, index) => {
          acc[id] = groups[index];
          return acc;
        },
        {} as Record<string, string>
      );
      setGroupNames(groupMap);
    } catch (groupFetchError) {
      console.error("Error fetching group data:", groupFetchError);
      setError("Error loading group data.");
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.invitationsContainer}>
      {/* Group Invitations */}
      <h2 className={styles.h2}>Group Invitations:</h2>
      <div className={styles.groupInvitationsContainer}>
        {invitations.filter((inv) => inv.invitationGroupId).length > 0 ? (
          invitations
            .filter((inv) => inv.invitationGroupId)
            .map((invitation) => {
              const sender = userDetails[invitation.invitationSenderId];
              const groupName = invitation.invitationGroupId
                ? groupNames[invitation.invitationGroupId] || "Loading..."
                : "Unknown";

              return (
                <div
                  key={invitation.invitationId}
                  className={`${styles.invitationDetail} ${styles.responsiveInvitation}`}
                >
                  <h3>Group Invitation</h3>
                  <p className={styles.p}>
                    Invited by: {sender?.first_name} {sender?.last_name} (
                    {sender?.email})
                  </p>
                  <p className={styles.p}>Group name: {groupName}</p>
                  <p className={styles.p}>Role: {invitation.invitationRole}</p>
                  <p className={styles.p}>
                    Sent on:{" "}
                    {new Date(invitation.invitationDate).toLocaleDateString()}
                  </p>
                  <div className={styles.acceptDeclineButtons}>
                    <button
                      onClick={() =>
                        acceptInvitation(
                          invitation.invitationGroupId,
                          invitation.invitationProjectId,
                          invitation.invitationRole,
                          invitation.invitationId,
                          invitation.invitationSenderId
                        )
                      }
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineInvitation(invitation.invitationId)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })
        ) : (
          <p className={styles.p}>No group invitations found.</p>
        )}
      </div>

      {/* Project Invitations */}
      <h2 className={styles.h2}>Project Invitations:</h2>
      <div className={styles.projectInvitationsContainer}>
        {invitations.filter((inv) => inv.invitationProjectId).length > 0 ? (
          invitations
            .filter((inv) => inv.invitationProjectId)
            .map((invitation) => {
              const sender = userDetails[invitation.invitationSenderId];
              return (
                <div
                  key={invitation.invitationId}
                  className={`${styles.invitationDetail} ${styles.responsiveInvitation}`}
                >
                  <h3>Project Invitation</h3>
                  <p className={styles.p}>
                    Invited by: {sender?.first_name} {sender?.last_name} (
                    {sender?.email})
                  </p>
                  <p className={styles.p}>
                    Project ID: {invitation.invitationProjectId}
                  </p>
                  <p className={styles.p}>Role: {invitation.invitationRole}</p>
                  <p className={styles.p}>
                    Sent on:{" "}
                    {new Date(invitation.invitationDate).toLocaleDateString()}
                  </p>
                  <div className={styles.acceptDeclineButtons}>
                    <button
                      onClick={() =>
                        acceptInvitation(
                          invitation.invitationGroupId,
                          invitation.invitationProjectId,
                          invitation.invitationRole,
                          invitation.invitationId,
                          invitation.invitationSenderId
                        )
                      }
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineInvitation(invitation.invitationId)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })
        ) : (
          <p className={styles.p}>No project invitations found.</p>
        )}
      </div>

      {/* Friend Invitations */}
      <h2 className={styles.h2}>Friend Invitations:</h2>
      <div className={styles.friendInvitationsContainer}>
        {invitations.filter(
          (inv) => !inv.invitationGroupId && !inv.invitationProjectId
        ).length > 0 ? (
          invitations
            .filter((inv) => !inv.invitationGroupId && !inv.invitationProjectId)
            .map((invitation) => {
              const sender = userDetails[invitation.invitationSenderId];
              return (
                <div
                  key={invitation.invitationId}
                  className={`${styles.invitationDetail} ${styles.responsiveInvitation}`}
                >
                  <h3>Friend Invitation</h3>
                  <p className={styles.p}>
                    Invited by: {sender?.first_name} {sender?.last_name} (
                    {sender?.email})
                  </p>
                  <p className={styles.p}>
                    Sent on:{" "}
                    {new Date(invitation.invitationDate).toLocaleDateString()}
                  </p>
                  <div className={styles.acceptDeclineButtons}>
                    <button
                      onClick={() =>
                        acceptInvitation(
                          invitation.invitationGroupId,
                          invitation.invitationProjectId,
                          invitation.invitationRole,
                          invitation.invitationId,
                          invitation.invitationSenderId
                        )
                      }
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineInvitation(invitation.invitationId)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })
        ) : (
          <p className={styles.p}>No friend invitations found.</p>
        )}
      </div>
    </div>
  );
}
