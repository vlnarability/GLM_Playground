"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../state/store";

// Drives the game loop with requestAnimationFrame, ~60fps ticks
// Calls store.tick(dt) and periodically saves.
// On mount, applies offline progress (if away > 30s).
export function useGameLoop() {
  const tick = useGameStore((s) => s.tick);
  const saveGame = useGameStore((s) => s.saveGame);
  const applyOfflineProgress = useGameStore((s) => s.applyOfflineProgress);
  const lastFrame = useRef<number>(performance.now());
  const lastSave = useRef<number>(performance.now());
  const [offlineSummary, setOfflineSummary] = useState<{
    elapsed: number;
    resourcesGained: Record<string, number>;
  } | null>(null);

  // On mount: apply offline progress
  useEffect(() => {
    const result = applyOfflineProgress();
    if (result?.applied) {
      setOfflineSummary({
        elapsed: result.elapsed,
        resourcesGained: result.resourcesGained,
      });
    }
  }, [applyOfflineProgress]);

  useEffect(() => {
    let raf: number;
    const loop = (now: number) => {
      const dt = Math.min(0.25, (now - lastFrame.current) / 1000);
      lastFrame.current = now;
      tick(dt);
      // Auto-save every 30s
      if (now - lastSave.current > 30000) {
        lastSave.current = now;
        saveGame();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick, saveGame]);

  // Save on unmount / page hide
  useEffect(() => {
    const handler = () => saveGame();
    window.addEventListener("beforeunload", handler);
    window.addEventListener("pagehide", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveGame();
    });
    return () => {
      window.removeEventListener("beforeunload", handler);
      window.removeEventListener("pagehide", handler);
    };
  }, [saveGame]);

  return { offlineSummary, dismissOffline: () => setOfflineSummary(null) };
}
