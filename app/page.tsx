import Header from "./components/Header/header";
import MainFront from "./components/MainFront/mainfront";
import styles from "./page.module.css";
import "@/app/globals.css";

export default function Home() {
  return (
    <div className={styles.mainContainer}>
      <Header />
      <MainFront />
    </div>
  );
}
