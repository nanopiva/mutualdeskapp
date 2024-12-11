"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserById } from "@/app/actions";

type FriendLinkData = {
  linkId: string;
  linkFUserId: string;
  linkSUserId: string;
  linkData: string;
};

export default function FriendsPanel() {
  const [myFriends, setMyFriends] = useState<FriendLinkData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  const fetchLinks = async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        "No hemos podido corroborar su sesión. Intente logueándose nuevamente."
      );
      return;
    }

    const { data, error } = await supabase
      .from("friends_links")
      .select(`id,first_user_id,second_user_id,created_at`)
      .or(`first_user_id.eq.${user.id},second_user_id.eq.${user.id}`);

    if (error) {
      console.error("Error al obtener los friend link:", error);
      setError("Error al obtener los friends links.");
      return;
    }

    const formattedFriendsLink: FriendLinkData[] = data.map((friend) => ({
      linkId: friend.id,
      linkFUserId: friend.first_user_id,
      linkSUserId: friend.second_user_id,
      linkData: friend.created_at,
    }));

    setMyFriends(formattedFriendsLink);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAddFriend = async () => {
    if (!email) {
      alert("Por favor, ingresa un email válido.");
      return;
    }

    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "No hemos podido corroborar su sesión. Intente logueándose nuevamente."
        );
        return;
      }

      const { data: invitedId, error } = await supabase
        .from("users")
        .select(`id`)
        .eq("email", email);
      if (error) {
        console.error("Error al obtener los usuarios:", error);
        setError("Error al obtener los usuarios.");
        return;
      }
      if (!invitedId || invitedId === null) {
        console.log("No existe un usuario con el email indicado");
        setError("No existe un usuario con el email indicado");
        return;
      }
      const receiverId = invitedId[0].id;
      const { error: errorData } = await supabase.from("invitations").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: "pending",
      });

      if (errorData) {
        console.log("Error insertando link en la tabla");
        setError("Error insertando link en la tabla");
      }

      console.log("Enviando solicitud de amistad a:", email);
      setIsModalOpen(false);
      setEmail(""); // Limpiar el input después de agregar
    } catch (error) {
      console.error("Error al agregar amigo:", error);
    }
  };

  return (
    <div className={styles.friendsPanelContainer}>
      <div className={styles.friendsContainer}>
        {myFriends.filter((friend) => friend.linkId).length > 0 ? (
          myFriends
            .filter((friend) => friend.linkId)
            .map((friendLink) => {
              // Se determina quién es el amigo
              const { linkFUserId, linkSUserId } = friendLink;
              const friendUserId =
                linkFUserId !== linkSUserId ? linkFUserId : linkSUserId;

              return (
                <div
                  key={friendLink.linkId}
                  className={styles.friendLinkDetail}
                >
                  <p>Amigo:</p>
                  <UserDetails userId={friendUserId} />
                  <p>
                    Amigos desde:{" "}
                    {new Date(friendLink.linkData).toLocaleDateString()}
                  </p>
                </div>
              );
            })
        ) : (
          <p>No se encontraron amigos.</p>
        )}
      </div>
      <button
        className={styles.addFriendButton}
        onClick={() => setIsModalOpen(true)}
      >
        Agregar amigo
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Agregar un amigo</h3>
            <input
              type="email"
              placeholder="Ingresa el email del amigo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
            />
            <div className={styles.modalActions}>
              <button onClick={handleAddFriend}>Agregar</button>
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const UserDetails = ({ userId }: { userId: string }) => {
  const [userDetails, setUserDetails] = useState<any | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = await getUserById(userId);
      setUserDetails(user);
    };

    fetchUserDetails();
  }, [userId]);

  return (
    <div>
      {userDetails ? (
        <>
          <p>
            Nombre: {userDetails.first_name} {userDetails.last_name}
          </p>
          <p>Email: {userDetails.email}</p>
          <p>
            Miembro desde:{" "}
            {new Date(userDetails.created_at).toLocaleDateString()}
          </p>
        </>
      ) : (
        <p>Cargando detalles del amigo...</p>
      )}
    </div>
  );
};
