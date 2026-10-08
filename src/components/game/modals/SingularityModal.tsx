"use client";

import { useGameStore } from "@/game/state/store";
import {
  RELIC_LOADOUTS,
  LOGIC_CORES,
  relicBonus,
  logicCoreBonus,
} from "@/game/data/singularity";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Circle, Cpu, CheckCircle2 } from "lucide-react";
import { formatNumber } from "../shared/format";

export function SingularityModal() {
  const show = useGameStore((s) => s.showSingularity);
  const setShow = useGameStore((s) => s.setShowSingularity);
  const unlockedLayers = useGameStore((s) => s.unlockedLayers);
  const singularityCores = useGameStore((s) => s.singularityCores);
  const equippedRelics = useGameStore((s) => s.equippedRelics || {});
  const activeLogicCores = useGameStore((s) => s.activeLogicCores || {});

  const toggleRelicLoadout = useGameStore((s) => s.toggleRelicLoadout);
  const toggleLogicCore = useGameStore((s) => s.toggleLogicCore);

  const isUnlocked = !!unlockedLayers.singularity;
  const rb = relicBonus(equippedRelics);
  const cb = logicCoreBonus(activeLogicCores);
  const equippedCount = RELIC_LOADOUTS.filter((r) => equippedRelics[r.id]).length;
  const coreCount = LOGIC_CORES.filter((c) => activeLogicCores[c.id]).length;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Circle className="w-5 h-5" />
            Layer 6 — Singularity
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Equip Relic Loadouts (upside + downside) and activate Logic Cores (automation + passive bonuses). All bonuses apply as multipliers.
            </span>
            <Badge variant="outline" className="text-cyan-300 border-cyan-400/40">
              {formatNumber(singularityCores, 0)} Cores
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <div className="text-center text-muted-foreground py-10">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Singularity is sealed.</p>
            <p className="text-xs mt-1">Enact 3+ Divine Laws (Layer 5) to unlock Singularity.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="stat-card">
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">
                Active bonuses: {equippedCount} relic(s), {coreCount} core(s) active
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-cyan-300 border-cyan-400/40">+{((rb.productionMult + cb.productionMult) * 100).toFixed(0)}% prod</Badge>
                <Badge variant="outline" className="text-amber-300 border-amber-400/40">+{((rb.capMult + cb.capMult) * 100).toFixed(0)}% cap</Badge>
                <Badge variant="outline" className="text-emerald-300 border-emerald-400/40">+{((rb.epMult + cb.epMult) * 100).toFixed(0)}% EP</Badge>
                <Badge variant="outline" className="text-violet-300 border-violet-400/40">+{(rb.popGrowthMult * 100).toFixed(0)}% pop</Badge>
              </div>
            </div>

            {/* Relic Loadouts */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Relic Loadouts (each has upside + downside)</div>
              <div className="space-y-1.5">
                {RELIC_LOADOUTS.map((r) => {
                  const equipped = !!equippedRelics[r.id];
                  return (
                    <div key={r.id} className={`stat-card flex items-center gap-3 py-2 ${equipped ? "border-amber-400/60" : ""}`}>
                      <span className="text-xl shrink-0">{r.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{r.name}</span>
                          {equipped && (
                            <Badge className="text-[0.6rem] bg-amber-500/20 text-amber-300 border-amber-400/40">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Equipped
                            </Badge>
                          )}
                        </div>
                        <div className="text-[0.65rem] text-emerald-300/80 leading-snug">▲ {r.upside}</div>
                        <div className="text-[0.65rem] text-rose-300/80 leading-snug">▼ {r.downside}</div>
                      </div>
                      <Button
                        size="sm"
                        variant={equipped ? "outline" : "default"}
                        className="h-7"
                        onClick={() => toggleRelicLoadout(r.id)}
                      >
                        {equipped ? "Unequip" : "Equip"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Logic Cores */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Logic Cores (toggleable automation)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {LOGIC_CORES.map((c) => {
                  const active = !!activeLogicCores[c.id];
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleLogicCore(c.id)}
                      className={`stat-card text-left p-2 ${active ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{c.icon}</span>
                          <span className="text-xs font-medium">{c.name}</span>
                        </div>
                        <Badge variant="outline" className={`text-[0.6rem] ${active ? "text-amber-300 border-amber-400/40" : "text-muted-foreground"}`}>
                          {active ? "ACTIVE" : "OFF"}
                        </Badge>
                      </div>
                      <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{c.desc}</div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <Separator className="my-2" />
        <div className="text-[0.65rem] text-muted-foreground px-1">
          Omega Shard is exclusive (equipping it unequips all other relics). Relic and core selections persist across prestige.
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShow(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
