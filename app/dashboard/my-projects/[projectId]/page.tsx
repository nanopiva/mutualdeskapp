import Editor from "../../components/Editor/Editor";

type Params = Promise<{ projectId: string }>;

export default async function Project(props: { params: Params }) {
  const params = await props.params;
  const projectId = params.projectId;

  return <Editor projectId={projectId} />;
}
