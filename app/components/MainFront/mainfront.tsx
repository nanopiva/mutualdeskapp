import styles from "./mainfront.module.css";
import Image from "next/image";
import mainImage from "../../../public/frontImage.jpg";

export default function mainfront() {
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
          <a
            className={`${styles.loginButtonDescription} ${styles.buttonDescription}`}
          >
            Login
          </a>
          <a
            className={`${styles.signupButtonDescription} ${styles.buttonDescription}`}
          >
            Sign Up
          </a>
        </div>
      </div>
      <div className={styles.mainfrontImageContainer}>
        <Image
          className={styles.mainfrontImage}
          src={mainImage}
          alt="Picture of the author"
          // blurDataURL="data:..." automatically provided
          // placeholder="blur" // Optional blur-up while loading
          priority
        />
      </div>
    </div>
  );
}
