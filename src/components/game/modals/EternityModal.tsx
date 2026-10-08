"use client";

import { useGameStore } from "@/game/state/store";
import {
  TESTAMENT_CLAUSES,
  CANONIZATIONS,
  PERMANENCE_WEAVES,
  ENDING_CHOICES,
  testamentClauseBonus,
  canonizationBonus,
  permanenceWeaveBonus,
  cosmicBoonBonus,
} from "@/game/data/eternity";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Sparkles, CheckCircle2, Scroll, Crown, RefreshCw, Star } from "lucide-react";
import { formatNumber } from "../shared/format";

export function EternityModal() {
  const show = useGameStore((s) => s.showEternity);
  const setShow = useGameStore((s) => s.setShowEternity);
  const unlockedLayers = useGameStore((s) => s.unlockedLayers);
  const testamentClauses = useGameStore((s) => s.testamentClauses);
  const purchasedClauses = useGameStore((s) => s.purchasedTestamentClauses || {});
  const activeCanonizations = useGameStore((s) => s.activeCanonizations || {});
  const activeWeaves = useGameStore((s) => s.activePermanenceWeaves || {});
  const chosenEnding = useGameStore((s) => s.chosenEnding);
  const cosmicBoonStacks = useGameStore((s) => s.cosmicBoonStacks || 0);

  const purchaseTestamentClause = useGameStore((s) => s.purchaseTestamentClause);
  const toggleCanonization = useGameStore((s) => s.toggleCanonization);
  const togglePermanenceWeave = useGameStore((s) => s.togglePermanenceWeave);
  const chooseEnding = useGameStore((s) => s.chooseEnding);

  const isUnlocked = !!unlockedLayers.eternity;
  const testB = testamentClauseBonus(purchasedClauses);
  const canonB = canonizationBonus(activeCanonizations);
  const weaveB = permanenceWeaveBonus(activeWeaves);
  const boon = cosmicBoonBonus(cosmicBoonStacks);
  const purchasedClauseCount = TESTAMENT_CLAUSES.filter((c) => purchasedClauses[c.id]).length;
  const activeCanonCount = CANONIZATIONS.filter((c) => activeCanonizations[c.id]).length;
  const activeWeaveCount = PERMANENCE_WEAVES.filter((w) => activeWeaves[w.id]).length;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5" />
            Layer 10 — Eternity
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Enact Testament Clauses, Canonize events, weave Permanence across resets. Choose an Ending to complete the layer.
            </span>
            <Badge variant="outline" className="text-amber-300 border-amber-400/40">
              {formatNumber(testamentClauses, 0)} Clauses
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <div className="text-center text-muted-foreground py-10">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Eternity is sealed.</p>
            <p className="text-xs mt-1">Resolve all 4 forks AND repay every debt taken (Layer 9 — Infinity) to unlock Eternity.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="stat-card">
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">
                {purchasedClauseCount}/8 clauses · {activeCanonCount}/3 canonizations · {activeWeaveCount}/3 weaves · {cosmicBoonStacks} Cosmic Boon stack(s)
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-cyan-300 border-cyan-400/40">+{((testB.productionMult + canonB.productionMult + weaveB.productionMult + boon) * 100).toFixed(0)}% prod</Badge>
                <Badge variant="outline" className="text-amber-300 border-amber-400/40">+{((testB.capMult + canonB.capMult + weaveB.capMult) * 100).toFixed(0)}% cap</Badge>
                <Badge variant="outline" className="text-emerald-300 border-emerald-400/40">+{((testB.epMult + canonB.epMult + weaveB.epMult) * 100).toFixed(0)}% EP</Badge>
                <Badge variant="outline" className="text-violet-300 border-violet-400/40">+{((testB.popGrowthMult + canonB.popGrowthMult + weaveB.popGrowthMult) * 100).toFixed(0)}% pop</Badge>
              </div>
            </div>

            {/* Testament Clauses */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Scroll className="w-3 h-3" /> Testament Clauses (permanent, cost Clauses)
              </div>
              <div className="space-y-1.5">
                {TESTAMENT_CLAUSES.map((c) => {
                  const purchased = !!purchasedClauses[c.id];
                  const canAfford = testamentClauses >= c.cost;
                  return (
                    <div key={c.id} className={`stat-card flex items-center gap-3 py-2 ${purchased ? "border-emerald-400/40" : ""}`}>
                      <span className="text-xl shrink-0">{c.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{c.name}</span>
                          {purchased && (
                            <Badge className="text-[0.6rem] bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Enacted
                            </Badge>
                          )}
                        </div>
                        <div className="text-[0.65rem] text-muted-foreground leading-snug">{c.desc}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[0.6rem] text-amber-300/80">{c.cost} Clauses</div>
                        <Button
                          size="sm"
                          className="h-7 mt-1"
                          disabled={purchased || !canAfford}
                          onClick={() => purchaseTestamentClause(c.id)}
                        >
                          {purchased ? "Enacted" : "Enact"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Canonizations */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Canonizations (declare events/archetypes eternal — costs Clauses to activate)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {CANONIZATIONS.map((c) => {
                  const active = !!activeCanonizations[c.id];
                  const canAfford = testamentClauses >= c.cost;
                  return (
                    <button
                      key={c.id}
                      onClick={() => active || canAfford ? toggleCanonization(c.id) : undefined}
                      disabled={!active && !canAfford}
                      className={`stat-card text-left p-2 ${active ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{c.icon}</span>
                        <span className="text-xs font-medium">{c.name}</span>
                        {active && <CheckCircle2 className="w-2.5 h-2.5 text-amber-300 ml-auto" />}
                      </div>
                      <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{c.desc}</div>
                      <div className="text-[0.55rem] text-amber-300/80 mt-0.5">{c.cost} Clauses</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Permanence Weaves */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Permanence Weaves (pin laws/modes/routes through resets)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {PERMANENCE_WEAVES.map((w) => {
                  const active = !!activeWeaves[w.id];
                  const canAfford = testamentClauses >= w.cost;
                  return (
                    <button
                      key={w.id}
                      onClick={() => active || canAfford ? togglePermanenceWeave(w.id) : undefined}
                      disabled={!active && !canAfford}
                      className={`stat-card text-left p-2 ${active ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{w.icon}</span>
                        <span className="text-xs font-medium">{w.name}</span>
                        {active && <CheckCircle2 className="w-2.5 h-2.5 text-amber-300 ml-auto" />}
                      </div>
                      <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{w.desc}</div>
                      <div className="text-[0.55rem] text-amber-300/80 mt-0.5">{w.cost} Clauses</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Ending Choices */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Star className="w-3 h-3" /> Ending Choice (completes Layer 10)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ENDING_CHOICES.map((e) => {
                  const chosen = chosenEnding === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => !chosen && chooseEnding(e.id)}
                      disabled={!!chosenEnding}
                      className={`stat-card text-left p-2 ${chosen ? "border-amber-400/60 bg-amber-500/10" : chosenEnding ? "opacity-50" : "hover:border-amber-400/40"}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{e.icon}</span>
                        <span className="text-xs font-medium">{e.name}</span>
                        {chosen && <CheckCircle2 className="w-2.5 h-2.5 text-amber-300 ml-auto" />}
                      </div>
                      <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{e.desc}</div>
                    </button>
                  );
                })}
              </div>
              {chosenEnding && (
                <div className="text-[0.6rem] text-amber-300/80 mt-1">
                  Ending chosen: {ENDING_CHOICES.find((e) => e.id === chosenEnding)?.name}.{" "}
                  {cosmicBoonStacks > 0 && `Cosmic Boon stacks: ${cosmicBoonStacks} (+${(boon * 100).toFixed(0)}% production).`}
                </div>
              )}
            </section>
          </div>
        )}

        <Separator className="my-2" />
        <div className="text-[0.65rem] text-muted-foreground px-1 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          Choosing an Ending completes the layer. Reset Universe grants a permanent Cosmic Boon (+10% production per stack). Clauses, canonizations, and weaves persist forever.
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShow(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
