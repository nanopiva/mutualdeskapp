"use client";
import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import Image from "next/image";
import logo from "./files-svgrepo-com.svg";
import friendsLogo from "./users-friends-svgrepo-com.svg";
import groupsLogo from "./group-svgrepo-com.svg";
import settingsLogo from "./settings-svgrepo-com.svg";
import inviteLogo from "./invite-svgrepo-com.svg";
import logoutLogo from "./logout-svgrepo-com.svg";
import downArrow from "./down-arrow-multimedia-option-svgrepo-com.svg";
import { createClient } from "@/utils/supabase/client";
import { getUserGroups } from "@/app/actions";

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const [isGroupsOpen, setIsGroupsOpen] = useState(false); // Estado del acordeón de grupos
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Cargar los grupos del usuario al montar el componente
    const fetchGroups = async () => {
      const userGroups = await getUserGroups();
      setGroups(userGroups || []);
    };
    fetchGroups();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error.message);
        alert("Hubo un problema al cerrar sesión. Inténtalo nuevamente.");
      } else {
        console.log("Sesión cerrada exitosamente");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Error inesperado durante el logout:", err);
    }
  };

  return (
    <nav className={`${styles.sidebarContainer} ${isOpen ? styles.open : ""}`}>
      {/* Navegación Principal */}
      <Link
        href="/dashboard/my-projects"
        className={styles.itemSidebarContainer}
      >
        <Image src={logo} alt="Logo of My Projects" width={35} height={35} />
        <span className={styles.itemSidebarTitle}>My Projects</span>
      </Link>

      {/* Grupos */}
      <div className={styles.groupButton}>
        <Link
          href="/dashboard/groups"
          className={`${styles.itemSidebarContainer} ${styles.groupSidebarItem}`}
        >
          <Image src={groupsLogo} alt="Logo of Groups" width={35} height={35} />
          <span className={styles.itemSidebarTitle}>Groups</span>
        </Link>
        <button
          className={styles.arrowButton}
          onClick={() => setIsGroupsOpen(!isGroupsOpen)}
          aria-label="Toggle Groups Menu"
        >
          <Image
            src={downArrow}
            alt="Toggle groups menu"
            width={20}
            height={20}
            className={`${styles.arrowIcon} ${isGroupsOpen ? styles.arrowIconOpen : ""}`}
          />
        </button>
      </div>

      {/* Dropdown de grupos */}
      {isGroupsOpen && (
        <div className={styles.groupsDropdown}>
          <Link
            href="/dashboard/groups/create-group"
            className={styles.createGroupButton}
          >
            + Create Group
          </Link>
          <ul className={styles.groupList}>
            {groups.length > 0 ? (
              groups.map((group) => (
                <li key={group.id} className={styles.groupItem}>
                  <Link href={`/dashboard/groups/${group.id}`}>
                    {group.name}
                  </Link>
                </li>
              ))
            ) : (
              <li className={styles.groupItem}>No groups found</li>
            )}
          </ul>
        </div>
      )}

      {/* Otros botones del sidebar */}
      <Link href="/dashboard/friends" className={styles.itemSidebarContainer}>
        <Image src={friendsLogo} alt="Logo of Friends" width={35} height={35} />
        <span className={styles.itemSidebarTitle}>Friends</span>
      </Link>
      <Link
        href="/dashboard/invitations"
        className={styles.itemSidebarContainer}
      >
        <Image
          src={inviteLogo}
          alt="Logo of Invitations"
          width={35}
          height={35}
        />
        <span className={styles.itemSidebarTitle}>Invitations</span>
      </Link>
      {/*
        <Link href="/dashboard/settings" className={styles.itemSidebarContainer}>
          <Image
            src={settingsLogo}
            alt="Logo of Settings"
            width={35}
            height={35}
          />
          <span className={styles.itemSidebarTitle}>Settings</span>
        </Link>
      */}
      <button
        className={styles.itemSidebarContainer}
        id={styles.logoutItem}
        onClick={handleLogout}
      >
        <Image src={logoutLogo} alt="Logo of Logout" width={35} height={35} />
        <span className={styles.itemSidebarTitle}>Logout</span>
      </button>
    </nav>
  );
}
