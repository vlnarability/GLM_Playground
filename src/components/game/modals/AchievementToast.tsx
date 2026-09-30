"use client";

import { useGameStore } from "@/game/state/store";
import { ACHIEVEMENT_MAP } from "@/game/data/achievements";
import { Button } from "@/components/ui/button";
import { Trophy, X } from "lucide-react";

export function AchievementToast() {
  const newAchievements = useGameStore((s) => s.newAchievements || []);
  const dismissAchievementToast = useGameStore((s) => s.dismissAchievementToast);
  const setTab = useGameStore((s) => s.setTab);

  if (newAchievements.length === 0) return null;

  const firstId = newAchievements[0];
  const ach = ACHIEVEMENT_MAP[firstId];
  if (!ach) return null;

  const hasMore = newAchievements.length > 1;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-[slideUp_0.3s_ease]">
      <div className="glass-strong rounded-lg border border-primary/50 overflow-hidden shadow-2xl">
        {/* Header bar */}
        <div className="bg-primary/20 px-3 py-1.5 flex items-center gap-2 border-b border-primary/30">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-primary">
            Achievement Unlocked
          </span>
          <button
            onClick={dismissAchievementToast}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Body */}
        <div className="p-3 flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 bg-primary/15 border border-primary/40">
            {ach.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold leading-tight">{ach.name}</h3>
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">{ach.desc}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[0.6rem] px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 font-semibold">
                +{(ach.bonus.value * 100).toFixed(1)}% {ach.bonus.type}
              </span>
              {hasMore && (
                <span className="text-[0.6rem] text-muted-foreground">
                  +{newAchievements.length - 1} more
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-3 pb-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-1"
            onClick={() => {
              setTab("achievements");
              dismissAchievementToast();
            }}
          >
            View All
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={dismissAchievementToast}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
