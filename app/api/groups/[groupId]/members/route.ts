import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  const supabase = await createClient();
  const groupId = await params.groupId;

  const { data: members, error } = await supabase
    .from("group_members")
    .select("user_id") // Asegurate que exista relación con "users"
    .eq("group_id", groupId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = members.map((member) => ({
    id: member.user_id,
  }));

  return NextResponse.json({ members: formatted });
}
