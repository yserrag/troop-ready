"use client";

import { useState } from "react";

export function CopyLink() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select a temporary input
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-700 py-2.5 px-5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
