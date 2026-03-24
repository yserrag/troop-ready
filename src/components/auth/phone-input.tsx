"use client";

import { useState } from "react";

const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
] as const;

interface PhoneInputProps {
  onSubmit: (fullPhone: string) => void;
  disabled?: boolean;
}

export function PhoneInput({ onSubmit, disabled }: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");

  const isValid = phone.replace(/\D/g, "").length >= 7;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const digits = phone.replace(/\D/g, "");
    onSubmit(`${countryCode}${digits}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="phone-input" className="block text-sm font-medium text-gray-700 mb-1">
          Phone number
        </label>
        <div className="flex gap-2">
          <select
            id="country-code"
            aria-label="Country code"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            disabled={disabled}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744] bg-white"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            id="phone-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="555 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={disabled}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={disabled || !isValid}
        className="w-full rounded-md bg-[#1a2744] text-white py-2.5 px-4 text-sm font-medium hover:bg-[#2a3754] focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue with SMS
      </button>
    </form>
  );
}
