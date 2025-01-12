import { forgotPasswordAction } from "@/app/actions";
import {
  FormMessage,
  Message,
} from "@/app/components/FormMessage/form-message";
import Link from "next/link";
import styles from "./page.module.css";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const isSuccess = "success" in searchParams;

  return (
    <main className={styles.container}>
      <form className={styles.form}>
        <header className={styles.header}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtext}>
            Already have an account?{" "}
            <Link className={styles.link} href="/sign-in">
              Sign in
            </Link>
          </p>
        </header>

        <div className={styles.formBody}>
          {!isSuccess && (
            <>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                className={styles.input}
              />
              <button
                className={styles.button}
                formAction={forgotPasswordAction}
              >
                Reset Password
              </button>
            </>
          )}
          <FormMessage message={searchParams} />
        </div>
      </form>
    </main>
  );
}
