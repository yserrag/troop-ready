"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { usePathname } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, profile, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      window.location.href = `/auth/verify?redirect=${redirect}`;
      return;
    }

    if (isAuthenticated && !profile) {
      const redirect = encodeURIComponent(pathname);
      window.location.href = `/auth/setup?redirect=${redirect}`;
    }
  }, [isAuthenticated, profile, isLoading, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1a2744]" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  return <>{children}</>;
}
