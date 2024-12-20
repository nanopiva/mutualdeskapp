"use client";
import Image from "next/image";
import styles from "./header.module.css";
import logo from "../../../public/Logo.svg";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

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
        <button
          className={styles.menuButton}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          ☰
        </button>
        {menuOpen && (
          <div
            className={styles.backdrop}
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <ul
          className={`${styles.headerNavbarOptionsContainer} ${
            menuOpen ? styles.menuOpen : styles.menuClosed
          }`}
          role="menu"
        >
          <li className={styles.headerNavbarOption} role="menuitem">
            <Link href="/features" className={styles.navbara}>
              Features
            </Link>
          </li>
          <li className={styles.headerNavbarOption} role="menuitem">
            <Link href="/about" className={styles.navbara}>
              About
            </Link>
          </li>
          <li className={styles.headerNavbarOption} role="menuitem">
            <Link href="/contact" className={styles.navbara}>
              Contact
            </Link>
          </li>
          <li className={styles.menuLoginButton} role="menuitem">
            <Link href="/sign-in" className={styles.loginHeaderButton}>
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
