import GridItemFeatures from "../GridItemFeatures/griditemfeatures";
import styles from "./featuresincoming.module.css";
import MicIcon from "../../../public/MicDisabledIcon.svg";
import ScreenShareDisabledIcon from "../../../public/ScreenShareDisabledIcon.svg";

export default function FeaturesIncoming() {
  return (
    <div className={styles.featuresIncomingContainer}>
      <div className={styles.featuresIncomingGridContainer}>
        <GridItemFeatures
          image={MicIcon}
          alt="Mic disabled icon"
          title="Live audio"
          description=""
        />
        <GridItemFeatures
          image={ScreenShareDisabledIcon}
          alt="Screen share disabled icon"
          title="Screen share"
          description=""
        />
      </div>
    </div>
  );
}
