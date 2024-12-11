"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/client";

// Tipo para las invitaciones
type Invitation = {
  invitationId: string;
  invitationSenderId: string;
  invitationReceiverId: string;
  invitationGroupId: string;
  invitationProjectId: string | null;
  invitationDate: string;
  invitationRole: string;
};

export default function Invitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]); // Especificar tipo de arreglo
  const [error, setError] = useState<string | null>(null); // Error puede ser string o null

  const fetchInvitations = async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        "No hemos podido corroborar su sesión. Intente logueándose nuevamente."
      );
      return;
    }

    const { data, error } = await supabase
      .from("invitations")
      .select(`id,sender_id,receiver_id,group_id,project_id,created_at,role`)
      .eq("receiver_id", user.id);

    if (error) {
      console.error("Error al obtener las invitaciones:", error);
      setError("Error al obtener las invitaciones.");
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
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAcceptGroupInvitation = async (
    invitationId: string,
    invitationReceiverId: string,
    invitationGroupId: string,
    invitationRole: string
  ) => {
    const supabase = await createClient();

    try {
      // Agregar usuario al grupo:
      const { error: addMemberError } = await supabase
        .from("group_members")
        .insert({
          group_id: invitationGroupId,
          role: invitationRole,
          user_id: invitationReceiverId, // Asegúrate de que el campo sea correcto
        });

      if (addMemberError) {
        console.error(
          "Error al añadir miembro al grupo:",
          JSON.stringify(addMemberError, null, 2)
        );
        return;
      }

      // Eliminar la invitación de la base de datos
      const { error: deleteInvitationError } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (deleteInvitationError) {
        console.error(
          "Error al eliminar la invitación:",
          deleteInvitationError
        );
        return;
      }

      // Actualizar el estado local eliminando la invitación aceptada
      setInvitations((prevInvitations) =>
        prevInvitations.filter(
          (invitation) => invitation.invitationId !== invitationId
        )
      );
    } catch (err) {
      console.error("Error inesperado al aceptar la invitación:", err);
    }
  };

  const handleRejectGroupInvitation = async (invitationId: string) => {
    const supabase = createClient();

    try {
      // Eliminar la invitación de la base de datos
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (error) {
        console.error("Error al rechazar la invitación:", error);
        return;
      }

      // Actualizar el estado local eliminando la invitación rechazada
      setInvitations((prevInvitations) =>
        prevInvitations.filter(
          (invitation) => invitation.invitationId !== invitationId
        )
      );
    } catch (err) {
      console.error("Error inesperado al rechazar la invitación:", err);
    }
  };

  const handleAcceptFriendInvitation = async (
    invitationId: string,
    invitationSenderId: string,
    invitationReceiverId: string
  ) => {
    const supabase = await createClient();

    try {
      // Agregar friend link:
      const { error: addLinkError } = await supabase
        .from("friends_links")
        .insert({
          first_user_id: invitationSenderId,
          second_user_id: invitationReceiverId,
        });

      if (addLinkError) {
        console.error(
          "Error al añadir miembro al grupo:",
          JSON.stringify(addLinkError, null, 2)
        );
        return;
      }

      // Eliminar la invitación de la base de datos
      const { error: deleteInvitationError } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (deleteInvitationError) {
        console.error(
          "Error al eliminar la invitación:",
          deleteInvitationError
        );
        return;
      }

      // Actualizar el estado local eliminando la invitación aceptada
      setInvitations((prevInvitations) =>
        prevInvitations.filter(
          (invitation) => invitation.invitationId !== invitationId
        )
      );
    } catch (err) {
      console.error("Error inesperado al aceptar la invitación:", err);
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.invitationsContainer}>
      {/* Invitaciones de grupo */}
      <h2>Group Invitations:</h2>
      <div className={styles.groupInvitationsContainer}>
        {invitations.filter((inv) => inv.invitationGroupId).length > 0 ? (
          invitations
            .filter((inv) => inv.invitationGroupId)
            .map((invitation) => (
              <div
                key={invitation.invitationId}
                className={styles.invitationDetail}
              >
                <p>Id del invitador: {invitation.invitationSenderId}</p>
                <p>Id del grupo invitado: {invitation.invitationGroupId}</p>
                <p>Rol: {invitation.invitationRole}</p>
                <p>
                  Enviada el:{" "}
                  {new Date(invitation.invitationDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() => {
                    handleAcceptGroupInvitation(
                      invitation.invitationId,
                      invitation.invitationReceiverId,
                      invitation.invitationGroupId,
                      invitation.invitationRole
                    );
                  }}
                >
                  Aceptar
                </button>
                <button
                  onClick={() => {
                    handleRejectGroupInvitation(invitation.invitationId);
                  }}
                >
                  Rechazar
                </button>
              </div>
            ))
        ) : (
          <p>No se encontraron invitaciones de grupo.</p>
        )}
      </div>

      {/* Invitaciones de proyecto */}
      <h2>Project Invitations:</h2>
      <div className={styles.projectInvitationsContainer}>
        {invitations.filter((inv) => inv.invitationProjectId).length > 0 ? (
          invitations
            .filter((inv) => inv.invitationProjectId)
            .map((invitation) => (
              <div
                key={invitation.invitationId}
                className={styles.invitationDetail}
              >
                <p>Id del invitador: {invitation.invitationSenderId}</p>
                <p>
                  Id del proyecto invitado: {invitation.invitationProjectId}
                </p>
                <p>Rol: {invitation.invitationRole}</p>
                <p>
                  Enviada el:{" "}
                  {new Date(invitation.invitationDate).toLocaleDateString()}
                </p>
                <button>Aceptar</button>
                <button>Rechazar</button>
              </div>
            ))
        ) : (
          <p>No se encontraron invitaciones de proyecto.</p>
        )}
      </div>

      {/* Invitaciones de amigo */}
      <h2>Friend Invitations:</h2>
      <div className={styles.friendInvitationsContainer}>
        {invitations.filter(
          (inv) => !inv.invitationGroupId && !inv.invitationProjectId
        ).length > 0 ? (
          invitations
            .filter((inv) => !inv.invitationGroupId && !inv.invitationProjectId)
            .map((invitation) => (
              <div
                key={invitation.invitationId}
                className={styles.invitationDetail}
              >
                <p>Id del invitador: {invitation.invitationSenderId}</p>
                <p>
                  Enviada el:{" "}
                  {new Date(invitation.invitationDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() => {
                    handleAcceptFriendInvitation(
                      invitation.invitationId,
                      invitation.invitationSenderId,
                      invitation.invitationReceiverId
                    );
                  }}
                >
                  Aceptar
                </button>
                <button
                  onClick={() => {
                    handleRejectGroupInvitation(invitation.invitationId);
                  }}
                >
                  Rechazar
                </button>
              </div>
            ))
        ) : (
          <p>No se encontraron invitaciones de amigos.</p>
        )}
      </div>
    </div>
  );
}
