"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import styles from "./ResetPassword.module.css";

const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push("The password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("The password must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("The password must contain at least one lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("The password must contain at least one number.");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push(
      "The password must contain at least one special character (!@#$%^&*)."
    );
  }
  return errors;
};

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | string[]>("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const checkTokenAndSignOut = async () => {
      const token = searchParams.get("token");
      if (token) {
        // Sign out the user first to prevent automatic authentication
        await supabase.auth.signOut();

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
        });
        if (error) {
          setError(
            "Invalid or expired token. Please request a new reset link."
          );
          setIsTokenValid(false);
        } else {
          setIsTokenValid(true);
        }
      } else {
        setError(
          "No token provided. Please use the link sent to your email address."
        );
        setIsTokenValid(false);
      }
      setIsLoading(false);
    };

    checkTokenAndSignOut();
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isTokenValid) {
      setError("Cannot reset password with an invalid or expired token.");
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError("Error resetting password: " + error.message);
    } else {
      // Ensure the user is signed out after resetting the password
      await supabase.auth.signOut();
      setMessage(
        "Password successfully reset. Please log in with your new password."
      );
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 2000);
    }
  };

  if (isLoading) {
    return <span className={styles.loader}></span>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.form}>
        <h1 className={styles.title}>Reset Password</h1>

        {typeof error === "string" && <p className={styles.error}>{error}</p>}
        {Array.isArray(error) &&
          error.map((err, index) => (
            <p key={index} className={styles.error}>
              {err}
            </p>
          ))}
        {message && <p className={styles.success}>{message}</p>}

        {isTokenValid ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.passwordRequirements}>
              <h2>Password Requirements</h2>
              <ul>
                <li>At least 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character (!@#$%^&*)</li>
              </ul>
            </div>

            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className={styles.input}
              required
            />

            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={styles.input}
              required
            />

            <button type="submit" className={styles.button}>
              Reset Password
            </button>
          </form>
        ) : (
          <p className={styles.message}>
            If you need to reset your password, please request a new reset link.
          </p>
        )}

        <p className={styles.login}>
          Remembered your password?{" "}
          <Link className={styles.loginLink} href="/sign-in">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
