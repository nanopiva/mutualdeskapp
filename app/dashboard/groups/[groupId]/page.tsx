import { createClient } from "@/utils/supabase/server";
import { getUserById } from "@/app/actions"; // Importa la función de actions.ts
import styles from "./page.module.css";
import ProjectCard from "../../components/ProjectCard/ProjectCard";

export default async function GroupPage({
  params,
}: {
  params: { groupId: string };
}) {
  const { groupId } = params;

  async function getGroupInfo() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("groups")
      .select("id, name, description, created_at, creator_id, updated_at")
      .eq("id", groupId);

    if (error) {
      console.error(error, "Error al obtener la información del grupo");
      return null;
    }

    return data.map((group) => ({
      groupId: group.id,
      groupName: group.name,
      groupDescription: group.description,
      groupCreatedAt: group.created_at,
      groupCreatorId: group.creator_id,
      groupUpdatedAt: group.updated_at,
    }));
  }

  async function getGroupMembers() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("group_members")
      .select(`id, user_id, role`)
      .eq("group_id", groupId);

    if (error) {
      console.error(error, "Error al obtener los integrantes del grupo");
      return null;
    }

    // Obtener detalles de cada usuario asociado al grupo
    const membersWithDetails = await Promise.all(
      data.map(async (member) => {
        const userDetails = await getUserById(member.user_id);
        return {
          id: member.id,
          userId: member.user_id,
          role: member.role,
          email: userDetails.email,
          firstName: userDetails.first_name || null,
          lastName: userDetails.last_name || null,
          createdAt: userDetails.created_at,
        };
      })
    );

    return membersWithDetails;
  }

  async function getPendingInvitations() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("invitations")
      .select(`id, sender_id, receiver_id, role, created_at`)
      .eq("group_id", groupId)
      .eq("status", "pending");

    if (error) {
      console.error(error, "Error al obtener las invitaciones del grupo");
      return null;
    }

    return data.map((invitation) => ({
      id: invitation.id,
      senderId: invitation.sender_id,
      receiverId: invitation.receiver_id,
      role: invitation.role,
      invitationDate: invitation.created_at,
    }));
  }

  async function getGroupProjects() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        `id, name, description, is_public, author_id, created_at, updated_at,group_id`
      )
      .eq("group_id", groupId);

    if (error) {
      console.error(error, "Error al obtener los proyectos del grupo");
      return null;
    }

    return data.map((project) => ({
      id: project.id,
      projectName: project.name,
      projectDescription: project.description,
      projectType: project.is_public,
      projectAuthor: project.author_id,
      projectCreated: project.created_at,
      projectLastUpdated: project.updated_at,
      projectGroupId: project.group_id,
    }));
  }

  const groupData = await getGroupInfo();
  const groupMembers = await getGroupMembers();
  const groupInvitations = await getPendingInvitations();
  const groupProjects = await getGroupProjects();

  if (!groupData || groupData.length === 0) {
    return (
      <div className={styles.groupDetailsContainer}>
        <p>No se encontró información del grupo.</p>
      </div>
    );
  }

  return (
    <div className={styles.groupDetailsContainer}>
      {groupData.map(async (group) => {
        const creator = await getUserById(group.groupCreatorId);

        return (
          <div key={group.groupId} className={styles.groupDetail}>
            <h1 className={styles.groupName}>{group.groupName}</h1>
            <p className={styles.groupDescription}>{group.groupDescription}</p>
            <p className={styles.groupMeta}>
              Creado el: {new Date(group.groupCreatedAt).toLocaleDateString()}
            </p>
            <p className={styles.groupMeta}>
              Última actualización:{" "}
              {new Date(group.groupUpdatedAt).toLocaleDateString()}
            </p>
            <p className={styles.groupMeta}>
              Creador:{" "}
              {creator
                ? `${creator.first_name || ""} ${creator.last_name || ""}`.trim()
                : "Datos no disponibles"}
            </p>
            <p className={styles.groupMeta}>
              Email del creador: {creator?.email || "Correo no disponible"}
            </p>
          </div>
        );
      })}

      <h2 className={styles.sectionTitle}>Integrantes del grupo:</h2>
      {!groupMembers || groupMembers.length === 0 ? (
        <p className={styles.noData}>
          No se encontraron los miembros del grupo
        </p>
      ) : (
        groupMembers.map((member) => (
          <div
            key={`${member.id}-${member.userId}`}
            className={styles.groupMembersData}
          >
            <p>Email: {member.email}</p>
            {member.firstName && member.lastName && (
              <p>
                Nombre: {member.firstName} {member.lastName}
              </p>
            )}
            <p>Rol: {member.role}</p>
            <p>
              Miembro desde: {new Date(member.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      )}

      <h2 className={styles.sectionTitle}>Proyectos del grupo:</h2>
      {!groupProjects || groupProjects.length === 0 ? (
        <p className={styles.noData}>No se encontraron proyectos</p>
      ) : (
        groupProjects.map((project) => (
          <div key={project.id} className={styles.groupProjectsData}>
            <ProjectCard
              name={project.projectName}
              id={project.id}
              role="random"
              isGroup={true}
            />
          </div>
        ))
      )}
    </div>
  );
}
