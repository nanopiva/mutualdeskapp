"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UUID } from "crypto";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("first_name")?.toString();
  const lastName = formData.get("last_name")?.toString();

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password || !firstName || !lastName) {
    return { error: "All fields are required to login" };
  }

  // Guarda el usuario en auth.users
  const { error, data: user } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  // Guarda el usuario tambien, pero en la tabla de public.users
  const { error: errorSavingUser } = await supabase.from("users").insert({
    id: user.user?.id,
    email,
    first_name: firstName,
    last_name: lastName,
  });

  if (errorSavingUser) {
    console.error(errorSavingUser);
    // localhost:3000/sign-up?error=errorSavingUser.message
    return encodedRedirect("error", "/sign-up", errorSavingUser.message);
  }

  if (error) {
    console.error(error.code + " " + error.message);
    // localhost:3000/sign-up?error=error.message
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
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
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/dashboard/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/dashboard/reset-password", "Password updated");
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

export const createGroup = async (formData: FormData) => {
  const groupName = formData.get("groupName")?.toString();
  const groupDescription = formData.get("groupDescription")?.toString();

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

  //Se crea el grupo

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: groupName,
      description: groupDescription || "",
      creator_id: creator_id,
    })
    .select()
    .single();

  if (groupError) {
    throw new Error(`Error al crear el grupo: ${groupError.message}`);
  }

  // Añadir al creador como miembro admin
  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: creator_id,
    role: "admin",
  });

  if (memberError) {
    // Si falla la adición del miembro, eliminamos el grupo creado
    await supabase.from("groups").delete().eq("id", group.id);
    throw new Error(
      `Error al añadir al creador como miembro: ${memberError.message}`
    );
  }

  // Revalidar la ruta para actualizar la lista de grupos
  revalidatePath("/dashboard/groups");

  // Redirigir a la página del grupo recién creado
  redirect(`dashboard/groups/${group.id}`);
};

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

export const sendGroupInvitation = async (formData: FormData) => {
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

export const createProject = async (formData: FormData) => {
  const projectName = formData.get("projectName")?.toString();
  const projectDescription = formData.get("projectDescription")?.toString();
  const isPublic = formData.get("isPublic") === "on";
  const group = formData.get("group")?.toString();
  let groupId;
  if (group === "none") {
    groupId = null;
  } else {
    groupId = group;
  }

  console.log(projectName, projectDescription, isPublic, group);

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No se encontro el usuario");
    return;
  }

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .insert({
      name: projectName,
      description: projectDescription,
      is_public: isPublic,
      author_id: user.id,
      group_id: groupId,
    })
    .select("id");
  // seleccionamos el id del proyecto creado
  if (projectError) {
    console.error("Error al insertar el proyecto");
    return;
  }

  const projectId = projectData?.[0]?.id;
  console.log(projectId);
  if (projectId === null) {
    console.error("Error generando Id de proyecto");
    return;
  }

  const { error: projectMembersError } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: user.id,
      group_id: groupId,
      role: "admin",
    });

  if (projectMembersError) {
    console.error(
      "Error insertando el miembro al proyecto",
      projectMembersError
    );
    return;
  }

  //En caso de que sea un proyecto en grupo, buscaremos a los integrantes y el rol que tengan en el grupo y los añadimos al proyecto con ese rol.
  if (groupId != null) {
    const { data: otherMembers, error: otherMembersError } = await supabase
      .from("group_members")
      .select("user_id,role")
      .eq("group_id", groupId)
      .neq("role", "admin");

    if (otherMembersError) {
      console.error("Error obteniendo al resto de los miembros");
      return;
    }
    try {
      const insertPromises = otherMembers.map(async (member) => {
        const { error: insertError } = await supabase
          .from("project_members")
          .insert({
            project_id: projectId, // ID del proyecto
            user_id: member.user_id, // ID del usuario
            role: member.role,
          });

        if (insertError) {
          console.error(
            `Error al agregar usuario ${user.id} al proyecto:`,
            insertError
          );
        }
      });

      await Promise.all(insertPromises);

      console.log(
        "Todos los usuarios fueron agregados al proyecto correctamente."
      );
    } catch (error) {
      console.error(
        "Error al agregar usuarios a la tabla project_members:",
        error
      );
      throw new Error("Error al agregar usuarios al proyecto.");
    }
  }
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
  newContent: JSON
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

export const listenToRealtimeUpdates = async (
  projectId: string,
  onUpdate: (content: any) => void
) => {
  const supabase = await createClient();
  const subscription = supabase
    .channel("realtime:projects")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "projects",
        filter: `id=eq.${projectId}`,
      },
      (payload) => {
        console.log("Cambio detectado en Realtime:", payload);
        onUpdate(payload.new.content);
      }
    )
    .subscribe();

  // Devolver la función de limpieza directamente
  return () => {
    supabase.removeChannel(subscription);
  };
};
