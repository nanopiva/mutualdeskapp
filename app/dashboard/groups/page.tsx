import styles from "./page.module.css";
import Groups from "../components/Groups/Groups";
import { createClient } from "@/utils/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error getting the user session");
    return;
  }

  return (
    <div className={styles.userGroupsContainer}>
      <Groups userId={user.id} />
    </div>
  );
}
