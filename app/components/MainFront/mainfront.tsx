import styles from "./mainfront.module.css";
import Image from "next/image";
import mainImage from "../../../public/frontImage.jpg";
import Link from "next/link";

export default function Mainfront() {
  return (
    <div className={styles.mainfrontContainer}>
      <div className={styles.mainfrontDescription}>
        <span className={styles.subtitleDescription}>
          WORKING IN A TEAM WAS NEVER SO EASY
        </span>
        <h1 className={styles.titleDescription}>
          The most simple way to organize group works
        </h1>
        <p className={styles.textDescription}>
          Sometimes group works can be annoying and difficult to handle. We
          offer a solution based in the concept of simplicity to solve any
          problems you may have in the organization of any group job. Enjoy the
          live editor, chat and many other funcionalities coming soon!
        </p>
        <div className={styles.loginContainerDescription}>
          <Link
            className={`${styles.loginButtonDescription} ${styles.buttonDescription}`}
            href="/sign-in"
          >
            Login
          </Link>
          <Link
            className={`${styles.signupButtonDescription} ${styles.buttonDescription}`}
            href="/sign-up"
          >
            Sign Up
          </Link>
        </div>
      </div>
      <div className={styles.mainfrontImageContainer}>
        <Image
          className={styles.mainfrontImage}
          src={mainImage}
          alt="Ilustrative picture"
        />
      </div>
    </div>
  );
}
