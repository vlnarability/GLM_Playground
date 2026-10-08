"use client";

import { useGameStore } from "@/game/state/store";
import {
  OFFERINGS,
  RITUALS,
  SCRIPTS,
  BLOOD_PACTS,
  offeringDivinityAtRepeat,
} from "@/game/data/transcendence";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Triangle, CheckCircle2, Clock } from "lucide-react";
import { formatNumber, resourceName } from "../shared/format";

export function TranscendenceModal() {
  const show = useGameStore((s) => s.showTranscendence);
  const setShow = useGameStore((s) => s.setShowTranscendence);
  const unlockedLayers = useGameStore((s) => s.unlockedLayers);
  const divinity = useGameStore((s) => s.divinity);
  const population = useGameStore((s) => s.population);
  const resources = useGameStore((s) => s.resources);
  const time = useGameStore((s) => s.time);
  const offeringsUsed = useGameStore((s) => s.transcendenceOfferingsUsed || {});
  const purchasedRituals = useGameStore((s) => s.purchasedRituals || {});
  const activeTemporaryRituals = useGameStore((s) => s.activeTemporaryRituals || {});
  const activeScripts = useGameStore((s) => s.activeScripts || {});
  const bloodPactsUsed = useGameStore((s) => s.bloodPactsUsed || {});
  // QUICK WIN 3 — ritual combo tracking
  const lastRitualTime = useGameStore((s) => s.lastRitualTime || 0);
  const lastRitualId = useGameStore((s) => s.lastRitualId);
  const ritualComboCount = useGameStore((s) => s.ritualComboCount || 0);
  const ritualComboTimer = useGameStore((s) => s.ritualComboTimer || 0);

  const performOffering = useGameStore((s) => s.performOffering);
  const performRitual = useGameStore((s) => s.performRitual);
  const toggleScript = useGameStore((s) => s.toggleScript);
  const performBloodPact = useGameStore((s) => s.performBloodPact);

  const isUnlocked = !!unlockedLayers.transcendence;
  const pactsUsedCount = BLOOD_PACTS.filter((p) => bloodPactsUsed[p.id]).length;

  // QUICK WIN 3 — combo display: show count and time remaining in the 60s window or in the divine combo bonus
  const comboActive = ritualComboTimer > 0;
  const secondsSinceLast = Math.max(0, time - lastRitualTime);
  const windowRemaining = comboActive ? ritualComboTimer : Math.max(0, 60 - secondsSinceLast);
  const comboLabel = comboActive
    ? `Divine Combo! +50% production — ${Math.ceil(ritualComboTimer)}s remaining`
    : `Combo: ${ritualComboCount}/3 (${Math.ceil(windowRemaining)}s remaining in window)`;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Triangle className="w-5 h-5" />
            Layer 3 — Transcendence
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Sacrifice resources for Divinity. Spend Divinity on rituals, scripts, and blood pacts. All 4 pacts unlock Genesis.
            </span>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-violet-300 border-violet-400/40">
                {formatNumber(divinity, 0)} Divinity
              </Badge>
              <Badge variant="outline" className="text-rose-300 border-rose-400/40">
                {pactsUsedCount}/4 pacts
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <div className="text-center text-muted-foreground py-10">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Transcendence is sealed.</p>
            <p className="text-xs mt-1">Inscribe 10 Foresight nodes (Layer 2) to unlock Transcendence.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* QUICK WIN 3 — Ritual combo progress banner */}
            <div className={`rounded-md border p-2 text-[0.7rem] flex items-center gap-2 ${comboActive ? "border-amber-400/60 bg-amber-500/10 text-amber-200" : "border-border bg-muted/20 text-muted-foreground"}`}>
              <span className="text-base">{comboActive ? "🌟" : "🔗"}</span>
              <span className="font-medium">{comboLabel}</span>
              {lastRitualId && !comboActive && (
                <span className="ml-auto text-[0.6rem] opacity-80">Last ritual: {RITUALS.find((r) => r.id === lastRitualId)?.name || lastRitualId}</span>
              )}
            </div>
            {/* Offerings */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Offerings (sacrifice resources → Divinity)</div>
              <div className="space-y-1.5">
                {OFFERINGS.map((o) => {
                  const repeats = offeringsUsed[o.id] || 0;
                  const gain = offeringDivinityAtRepeat(o, repeats);
                  const canAfford = Object.entries(o.cost).every(([r, v]) => (resources[r] || 0) >= (v as number));
                  return (
                    <div key={o.id} className="stat-card flex items-center gap-3 py-2">
                      <span className="text-xl shrink-0">{o.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{o.name}</div>
                        <div className="text-[0.65rem] text-muted-foreground leading-snug">{o.desc}</div>
                        <div className="text-[0.6rem] text-muted-foreground mt-0.5">
                          Cost: {Object.entries(o.cost).map(([r, v]) => `${formatNumber(v as number, 0)} ${resourceName(r)}`).join(", ")}
                          {repeats > 0 && <span className="ml-1 text-amber-300/80">· repeat {repeats} (×{o.repeatMult.toFixed(2)})</span>}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[0.6rem] text-emerald-300/80">+{gain} Div</div>
                        <Button size="sm" className="h-7 mt-1" disabled={!canAfford} onClick={() => performOffering(o.id)}>
                          Offer
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Rituals */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Rituals (spend Divinity for effects)</div>
              <div className="space-y-1.5">
                {RITUALS.map((r) => {
                  const purchased = r.kind === "permanent" && purchasedRituals[r.id];
                  const active = r.kind === "temporary" && (activeTemporaryRituals[r.id] || 0) > 0;
                  const canAfford = divinity >= r.cost;
                  return (
                    <div key={r.id} className={`stat-card flex items-center gap-3 py-2 ${purchased || active ? "border-emerald-400/40" : ""}`}>
                      <span className="text-xl shrink-0">{r.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{r.name}</span>
                          <Badge variant="outline" className="text-[0.6rem] capitalize">{r.kind}</Badge>
                          {purchased && (
                            <Badge className="text-[0.6rem] bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Permanent
                            </Badge>
                          )}
                          {active && (
                            <Badge className="text-[0.6rem] bg-amber-500/20 text-amber-300 border-amber-400/40">
                              <Clock className="w-2.5 h-2.5 mr-0.5" /> {Math.ceil(activeTemporaryRituals[r.id])}s
                            </Badge>
                          )}
                        </div>
                        <div className="text-[0.65rem] text-muted-foreground leading-snug">{r.desc}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[0.6rem] text-violet-300/80">{r.cost} Div</div>
                        <Button
                          size="sm"
                          className="h-7 mt-1"
                          disabled={!!purchased || !!active || !canAfford}
                          onClick={() => performRitual(r.id)}
                        >
                          {purchased ? "Owned" : active ? "Active" : "Perform"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Scripts */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Scripts (toggleable automation)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {SCRIPTS.map((sc) => {
                  const on = !!activeScripts[sc.id];
                  return (
                    <button
                      key={sc.id}
                      onClick={() => toggleScript(sc.id)}
                      className={`stat-card text-left p-2 ${on ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{sc.icon}</span>
                          <span className="text-xs font-medium">{sc.name}</span>
                        </div>
                        <Badge variant="outline" className={`text-[0.6rem] ${on ? "text-amber-300 border-amber-400/40" : "text-muted-foreground"}`}>
                          {on ? "ON" : "OFF"}
                        </Badge>
                      </div>
                      <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{sc.desc}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Blood Pacts */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Blood Pacts (sacrifice population → Divinity, once per run)</div>
              <div className="space-y-1.5">
                {BLOOD_PACTS.map((p) => {
                  const used = !!bloodPactsUsed[p.id];
                  const canAffordPop = population >= p.popCost;
                  return (
                    <div key={p.id} className={`stat-card flex items-center gap-3 py-2 ${used ? "border-rose-400/40 opacity-60" : ""}`}>
                      <span className="text-xl shrink-0">{p.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{p.name}</div>
                        <div className="text-[0.65rem] text-muted-foreground leading-snug">{p.desc}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[0.6rem] text-rose-300/80">-{p.popCost} pop</div>
                        <div className="text-[0.6rem] text-emerald-300/80">+{p.divinityGain} Div</div>
                        <Button
                          size="sm"
                          className="h-7 mt-1"
                          disabled={used || !canAffordPop}
                          onClick={() => performBloodPact(p.id)}
                        >
                          {used ? "Used" : "Pact"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <Separator className="my-2" />
        <div className="text-[0.65rem] text-muted-foreground px-1">
          Offerings scale by ~10-35% per repeat. Temporary rituals decay on prestige. Perform all 4 Blood Pacts to unlock Layer 4 (Genesis).
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShow(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
