"use client";

import { useGameStore } from "@/game/state/store";
import {
  HYBRID_LINEAGES,
  OMNIPOTENCE_STANCES,
  hybridBonus,
  instabilityRateMult,
  effectiveInstabilityRate,
} from "@/game/data/omnipotence";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Atom, CheckCircle2, AlertTriangle } from "lucide-react";

export function OmnipotenceModal() {
  const show = useGameStore((s) => s.showOmnipotence);
  const setShow = useGameStore((s) => s.setShowOmnipotence);
  const unlockedLayers = useGameStore((s) => s.unlockedLayers);
  const equippedHybrids = useGameStore((s) => s.equippedHybrids || {});
  const activeStance = useGameStore((s) => s.activeOmnipotenceStance || "balanced");
  const instability = useGameStore((s) => s.instability || 0);
  const peakInstability = useGameStore((s) => s.peakInstability || 0);

  const toggleHybridLineage = useGameStore((s) => s.toggleHybridLineage);
  const setOmnipotenceStance = useGameStore((s) => s.setOmnipotenceStance);

  const isUnlocked = !!unlockedLayers.omnipotence;
  const hb = hybridBonus(equippedHybrids, activeStance);
  const rate = effectiveInstabilityRate(equippedHybrids, activeStance);
  const stanceRateMult = instabilityRateMult(activeStance);
  const equippedCount = HYBRID_LINEAGES.filter((h) => equippedHybrids[h.id]).length;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Atom className="w-5 h-5" />
            Layer 7 — Omnipotence
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Equip Hybrid Lineages (two archetypes fused). Each adds instability — at 100, your run ends. Choose a Stance to trade power for safety.
            </span>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-violet-300 border-violet-400/40">
                {equippedCount} hybrid(s)
              </Badge>
              <Badge variant="outline" className={instability >= 75 ? "text-rose-400 border-rose-400/60" : "text-rose-300 border-rose-400/40"}>
                {instability.toFixed(1)} / 100
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <div className="text-center text-muted-foreground py-10">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Omnipotence is sealed.</p>
            <p className="text-xs mt-1">Activate 3+ Logic Cores (Layer 6 — Singularity) to unlock Omnipotence.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Instability meter */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Instability (run ends at 100)
                </div>
                <div className="text-[0.65rem] text-rose-300/80">
                  rate ×{stanceRateMult.toFixed(2)} · {rate.toFixed(3)}/s · peak {peakInstability.toFixed(1)}
                </div>
              </div>
              <div className="h-2 bg-rose-950/50 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${instability >= 75 ? "bg-rose-500" : "bg-rose-400/70"}`}
                  style={{ width: `${Math.min(100, instability)}%` }}
                />
              </div>
              <div className="text-[0.6rem] text-muted-foreground mt-1">
                Active bonuses: +{(hb.productionMult * 100).toFixed(0)}% prod, +{(hb.capMult * 100).toFixed(0)}% cap, +{(hb.epMult * 100).toFixed(0)}% EP, +{(hb.popGrowthMult * 100).toFixed(0)}% pop
              </div>
            </div>

            {/* Stances */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Stance (trade off instability vs. bonus)</div>
              <div className="grid grid-cols-3 gap-1.5">
                {OMNIPOTENCE_STANCES.map((s) => {
                  const active = activeStance === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setOmnipotenceStance(s.id)}
                      className={`stat-card text-left p-2 ${active ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{s.icon}</span>
                        <span className="text-xs font-medium">{s.name}</span>
                      </div>
                      <div className="text-[0.55rem] text-muted-foreground mt-0.5 leading-tight">{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Hybrid Lineages */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Hybrid Lineages (each combines 2 archetypes)</div>
              <div className="space-y-1.5">
                {HYBRID_LINEAGES.map((h) => {
                  const equipped = !!equippedHybrids[h.id];
                  return (
                    <div key={h.id} className={`stat-card flex items-center gap-3 py-2 ${equipped ? "border-amber-400/60" : ""}`}>
                      <span className="text-xl shrink-0">{h.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{h.name}</span>
                          {equipped && (
                            <Badge className="text-[0.6rem] bg-amber-500/20 text-amber-300 border-amber-400/40">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Equipped
                            </Badge>
                          )}
                        </div>
                        <div className="text-[0.65rem] text-muted-foreground leading-snug">{h.desc}</div>
                        <div className="text-[0.6rem] text-rose-300/80 mt-0.5">+{h.instabilityPerSec.toFixed(2)} instability/s</div>
                      </div>
                      <Button
                        size="sm"
                        variant={equipped ? "outline" : "default"}
                        className="h-7"
                        onClick={() => toggleHybridLineage(h.id)}
                      >
                        {equipped ? "Unequip" : "Equip"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <Separator className="my-2" />
        <div className="text-[0.65rem] text-muted-foreground px-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Peak instability ≥ 80 unlocks Layer 8 (Divinity). Instability resets on prestige; equipped hybrids + stance persist.
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShow(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
