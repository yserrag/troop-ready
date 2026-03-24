import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/nanoid";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller is a leader
  const { data: profile } = await supabase
    .from("users")
    .select("role, unit_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "leader") {
    return NextResponse.json(
      { error: "Only leaders can generate invite codes" },
      { status: 403 }
    );
  }

  const inviteCode = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error: insertError } = await supabase
    .from("leader_invites")
    .insert({
      unit_id: profile.unit_id,
      invite_code: inviteCode,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invite_code: inviteCode }, { status: 201 });
}
