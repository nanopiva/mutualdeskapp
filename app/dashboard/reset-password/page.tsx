import { resetPasswordAction } from "@/app/actions";
import {
  FormMessage,
  Message,
} from "@/app/components/FormMessage/form-message";
import styles from "./page.module.css";
import { useState } from "react";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const isSuccess = "success" in searchParams;

  return (
    <div className={styles.divContainerRPForm}>
      <form className={styles.containerRPForm}>
        <h1 className={styles.titleRPForm}>Reset Password</h1>
        {!isSuccess && (
          <>
            <p className={`${styles.descriptionRPForm} `}>
              Please enter your new password below.
            </p>
            <label htmlFor="password" className={styles.labelRPForm}>
              New Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your new password"
              required
              className={styles.inputRPForm}
            />
            <label htmlFor="confirmPassword" className={styles.labelRPForm}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              required
              className={styles.inputRPForm}
            />
            <button
              formAction={resetPasswordAction}
              className={styles.buttonRPForm}
            >
              Reset Password
            </button>
          </>
        )}
        <FormMessage message={searchParams} />
      </form>
    </div>
  );
}
