"use client";
import Image from "next/image";
import styles from "./header.module.css";
import logo from "../../../public/Logo.svg";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  return (
    <header className={styles.headerContainer}>
      <nav className={styles.headerNavbar}>
        <div className={styles.headerNavbarLogoContainer}>
          <Link href="/" passHref>
            <Image
              className={styles.headerNavbarLogo}
              src={logo}
              alt="MultiDesk Logo"
              width={100}
              height={40}
              priority
            />
          </Link>
        </div>
        <button
          className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span className={styles.menuButtonIcon}></span>
        </button>
        <ul
          className={`${styles.headerNavbarOptionsContainer} ${
            menuOpen ? styles.menuOpen : ""
          }`}
          role="menu"
        >
          <li className={styles.headerNavbarOption} role="menuitem">
            <Link href="/features" className={styles.navLink}>
              Features
            </Link>
          </li>
          <li className={styles.headerNavbarOption} role="menuitem">
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
          </li>
          <li className={styles.headerNavbarOption} role="menuitem">
            <Link href="/contact" className={styles.navLink}>
              Contact
            </Link>
          </li>
          <li className={styles.headerNavbarOption} role="menuitem">
            <Link href="/sign-in" className={styles.loginButton}>
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
