"use client";

import styles from "./Header.module.css";
import logo from "@/public/Logo.svg";
import Link from "next/link";
import Image from "next/image";
import { Bungee_Inline } from "next/font/google";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import AvatarIcon from "../AvatarIcon/AvatarIcon";
import { Menu } from "lucide-react"; // Importa el icono de hamburguesa

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
        }
      }
    };

    fetchUserData();
  }, []);

  const profilePictureURL = user
    ? `https://kckpcncvhqcxfvzinkto.supabase.co/storage/v1/object/public/profilepictures/${user.id}/profile.jpg`
    : "";

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
            alt="Logo de la aplicación"
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
      <DropdownMenu>
        <DropdownMenuTrigger>
          <AvatarIcon
            pictureURL={profilePictureURL}
            firstLetterBackup={firstName.charAt(0)}
            secondLetterBackup={lastName.charAt(0)}
            size={60}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/dashboard/profile">
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </Link>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
