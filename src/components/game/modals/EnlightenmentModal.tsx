"use client";

import { useGameStore } from "@/game/state/store";
import {
  FORESIGHT_NODES,
  FORESIGHT_ROUTES,
  foresightBonus,
  routeBonus,
  countForesightNodes,
  FORESIGHT_NODES_REQUIRED_FOR_LAYER_3,
} from "@/game/data/foresight";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Sparkles, Eye } from "lucide-react";
import { formatNumber } from "../shared/format";

export function EnlightenmentModal() {
  const show = useGameStore((s) => s.showEnlightenment);
  const setShow = useGameStore((s) => s.setShowEnlightenment);
  const unlockedLayers = useGameStore((s) => s.unlockedLayers);
  const divinity = useGameStore((s) => s.divinity);
  const foresightNodes = useGameStore((s) => s.foresightNodes || {});
  const activeRoute = useGameStore((s) => s.activeForesightRoute);
  const purchaseForesightNode = useGameStore((s) => s.purchaseForesightNode);
  const setForesightRoute = useGameStore((s) => s.setForesightRoute);

  const isUnlocked = !!unlockedLayers.enlightenment;
  const purchasedCount = countForesightNodes(foresightNodes);
  const fs = foresightBonus(foresightNodes);
  const rb = routeBonus(activeRoute);

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5" />
            Layer 2 — Enlightenment (Foresight)
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Spend Divinity to inscribe Foresight nodes. Each grants a permanent bonus. Master {FORESIGHT_NODES_REQUIRED_FOR_LAYER_3} to advance.
            </span>
            <Badge variant="outline" className="text-violet-300 border-violet-400/40">
              {formatNumber(divinity, 0)} Divinity
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <div className="text-center text-muted-foreground py-10">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Enlightenment is sealed.</p>
            <p className="text-xs mt-1">Master 3 distinct Layer 1 trials to unlock Foresight.</p>
          </div>
        ) : (
          <>
            <div className="stat-card">
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Progress</div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-cyan-300 border-cyan-400/40">
                  {purchasedCount}/{FORESIGHT_NODES.length} nodes purchased
                </Badge>
                <Badge variant="outline" className="text-amber-300 border-amber-400/40">
                  {purchasedCount >= FORESIGHT_NODES_REQUIRED_FOR_LAYER_3
                    ? "Transcendence unlocked!"
                    : `${FORESIGHT_NODES_REQUIRED_FOR_LAYER_3 - purchasedCount} more to advance`}
                </Badge>
              </div>
              <div className="text-[0.65rem] text-muted-foreground mt-1">
                Active bonuses: +{(fs.productionMult * 100).toFixed(0)}% prod, +{(fs.capMult * 100).toFixed(0)}% cap, +{(fs.epMult * 100).toFixed(0)}% EP, +{(fs.popGrowthMult * 100).toFixed(0)}% pop, +{(fs.divinityMult * 100).toFixed(0)}% divinity
              </div>
            </div>

            {/* Routes */}
            <div>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Route (choose one)</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {FORESIGHT_ROUTES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setForesightRoute(activeRoute === r.id ? null : r.id)}
                    className={`stat-card text-left p-2 ${activeRoute === r.id ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-base">{r.icon}</span>
                      <span className="text-xs font-medium">{r.name}</span>
                    </div>
                    <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{r.blurb}</div>
                  </button>
                ))}
              </div>
              <div className="text-[0.6rem] text-amber-300/80 mt-1">
                Route bonus: +{(rb.productionMult * 100).toFixed(0)}% prod, +{(rb.capMult * 100).toFixed(0)}% cap, +{(rb.epMult * 100).toFixed(0)}% EP, +{(rb.popGrowthMult * 100).toFixed(0)}% pop
              </div>
            </div>

            {/* Foresight Nodes */}
            <div className="space-y-1.5">
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">Foresight Nodes</div>
              {FORESIGHT_NODES.map((n) => {
                const purchased = !!foresightNodes[n.id];
                const prereqMet = !n.requires || foresightNodes[n.requires];
                const canAfford = divinity >= n.cost;
                return (
                  <div
                    key={n.id}
                    className={`stat-card flex items-center gap-3 py-2 ${purchased ? "border-emerald-400/40" : ""}`}
                  >
                    <span className="text-xl shrink-0">{n.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{n.name}</span>
                        <Badge variant="outline" className="text-[0.6rem] capitalize">{n.category}</Badge>
                        {purchased && (
                          <Badge className="text-[0.6rem] bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Inscribed
                          </Badge>
                        )}
                      </div>
                      <div className="text-[0.65rem] text-muted-foreground leading-snug">{n.desc}</div>
                      {n.requires && !purchased && (
                        <div className="text-[0.6rem] text-amber-300/80 mt-0.5">Requires: {FORESIGHT_NODES.find((x) => x.id === n.requires)?.name}</div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {purchased ? (
                        <Button size="sm" variant="outline" disabled className="h-7">Inscribed</Button>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7"
                          disabled={!prereqMet || !canAfford}
                          onClick={() => purchaseForesightNode(n.id)}
                        >
                          {n.cost} Divinity
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <Separator className="my-2" />
        <div className="text-[0.65rem] text-muted-foreground px-1">
          Divinity accrues at prestige when Enlightenment is unlocked. Routes apply only one bonus at a time. Foresight nodes persist across prestige.
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShow(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
