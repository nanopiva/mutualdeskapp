import styles from "./page.module.css";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className={styles.sidebarAndMainContainer}>
        <Sidebar />
        <main className={styles.mainContentContainer}>{children}</main>
      </div>
    </>
  );
}
