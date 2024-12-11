import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const handleLogout = async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error al cerrar sesión:", error.message);
      alert("Hubo un problema al cerrar sesión. Inténtalo nuevamente.");
    } else {
      console.log("Sesión cerrada exitosamente");
      window.location.href = "/"; // Redirige a la página de inicio
    }
  };

  return <></>;
}
