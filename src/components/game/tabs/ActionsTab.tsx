"use client";

import { useGameStore, isActionCapped } from "@/game/state/store";
import { actionsForStage } from "@/game/data/actions";
import { STAGES } from "@/game/data/stages";
import { formatNumber, resourceColor, resourceIcon } from "../shared/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";

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

interface FloatNum {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
}

function ActionCard({ action }: { action: typeof import("@/game/data/actions").ACTIONS[number] }) {
  const resources = useGameStore((s) => s.resources);
  const capacities = useGameStore((s) => s.capacities);
  const performAction = useGameStore((s) => s.performAction);
  const [floats, setFloats] = useState<FloatNum[]>([]);
  const floatId = useRef(0);

  const canAfford = !action.cost || Object.entries(action.cost).every(([r, v]) => (resources[r] || 0) >= (v as number));
  const capped = isActionCapped(action.produces as Record<string, number>, resources, capacities);
  const disabled = !canAfford || capped;

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Create floating numbers for each produced resource
    const newFloats: FloatNum[] = Object.entries(action.produces).map(([r, v], i) => {
      const id = floatId.current++;
      return {
        id,
        text: `+${formatNumber(v as number)}${resourceIcon(r)}`,
        color: resourceColor(r),
        x: rect.width / 2 + (i - (Object.keys(action.produces).length - 1) / 2) * 30,
        y: 10,
      };
    });
    setFloats((prev) => [...prev, ...newFloats]);
    // Remove floats after animation
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => !newFloats.find((nf) => nf.id === f.id)));
    }, 800);
    performAction(action.id);
  }, [disabled, action, performAction]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn("action-btn relative overflow-visible", capped && "opacity-40")}
      title={capped ? "Output resource is at capacity — no waste" : action.desc}
    >
      {/* Floating numbers */}
      {floats.map((f) => (
        <span
          key={f.id}
          className="absolute font-bold text-sm pointer-events-none z-20"
          style={{
            left: `${f.x}px`,
            top: `${f.y}px`,
            color: f.color,
            animation: "floatUp 0.8s ease-out forwards",
          }}
        >
          {f.text}
        </span>
      ))}
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
