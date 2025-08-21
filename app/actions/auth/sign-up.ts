"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { encodedRedirect } from "@/utils/utils";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();
  const origin = (await headers()).get("origin");

  // Validaciones básicas
  if (!email || !password || !firstName || !lastName) {
    return encodedRedirect("error", "/sign-up", "All fields are required.");
  }

  // Validar formato del email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Please enter a valid email address."
    );
  }

  // Validar contraseña
  const passwordError = validatePassword(password);
  if (passwordError) {
    return encodedRedirect("error", "/sign-up", passwordError);
  }

  // Validar nombres
  if (firstName.length < 2 || lastName.length < 2) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "First and last names must be at least 2 characters long."
    );
  }

  const supabase = await createClient();

  // Registrar usuario en Auth
  const {
    error: authError,
    data: { user },
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    return encodedRedirect(
      "error",
      "/sign-up",
      authError.message || "Error creating account. Please try again."
    );
  }

  // Crear registro en la tabla de usuarios
  const { error: dbError } = await supabase.from("users").insert({
    id: user?.id,
    email,
    first_name: firstName,
    last_name: lastName,
  });

  if (dbError) {
    console.error("DB error:", dbError.message);

    // Intentar eliminar el usuario de auth si falla la creación en la tabla users
    if (user?.id) {
      await supabase.auth.admin.deleteUser(user.id);
    }

    return encodedRedirect(
      "error",
      "/sign-up",
      "Error saving user data. Please contact support."
    );
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email to verify your account."
  );
};

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password needs at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password needs at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password needs at least one number";
  if (!/[!@#$%^&*]/.test(password))
    return "Password needs at least one special character (!@#$%^&*)";
  return null;
}
