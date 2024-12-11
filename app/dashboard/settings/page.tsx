import styles from "./page.module.css";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className={styles.settingsPanelContainer}>
      <h1 className={styles.titleSettings}>Settings of the app</h1>
      <div className={styles.settingsThemeContainer}>
        <h2 className={styles.subtitleSettings}>Theme settings:</h2>
        <span className={styles.darkModeSwitchButton}>Dark mode</span>
        <Switch />
      </div>
    </div>
  );
}
