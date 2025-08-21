"use client";

import styles from "./Header.module.css";
import logo from "@/public/Logo.svg";
import Link from "next/link";
import Image from "next/image";
import { Bungee_Inline } from "next/font/google";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import AvatarIcon from "../AvatarIcon/AvatarIcon";
import { Menu } from "lucide-react";

const bungee = Bungee_Inline({
  subsets: ["latin"],
  weight: "400",
});

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePictureURL, setProfilePictureURL] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        const { data: profileData } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setFirstName(profileData.first_name || "");
          setLastName(profileData.last_name || "");
        }

        const { data: files, error } = await supabase.storage
          .from("profilepictures")
          .list(user.id);

        if (error) {
          console.error("Error listing profile pictures:", error);
        } else if (files && files.length > 0) {
          const profileFile = files.find((f) => f.name.startsWith("profile."));
          if (profileFile) {
            const url = `https://kckpcncvhqcxfvzinkto.supabase.co/storage/v1/object/public/profilepictures/${user.id}/${profileFile.name}?t=${Date.now()}`;
            setProfilePictureURL(url);
          }
        }
      }
    };

    fetchUserData();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.headerNav}>
      <div className={styles.headerNavbarLogoContainer}>
        <button className={styles.menuButton} onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <Link href="/dashboard" passHref>
          <Image
            className={styles.headerNavbarLogo}
            src={logo}
            alt="App logo"
            width={90}
            height={55}
          />
        </Link>
      </div>
      <Link
        href="/dashboard"
        className={`${bungee.className} ${styles.headerTitle}`}
      >
        MutualDesk
      </Link>
      <div className={styles.avatarContainer}>
        <button
          className={styles.avatarButton}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="User menu"
        >
          <AvatarIcon
            pictureURL={profilePictureURL}
            firstLetterBackup={firstName.charAt(0)}
            secondLetterBackup={lastName.charAt(0)}
            size={60}
          />
        </button>

        {isMenuOpen && (
          <>
            <div className={styles.menuBackdrop} onClick={closeMenu}></div>
            <div className={styles.dropdownMenu}>
              <div className={styles.menuHeader}>
                <span className={styles.menuTitle}>My Account</span>
              </div>
              <div className={styles.menuSeparator}></div>
              <Link href="/dashboard/profile" onClick={closeMenu}>
                <div className={styles.menuItem}>Profile</div>
              </Link>
              <div className={`${styles.menuItem} ${styles.disabled}`}>
                Billing
                <div className={styles.tooltip}>Not available yet</div>
              </div>
              <div className={`${styles.menuItem} ${styles.disabled}`}>
                Team
                <div className={styles.tooltip}>Not available yet</div>
              </div>
              <div className={`${styles.menuItem} ${styles.disabled}`}>
                Subscription
                <div className={styles.tooltip}>Not available yet</div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
