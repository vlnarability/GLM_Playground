"use client";

import { useGameStore } from "@/game/state/store";
import { STAGES } from "@/game/data/stages";
import { formatNumber, formatTime } from "../shared/format";
import { Button } from "@/components/ui/button";
import { Pause, Play, FastForward, Save, RotateCcw, Settings, Store, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Header() {
  const stageIndex = useGameStore((s) => s.stageIndex);
  const population = useGameStore((s) => s.population);
  const time = useGameStore((s) => s.time);
  const speed = useGameStore((s) => s.speed);
  const paused = useGameStore((s) => s.paused);
  const evolutionPoints = useGameStore((s) => s.evolutionPoints);
  const galacticWins = useGameStore((s) => s.galacticWins);
  const totalRuns = useGameStore((s) => s.totalRuns);

  const setSpeed = useGameStore((s) => s.setSpeed);
  const togglePause = useGameStore((s) => s.togglePause);
  const saveGame = useGameStore((s) => s.saveGame);
  const setShowShop = useGameStore((s) => s.setShowShop);
  const hardReset = useGameStore((s) => s.hardReset);

  const stage = STAGES[stageIndex];
  const [showConfirm, setShowConfirm] = useState(false);

  const speeds = [1, 2, 4, 8];
  const speedIdx = speeds.indexOf(speed);
  const nextSpeed = speeds[(speedIdx + 1) % speeds.length];

  return (
    <header
      className="sticky top-0 z-30 glass-strong border-b border-border"
      style={{ boxShadow: `inset 0 -1px 0 ${stage.accent}40` }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-3">
        {/* Logo + title */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ background: `${stage.accent}20`, border: `1px solid ${stage.accent}40` }}
          >
            {stage.icon}
          </div>
          <div className="min-w-0 hidden sm:block">
            <h1 className="text-base font-bold leading-tight truncate">
              Evolution Idle
            </h1>
            <p className="text-xs text-muted-foreground leading-tight truncate">
              {stage.name} · {stage.tagline}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          <HeaderStat
            icon={<Clock className="w-3 h-3" />}
            label="Time"
            value={formatTime(time)}
            color="text-cyan-300"
          />
          <HeaderStat
            label="Pop"
            value={formatNumber(population, 0)}
            color="text-emerald-300"
          />
          {evolutionPoints > 0 && (
            <HeaderStat
              label="EP"
              value={formatNumber(evolutionPoints, 0)}
              color="text-amber-300"
            />
          )}
          {galacticWins > 0 && (
            <HeaderStat
              label="Wins"
              value={formatNumber(galacticWins, 0)}
              color="text-violet-300"
            />
          )}
        </div>

        {/* Speed controls */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={togglePause}
            title={paused ? "Resume" : "Pause"}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => setSpeed(nextSpeed)}
            title="Cycle speed"
          >
            <FastForward className="w-3 h-3 mr-1" />
            {speed}×
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 hidden sm:flex"
            onClick={() => setShowShop(true)}
          >
            <Store className="w-3 h-3 mr-1" />
            Shop
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => saveGame()}
            title="Save game"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowConfirm(true)}
            title="Hard reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile speed bar */}
      <div className="md:hidden flex items-center justify-center gap-1 pb-2 px-3">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={togglePause}
        >
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          <span className="ml-1">{paused ? "Paused" : "Playing"}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setSpeed(nextSpeed)}
        >
          <FastForward className="w-3 h-3 mr-1" />
          {speed}×
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setShowShop(true)}
        >
          <Store className="w-3 h-3 mr-1" />
          Shop
        </Button>
      </div>

      {/* Hard reset confirm */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="glass-strong rounded-xl p-5 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Hard Reset
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will erase ALL progress — every run, every upgrade, every story beat.
              You will start completely fresh. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  hardReset();
                  setShowConfirm(false);
                }}
              >
                Erase Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderStat({
  icon,
  label,
  value,
  color,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/30 border border-border/40 whitespace-nowrap">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-xs font-bold tabular-nums", color)}>{value}</span>
    </div>
  );
}
