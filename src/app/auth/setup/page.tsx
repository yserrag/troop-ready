"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function ProfileSetupContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/auth/verify?redirect=${encodeURIComponent(redirect)}`;
        return;
      }

      // Check if profile already exists
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profile) {
        // Profile exists — skip setup
        window.location.href = redirect;
        return;
      }

      setIsChecking(false);
    }

    checkProfile();
  }, [redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Session expired. Please sign in again.");
        return;
      }

      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        phone: user.phone || null,
        email: user.email || null,
        display_name: displayName.trim(),
        role: "parent",
        account_type: "adult",
        unit_id: "troop-17",
      });

      if (insertError) {
        if (insertError.code === "23505") {
          // Unique violation — profile was created in parallel, just redirect
          window.location.href = redirect;
          return;
        }
        setError(insertError.message);
        return;
      }

      window.location.href = redirect;
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-label="Checking profile">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1a2744]" />
        <span className="sr-only">Checking profile...</span>
      </div>
    );
  }

  return (
    <section aria-labelledby="setup-heading" className="max-w-sm mx-auto">
      <h1 id="setup-heading" className="text-2xl font-bold mb-2">
        Welcome to TroopReady
      </h1>
      <p className="text-gray-600 text-sm mb-6">
        Tell us your name to complete setup.
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 mb-1">
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            autoComplete="name"
            placeholder="e.g., Sarah M."
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !displayName.trim()}
          className="w-full rounded-md bg-[#1a2744] text-white py-2.5 px-4 text-sm font-medium hover:bg-[#2a3754] focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Setting up..." : "Continue"}
        </button>
      </form>
    </section>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={null}>
      <ProfileSetupContent />
    </Suspense>
  );
}
