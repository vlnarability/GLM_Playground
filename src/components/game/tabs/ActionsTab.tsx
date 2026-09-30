"use client";

import { useGameStore, isActionCapped } from "@/game/state/store";
import { actionsForStage } from "@/game/data/actions";
import { STAGES } from "@/game/data/stages";
import { formatNumber, resourceColor, resourceIcon } from "../shared/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ActionsTab() {
  const stageIndex = useGameStore((s) => s.stageIndex);
  const stage = STAGES[stageIndex];
  const actions = actionsForStage(stage.id);

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
          <CardDescription>
            Click to gather. Actions that would only overflow a capped resource are disabled — no waste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {actions.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionCard({ action }: { action: typeof import("@/game/data/actions").ACTIONS[number] }) {
  const resources = useGameStore((s) => s.resources);
  const capacities = useGameStore((s) => s.capacities);
  const performAction = useGameStore((s) => s.performAction);

  const canAfford = !action.cost || Object.entries(action.cost).every(([r, v]) => (resources[r] || 0) >= (v as number));
  const capped = isActionCapped(action.produces as Record<string, number>, resources, capacities);
  const disabled = !canAfford || capped;

  return (
    <button
      onClick={() => performAction(action.id)}
      disabled={disabled}
      className={cn("action-btn", capped && "opacity-40")}
      title={capped ? "Output resource is at capacity — no waste" : action.desc}
    >
      <span className="icon">{action.icon}</span>
      <span className="label">{action.name}</span>
      {capped ? (
        <span className="cost text-amber-500/80">capped</span>
      ) : (
        <>
          <span className="cost">
            {action.cost && Object.keys(action.cost).length > 0 ? (
              Object.entries(action.cost).map(([r, v]) => (
                <span
                  key={r}
                  className="mr-1"
                  style={{ color: (resources[r] || 0) >= (v as number) ? resourceColor(r) : "#ef4444" }}
                >
                  {resourceIcon(r)}{formatNumber(v as number)}
                </span>
              ))
            ) : (
              <span className="text-emerald-400">free</span>
            )}
          </span>
          <span className="cost text-emerald-300">
            +{Object.entries(action.produces).map(([r, v]) =>
              `${formatNumber(v as number)}${resourceIcon(r)}`
            ).join(" ")}
          </span>
        </>
      )}
    </button>
  );
}
