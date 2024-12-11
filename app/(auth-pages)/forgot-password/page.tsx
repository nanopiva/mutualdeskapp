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
    <div className={styles.divContainerFPForm}>
      <form className={styles.containerFPForm}>
        <div className={styles.headerFPForm}>
          <h1 className={styles.titleFPForm}>Reset Password</h1>
          <p className={styles.alreadyAccountTextFPForm}>
            Already have an account?{" "}
            <Link className={styles.signInLinkFPForm} href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>

        <div className={styles.inputsContainerFPForm}>
          {!isSuccess && (
            <>
              <label htmlFor="email" className={styles.emailLabelFPForm}>
                Email
              </label>
              <input
                name="email"
                placeholder="you@example.com"
                required
                className={styles.emailInputFPForm}
              />
              <button
                className={styles.buttonFPForm}
                formAction={forgotPasswordAction}
              >
                Reset Password
              </button>
            </>
          )}

          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
