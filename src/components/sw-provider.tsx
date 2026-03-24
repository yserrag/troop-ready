"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/sw-register";

export function ServiceWorkerProvider() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
