import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/email?error=invalid_code", request.url)
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/auth/email?error=invalid_code", request.url)
    );
  }

  // Redirect to setup (will skip if profile already exists)
  return NextResponse.redirect(
    new URL(`/auth/setup?redirect=${encodeURIComponent(redirect)}`, request.url)
  );
}
