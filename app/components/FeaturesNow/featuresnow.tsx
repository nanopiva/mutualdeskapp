import styles from "./featuresnow.module.css";
import GridItemFeatures from "../GridItemFeatures/griditemfeatures";
import EditIcon from "../../../public/EditIcon.svg";
import ChatIcon from "../../../public/ChatIcon.svg";
import ShareIcon from "../../../public/ShareIcon.svg";
import SaveIcon from "../../../public/SaveIcon.svg";

export default function FeaturesNow() {
  return (
    <div className={styles.featuresNowContainer}>
      <h3 className={styles.featuresNowTitle}>
        What are the current features we offer?
      </h3>
      <div className={styles.featuresNowGridContainer}>
        <GridItemFeatures
          image={EditIcon}
          alt="Edit icon"
          title="Live edition"
          description="You can edit your documents simultaneously with members of your group"
        />
        <GridItemFeatures
          image={ChatIcon}
          alt="Chat icon"
          title="Chat"
          description="A chat is provided to communicate with any member of the group"
        />
        <GridItemFeatures
          image={ShareIcon}
          alt="Share icon"
          title="Share your work easily"
          description="You can invite any person to edit or watch your work only sending them a link"
        />
        <GridItemFeatures
          image={SaveIcon}
          alt="Save icon"
          title="Cloud save"
          description="Save your work in the cloud to not loss any progress made"
        />
      </div>
    </div>
  );
}
