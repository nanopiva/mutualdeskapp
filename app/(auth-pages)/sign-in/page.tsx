import { signInAction } from "@/app/actions";
import {
  FormMessage,
  Message,
} from "@/app/components/FormMessage/form-message";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <main className={styles.main}>
      <form className={styles.form}>
        <h1 className={styles.title}>Sign in</h1>

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

        <div className={styles.passwordContainer}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <Link className={styles.link} href="/forgot-password">
            Forgot Password?
          </Link>
        </div>
        <input
          className={styles.input}
          type="password"
          name="password"
          id="password"
          placeholder="Your password"
          required
          autoComplete="current-password"
          aria-label="Password"
        />

        <FormMessage message={searchParams} />

        <button className={styles.button} formAction={signInAction}>
          Sign in
        </button>

        <p className={styles.register}>
          Don't have an account?{" "}
          <Link className={styles.registerLink} href="/sign-up">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
