import { signInAction } from "@/app/actions";
import {
  FormMessage,
  Message,
} from "@/app/components/FormMessage/form-message";
import styles from "./page.module.css";

import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <div className={styles.divContainerSIForm}>
      <form className={styles.containerSIForm}>
        <h1 className={styles.signInTitleSIForm}>Sign in</h1>
        <label htmlFor="email" className={styles.emailLabelSIForm}>
          Email
        </label>
        <input
          name="email"
          id="email"
          placeholder="you@example.com"
          required
          className={styles.emailInputSIForm}
          autoComplete="true"
        />
        <div className={styles.passwordContainerSIForm}>
          <label htmlFor="password" className={styles.passwordLaberSIForm}>
            Password
          </label>
          <Link className={styles.fPasswordLinkSIForm} href="/forgot-password">
            Forgot Password?
          </Link>
        </div>
        <input
          className={styles.passwordInputSIForm}
          type="password"
          name="password"
          id="password"
          placeholder="Your password"
          required
        />
        <FormMessage message={searchParams} />

        <button className={styles.buttonSIForm} formAction={signInAction}>
          Sign in
        </button>
        <p className={styles.registerTextSIForm}>
          Don't have an account?{" "}
          <Link className={styles.registerLinkSIForm} href="/sign-up">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
