import Header from "../components/Header/header";
import FeaturesNow from "../components/FeaturesNow/featuresnow";
import styles from "./page.module.css";
import FeaturesIncoming from "../components/FeaturesIncoming/featuresincoming";
import IntroFrontPages from "../components/IntroFrontPages/intro";

export default function Features() {
  return (
    <div className={styles.featuresCcontainer}>
      <Header />
      <IntroFrontPages
        title="Features"
        subtitle="What we have and what is coming soon"
      />
      <FeaturesNow />
      <h2 className={styles.titleFeaturesIncoming}>Features incoming</h2>
      <FeaturesIncoming />
    </div>
  );
}
