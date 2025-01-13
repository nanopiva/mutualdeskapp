import AddMemberToProject from "../../components/AddMemberToProject/AddMemberToProject";

type Params = Promise<{ projectId: string }>;
export default async function AddMemberPage(props: { params: Params }) {
  const params = await props.params;
  const projectId = params.projectId;
  return <AddMemberToProject projectId={projectId} />;
}
