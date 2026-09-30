"use client";

import { useEffect } from "react";
import { useGameStore } from "../state/store";
import type { TabId } from "../state/types";

// Keyboard shortcuts for power users
// Space = pause/resume
// 1-4 = speed
// Q/W/E/R/T/Y/U/I = tabs (Actions, Systems, Production, Tech, Story, Codex, Awards, Archive)
// S = shop, Esc = close modals
export function useKeyboardShortcuts() {
  const togglePause = useGameStore((s) => s.togglePause);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const setTab = useGameStore((s) => s.setTab);
  const setShowShop = useGameStore((s) => s.setShowShop);
  const setShowEvolve = useGameStore((s) => s.setShowEvolve);
  const setShowSettings = useGameStore((s) => s.setShowSettings);
  const dismissStory = useGameStore((s) => s.dismissStory);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const activeStoryPopup = useGameStore((s) => s.activeStoryPopup);
  const activeEvent = useGameStore((s) => s.activeEvent);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (target.isContentEditable) return;

      // Escape closes modals/story
      if (e.key === "Escape") {
        if (activeStoryPopup) {
          dismissStory(activeStoryPopup);
          return;
        }
        setShowShop(false);
        setShowEvolve(false);
        setShowSettings(false);
        return;
      }

      // If a story popup or event is active, don't process other shortcuts
      if (activeStoryPopup || activeEvent) return;

      const speeds = [1, 2, 4, 8];
      const tabs: { key: string; tab: TabId }[] = [
        { key: "q", tab: "actions" },
        { key: "w", tab: "systems" },
        { key: "e", tab: "production" },
        { key: "r", tab: "tech" },
        { key: "t", tab: "story" },
        { key: "y", tab: "codex" },
        { key: "u", tab: "achievements" },
        { key: "i", tab: "archive" },
        { key: "o", tab: "log" },
      ];

      const key = e.key.toLowerCase();

      if (key === " ") {
        e.preventDefault();
        togglePause();
        return;
      }

      if (["1", "2", "3", "4"].includes(key)) {
        const idx = parseInt(key) - 1;
        if (speeds[idx]) setSpeed(speeds[idx]);
        return;
      }

      if (key === "s") {
        setShowShop(true);
        return;
      }

      if (key === "b") {
        setShowEvolve(true);
        return;
      }

      if (key === ",") {
        setShowSettings(true);
        return;
      }

      const tabMatch = tabs.find((t) => t.key === key);
      if (tabMatch) {
        setTab(tabMatch.tab);
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePause, setSpeed, setTab, setShowShop, setShowEvolve, setShowSettings, dismissStory, resolveEvent, activeStoryPopup, activeEvent]);
}
