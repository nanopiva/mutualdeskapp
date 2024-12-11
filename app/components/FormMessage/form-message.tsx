import styles from "./form-message.module.css";

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className={styles.containerFormMessage}>
      {"success" in message && (
        <div className={`${styles.message} ${styles.successMessage}`}>
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className={`${styles.message} ${styles.errorMessage}`}>
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className={`${styles.message} ${styles.defaultMessage}`}>
          {message.message}
        </div>
      )}
    </div>
  );
}
