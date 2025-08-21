import FeaturesNow from "../components/FeaturesNow/featuresnow";
import styles from "./page.module.css";
import FeaturesIncoming from "../components/FeaturesIncoming/featuresincoming";
import IntroFrontPages from "../components/IntroFrontPages/intro";

export default function Features() {
  return (
    <main className={styles.featuresContainer}>
      <IntroFrontPages
        title="Powerful Collaboration Tools"
        subtitle="Discover what makes MultiDesk the best choice for team productivity"
      />
      <FeaturesNow />
      <FeaturesIncoming />
    </main>
  );
}
