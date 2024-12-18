import Editor from "../../components/Editor/Editor";
import { getActualUserId } from "@/app/actions";

type Params = Promise<{ projectId: string }>;

export default async function Project(props: { params: Params }) {
  const params = await props.params;
  const projectId = params.projectId;
  const userId = await getActualUserId();

  return <Editor projectId={projectId} userId={userId} />;
}
