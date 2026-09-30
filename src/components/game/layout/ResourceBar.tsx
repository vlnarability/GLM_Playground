"use client";

import { useGameStore } from "@/game/state/store";
import { RESOURCES, STAGE_RESOURCES } from "@/game/data/resources";
import { STAGES } from "@/game/data/stages";
import { formatNumber, resourceColor, resourceIcon, resourceName } from "../shared/format";
import { cn } from "@/lib/utils";

export function ResourceBar() {
  const resources = useGameStore((s) => s.resources);
  const capacities = useGameStore((s) => s.capacities);
  const stageIndex = useGameStore((s) => s.stageIndex);
  const evolutionPoints = useGameStore((s) => s.evolutionPoints);
  const galacticWins = useGameStore((s) => s.galacticWins);
  const stage = STAGES[stageIndex];
  const visible = STAGE_RESOURCES[stage.id] || [];

  return (
    <div className="glass-panel rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Resources
        </h2>
        <span className="text-xs text-muted-foreground">{stage.name} stage</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {visible.map((id) => {
          const res = resources[id] || 0;
          const cap = capacities[id] || 0;
          const pct = cap > 0 ? (res / cap) * 100 : 0;
          const nearCap = pct > 85;
          const low = id === "happiness" ? res < 30 : false;
          return (
            <div
              key={id}
              title={`${resourceName(id)}: ${formatNumber(res)} / ${formatNumber(cap)}`}
              className={cn(
                "res-chip group relative",
                nearCap && "chip-near-cap",
                low && "border-red-500/50"
              )}
            >
              <span className="text-base leading-none">{resourceIcon(id)}</span>
              <span
                className="font-semibold"
                style={{ color: resourceColor(id) }}
              >
                {formatNumber(res, 0)}
              </span>
              <span className="text-xs text-muted-foreground">
                / {formatNumber(cap, 0)}
              </span>
              {/* Mini progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b overflow-hidden bg-muted/40">
                <div
                  className={cn(
                    "h-full transition-all",
                    nearCap ? "bg-amber-400" : low ? "bg-red-400" : "bg-primary"
                  )}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
        {/* Prestige currency chips */}
        {(evolutionPoints > 0 || galacticWins > 0) && (
          <div className="res-chip" title="Evolution Points — earned by prestiging">
            <span>🌱</span>
            <span className="font-semibold text-emerald-400">
              {formatNumber(evolutionPoints, 0)}
            </span>
            <span className="text-xs text-muted-foreground">EP</span>
          </div>
        )}
      </div>
    </div>
  );
}
