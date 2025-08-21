// /hooks/useUserPermissions.ts
import { useSelf } from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

// Definir el tipo para la información del usuario
type UserInfo = {
  name: string;
  avatar?: string;
  role: string;
};

export function useUserPermissions() {
  const params = useParams();
  const [permissions, setPermissions] = useState({
    userRole: null as string | null,
    isViewer: false,
    isOwner: false,
    isMember: false,
    canEdit: false,
    isLoading: true,
  });

  // Función para obtener permisos desde el backend
  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/project-permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId: params.projectId }),
      });

      if (response.ok) {
        const data = await response.json();
        const role = data.role;

        setPermissions({
          userRole: role,
          isViewer: role === "viewer",
          isOwner: role === "owner",
          isMember: role === "member",
          canEdit: role !== "viewer",
          isLoading: false,
        });
      } else {
        // Si no tiene permisos, establecer como viewer por defecto
        setPermissions({
          userRole: null,
          isViewer: false,
          isOwner: false,
          isMember: false,
          canEdit: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissions((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    if (params.projectId) {
      fetchPermissions();
    }
  }, [params.projectId]);

  return permissions;
}

// Hook alternativo que usa Liveblocks (solo funciona dentro del RoomProvider)
export function useLiveblocksPermissions() {
  try {
    const self = useSelf();
    const userInfo = self?.info as UserInfo | undefined;
    const userRole = userInfo?.role || null;

    const isViewer = userRole === "viewer";
    const isOwner = userRole === "owner";
    const isMember = userRole === "member";
    const canEdit = !isViewer;

    return {
      userRole,
      isViewer,
      isOwner,
      isMember,
      canEdit,
      userInfo,
      isLoading: false,
    };
  } catch (error) {
    // Si no está dentro del RoomProvider, devolver valores por defecto
    return {
      userRole: null,
      isViewer: false,
      isOwner: false,
      isMember: false,
      canEdit: false,
      userInfo: null,
      isLoading: true,
    };
  }
}
