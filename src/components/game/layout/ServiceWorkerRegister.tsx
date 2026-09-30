"use client";

import { useEffect } from "react";

// Registers the service worker for PWA offline support (design doc §12.1)
// Only runs in production to avoid caching issues during development
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Only register in production to avoid dev caching issues
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (reg.waiting) {
          reg.waiting.postMessage("SKIP_WAITING");
        }
      } catch (err) {
        // Silently fail — PWA is a progressive enhancement
        console.debug("SW registration failed:", err);
      }
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
