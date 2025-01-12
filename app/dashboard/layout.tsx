"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className={styles.sidebarAndMainContainer}>
        <Sidebar isOpen={isSidebarOpen} />
        <main className={styles.mainContentContainer}>{children}</main>
      </div>
    </>
  );
}
