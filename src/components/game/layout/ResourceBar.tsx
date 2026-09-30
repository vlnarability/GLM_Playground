"use client";

import { useGameStore } from "@/game/state/store";
import { STAGE_RESOURCES, RESOURCE_MAP } from "@/game/data/resources";
import { STAGES } from "@/game/data/stages";
import { ARCHETYPE_MAP } from "@/game/data/archetypes";
import { formatNumber, formatCompact, resourceColor, resourceIcon, resourceName } from "../shared/format";
import { cn } from "@/lib/utils";

export function ResourceBar() {
  const resources = useGameStore((s) => s.resources);
  const capacities = useGameStore((s) => s.capacities);
  const stageIndex = useGameStore((s) => s.stageIndex);
  const evolutionPoints = useGameStore((s) => s.evolutionPoints);
  const galacticWins = useGameStore((s) => s.galacticWins);
  const lockedArchetype = useGameStore((s) => s.lockedArchetype);
  const stage = STAGES[stageIndex];
  const visible = STAGE_RESOURCES[stage.id] || [];

  const archDef = lockedArchetype ? ARCHETYPE_MAP[lockedArchetype] : null;

  return (
    <div
      className="sticky top-[53px] z-20 glass-strong border-b border-border/80"
      style={{ boxShadow: `0 4px 20px -8px ${stage.accent}40` }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stage label */}
          <div className="flex items-center gap-1.5 shrink-0 mr-1">
            <span className="text-base">{stage.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:inline">
              {stage.name}
            </span>
          </div>

          {/* Resource chips */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 overflow-x-auto no-scrollbar">
            {visible.map((id) => {
              const res = resources[id] || 0;
              const cap = capacities[id] || 0;
              const pct = cap > 0 ? (res / cap) * 100 : 0;
              const nearCap = pct > 90;
              const low = id === "happiness" ? res < 25 : false;
              return (
                <div
                  key={id}
                  title={`${resourceName(id)}: ${formatNumber(res)} / ${formatNumber(cap)}`}
                  className={cn(
                    "res-chip group relative shrink-0",
                    nearCap && "chip-near-cap",
                    low && "ring-1 ring-red-500/60"
                  )}
                >
                  <span className="text-sm leading-none">{resourceIcon(id)}</span>
                  <span
                    className="font-semibold tabular-nums text-xs"
                    style={{ color: resourceColor(id) }}
                  >
                    {formatNumber(res)}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground tabular-nums">
                    /{formatNumber(cap)}
                  </span>
                  {/* Mini progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b overflow-hidden bg-muted/40">
                    <div
                      className={cn(
                        "h-full transition-all",
                        nearCap ? "bg-amber-400" : low ? "bg-red-400" : "bg-primary/70"
                      )}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right-side meta chips */}
          <div className="flex items-center gap-1.5 shrink-0">
            {archDef && (
              <div
                className="res-chip shrink-0"
                title={`Lineage: ${archDef.name} — ${archDef.bonus.label}`}
                style={{ borderColor: `${archDef.color}60` }}
              >
                <span className="text-sm font-mono">{archDef.glyph}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: archDef.color }}
                >
                  {archDef.name}
                </span>
              </div>
            )}
            {(evolutionPoints > 0 || galacticWins > 0) && (
              <div className="res-chip shrink-0" title="Evolution Points">
                <span className="text-sm">🌱</span>
                <span className="font-semibold text-emerald-400 text-xs tabular-nums">
                  {formatCompact(evolutionPoints)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
