"use client";

import { useGameStore } from "@/game/state/store";
import { STAGES } from "@/game/data/stages";
import { SYSTEMS } from "@/game/data/systems";
import { TECHS } from "@/game/data/techs";
import { formatNumber, formatTime } from "../shared/format";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, Star, Clock, TrendingUp, Sparkles } from "lucide-react";

export function StagePanel() {
  const stageIndex = useGameStore((s) => s.stageIndex);
  const population = useGameStore((s) => s.population);
  const time = useGameStore((s) => s.time);
  const resources = useGameStore((s) => s.resources);
  const ownedSystems = useGameStore((s) => s.ownedSystems);
  const technologies = useGameStore((s) => s.technologies);
  const setShowEvolve = useGameStore((s) => s.setShowEvolve);
  const upgrades = useGameStore((s) => s.upgrades);

  const stage = STAGES[stageIndex];
  const totalSystems = Object.values(ownedSystems).reduce((a, b) => a + b, 0);
  const totalTech = Object.keys(technologies).length;
  const score = computeScore(resources, ownedSystems, technologies, population, time);

  const reqs = stage.evolveRequires;
  const evolveBoost = 1 - Math.min(0.30, (upgrades["evolutionary_momentum"] || 0) * 0.05);
  const popPct = Math.min(100, (population / (reqs.minPopulation * evolveBoost)) * 100);
  const sysPct = Math.min(100, (totalSystems / (reqs.minSystems * evolveBoost)) * 100);
  const techPct = Math.min(100, (totalTech / (reqs.minTech * evolveBoost)) * 100);
  const scorePct = Math.min(100, (score / (reqs.minScore * evolveBoost)) * 100);
  const canEvolve = popPct >= 100 && sysPct >= 100 && techPct >= 100 && scorePct >= 100;

  return (
    <div className="glass-panel rounded-xl p-4 relative overflow-hidden">
      {/* Accent glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: stage.accent }}
      />

      <div className="flex items-start justify-between mb-3 relative">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl leading-none">{stage.icon}</span>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{stage.name}</h2>
              <p className="text-xs text-muted-foreground italic">{stage.tagline}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Stage</div>
          <div className="text-sm font-semibold">
            {stageIndex + 1} / {STAGES.length}
          </div>
        </div>
      </div>

      {/* Stage art portal */}
      <div
        className="stage-portal mb-3 flex items-center justify-center"
        style={{ background: stage.bgGradient }}
      >
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-1 animate-pulse" style={{ filter: `drop-shadow(0 0 20px ${stage.accent})` }}>
            {stage.icon}
          </div>
          <div className="text-xs text-white/70 font-medium uppercase tracking-widest">
            {stage.name} Era · {stage.duration}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{stage.desc}</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <StatBox
          icon={<Users className="w-3.5 h-3.5" />}
          label="Population"
          value={formatNumber(population, 0)}
          sub={population > reqs.minPopulation * evolveBoost ? "✓ ready" : `need ${formatNumber(reqs.minPopulation * evolveBoost, 0)}`}
          ok={population >= reqs.minPopulation * evolveBoost}
        />
        <StatBox
          icon={<Sparkles className="w-3.5 h-3.5" />}
          label="Systems"
          value={formatNumber(totalSystems, 0)}
          sub={totalSystems >= reqs.minSystems * evolveBoost ? "✓ ready" : `need ${reqs.minSystems * evolveBoost}`}
          ok={totalSystems >= reqs.minSystems * evolveBoost}
        />
        <StatBox
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          label="Tech"
          value={formatNumber(totalTech, 0)}
          sub={totalTech >= reqs.minTech * evolveBoost ? "✓ ready" : `need ${reqs.minTech * evolveBoost}`}
          ok={totalTech >= reqs.minTech * evolveBoost}
        />
        <StatBox
          icon={<Star className="w-3.5 h-3.5" />}
          label="Score"
          value={formatNumber(score, 0)}
          sub={score >= reqs.minScore * evolveBoost ? "✓ ready" : `need ${formatNumber(reqs.minScore * evolveBoost, 0)}`}
          ok={score >= reqs.minScore * evolveBoost}
        />
      </div>

      {/* Evolve progress */}
      <div className="space-y-2 mb-3">
        <ProgressRow label="Population" pct={popPct} color="bg-cyan-400" />
        <ProgressRow label="Systems" pct={sysPct} color="bg-violet-400" />
        <ProgressRow label="Technology" pct={techPct} color="bg-amber-400" />
        <ProgressRow label="Score" pct={scorePct} color="bg-emerald-400" />
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!canEvolve}
        onClick={() => setShowEvolve(true)}
        style={canEvolve ? { background: stage.accent, color: "#0a0a1a" } : undefined}
      >
        {stageIndex >= STAGES.length - 1 ? "🌌 Achieve Galactic Ascension" : `Evolve to ${STAGES[stageIndex + 1]?.name || "Next"}`}
      </Button>
      {!canEvolve && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Complete all four requirements to evolve
        </p>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, sub, ok }: { icon: React.ReactNode; label: string; value: string; sub: string; ok: boolean }) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
        {icon}
        <span className="uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-lg font-bold leading-none">{value}</div>
      <div className={cn("text-xs mt-0.5", ok ? "text-emerald-400" : "text-muted-foreground")}>{sub}</div>
    </div>
  );
}

function ProgressRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", color)}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
        {Math.floor(pct)}%
      </span>
    </div>
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
