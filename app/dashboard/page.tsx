"use client";
import WelcomeHeader from "./components/WelcomeHeader/WelcomeHeader";
import RecentProjects from "./components/RecentProjects/RecentProjects";
import QuickActions from "./components/QuickActions/QuickActions";
import InvitationsPreview from "./components/InvitationsPreview/InvitationsPreview";
import PublicProjectsGallery from "./components/PublicProjectsGallery/PublicProjectsGallery";

export default function Dashboard() {
  return (
    <main>
      <WelcomeHeader />
      <RecentProjects />
      <QuickActions />
      <InvitationsPreview />
      <PublicProjectsGallery />
    </main>
  );
}
