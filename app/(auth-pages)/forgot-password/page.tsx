import { forgotPasswordAction } from "@/app/actions/auth/forgot-password";
import {
  FormMessage,
  type Message,
} from "@/app/components/FormMessage/form-message";
import Link from "next/link";
import styles from "./page.module.css";

type SP = Record<string, string | string[] | undefined>;

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const raw: SP = (await searchParams) ?? {};

  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const success = pick(raw.success);
  const error = pick(raw.error);
  const info = pick(raw.message);

  let msg: Message | null = null;
  if (success) msg = { success };
  else if (error) msg = { error };
  else if (info) msg = { message: info };

  const isSuccess = Boolean(success);

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

        {msg ? <FormMessage message={msg} /> : null}

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
