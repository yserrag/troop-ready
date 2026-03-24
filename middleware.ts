import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sw.js, manifest.json, icons (static assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|icons/).*)",
  ],
};
