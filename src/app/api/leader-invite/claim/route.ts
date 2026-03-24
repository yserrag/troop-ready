import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { invite_code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const inviteCode = body.invite_code?.trim().toLowerCase();
  if (!inviteCode || inviteCode.length < 6) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
  }

  // Use service client to bypass RLS for the update operations
  const serviceClient = createSupabaseServiceClient();

  // Look up the invite
  const { data: invite } = await serviceClient
    .from("leader_invites")
    .select("*")
    .eq("invite_code", inviteCode)
    .is("claimed_by", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!invite) {
    return NextResponse.json(
      { error: "Invalid or expired invite code" },
      { status: 400 }
    );
  }

  // Verify unit_id matches the user's unit
  const { data: profile } = await serviceClient
    .from("users")
    .select("unit_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found. Please complete setup first." },
      { status: 400 }
    );
  }

  if (profile.unit_id !== invite.unit_id) {
    return NextResponse.json(
      { error: "This invite code is for a different unit" },
      { status: 400 }
    );
  }

  // Claim the invite
  const { error: claimError } = await serviceClient
    .from("leader_invites")
    .update({ claimed_by: user.id })
    .eq("id", invite.id);

  if (claimError) {
    return NextResponse.json(
      { error: "Failed to claim invite" },
      { status: 500 }
    );
  }

  // Upgrade user role to leader
  const { error: roleError } = await serviceClient
    .from("users")
    .update({ role: "leader", updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (roleError) {
    return NextResponse.json(
      { error: "Failed to upgrade role" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
