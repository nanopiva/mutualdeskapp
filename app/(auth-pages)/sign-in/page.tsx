import { signInAction } from "@/app/actions/auth/sign-in";
import {
  FormMessage,
  Message,
} from "@/app/components/FormMessage/form-message";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Login({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <main className={styles.main} role="main">
      <section className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
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

          <div className={styles.formGroup}>
            <div className={styles.passwordContainer}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <Link
                href="/forgot-password"
                className={styles.link}
                aria-label="Forgot password?"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className={styles.input}
              autoComplete="current-password"
              aria-required="true"
              minLength={8}
            />
          </div>

          <FormMessage message={searchParams} />

          <button
            type="submit"
            className={styles.button}
            formAction={signInAction}
          >
            Sign in
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.registerText}>
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className={styles.registerLink}
              aria-label="Sign up"
            >
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
