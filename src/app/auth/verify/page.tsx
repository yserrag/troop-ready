"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const encodedRedirect = encodeURIComponent(redirect);

  return (
    <section aria-labelledby="verify-heading" className="max-w-sm mx-auto text-center">
      <h1 id="verify-heading" className="text-2xl font-bold mb-2">
        Sign in to continue
      </h1>
      <p className="text-gray-600 text-sm mb-8">
        Choose how you&apos;d like to verify your identity.
      </p>

      <div className="space-y-3">
        <a
          href={`/auth/phone?redirect=${encodedRedirect}`}
          className="block w-full rounded-md bg-[#1a2744] text-white py-2.5 px-4 text-sm font-medium hover:bg-[#2a3754] focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2 text-center"
        >
          Continue with WhatsApp
        </a>
        <a
          href={`/auth/email?redirect=${encodedRedirect}`}
          className="block w-full rounded-md border border-gray-300 text-gray-700 py-2.5 px-4 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2 text-center"
        >
          Continue with Email
        </a>
      </div>

      <a href="/" className="text-blue-600 hover:underline text-sm mt-6 inline-block">
        &larr; Back to events
      </a>
    </section>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
