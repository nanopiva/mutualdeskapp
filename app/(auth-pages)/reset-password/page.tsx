import { resetPasswordAction } from "@/app/actions/auth/reset-password";
import { createClient } from "@/utils/supabase/server";
import {
  FormMessage,
  type Message,
} from "@/app/components/FormMessage/form-message";
import Link from "next/link";
import styles from "./page.module.css";

type SP = Record<string, string | string[] | undefined>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const raw: SP = (await searchParams) ?? {};

  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const token = pick(raw.token);
  const spError = pick(raw.error);
  const spSuccess = pick(raw.success);
  const spMessage = pick(raw.message);

  let tokenValid = false;
  let errorText = spError || "";
  let infoText = spMessage || "";

  if (token) {
    const supabase = await createClient();
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });
      tokenValid = !verifyError;
      if (verifyError && !errorText) {
        errorText = "Invalid or expired token";
      }
    } catch {
      tokenValid = false;
      if (!errorText) errorText = "Invalid or expired token";
    }
  }

  let msg: Message | null = null;
  if (errorText) msg = { error: errorText };
  else if (spSuccess) msg = { success: spSuccess };
  else if (infoText) msg = { message: infoText };

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

        {msg ? <FormMessage message={msg} /> : null}

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
