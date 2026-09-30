"use client";

import { useGameStore } from "@/game/state/store";
import { SYSTEMS } from "@/game/data/systems";
import { STAGES } from "@/game/data/stages";
import { formatNumber, resourceColor, resourceIcon, resourceName } from "../shared/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory } from "lucide-react";

export function ProductionTab() {
  const stageIndex = useGameStore((s) => s.stageIndex);
  const ownedSystems = useGameStore((s) => s.ownedSystems);
  const resources = useGameStore((s) => s.resources);
  const upgrades = useGameStore((s) => s.upgrades);

  const stage = STAGES[stageIndex];
  const autoMult = 1 + (upgrades["inherited_efficiency"] || 0) * 0.15;

  // Aggregate all owned systems across all stages
  const owned = SYSTEMS.filter((s) => (ownedSystems[s.id] || 0) > 0);
  const byStage = owned.reduce((acc, s) => {
    (acc[s.stage] = acc[s.stage] || []).push(s);
    return acc;
  }, {} as Record<string, typeof SYSTEMS>);

  // Net production per resource
  const netProd: Record<string, number> = {};
  owned.forEach((sys) => {
    const count = ownedSystems[sys.id];
    const stageMult = sys.stage === stage.id ? 1 : 0.5;
    const mult = autoMult * stageMult;
    Object.entries(sys.produces).forEach(([r, v]) => {
      netProd[r] = (netProd[r] || 0) + (v as number) * count * mult;
    });
    if (sys.upkeep) {
      Object.entries(sys.upkeep).forEach(([r, v]) => {
        netProd[r] = (netProd[r] || 0) - (v as number) * count;
      });
    }
  });

  return (
    <div className="space-y-4">
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Factory className="w-4 h-4" />
            Production Overview
          </CardTitle>
          <CardDescription>
            All owned systems across every stage. Older stages run at 50% efficiency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {owned.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 text-sm">
              No systems built yet. Visit the Systems tab to build your first.
            </div>
          ) : (
            <>
              {/* Net production grid */}
              <div className="mb-4">
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Net Production (per second)</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.entries(netProd)
                    .sort(([, a], [, b]) => b - a)
                    .map(([r, rate]) => (
                      <div key={r} className="stat-card flex items-center gap-2">
                        <span className="text-base">{resourceIcon(r)}</span>
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground truncate">{resourceName(r)}</div>
                          <div
                            className={`text-sm font-bold tabular-nums ${rate >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {rate >= 0 ? "+" : "−"}
                            {formatNumber(Math.abs(rate), 2)}/s
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* By stage */}
              {Object.entries(byStage).map(([stg, list]) => (
                <div key={stg} className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{STAGES.find((x) => x.id === stg)?.icon}</span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                      {STAGES.find((x) => x.id === stg)?.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {stg === stage.id ? "100% efficiency" : "50% efficiency"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {list.map((sys) => {
                      const count = ownedSystems[sys.id];
                      const stageMult = sys.stage === stage.id ? 1 : 0.5;
                      const mult = autoMult * stageMult;
                      return (
                        <div key={sys.id} className="stat-card flex items-center gap-2">
                          <span className="text-xl">{sys.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {sys.name} <span className="text-muted-foreground text-xs">×{count}</span>
                            </div>
                            <div className="text-xs flex flex-wrap gap-2">
                              {Object.entries(sys.produces).map(([r, v]) => (
                                <span key={r} style={{ color: resourceColor(r) }}>
                                  +{formatNumber((v as number) * count * mult, 2)}/s {resourceIcon(r)}
                                </span>
                              ))}
                              {sys.upkeep && Object.entries(sys.upkeep).map(([r, v]) => (
                                <span key={r} className="text-red-400">
                                  −{formatNumber((v as number) * count, 2)}/s {resourceIcon(r)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
