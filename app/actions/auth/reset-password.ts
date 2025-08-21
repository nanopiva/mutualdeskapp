"use server";

import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";

export const resetPasswordAction = async (formData: FormData) => {
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Both password fields are required"
    );
  }

  if (newPassword !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match"
    );
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return encodedRedirect("error", "/reset-password", passwordError);
  }

  const supabase = await createClient();

  try {
    // Verify token again for security
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });

    if (verifyError) {
      return encodedRedirect(
        "error",
        "/reset-password",
        "Invalid or expired token. Please request a new reset link."
      );
    }

    // Update user password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return encodedRedirect(
        "error",
        "/reset-password",
        "Error resetting password. Please try again."
      );
    }

    // Sign out all sessions
    await supabase.auth.signOut();

    return encodedRedirect(
      "success",
      "/sign-in",
      "Password successfully reset. Please log in with your new password."
    );
  } catch (err) {
    console.error("Reset password error:", err);
    return encodedRedirect(
      "error",
      "/reset-password",
      "An unexpected error occurred. Please try again."
    );
  }
};

// Helper function for password validation
function validatePassword(password: string): string | null {
  const requirements = [
    {
      regex: /^.{8,}$/,
      message: "Password must be at least 8 characters",
    },
    {
      regex: /[A-Z]/,
      message: "Password must contain an uppercase letter",
    },
    {
      regex: /[a-z]/,
      message: "Password must contain a lowercase letter",
    },
    {
      regex: /[0-9]/,
      message: "Password must contain a number",
    },
    {
      regex: /[!@#$%^&*]/,
      message: "Password must contain a special character (!@#$%^&*)",
    },
  ];

  for (const req of requirements) {
    if (!req.regex.test(password)) {
      return req.message;
    }
  }

  return null;
}
