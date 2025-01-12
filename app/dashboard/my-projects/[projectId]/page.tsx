import Editor from "../../components/Editor/Editor";
import { getActualUserId } from "@/app/actions";
import styles from "./page.module.css";

type Params = Promise<{ projectId: string }>;

export default async function Project(props: { params: Params }) {
  const params = await props.params;
  const projectId = params.projectId;
  const userId = await getActualUserId();

  return (
    <div className={styles.projectPageContainer}>
      <div className={styles.projectPageInfoContainer}>
        <h1 className={styles.projectPageTitle}></h1>
      </div>
      <Editor projectId={projectId} userId={userId} />;
    </div>
  );
}
