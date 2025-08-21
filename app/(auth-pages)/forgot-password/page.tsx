import { forgotPasswordAction } from "@/app/actions/auth/forgot-password";
import {
  FormMessage,
  Message,
} from "@/app/components/FormMessage/form-message";
import Link from "next/link";
import styles from "./page.module.css";

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
  const isSuccess = "success" in searchParams;

  return (
    <main className={styles.main} role="main">
      <section className={styles.card}>
        <h1 className={styles.title}>
          {isSuccess ? "Check your email" : "Reset your password"}
        </h1>
        <p className={styles.subtitle}>
          {isSuccess
            ? "We've sent a password reset link to your email"
            : "Enter your email to receive a password reset link"}
        </p>

        <FormMessage message={searchParams} />

        {!isSuccess && (
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                className={styles.input}
                autoComplete="email"
                aria-required="true"
                aria-describedby="email-help"
              />
              <small id="email-help" className={styles.helpText}>
                We'll never share your email
              </small>
            </div>

            <button
              type="submit"
              className={styles.button}
              formAction={forgotPasswordAction}
            >
              Send reset link
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p className={styles.backToLogin}>
            Remember your password?{" "}
            <Link href="/sign-in" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
