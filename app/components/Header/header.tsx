import Image from "next/image";
import styles from "./header.module.css";
import logo from "../../../public/Logo.svg";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className={styles.headerContainer}>
      <nav className={styles.headerNavbar}>
        <div className={styles.headerNavbarLogoContainer}>
          <Link href="/" passHref>
            <Image
              className={styles.headerNavbarLogo}
              src={logo}
              alt="Logo de la aplicación"
              width={100}
              height={75}
              priority
            />
          </Link>
        </div>
        <ul className={styles.headerNavbarOptionsContainer}>
          <li className={styles.headerNavbarOption}>
            <Link
              href="/features"
              className={styles.navbara}
              id={styles.headerNavbarFeatures}
            >
              Features
            </Link>
          </li>
          <li className={styles.headerNavbarOption}>
            <Link
              href="/about"
              className={styles.navbara}
              id={styles.headerNavbarAbout}
            >
              About
            </Link>
          </li>
          <li className={styles.headerNavbarOption}>
            <Link
              href="/contact"
              className={styles.navbara}
              id={styles.headerNavbarContact}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/sign-in"
              className={` ${styles.navbara}`}
              id={styles.loginHeaderButton}
            >
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
