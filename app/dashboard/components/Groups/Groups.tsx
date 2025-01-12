"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { getUserById } from "@/app/actions";
import styles from "./Groups.module.css";

interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  creator_id: string;
}

export default function Groups({ userId }: { userId: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const supabase = await createClient();

        // Obtener los group_ids del usuario
        const { data: memberData, error: memberError } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", userId);

        if (memberError) throw memberError;

        // Obtener los detalles de los grupos
        const groupIds = memberData.map((member) => member.group_id);
        const { data: groupsData, error: groupsError } = await supabase
          .from("groups")
          .select("*")
          .in("id", groupIds);

        if (groupsError) throw groupsError;

        setGroups(groupsData);
      } catch (err) {
        setError("Error al cargar los grupos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [userId]);

  if (loading) return <div className={styles.loading}>Cargando grupos...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.groupsContainer}>
      <h2 className={styles.title}>Mis Grupos</h2>
      {groups.length === 0 ? (
        <p className={styles.noGroups}>No perteneces a ningún grupo aún.</p>
      ) : (
        <ul className={styles.groupList}>
          {groups.map((group) => (
            <li key={group.id} className={styles.groupItem}>
              <div className={styles.groupInfo}>
                <h3 className={styles.groupName}>{group.name}</h3>
                <p className={styles.groupDescription}>{group.description}</p>
                <p className={styles.groupDate}>
                  Creado el: {new Date(group.created_at).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/dashboard/groups/${group.id}`}
                className={styles.groupLink}
              >
                Ver Grupo
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
