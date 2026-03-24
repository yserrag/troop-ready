"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Step = "email" | "sent";

function EmailAuthContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError("");
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (otpError) {
        setError(otpError.message);
        return;
      }
      setStep("sent");
      setCooldown(60);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError("");
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setCooldown(60);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="email-auth-heading" className="max-w-sm mx-auto">
      <h1 id="email-auth-heading" className="text-2xl font-bold mb-2">
        Sign in with email
      </h1>

      {error && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === "email" ? (
        <>
          <p className="text-gray-600 text-sm mb-6">
            We&apos;ll send a magic link to your email.
          </p>
          <form onSubmit={handleSendLink} className="space-y-4">
            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                autoComplete="email"
                placeholder="parent@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full rounded-md bg-[#1a2744] text-white py-2.5 px-4 text-sm font-medium hover:bg-[#2a3754] focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send magic link"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            <a href={`/auth/phone?redirect=${encodeURIComponent(redirect)}`} className="text-blue-600 hover:underline">
              Use phone instead
            </a>
          </p>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            <p className="font-medium">Check your email</p>
            <p className="mt-1">We sent a magic link to <strong>{email}</strong>. Click the link to sign in.</p>
          </div>
          <p className="text-center text-sm text-gray-500">
            {cooldown > 0 ? (
              <span>Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting}
                className="text-blue-600 hover:underline disabled:opacity-50"
              >
                Resend magic link
              </button>
            )}
          </p>
        </div>
      )}

      <a href="/" className="text-blue-600 hover:underline text-sm mt-6 inline-block">
        &larr; Back to events
      </a>
    </section>
  );
}

export default function EmailAuthPage() {
  return (
    <Suspense fallback={null}>
      <EmailAuthContent />
    </Suspense>
  );
}
