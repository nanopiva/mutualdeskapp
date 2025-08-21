"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import GroupCard from "../components/GroupCard/GroupCard";
import styles from "./page.module.css";

interface Group {
  id: string;
  name: string;
  description: string | null;
  role: string;
  updated_at: string;
  created_at: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc("get_user_groups_with_roles", {
            user_id: user.id,
          })
          .order("updated_at", { ascending: false });

        if (error) throw error;

        setGroups(data || []);
      } catch (err) {
        setError("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Groups</h1>
        <div className={styles.actions}>
          <Link
            href="/dashboard/groups/create-group"
            className={styles.createButton}
          >
            <Plus size={18} />
            <span>Create Group</span>
          </Link>
        </div>
      </header>

      {loading ? (
        <div className={styles.loaderContainer}>
          <div className="loader"></div>
        </div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : groups.length > 0 ? (
        <div className={styles.groupsGrid}>
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              description={group.description}
              role={group.role}
              updatedAt={group.updated_at}
              createdAt={group.created_at}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>You don't belong to any groups yet.</p>
          <Link
            href="/dashboard/groups/create-group"
            className={styles.createLink}
          >
            Create your first group
          </Link>
        </div>
      )}
    </div>
  );
}
