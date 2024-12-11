import { signUpAction } from "@/app/actions";
import {
  FormMessage,
  Message,
} from "@/app/components/FormMessage/form-message";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  {
    /*
  if ("message" in searchParams) {
    return (
      <div className={styles.formMessageSUForm}>
        <FormMessage message={searchParams} />
      </div>
    );
  }
  */
  }
  const isSuccess = "success" in searchParams;

  return (
    <div className={styles.divContainerSUForm}>
      <form className={styles.containerSUForm}>
        <h1 className={styles.signUpTitleSUForm}>Sign up</h1>
        <p className={styles.alreadyAccountTextSUForm}>
          Already have an account?{" "}
          <Link className={styles.signInLinkSUForm} href="/sign-in">
            Sign in
          </Link>
        </p>
        {!isSuccess && (
          <>
            <div className={styles.inputsContainerSUForm}>
              <label htmlFor="email" className={styles.emailLabelSUForm}>
                Email
              </label>
              <input
                name="email"
                id="email"
                placeholder="you@example.com"
                required
                autoComplete="true"
                className={styles.emailInputSUForm}
              />

              <label
                htmlFor="first_name"
                className={styles.firstNameLabelSUForm}
              >
                First Name
              </label>
              <input
                name="first_name"
                id="first_name"
                autoComplete="true"
                required
                className={styles.firstNameInputSUForm}
              />

              <label htmlFor="last_name" className={styles.lastNameLabelSUForm}>
                Last Name
              </label>
              <input
                name="last_name"
                id="last_name"
                autoComplete="true"
                required
                className={styles.lastNameInputSUForm}
              />

              <label htmlFor="password" className={styles.passwordLabelSUForm}>
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Your password"
                minLength={6}
                required
                className={styles.passwordInputSUForm}
              />
            </div>

            <button className={styles.buttonSUForm} formAction={signUpAction}>
              Sign up
            </button>
          </>
        )}

        <FormMessage message={searchParams} />
      </form>
    </div>
  );
}
