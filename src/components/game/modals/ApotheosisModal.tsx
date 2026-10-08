"use client";

import { useGameStore } from "@/game/state/store";
import {
  DIVINE_LAWS,
  WORSHIP_MODES,
  MIRACLES,
  HERESY_RESPONSES,
  divineLawBonus,
  worshipModeBonus,
  heresyRateMult,
} from "@/game/data/apotheosis";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Crown, CheckCircle2, Flame, AlertTriangle } from "lucide-react";
import { formatNumber } from "../shared/format";

export function ApotheosisModal() {
  const show = useGameStore((s) => s.showApotheosis);
  const setShow = useGameStore((s) => s.setShowApotheosis);
  const unlockedLayers = useGameStore((s) => s.unlockedLayers);
  const faith = useGameStore((s) => s.faith);
  const heresy = useGameStore((s) => s.heresy);
  const enactedLaws = useGameStore((s) => s.enactedDivineLaws || {});
  const activeWorshipMode = useGameStore((s) => s.activeWorshipMode);
  const performedMiracles = useGameStore((s) => s.performedMiracles || {});
  const activeHeresyResponse = useGameStore((s) => s.activeHeresyResponse);

  const enactDivineLaw = useGameStore((s) => s.enactDivineLaw);
  const setWorshipMode = useGameStore((s) => s.setWorshipMode);
  const performMiracle = useGameStore((s) => s.performMiracle);
  const setHeresyResponse = useGameStore((s) => s.setHeresyResponse);

  const isUnlocked = !!unlockedLayers.apotheosis;
  const enactedCount = DIVINE_LAWS.filter((l) => enactedLaws[l.id]).length;
  const lawBonus = divineLawBonus(enactedLaws);
  const wMode = worshipModeBonus(activeWorshipMode);
  const hRateMult = heresyRateMult(activeHeresyResponse);

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Crown className="w-5 h-5" />
            Layer 5 — Apotheosis
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Enact Divine Laws, choose a Worship Mode, perform Miracles. Watch heresy — at 100, your run ends.
            </span>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-amber-300 border-amber-400/40">
                {formatNumber(faith, 0)} Faith
              </Badge>
              <Badge variant="outline" className={heresy >= 75 ? "text-rose-400 border-rose-400/60" : "text-rose-300 border-rose-400/40"}>
                {heresy.toFixed(1)} / 100 Heresy
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <div className="text-center text-muted-foreground py-10">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Apotheosis is sealed.</p>
            <p className="text-xs mt-1">Author at least 1 Genesis world (Layer 4) to unlock Apotheosis.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Heresy bar */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Heresy (run ends at 100)
                </div>
                <div className="text-[0.65rem] text-rose-300/80">gain rate ×{hRateMult.toFixed(2)}</div>
              </div>
              <div className="h-2 bg-rose-950/50 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${heresy >= 75 ? "bg-rose-500" : "bg-rose-400/70"}`}
                  style={{ width: `${Math.min(100, heresy)}%` }}
                />
              </div>
              <div className="text-[0.6rem] text-muted-foreground mt-1">
                Enacted {enactedCount} laws. Active bonuses: +{(lawBonus.productionMult * 100).toFixed(0)}% prod, +{(lawBonus.capMult * 100).toFixed(0)}% cap, +{(lawBonus.epMult * 100).toFixed(0)}% EP, +{(lawBonus.popGrowthMult * 100).toFixed(0)}% pop
              </div>
            </div>

            {/* Divine Laws */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Divine Laws ({enactedCount}/8 enacted)</div>
              <div className="space-y-1.5">
                {DIVINE_LAWS.map((l) => {
                  const enacted = !!enactedLaws[l.id];
                  const canAfford = faith >= l.faithCost;
                  return (
                    <div key={l.id} className={`stat-card flex items-center gap-3 py-2 ${enacted ? "border-emerald-400/40" : ""}`}>
                      <span className="text-xl shrink-0">{l.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{l.name}</div>
                        <div className="text-[0.65rem] text-muted-foreground leading-snug">{l.desc}</div>
                        {l.bonus.heresyRateMult !== undefined && (
                          <div className={`text-[0.6rem] mt-0.5 ${l.bonus.heresyRateMult > 1 ? "text-rose-300/80" : "text-emerald-300/80"}`}>
                            Heresy rate ×{l.bonus.heresyRateMult.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[0.6rem] text-amber-300/80">{l.faithCost} Faith</div>
                        <Button
                          size="sm"
                          className="h-7 mt-1"
                          disabled={enacted || !canAfford}
                          onClick={() => enactDivineLaw(l.id)}
                        >
                          {enacted ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Enacted</> : "Enact"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Worship Modes */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Worship Mode (choose one — generates Faith/sec, may accrue heresy)</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {WORSHIP_MODES.map((m) => {
                  const active = activeWorshipMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setWorshipMode(active ? null : m.id)}
                      className={`stat-card text-left p-2 ${active ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{m.icon}</span>
                        <span className="text-xs font-medium">{m.name}</span>
                      </div>
                      <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div className="text-[0.6rem] text-amber-300/80 mt-1">
                Active: +{wMode.faithPerSec.toFixed(1)} Faith/s, +{(wMode.productionMult * 100).toFixed(0)}% prod, +{wMode.heresyPerSec.toFixed(2)} heresy/s
              </div>
            </section>

            {/* Miracles */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Miracles (one-shot, cost Faith)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {MIRACLES.map((m) => {
                  const canAfford = faith >= m.faithCost;
                  const used = performedMiracles[m.id] || 0;
                  return (
                    <div key={m.id} className="stat-card flex items-center gap-2 py-2">
                      <span className="text-lg shrink-0">{m.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold">{m.name}</div>
                        <div className="text-[0.6rem] text-muted-foreground leading-snug">{m.desc}</div>
                        {used > 0 && <div className="text-[0.55rem] text-amber-300/80">used {used}× this run</div>}
                      </div>
                      <Button
                        size="sm"
                        className="h-7"
                        disabled={!canAfford}
                        onClick={() => performMiracle(m.id)}
                      >
                        {m.faithCost === 0 ? "Free" : `${m.faithCost} Faith`}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Heresy Responses */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Heresy Response (policy — affects heresy rate)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {HERESY_RESPONSES.map((h) => {
                  const active = activeHeresyResponse === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setHeresyResponse(h.id)}
                      className={`stat-card text-left p-2 ${active ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{h.icon}</span>
                        <span className="text-[0.65rem] font-medium">{h.name}</span>
                      </div>
                      <div className="text-[0.55rem] text-muted-foreground mt-0.5 leading-tight">{h.desc}</div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <Separator className="my-2" />
        <div className="text-[0.65rem] text-muted-foreground px-1 flex items-center gap-1">
          <Flame className="w-3 h-3" />
          Enact 3+ Divine Laws to unlock Layer 6 (Singularity). Heresy resets on prestige; divine laws persist forever.
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShow(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
