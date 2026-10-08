"use client";

import { useGameStore } from "@/game/state/store";
import {
  ECHO_TYPES,
  FORK_SCENARIOS,
  FUTURE_DEBT_TIERS,
  echoBonus,
  forkBonus,
  activeDebtBonus,
} from "@/game/data/infinity";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Infinity as InfinityIcon, CheckCircle2, Coins, GitBranch, Clock } from "lucide-react";
import { formatNumber } from "../shared/format";

export function InfinityModal() {
  const show = useGameStore((s) => s.showInfinity);
  const setShow = useGameStore((s) => s.setShowInfinity);
  const unlockedLayers = useGameStore((s) => s.unlockedLayers);
  const echoes = useGameStore((s) => s.echoes);
  const purchasedEchoes = useGameStore((s) => s.purchasedEchoes || {});
  const resolvedForks = useGameStore((s) => s.resolvedForks || {});
  const takenDebts = useGameStore((s) => s.takenFutureDebts || {});
  const repaidDebts = useGameStore((s) => s.repaidFutureDebts || {});

  const purchaseEcho = useGameStore((s) => s.purchaseEcho);
  const resolveFork = useGameStore((s) => s.resolveFork);
  const takeFutureDebt = useGameStore((s) => s.takeFutureDebt);
  const repayFutureDebt = useGameStore((s) => s.repayFutureDebt);

  const isUnlocked = !!unlockedLayers.infinity;
  const echoB = echoBonus(purchasedEchoes);
  const forkB = forkBonus(resolvedForks);
  const debtB = activeDebtBonus(takenDebts, repaidDebts);
  const purchasedEchoCount = ECHO_TYPES.filter((e) => purchasedEchoes[e.id]).length;
  const resolvedForkCount = forkB.resolvedCount;
  const activeDebtCount = debtB.activeCount;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <InfinityIcon className="w-5 h-5" />
            Layer 9 — Infinity
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Buy Echoes (past-run bonuses), resolve Fork Scenarios, take Future Debt. Resolve all forks + repay all debt to unlock Eternity.
            </span>
            <Badge variant="outline" className="text-cyan-300 border-cyan-400/40">
              {formatNumber(echoes, 0)} Echoes
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <div className="text-center text-muted-foreground py-10">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Infinity is sealed.</p>
            <p className="text-xs mt-1">Level 3+ Prayer Channels AND choose a Worship Polarity (Layer 8) to unlock Infinity.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="stat-card">
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">
                {purchasedEchoCount}/6 echoes · {resolvedForkCount}/4 forks resolved · {activeDebtCount} active debt(s)
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-cyan-300 border-cyan-400/40">+{((echoB.productionMult + forkB.productionMult + debtB.productionMult) * 100).toFixed(0)}% prod</Badge>
                <Badge variant="outline" className="text-amber-300 border-amber-400/40">+{((echoB.capMult + forkB.capMult + debtB.capMult) * 100).toFixed(0)}% cap</Badge>
                <Badge variant="outline" className="text-emerald-300 border-emerald-400/40">+{((echoB.epMult + forkB.epMult + debtB.epMult) * 100).toFixed(0)}% EP</Badge>
                <Badge variant="outline" className="text-violet-300 border-violet-400/40">+{((echoB.popGrowthMult + forkB.popGrowthMult + debtB.popGrowthMult) * 100).toFixed(0)}% pop</Badge>
              </div>
            </div>

            {/* Echoes */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3" /> Echo Types (permanent, cost Echoes)
              </div>
              <div className="space-y-1.5">
                {ECHO_TYPES.map((e) => {
                  const purchased = !!purchasedEchoes[e.id];
                  const canAfford = echoes >= e.cost;
                  return (
                    <div key={e.id} className={`stat-card flex items-center gap-3 py-2 ${purchased ? "border-emerald-400/40" : ""}`}>
                      <span className="text-xl shrink-0">{e.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{e.name}</span>
                          {purchased && (
                            <Badge className="text-[0.6rem] bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Owned
                            </Badge>
                          )}
                        </div>
                        <div className="text-[0.65rem] text-muted-foreground leading-snug">{e.desc}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[0.6rem] text-cyan-300/80">{e.cost} Echoes</div>
                        <Button
                          size="sm"
                          className="h-7 mt-1"
                          disabled={purchased || !canAfford}
                          onClick={() => purchaseEcho(e.id)}
                        >
                          {purchased ? "Owned" : "Buy"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Fork Scenarios */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <GitBranch className="w-3 h-3" /> Fork Scenarios (choose 1 branch each — permanent for run)
              </div>
              <div className="space-y-2">
                {FORK_SCENARIOS.map((f) => {
                  const resolved = resolvedForks[f.id];
                  return (
                    <div key={f.id} className="stat-card p-2">
                      <div className="text-xs font-semibold flex items-center gap-1.5 mb-1">
                        <span>{f.icon}</span> {f.name}
                        <span className="text-muted-foreground italic"> — {f.desc}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {f.branches.map((b) => {
                          const chosen = resolved === b.id;
                          const isResolved = !!resolved;
                          return (
                            <button
                              key={b.id}
                              onClick={() => !isResolved && resolveFork(f.id, b.id)}
                              disabled={isResolved}
                              className={`stat-card text-left p-2 ${chosen ? "border-amber-400/60 bg-amber-500/10" : isResolved ? "opacity-50" : "hover:border-amber-400/40"}`}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium">{b.label}</span>
                                {chosen && <CheckCircle2 className="w-2.5 h-2.5 text-amber-300 ml-auto" />}
                              </div>
                              <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{b.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Future Debt */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Future Debt (borrow now, repay later)
              </div>
              <div className="space-y-1.5">
                {FUTURE_DEBT_TIERS.map((d) => {
                  const taken = !!takenDebts[d.id];
                  const repaid = !!repaidDebts[d.id];
                  const canRepay = taken && !repaid && echoes >= d.repaymentCost;
                  return (
                    <div key={d.id} className={`stat-card flex items-center gap-3 py-2 ${taken && !repaid ? "border-amber-400/60" : repaid ? "border-emerald-400/40" : ""}`}>
                      <span className="text-xl shrink-0">{d.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{d.name}</span>
                          {taken && !repaid && <Badge variant="outline" className="text-[0.6rem] text-amber-300 border-amber-400/40">Active</Badge>}
                          {repaid && (
                            <Badge className="text-[0.6rem] bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Repaid
                            </Badge>
                          )}
                        </div>
                        <div className="text-[0.65rem] text-muted-foreground leading-snug">{d.desc}</div>
                      </div>
                      <div className="shrink-0">
                        {!taken ? (
                          <Button size="sm" variant="default" className="h-7" onClick={() => takeFutureDebt(d.id)}>
                            Borrow
                          </Button>
                        ) : !repaid ? (
                          <Button size="sm" variant="outline" className="h-7" disabled={!canRepay} onClick={() => repayFutureDebt(d.id)}>
                            Repay ({d.repaymentCost})
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-[0.6rem] text-muted-foreground">Done</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <Separator className="my-2" />
        <div className="text-[0.65rem] text-muted-foreground px-1 flex items-center gap-1">
          <InfinityIcon className="w-3 h-3" />
          Resolve all 4 forks AND repay every debt taken to unlock Layer 10 (Eternity). Echoes persist; forks + debts reset each run.
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShow(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
