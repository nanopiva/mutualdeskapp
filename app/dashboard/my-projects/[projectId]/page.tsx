import Editor from "../../components/Editor/Editor";

export default async function Project({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;
  return <Editor projectId={projectId} />;
}
