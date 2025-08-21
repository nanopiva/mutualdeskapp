// app/actions/auth/forgot-password.ts
"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString() || "";
  const callbackUrl = formData.get("callbackUrl")?.toString();

  // Validación básica del email
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return encodedRedirect("error", "/forgot-password", "Invalid email format");
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    });

    if (error) {
      console.error("Supabase error:", error);
      // Incluso si hay error, mostramos como éxito por seguridad
      return encodedRedirect(
        "success", // Cambiado de "error" a "success"
        "/forgot-password",
        "If an account with that email exists, you will receive a recovery link shortly."
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
  } catch (error) {
    console.error("Error in password reset:", error);
    // Mostramos como éxito por seguridad
    return encodedRedirect(
      "success", // Cambiado de "error" a "success"
      "/forgot-password",
      "If an account with that email exists, you will receive a recovery link shortly."
    );
  }
};
