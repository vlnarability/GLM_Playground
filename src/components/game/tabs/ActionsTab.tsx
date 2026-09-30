"use client";

import { useGameStore } from "@/game/state/store";
import { actionsForStage } from "@/game/data/actions";
import { STAGES } from "@/game/data/stages";
import { STAGE_RESOURCES } from "@/game/data/resources";
import { formatNumber, resourceColor, resourceIcon, resourceName } from "../shared/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function ActionsTab() {
  const stageIndex = useGameStore((s) => s.stageIndex);
  const resources = useGameStore((s) => s.resources);
  const performAction = useGameStore((s) => s.performAction);

  const stage = STAGES[stageIndex];
  const actions = actionsForStage(stage.id);
  const stageRes = STAGE_RESOURCES[stage.id] || [];

  return (
    <div className="space-y-4">
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-xl">{stage.icon}</span>
            {stage.name} Actions
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {stage.storyIntro}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Manual Actions</CardTitle>
          <CardDescription>Click to gather resources. The bootstrap of a civilization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {actions.map((a) => {
              const canAfford = !a.cost || Object.entries(a.cost).every(([r, v]) => (resources[r] || 0) >= (v as number));
              return (
                <button
                  key={a.id}
                  onClick={() => performAction(a.id)}
                  disabled={!canAfford}
                  className="action-btn"
                  title={a.desc}
                >
                  <span className="icon">{a.icon}</span>
                  <span className="label">{a.name}</span>
                  <span className="cost">
                    {a.cost && Object.keys(a.cost).length > 0 ? (
                      Object.entries(a.cost).map(([r, v]) => (
                        <span key={r} className="mr-1" style={{ color: (resources[r] || 0) >= (v as number) ? resourceColor(r) : "#ef4444" }}>
                          {resourceIcon(r)}{formatNumber(v as number, 0)}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-400">free</span>
                    )}
                  </span>
                  <span className="cost text-emerald-300">
                    +{Object.entries(a.produces).map(([r, v]) => `${formatNumber(v as number, 0)}${resourceIcon(r)}`).join(" ")}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stage resources list */}
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Stage Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {stageRes.map((r) => (
              <div key={r} className="stat-card flex items-center gap-2">
                <span className="text-lg">{resourceIcon(r)}</span>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground truncate">{resourceName(r)}</div>
                  <div className="text-sm font-bold" style={{ color: resourceColor(r) }}>
                    {formatNumber(resources[r] || 0, 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
