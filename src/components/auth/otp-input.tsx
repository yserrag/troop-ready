"use client";

import { useRef, useEffect, useCallback } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OTP_LENGTH = 6;

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const setRef = useCallback((index: number) => (el: HTMLInputElement | null) => {
    inputsRef.current[index] = el;
  }, []);

  function handleChange(index: number, digit: string) {
    if (!/^\d?$/.test(digit)) return;
    const chars = value.split("");
    chars[index] = digit;
    const newValue = chars.join("").slice(0, OTP_LENGTH);
    onChange(newValue);

    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted) {
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  }

  return (
    <fieldset disabled={disabled}>
      <legend className="block text-sm font-medium text-gray-700 mb-2">
        Enter your 6-digit code
      </legend>
      <p id="otp-instructions" className="sr-only">
        Enter the 6-digit verification code. You can paste the full code into any field.
      </p>
      <div className="flex gap-2 justify-center" role="group" aria-describedby="otp-instructions">
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={setRef(i)}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${i + 1}`}
            className="w-11 h-13 text-center text-xl font-mono rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a2744] disabled:opacity-50"
          />
        ))}
      </div>
    </fieldset>
  );
}
