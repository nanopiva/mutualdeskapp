import AddMemberToProject from "../../components/AddMemberToProject/AddMemberToProject";

export default async function AddMemberPage({
  params,
}: {
  params: Promise<{ "project-id": string }>;
}) {
  // Await the params promise
  const resolvedParams = await params;
  const projectId = resolvedParams["project-id"];

  return <AddMemberToProject projectId={projectId} />;
}
