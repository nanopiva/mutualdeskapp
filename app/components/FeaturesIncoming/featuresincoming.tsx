import GridItemFeatures from "../GridItemFeatures/griditemfeatures";
import styles from "./featuresincoming.module.css";
import { Mic, Monitor, History, Code, Zap, GitMerge } from "lucide-react";

export default function FeaturesIncoming() {
  return (
    <section className={styles.featuresIncomingSection}>
      <div className={styles.featuresIncomingContainer}>
        <h2 className={styles.sectionTitle}>Coming Soon</h2>
        <p className={styles.sectionSubtitle}>
          Exciting features we're working on
        </p>

        <div className={styles.featuresIncomingGridContainer}>
          <GridItemFeatures
            icon={<Mic size={48} />}
            title="Voice Collaboration"
            description="Integrated voice chat for real-time discussions"
            comingSoon={true}
          />
          <GridItemFeatures
            icon={<Monitor size={48} />}
            title="Screen Sharing"
            description="Share your screen directly within the editor"
            comingSoon={true}
          />
          <GridItemFeatures
            icon={<History size={48} />}
            title="Version History"
            description="Track changes and revert to previous document versions"
            comingSoon={true}
          />
          <GridItemFeatures
            icon={<Code size={48} />}
            title="Code Collaboration"
            description="Real-time collaborative coding with syntax highlighting"
            comingSoon={true}
          />
          <GridItemFeatures
            icon={<Zap size={48} />}
            title="AI Assistance"
            description="Smart suggestions and auto-completion powered by AI"
            comingSoon={true}
          />
          <GridItemFeatures
            icon={<GitMerge size={48} />}
            title="Git Integration"
            description="Connect with your GitHub repositories directly"
            comingSoon={true}
          />
        </div>
      </div>
    </section>
  );
}
