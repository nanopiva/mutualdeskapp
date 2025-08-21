import styles from "./featuresnow.module.css";
import GridItemFeatures from "../GridItemFeatures/griditemfeatures";
import {
  Users,
  MessageSquare,
  Share2,
  Cloud,
  Lock,
  Tag,
  Bell,
  GitBranch,
} from "lucide-react";

export default function FeaturesNow() {
  return (
    <section className={styles.featuresNowSection}>
      <div className={styles.featuresNowContainer}>
        <h2 className={styles.sectionTitle}>Current Features</h2>
        <p className={styles.sectionSubtitle}>
          Everything you need for seamless collaboration
        </p>

        <div className={styles.featuresNowGridContainer}>
          <GridItemFeatures
            icon={<Users size={48} />}
            title="Real-time Collaboration"
            description="Work simultaneously with your team on documents with instant updates"
          />
          <GridItemFeatures
            icon={<Lock size={48} />}
            title="Project Privacy"
            description="Create private workspaces or public projects with customizable permissions"
          />
          <GridItemFeatures
            icon={<MessageSquare size={48} />}
            title="Integrated Chat"
            description="Communicate with your team without leaving the editor"
          />
          <GridItemFeatures
            icon={<Share2 size={48} />}
            title="Easy Sharing"
            description="Invite collaborators with shareable links and set access levels"
          />
          <GridItemFeatures
            icon={<Cloud size={48} />}
            title="Cloud Storage"
            description="Automatic saves ensure you never lose your work"
          />
          <GridItemFeatures
            icon={<Tag size={48} />}
            title="Mention System"
            description="Tag team members in comments to get their attention"
          />
        </div>
      </div>
    </section>
  );
}
