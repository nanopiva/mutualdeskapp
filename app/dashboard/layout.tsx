"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import styles from "./page.module.css";
import EditorHeader from "./components/EditorHeader/EditorHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (pathname?.startsWith("/dashboard/my-projects/")) {
    return (
      <div className={`${styles.editorLayout} print:hidden`}>
        <EditorHeader onBack={() => router.push("/dashboard/my-projects")} />
        <div className={styles.editorContent}>{children}</div>
      </div>
    );
  }

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
