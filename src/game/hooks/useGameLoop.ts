"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "../state/store";

// Drives the game loop with requestAnimationFrame, ~60fps ticks
// Calls store.tick(dt) and periodically saves
export function useGameLoop() {
  const tick = useGameStore((s) => s.tick);
  const saveGame = useGameStore((s) => s.saveGame);
  const lastFrame = useRef<number>(performance.now());
  const lastSave = useRef<number>(performance.now());

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
}
