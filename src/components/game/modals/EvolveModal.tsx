"use client";

import { useGameStore } from "@/game/state/store";
import { STAGES } from "@/game/data/stages";
import { SYSTEMS } from "@/game/data/systems";
import { TECHS } from "@/game/data/techs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { formatNumber } from "../shared/format";

export function EvolveModal() {
  const showEvolve = useGameStore((s) => s.showEvolve);
  const setShowEvolve = useGameStore((s) => s.setShowEvolve);
  const stageIndex = useGameStore((s) => s.stageIndex);
  const population = useGameStore((s) => s.population);
  const ownedSystems = useGameStore((s) => s.ownedSystems);
  const technologies = useGameStore((s) => s.technologies);
  const resources = useGameStore((s) => s.resources);
  const time = useGameStore((s) => s.time);
  const upgrades = useGameStore((s) => s.upgrades);
  const evolveStage = useGameStore((s) => s.evolveStage);

  const stage = STAGES[stageIndex];
  const next = STAGES[stageIndex + 1];
  const isFinal = !next;

  const reqs = stage.evolveRequires;
  const evolveBoost = 1 - Math.min(0.30, (upgrades["evolutionary_momentum"] || 0) * 0.05);
  const totalSystems = Object.values(ownedSystems).reduce((a, b) => a + b, 0);
  const totalTech = Object.keys(technologies).length;
  const score = computeScore(resources, ownedSystems, technologies, population, time);

  const checks = [
    { label: "Population", current: population, need: reqs.minPopulation * evolveBoost },
    { label: "Systems built", current: totalSystems, need: reqs.minSystems * evolveBoost },
    { label: "Technologies", current: totalTech, need: reqs.minTech * evolveBoost },
    { label: "Score", current: score, need: reqs.minScore * evolveBoost },
  ];

  const canEvolve = checks.every((c) => c.current >= c.need);

  return (
    <Dialog open={showEvolve} onOpenChange={setShowEvolve}>
      <DialogContent className="max-w-lg glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">{stage.icon}</span>
            {isFinal ? "Achieve Galactic Ascension" : `Evolve: ${stage.name} → ${next?.name}`}
          </DialogTitle>
          <DialogDescription>
            {isFinal
              ? "Your civilization has reached the pinnacle of mortal achievement. Beyond lies the divine."
              : "Complete all four requirements to evolve to the next stage of life."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Story beat */}
          <div className="rounded-lg bg-muted/30 border border-border p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {isFinal ? "Final Words" : `${stage.name} → ${next?.name}`}
            </div>
            <p className="text-sm italic leading-relaxed text-foreground/90">
              &ldquo;{isFinal ? stage.storyOutro : stage.storyOutro}&rdquo;
            </p>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            {checks.map((c) => {
              const ok = c.current >= c.need;
              const pct = Math.min(100, (c.current / c.need) * 100);
              return (
                <div key={c.label} className="flex items-center gap-3">
                  {ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm w-28 shrink-0">{c.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={`h-full transition-all ${ok ? "bg-emerald-400" : "bg-amber-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-xs tabular-nums w-24 text-right ${ok ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {formatNumber(c.current, 0)} / {formatNumber(c.need, 0)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Next stage preview */}
          {!isFinal && (
            <div className="rounded-lg border border-accent/30 p-3" style={{ background: `${next.accent}10` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{next.icon}</span>
                <span className="text-sm font-bold">{next.name}</span>
                <Badge variant="outline" className="text-xs ml-auto">{next.duration}</Badge>
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">{next.tagline}. {next.desc}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setShowEvolve(false)}>Not yet</Button>
            <Button
              disabled={!canEvolve}
              onClick={() => {
                evolveStage();
                setShowEvolve(false);
              }}
              className="gap-1"
              style={canEvolve ? { background: next?.accent || stage.accent, color: "#0a0a1a" } : undefined}
            >
              {isFinal ? "Ascend 🌌" : `Evolve to ${next?.name}`}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function computeScore(
  resources: Record<string, number>,
  ownedSystems: Record<string, number>,
  technologies: Record<string, boolean>,
  population: number,
  time: number
): number {
  const totalSystems = Object.values(ownedSystems).reduce((a, b) => a + b, 0);
  const totalTech = Object.keys(technologies).length;
  const resourceSum = Object.values(resources).reduce((a, b) => a + b, 0);
  return Math.floor(
    population * 2 +
    totalSystems * 5 +
    totalTech * 10 +
    resourceSum * 0.5 +
    time * 0.1
  );
}
