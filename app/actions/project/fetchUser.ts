import { createClient } from "@/utils/supabase/server";

export async function fetchUser(userId: string): Promise<string> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("User not found");
    }

    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const userName = `${firstName} ${lastName}`.trim();

    return userName || "Unknown User";
  } catch (error) {
    console.error("Error fetching user:", error);
    return "Unknown User";
  }
}
