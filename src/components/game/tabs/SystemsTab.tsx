"use client";

import { useGameStore } from "@/game/state/store";
import { systemsForStage } from "@/game/data/systems";
import { STAGES } from "@/game/data/stages";
import { systemCost } from "@/game/data/systems";
import { formatNumber, resourceColor, resourceIcon, resourceName } from "../shared/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Plus, Minus, Lock } from "lucide-react";

export function SystemsTab() {
  const stageIndex = useGameStore((s) => s.stageIndex);
  const resources = useGameStore((s) => s.resources);
  const ownedSystems = useGameStore((s) => s.ownedSystems);
  const upgrades = useGameStore((s) => s.upgrades);
  const buySystem = useGameStore((s) => s.buySystem);

  const stage = STAGES[stageIndex];
  const systems = systemsForStage(stage.id);
  const costReduction = (upgrades["frugality"] || 0) * 0.04;

  return (
    <div className="space-y-4">
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-xl">{stage.icon}</span>
            {stage.name} Systems
          </CardTitle>
          <CardDescription>
            Buy and upgrade buildings. Each purchase costs more than the last. Production runs automatically.
          </CardDescription>
        </CardHeader>
      </Card>

      {systems.length === 0 ? (
        <Card className="glass-panel">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No systems for this stage yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {systems.map((sys) => {
            const owned = ownedSystems[sys.id] || 0;
            const cost = systemCost(sys, owned, costReduction);
            const canAfford = Object.entries(cost).every(([r, v]) => (resources[r] || 0) >= (v as number));
            const atMax = sys.maxOwned ? owned >= sys.maxOwned : false;
            return (
              <SystemCard
                key={sys.id}
                sys={sys}
                owned={owned}
                cost={cost}
                canAfford={canAfford}
                atMax={atMax}
                onBuy={(qty) => buySystem(sys.id, qty)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SystemCardProps {
  sys: typeof import("@/game/data/systems").SYSTEMS[number];
  owned: number;
  cost: Partial<Record<string, number>>;
  canAfford: boolean;
  atMax: boolean;
  onBuy: (qty: number) => void;
}

function SystemCard({ sys, owned, cost, canAfford, atMax, onBuy }: SystemCardProps) {
  const [qty, setQty] = useState(1);
  const resources = useGameStore((s) => s.resources);
  return (
    <Card className="glass-panel relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, var(--primary) 0%, transparent 100%)` }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="text-2xl shrink-0">{sys.icon}</div>
            <div className="min-w-0">
              <CardTitle className="text-sm leading-tight">{sys.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5 leading-snug">{sys.desc}</CardDescription>
            </div>
          </div>
          {owned > 0 && (
            <Badge variant="secondary" className="shrink-0">×{owned}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Production / effects */}
        {Object.keys(sys.produces).length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="text-muted-foreground">Produces:</span>
            {Object.entries(sys.produces).map(([r, v]) => (
              <span key={r} className="font-semibold" style={{ color: resourceColor(r) }}>
                +{formatNumber((v as number) * owned, 2)}/s {resourceIcon(r)}
              </span>
            ))}
          </div>
        )}
        {sys.capacityBoost && Object.keys(sys.capacityBoost).length > 0 && owned > 0 && (
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="text-muted-foreground">Capacity:</span>
            {Object.entries(sys.capacityBoost).map(([r, v]) => (
              <span key={r} style={{ color: resourceColor(r) }}>
                +{(v as number) * owned} {resourceName(r)}
              </span>
            ))}
          </div>
        )}
        {sys.upkeep && Object.keys(sys.upkeep).length > 0 && owned > 0 && (
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="text-muted-foreground">Upkeep:</span>
            {Object.entries(sys.upkeep).map(([r, v]) => (
              <span key={r} className="text-red-400">
                −{formatNumber((v as number) * owned, 2)}/s {resourceIcon(r)}
              </span>
            ))}
          </div>
        )}

        {/* Cost */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(cost).map(([r, v]) => {
              const have = (resources[r] || 0);
              const enough = have >= (v as number);
              return (
                <span key={r} className={enough ? "" : "text-red-400"} style={enough ? { color: resourceColor(r) } : undefined}>
                  {resourceIcon(r)}{formatNumber(v as number, 0)}
                </span>
              );
            })}
          </div>
        </div>

        {/* Buy buttons */}
        <div className="flex items-center gap-1 pt-1">
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setQty(Math.max(1, qty - 1))}>
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-xs w-8 text-center tabular-nums">×{qty}</span>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setQty(Math.min(100, qty + 1))}>
            <Plus className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            className="h-7 ml-auto flex-1"
            disabled={!canAfford || atMax}
            onClick={() => onBuy(qty)}
          >
            {atMax ? "Max owned" : `Build ${qty > 1 ? `×${qty}` : ""}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
