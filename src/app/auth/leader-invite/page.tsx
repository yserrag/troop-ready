"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";

function LeaderInviteForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) return;
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leader-invite/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: code.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Invalid or expired invite code.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800 text-center">
        <p className="font-medium">Leader access granted!</p>
        <p className="mt-1">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700 mb-1">
          Invite code
        </label>
        <input
          id="invite-code"
          type="text"
          maxLength={6}
          placeholder="abc123"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
          disabled={isSubmitting}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || code.length < 6}
        className="w-full rounded-md bg-[#1a2744] text-white py-2.5 px-4 text-sm font-medium hover:bg-[#2a3754] focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Claiming..." : "Claim Leader Access"}
      </button>
    </form>
  );
}

export default function LeaderInvitePage() {
  return (
    <AuthGuard>
      <section aria-labelledby="leader-invite-heading" className="max-w-sm mx-auto">
        <h1 id="leader-invite-heading" className="text-2xl font-bold mb-2">
          Leader Invite
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Enter the 6-character invite code from your unit leader.
        </p>
        <LeaderInviteForm />
        <a href="/" className="text-blue-600 hover:underline text-sm mt-6 inline-block">
          &larr; Back to events
        </a>
      </section>
    </AuthGuard>
  );
}
