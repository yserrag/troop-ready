"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PhoneInput } from "@/components/auth/phone-input";
import { OtpInput } from "@/components/auth/otp-input";

type Step = "phone" | "otp";

function PhoneAuthContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = useCallback(async (fullPhone: string) => {
    setError("");
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: { channel: "sms" },
      });
      if (otpError) {
        if (otpError.message.includes("rate")) {
          setError("Too many requests. Please wait before trying again.");
        } else {
          setError(otpError.message);
        }
        return;
      }
      setPhone(fullPhone);
      setStep("otp");
      setCooldown(60);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  async function handleVerifyOtp() {
    if (otp.length !== 6) return;
    setError("");
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (verifyError) {
        setError("Invalid or expired code. Please try again.");
        setOtp("");
        return;
      }
      window.location.href = `/auth/setup?redirect=${encodeURIComponent(redirect)}`;
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
        phone,
        options: { channel: "sms" },
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setCooldown(60);
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="phone-auth-heading" className="max-w-sm mx-auto">
      <h1 id="phone-auth-heading" className="text-2xl font-bold mb-2">
        Sign in
      </h1>
      <p className="text-gray-600 text-sm mb-6">
        {step === "phone"
          ? "We\u2019ll text you a verification code."
          : `Enter the 6-digit code sent to ${phone}.`}
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === "phone" ? (
        <>
          <PhoneInput onSubmit={handleSendOtp} disabled={isSubmitting} />
          <p className="mt-4 text-center text-sm text-gray-500">
            <a href={`/auth/email?redirect=${encodeURIComponent(redirect)}`} className="text-blue-600 hover:underline">
              Use email instead
            </a>
          </p>
        </>
      ) : (
        <div className="space-y-4">
          <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isSubmitting || otp.length !== 6}
            className="w-full rounded-md bg-[#1a2744] text-white py-2.5 px-4 text-sm font-medium hover:bg-[#2a3754] focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
          <p className="text-center text-sm text-gray-500">
            {cooldown > 0 ? (
              <span>Resend code in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting}
                className="text-blue-600 hover:underline disabled:opacity-50"
              >
                Resend code
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

export default function PhoneAuthPage() {
  return (
    <Suspense fallback={null}>
      <PhoneAuthContent />
    </Suspense>
  );
}
