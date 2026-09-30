"use client";

import { useGameStore } from "@/game/state/store";
import { EVENT_MAP } from "@/game/data/events";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function EventModal() {
  const activeEvent = useGameStore((s) => s.activeEvent);
  const resolveEvent = useGameStore((s) => s.resolveEvent);

  if (!activeEvent) return null;
  const ev = EVENT_MAP[activeEvent];
  if (!ev) return null;

  return (
    <div className="story-popup-overlay" onClick={(e) => { /* don't dismiss on backdrop click — require a choice */ }}>
      <div className="story-popup-card glass-strong rounded-xl overflow-hidden border border-amber-500/40 max-w-md">
        {/* Header */}
        <div className="relative p-4 border-b border-border/60 bg-amber-500/10">
          <div className="text-[0.65rem] uppercase tracking-[0.25em] text-amber-400 font-mono mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Event
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 bg-amber-500/15 border border-amber-500/30">
              {ev.icon}
            </div>
            <h2 className="text-lg font-bold leading-tight">{ev.name}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm leading-relaxed text-foreground/95">{ev.desc}</p>
        </div>

        {/* Choices */}
        <div className="px-5 pb-5 space-y-2">
          {ev.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => resolveEvent(ev.id, choice.id)}
              className="w-full text-left p-3 rounded-lg border border-border bg-muted/30 hover:border-amber-500/50 hover:bg-amber-500/10 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold group-hover:text-amber-400 transition-colors">
                    {choice.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{choice.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
