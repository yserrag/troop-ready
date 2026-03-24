import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect /dashboard/* routes — redirect to /auth/verify if no session
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/verify";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Protect /api/leader-invite (POST only) — return 401 if no session
  if (
    !user &&
    pathname.startsWith("/api/leader-invite") &&
    request.method === "POST"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Protect /api/sync (POST only) — return 401 if no session
  if (!user && pathname === "/api/sync" && request.method === "POST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow all /e/* routes through (public event access)
  // Allow all /auth/* routes through
  // Allow /api/events/* GET through (public event API)
  // All other routes pass through with session refresh

  return supabaseResponse;
}
