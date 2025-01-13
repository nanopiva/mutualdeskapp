import { useEffect, useState } from "react";
import styles from "./UsersInProject.module.css";
import { createClient } from "@/utils/supabase/client";
import { getUserById, verifyUserRole, verifyUserAuthor } from "@/app/actions";
import AvatarIcon from "../AvatarIcon/AvatarIcon";
import Link from "next/link";

interface UsersInProjectProps {
  projectId: string;
  currentUserId: string | null | undefined;
}

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  role: string;
}

export default function UsersInProject({
  projectId,
  currentUserId,
}: UsersInProjectProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);
  const [isUserAuthor, setIsUserAuthor] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState<Record<string, boolean>>({});
  const [modalData, setModalData] = useState<{
    userId: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClient();
        const { data: projectMembers, error: usersError } = await supabase
          .from("project_members")
          .select("user_id, role")
          .eq("project_id", projectId);

        if (usersError) {
          throw new Error("Error loading users of the project");
        }

        const userPromises = projectMembers.map(async (member) => {
          const user = await getUserById(member.user_id);
          return { ...user, role: member.role };
        });
        const userData = await Promise.all(userPromises);
        setUsers(userData);
      } catch (err) {
        console.error("Error:", err);
        setError("No se pudieron cargar los usuarios del proyecto.");
      }
    };

    const checkUserRoles = async () => {
      try {
        const [userRole, authorId] = await Promise.all([
          verifyUserRole(currentUserId, projectId),
          verifyUserAuthor(currentUserId, projectId),
        ]);

        setIsUserAdmin(userRole === "admin");
        setIsUserAuthor(authorId === currentUserId);
      } catch (err) {
        console.error("Error verifying user roles:", err);
        setError("No se pudieron verificar los roles del usuario.");
      }
    };

    fetchUsers();
    checkUserRoles();
  }, [projectId, currentUserId]);

  const toggleMenu = (userId: string) => {
    setMenuOpen((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const removeUser = async (userId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("user_id", userId)
        .eq("project_id", projectId);

      if (error) throw error;

      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Error removing user:", err);
      setError("No se pudo eliminar al usuario del proyecto.");
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("project_members")
        .update({ role: newRole })
        .eq("user_id", userId)
        .eq("project_id", projectId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      setModalData(null);
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("No se pudo actualizar el rol del usuario.");
    }
  };

  const deleteProject = async () => {
    if (!isUserAuthor) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("No se pudo eliminar el proyecto.");
    }
  };

  const openModal = (userId: string, role: string) => {
    setModalData({ userId, role });
  };

  const closeModal = () => {
    setModalData(null);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsVisible((prev) => !prev)}
        aria-expanded={isVisible}
      >
        {isVisible ? "▲ Hide users" : "▼ Show users"}
      </button>
      {isVisible && (
        <div className={styles.usersContainer}>
          {users.map((user) => (
            <div className={styles.userCard} key={user.id}>
              <AvatarIcon
                pictureURL={`https://kckpcncvhqcxfvzinkto.supabase.co/storage/v1/object/public/profilepictures/${user.id}/profile.jpg`}
                firstLetterBackup={user.first_name.at(0) || ""}
                secondLetterBackup={user.last_name.at(0) || ""}
                size={60}
              />
              <div className={styles.infoCard}>
                <h3 className={styles.userName}>
                  {user.first_name} {user.last_name}
                </h3>
                <p className={styles.userEmail}>{user.email}</p>
                <p className={styles.userRole}>Rol: {user.role}</p>
              </div>
              {isUserAdmin && (
                <div className={styles.optionsMenu}>
                  <button
                    className={styles.menuButton}
                    onClick={() => toggleMenu(user.id)}
                  >
                    ⋮
                  </button>
                  {menuOpen[user.id] && (
                    <div className={styles.menuDropdown}>
                      <button
                        className={styles.removeUser}
                        onClick={() => removeUser(user.id)}
                      >
                        Remove user from project
                      </button>
                      <button onClick={() => openModal(user.id, user.role)}>
                        Change user role
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isUserAdmin && (
            <Link
              href={`/dashboard/add-member/${projectId}`}
              className={styles.addMemberButton}
            >
              <span className={styles.addIcon}>+</span>
              <span className={styles.addText}>Add Member</span>
            </Link>
          )}
        </div>
      )}
      {modalData && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Change user role</h2>
            <select
              value={modalData.role}
              onChange={(e) =>
                setModalData({ ...modalData, role: e.target.value })
              }
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              className={styles.saveButton}
              onClick={() => updateUserRole(modalData.userId, modalData.role)}
            >
              Save
            </button>
            <button className={styles.cancelButton} onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {isUserAuthor && (
        <button className={styles.deleteProjectButton} onClick={deleteProject}>
          Delete Project
        </button>
      )}
    </div>
  );
}
