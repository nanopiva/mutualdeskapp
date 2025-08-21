import { signUpAction } from "@/app/actions/auth/sign-up";
import {
  FormMessage,
  Message,
} from "@/app/components/FormMessage/form-message";
import Link from "next/link";
import styles from "./page.module.css";

export default async function SignUp(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const isSuccess = "success" in searchParams && Boolean(searchParams.success);

  return (
    <main className={styles.main} role="main">
      <section className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join us to get started</p>

        <FormMessage message={searchParams} />

        {!isSuccess && (
          <form className={styles.form} action={signUpAction}>
            <div className={styles.nameFields}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  className={styles.input}
                  required
                  minLength={2}
                  autoComplete="given-name"
                  aria-required="true"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  className={styles.input}
                  required
                  minLength={2}
                  autoComplete="family-name"
                  aria-required="true"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className={styles.input}
                required
                autoComplete="email"
                aria-required="true"
                aria-describedby="email-help"
              />
              <small id="email-help" className={styles.helpText}>
                We'll never share your email
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={8}
                autoComplete="new-password"
                aria-required="true"
              />
              <div className={styles.passwordRequirements}>
                <p className={styles.requirementsTitle}>
                  Password Requirements:
                </p>
                <ul className={styles.requirementsList}>
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                  <li>One special character (!@#$%^&*)</li>
                </ul>
              </div>
            </div>

            <button type="submit" className={styles.button}>
              Sign Up
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p className={styles.loginPrompt}>
            Already have an account?{" "}
            <Link href="/sign-in" className={styles.loginLink}>
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
