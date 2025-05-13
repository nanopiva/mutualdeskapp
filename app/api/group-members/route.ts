import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json([], { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_members")
    .select("user_id, role")
    .eq("group_id", groupId);

  if (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data);
}
