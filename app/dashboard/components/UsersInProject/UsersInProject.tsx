import { useEffect, useState } from "react";
import styles from "./UsersInProject.module.css";
import { createClient } from "@/utils/supabase/client";
import { getUserById } from "@/app/actions";
import AvatarIcon from "../AvatarIcon/AvatarIcon";

interface UsersInProjectProps {
  projectId: string;
  currentUserId: string | null | undefined; // ID del usuario que visualiza el componente
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

    fetchUsers();
  }, [projectId]);

  const toggleMenu = (userId: string) => {
    setMenuOpen((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const removeUser = async (userId: string) => {
    const supabase = createClient();
    try {
      await supabase
        .from("project_members")
        .delete()
        .eq("user_id", userId)
        .eq("project_id", projectId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const supabase = createClient();
    try {
      await supabase
        .from("project_members")
        .update({ role: newRole })
        .eq("user_id", userId)
        .eq("project_id", projectId);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      setModalData(null);
    } catch (error) {
      console.error("Error updating user role:", error);
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
        {isVisible ? "▲ Ocultar usuarios" : "▼ Mostrar usuarios"}
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
              {currentUserId === user.id && user.role === "admin" && (
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
        </div>
      )}
      {modalData && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Cambiar rol del usuario</h2>
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
              Guardar
            </button>
            <button className={styles.cancelButton} onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
