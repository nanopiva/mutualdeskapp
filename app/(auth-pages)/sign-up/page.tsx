import { signUpAction } from "@/app/actions";
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
    <div className={styles.backgroundContainer}>
      <main className={styles.main}>
        <form className={styles.form}>
          <h1 className={styles.title}>Sign up</h1>

          <p className={styles.register}>
            Already have an account?{" "}
            <Link className={styles.registerLink} href="/sign-in">
              Sign in
            </Link>
          </p>

          {/* Muestra el mensaje de éxito o el formulario */}
          <FormMessage message={searchParams} />

          {!isSuccess && (
            <>
              <label htmlFor="firstName" className={styles.label}>
                First Name
              </label>
              <input
                name="firstName"
                id="firstName"
                placeholder="John"
                required
                className={styles.input}
                aria-label="First name"
              />

              <label htmlFor="lastName" className={styles.label}>
                Last Name
              </label>
              <input
                name="lastName"
                id="lastName"
                placeholder="Doe"
                required
                className={styles.input}
                aria-label="Last name"
              />

              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                name="email"
                id="email"
                placeholder="you@example.com"
                required
                className={styles.input}
                autoComplete="email"
                aria-label="Email address"
              />

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

              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                className={styles.input}
                type="password"
                name="password"
                id="password"
                placeholder="Your password"
                required
                autoComplete="new-password"
                aria-label="Password"
              />

              <button className={styles.button} formAction={signUpAction}>
                Sign up
              </button>
            </>
          )}
        </form>
      </main>
    </div>
  );
}
