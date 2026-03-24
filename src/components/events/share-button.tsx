"use client";

import { useEffect, useState } from "react";

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  if (!canShare) return null;

  async function handleShare() {
    try {
      await navigator.share({
        title,
        url: window.location.href,
      });
    } catch {
      // User cancelled or share failed — ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-700 py-2.5 px-5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2"
    >
      Share...
    </button>
  );
}
