import { resetPasswordAction } from "@/app/actions/auth/reset-password";
import { createClient } from "@/utils/supabase/server";
import { FormMessage } from "@/app/components/FormMessage/form-message";
import Link from "next/link";
import styles from "./page.module.css";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: {
    token?: string;
    error?: string;
    success?: string;
    message?: string;
  };
}) {
  const token = searchParams.token;
  let tokenValid = false;
  let error = searchParams.error || "";
  let message = searchParams.message || "";

  if (token) {
    const supabase = await createClient();
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });
      tokenValid = !verifyError;
    } catch (err) {
      error = "Invalid or expired token";
    }
  }

  return (
    <main className={styles.main} role="main">
      <section className={styles.card}>
        <h1 className={styles.title}>Reset Your Password</h1>
        <p className={styles.subtitle}>
          {token && tokenValid
            ? "Enter your new password"
            : token
              ? "Invalid or expired token"
              : "No token provided"}
        </p>

        <FormMessage
          message={{
            error: error || undefined,
            success: searchParams.success || undefined,
            message: message,
          }}
        />

        {token && tokenValid ? (
          <form className={styles.form} action={resetPasswordAction}>
            <input type="hidden" name="token" value={token} />

            <div className={styles.passwordRequirements}>
              <p className={styles.requirementsTitle}>Password Requirements:</p>
              <ul className={styles.requirementsList}>
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (!@#$%^&*)</li>
              </ul>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={8}
                aria-required="true"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={8}
                aria-required="true"
              />
            </div>

            <button type="submit" className={styles.button}>
              Reset Password
            </button>
          </form>
        ) : (
          <p className={styles.message}>
            {token
              ? "Please request a new password reset link from your email"
              : "Please use the link from your email to reset your password"}
          </p>
        )}

        <div className={styles.footer}>
          <p className={styles.loginPrompt}>
            Remembered your password?{" "}
            <Link href="/sign-in" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
