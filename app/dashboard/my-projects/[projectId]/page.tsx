import { Toolbar } from "../../components/Editor/Toolbar";
import Editor from "../../components/Editor/Editor";
import { Navbar } from "../../components/Editor/Navbar";
import { Room } from "./room";
import fetchProject from "@/app/actions/project/fetchProject";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

type Params = { projectId?: string };

export default async function ProjectPage({
  params,
}: {
  params?: Promise<Params>;
}) {
  const p = (await params) ?? {};
  const projectId = typeof p.projectId === "string" ? p.projectId : undefined;

  if (!projectId) {
    notFound();
  }

  const project = await fetchProject(projectId);
  if (!project) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthor = !!(
    user?.id &&
    project?.author_id &&
    user.id === project.author_id
  );

  return (
    <Room>
      <div
        className="sticky top-0 z-20 print:hidden"
        style={{ background: "var(--background)" }}
      >
        <div className="px-4 pt-1 pb-1">
          <Navbar
            projectTitle={project?.name || "Untitled Document"}
            isAuthor={isAuthor}
            projectId={projectId}
          />
        </div>

        <div className="px-4 pb-2 border-b border-[var(--input-border)]">
          <Toolbar />
        </div>
      </div>

      <div className="flex-1 pb-4 print:pt-0 bg-[var(--white)]">
        <Editor projectId={projectId} />
      </div>
    </Room>
  );
}
