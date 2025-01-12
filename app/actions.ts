"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { SerializedEditorState } from "lexical";
import { isNull } from "util";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // Validaciones
  if (!email || !password || !firstName || !lastName) {
    return { error: "All fields are required." };
  }

  // Validar formato del email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format." };
  }

  // Validar contraseña
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordRegex.test(password)) {
    return {
      error:
        "Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.",
    };
  }

  // Validar longitud de nombres
  if (firstName.length < 2 || lastName.length < 2) {
    return {
      error: "First and last names must be at least 2 characters long.",
    };
  }

  // Intentar registrar al usuario
  const { error, data: user } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // Guardar usuario en la base de datos
  const { error: errorSavingUser } = await supabase.from("users").insert({
    id: user.user?.id,
    email,
    first_name: firstName,
    last_name: lastName,
  });

  if (errorSavingUser) {
    console.error(errorSavingUser);
    return encodedRedirect("error", "/sign-up", errorSavingUser.message);
  }

  return encodedRedirect(
    "success",
    "/sign-up?success=true",
    "Thanks for signing up! Please check your email for a verification link."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  // Validación del email en el servidor
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return encodedRedirect("error", "/forgot-password", "Invalid email format");
  }

  // Verificar si el email existe en la base de datos
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  // Si no se encuentra el usuario, actuar como si la operación fue exitosa
  if (fetchError || !user) {
    return encodedRedirect(
      "success",
      "/forgot-password",
      "If an account with that email exists, you will receive a recovery link shortly."
    );
  }

  // Enviar el correo si el email es válido
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    }
  );

  if (resetError) {
    console.error(resetError.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password. Please try again later."
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "If an account with that email exists, you will receive a recovery link shortly."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Password and confirm password are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Password update failed" };
  }

  return { success: true };
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const createUser = async (formData: FormData) => {
  try {
    const supabase = await createClient();
    const firstName = formData.get("first_name");
    const lastName = formData.get("last_name");

    const { error } = await supabase.from("users").insert({
      first_name: firstName,
      last_name: lastName,
    });

    if (error) {
      console.error(error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updateUser = async (formData: FormData) => {
  try {
    const supabase = await createClient();
    const firstName = formData.get("first_name");
    const lastName = formData.get("last_name");
    const id = formData.get("id");

    const { error } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export async function getUserGroups() {
  const supabase = await createClient();

  // Obtener el usuario actual
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return [];
  }

  // Obtener los IDs de los grupos donde el usuario es miembro
  const { data: groupMembers, error: groupMembersError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  if (groupMembersError) {
    console.error("Error fetching group members:", groupMembersError);
    return [];
  }

  const groupIds = groupMembers.map((member) => member.group_id);

  if (groupIds.length === 0) {
    console.log("No groups found for this user.");
    return [];
  }

  // Obtener los datos de los grupos correspondientes
  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("id, name")
    .in("id", groupIds);

  if (groupsError) {
    console.error("Error fetching groups:", groupsError);
    return [];
  }

  return groups;
}

export const addGroupIntegrant = async (formData: FormData) => {
  const integrantEmail = formData.get("email")?.toString();
  const integrantRole = formData.get("role")?.toString();
  const group_id = formData.get("groupId")?.toString();

  if (!integrantEmail || integrantEmail == "") {
    throw new Error("El email del integrante es requerido");
  }
  console.log(integrantRole);
  if (
    !(
      integrantRole == "author" ||
      integrantRole == "editor" ||
      integrantRole == "viewer"
    )
  ) {
    throw new Error("El rol del integrante no es valido");
  }

  const supabase = await createClient();

  try {
    // 1. Buscar el usuario por email
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", integrantEmail)
      .single();

    if (userError || !users) {
      throw new Error("Usuario no encontrado");
    }

    // 2. Añadir el usuario como miembro del grupo
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({ group_id: group_id, user_id: users.id, role: integrantRole });

    if (memberError) {
      throw new Error("Error al añadir el miembro al grupo");
    }

    // 3. Revalidar la ruta para actualizar los datos
    revalidatePath(`/groups/${group_id}`);

    return { success: true };
  } catch (error) {
    console.error("Error en addMemberToGroup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

export const sendGroupInvitationForm = async (formData: FormData) => {
  const integrantEmail = formData.get("email")?.toString();
  const integrantRole = formData.get("role")?.toString();
  const group_id = formData.get("groupId")?.toString();
  const senderId = formData.get("senderId")?.toString();
  const supabase = await createClient();

  //Validamos que el email no este vacío y los roles sean apropiados:
  if (!integrantEmail || integrantEmail == "") {
    throw new Error("El email del integrante es requerido");
  }
  console.log(integrantRole);
  if (
    !(
      integrantRole == "author" ||
      integrantRole == "editor" ||
      integrantRole == "viewer"
    )
  ) {
    throw new Error("El rol del integrante no es valido");
  }

  try {
    // 1. Buscar el usuario por email
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", integrantEmail)
      .single();

    const receiver_id = users?.id;

    if (userError || !users) {
      throw new Error("Usuario no encontrado");
    }

    // 2. Enviar invitacion al usuario

    console.log(
      "Datos a enviar: ",
      "SenderId:",
      senderId,
      "receiver_id",
      receiver_id,
      "group_id:",
      group_id,
      "role:",
      integrantRole
    );
    const { error: insertError } = await supabase.from("invitations").insert({
      sender_id: senderId,
      receiver_id: receiver_id,
      group_id: group_id,

      status: "pending",
      role: integrantRole,
    });
    if (insertError) {
      throw new Error("Error al enviar la invitacion");
    }

    // 3. Revalidar la ruta para actualizar los datos
    revalidatePath(`/groups/${group_id}`);

    return { success: true };
  } catch (error) {
    console.error("Error en sendGroupInvitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

export const createProject = async (
  projectName: string,
  projectDescription: string | null,
  isPublic: boolean,
  groupSelected: string | null
) => {
  console.log(projectName, projectDescription, isPublic, groupSelected);
  if (!projectName || isPublic === undefined || isPublic === null) {
    throw new Error("Nombre del proyecto y tipo son requeridos");
  }

  if (groupSelected === "") {
    groupSelected = null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No se encontró el usuario");
  }

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .insert({
      name: projectName,
      description: projectDescription,
      is_public: isPublic,
      author_id: user.id,
      group_id: groupSelected,
    })
    .select("id");

  if (projectError) {
    console.log(projectError);
    throw new Error("Error al insertar el proyecto");
  }

  const projectId = projectData?.[0]?.id;
  if (!projectId) {
    throw new Error("Error generando Id de proyecto");
  }

  const { error: projectMembersError } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: user.id,
      group_id: groupSelected,
      role: "admin",
    });

  if (projectMembersError) {
    throw new Error("Error insertando el miembro al proyecto");
  }

  if (groupSelected) {
    const { data: otherMembers, error: otherMembersError } = await supabase
      .from("group_members")
      .select("user_id,role")
      .eq("group_id", groupSelected)
      .neq("user_id", user.id);

    if (otherMembersError) {
      throw new Error("Error obteniendo al resto de los miembros");
    }

    const insertPromises = otherMembers.map(async (member) => {
      console.log(member.user_id, projectId, groupSelected, member.role);
      const { error: insertError } = await supabase
        .from("project_members")
        .insert({
          user_id: member.user_id,
          project_id: projectId,
          group_id: groupSelected,
          role: member.role,
        });

      if (insertError) {
        console.error(insertError);
        throw new Error(
          `Error al agregar al resto de los usuarios al proyecto`
        );
      }
    });

    await Promise.all(insertPromises);
  }

  return { success: true, projectId };
};
export const getUserById = async (userId: string) => {
  const supabase = await createClient();

  const { data: userData, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, created_at")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error obteniendo datos del usuario: ", error.message);
    throw new Error("No se pudo obtener la información del usuario.");
  }

  return userData;
};

export const saveProjectInDatabase = async (
  projectId: string,
  newContent: JSON | SerializedEditorState
) => {
  const supabase = await createClient();

  // Obtener el contenido actual para evitar actualizaciones innecesarias
  const { data: existingData, error: fetchError } = await supabase
    .from("projects")
    .select("content")
    .eq("id", projectId)
    .single();

  if (fetchError) {
    console.error("Error al obtener contenido actual:", fetchError);
    return;
  }

  if (JSON.stringify(existingData.content) === JSON.stringify(newContent)) {
    // No actualizar si el contenido es idéntico
    return;
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({ content: newContent })
    .eq("id", projectId);

  if (updateError) {
    console.error("Error insertando nuevo contenido", updateError);
    return;
  }
};
export const loadProjectFromDatabase = async (projectId: string) => {
  const supabase = await createClient();

  const { data: contentLoaded, error: loadProjectError } = await supabase
    .from("projects")
    .select(`content`)
    .eq("id", projectId);
  if (loadProjectError) {
    console.error("error obteniendo contenido de database", loadProjectError);
    return;
  }
  return contentLoaded;
};

export const getActualUserId = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error obteniendo el usuario actual");
    return null;
  }
  const userId = user?.id;
  return userId;
};

export const acceptInvitation = async (
  groupId: string | null,
  projectId: string | null,
  role: string | null,
  invitationId: string,
  invitationSenderId: string
) => {
  const supabase = await createClient();
  const userId = await getActualUserId();
  if (groupId != null && projectId == null && role != null) {
    try {
      await supabase.from("group_members").insert({
        group_id: groupId,
        role: role,
        user_id: userId,
      });
    } catch {
      console.error("Error inserting group member");
    }

    try {
      await supabase.from("invitations").delete().eq("id", invitationId);
    } catch {
      console.error("Error deleting group invitation");
    }
  }
  if (groupId == null && projectId != null && role != null) {
    try {
      await supabase.from("project_members").insert({
        project_id: projectId,
        user_id: userId,
        role: role,
      });
    } catch {
      console.error("Error inserting project member");
    }

    try {
      await supabase.from("invitations").delete().eq("id", invitationId);
    } catch {
      console.error("Error deleting project invitation");
    }
  }
  if (groupId == null && projectId == null && role == null) {
    try {
      await supabase.from("friends_links").insert({
        first_user_id: invitationSenderId,
        second_user_id: userId,
      });
    } catch {
      console.error("Error inserting friend");
    }

    try {
      await supabase.from("invitations").delete().eq("id", invitationId);
    } catch {
      console.error("Error deleting friend request");
    }
  }
};

export const declineInvitation = async (invitationId: string) => {
  const supabase = await createClient();

  try {
    await supabase.from("invitations").delete().eq("id", invitationId);
  } catch {
    console.error("Error deleting invitation");
  }
};

export const fetchUserIdByEmail = async (email: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_user_id_by_email", {
      input_email: email,
    });

    if (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
};

export const getGroupName = async (groupId: string | null) => {
  if (!groupId) {
    return "Group name not found.";
  }
  const supabase = await createClient();
  const { data: groupData, error } = await supabase
    .from("groups")
    .select("name")
    .eq("id", groupId)
    .single();

  if (error) {
    return "Group name not found";
  } else {
    return groupData.name;
  }
};

export const createGroup = async (formData: FormData) => {
  const groupName = formData.get("groupName")?.toString();
  const groupDescription = formData.get("description")?.toString();
  const groupType = formData.get("groupType")?.toString();
  const selectedFriends = JSON.parse(
    formData.get("selectedFriends")?.toString() || "[]"
  );
  const inviteEmails = JSON.parse(
    formData.get("inviteEmails")?.toString() || "[]"
  );

  if (!groupName) {
    throw new Error("El nombre del grupo es requerido");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }
  const creator_id = user.id;

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: groupName,
      description: groupDescription || "",
      creator_id: creator_id,
      is_public: groupType === "public",
    })
    .select()
    .single();

  if (groupError) {
    throw new Error(`Error al crear el grupo: ${groupError.message}`);
  }

  // Creator is automatically added as group_member (trigger in supabase)

  // Invite selected friends
  for (const friendId of selectedFriends) {
    await sendGroupInvitation({
      email: friendId,
      role: "member",
      groupId: group.id,
      senderId: creator_id,
    });
  }

  // Invite by email
  for (const email of inviteEmails) {
    await sendGroupInvitation({
      email: email,
      role: "member",
      groupId: group.id,
      senderId: creator_id,
    });
  }

  // Revalidate the route to update the groups list
  revalidatePath("/dashboard/groups");

  // Redirect to the newly created group page
  redirect(`dashboard/groups/${group.id}`);
};

// Update the sendGroupInvitation function to handle both friend IDs and emails
export const sendGroupInvitation = async ({
  email,
  role,
  groupId,
  senderId,
}: {
  email: string;
  role: string;
  groupId: string;
  senderId: string;
}) => {
  const supabase = await createClient();

  try {
    // Check if the email is actually a user ID (for friends)
    let receiver_id = email;
    if (!email.includes("@")) {
      receiver_id = email; // It's already a user ID
    } else {
      // It's an email, so we need to find the user ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        throw new Error("Usuario no encontrado");
      }
      receiver_id = userData.id;
    }

    const { error: insertError } = await supabase.from("invitations").insert({
      sender_id: senderId,
      receiver_id: receiver_id,
      group_id: groupId,
      status: "pending",
      role: role,
    });

    if (insertError) {
      throw new Error("Error al enviar la invitación");
    }

    return { success: true };
  } catch (error) {
    console.error("Error en sendGroupInvitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

export async function verifyUserRole(
  userId: string | null | undefined,
  projectId: string
) {
  const supabase = await createClient();
  const { data: userRole, error: userError } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .single();
  if (userError || userId == null || userId == undefined) {
    console.error("No se pudo verificar el rol del usuario");
    return null;
  } else {
    return userRole.role;
  }
}
