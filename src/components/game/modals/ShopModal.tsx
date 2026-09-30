"use client";

import { useGameStore } from "@/game/state/store";
import { UPGRADES, upgradeCost } from "@/game/data/upgrades";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, Lock, CheckCircle2 } from "lucide-react";
import { formatNumber } from "../shared/format";

export function ShopModal() {
  const showShop = useGameStore((s) => s.showShop);
  const setShowShop = useGameStore((s) => s.setShowShop);
  const evolutionPoints = useGameStore((s) => s.evolutionPoints);
  const upgrades = useGameStore((s) => s.upgrades);
  const galacticWins = useGameStore((s) => s.galacticWins);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  const categories = [
    { id: "manual", label: "Manual Actions" },
    { id: "automation", label: "Automation" },
    { id: "economy", label: "Economy" },
    { id: "prestige", label: "Prestige" },
  ];

  return (
    <Dialog open={showShop} onOpenChange={setShowShop}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Store className="w-5 h-5" />
            Evolution Shop
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Prestige upgrades persist across all runs.</span>
            <Badge variant="outline" className="text-amber-400 border-amber-400/40">
              🌱 {formatNumber(evolutionPoints, 0)} EP
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {categories.map((cat) => {
            const list = UPGRADES.filter((u) => u.category === cat.id);
            if (list.length === 0) return null;
            return (
              <div key={cat.id}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {cat.label}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {list.map((up) => {
                    const owned = upgrades[up.id] || 0;
                    const maxed = owned >= up.maxLevel;
                    const requiresWins = up.requiresWins && galacticWins < (up.requiresWins || 0);
                    const cost = upgradeCost(up, owned);
                    const canAfford = evolutionPoints >= cost;
                    return (
                      <div
                        key={up.id}
                        className={`stat-card ${maxed ? "opacity-70" : requiresWins ? "opacity-40" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {maxed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : requiresWins ? (
                              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                            ) : null}
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">{up.name}</div>
                              <Badge variant="outline" className="text-[0.6rem]">
                                Lv {owned}/{up.maxLevel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 leading-snug">{up.desc(owned)}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${canAfford ? "text-amber-400" : "text-red-400"}`}>
                            🌱 {formatNumber(cost, 0)} EP
                          </span>
                          <Button
                            size="sm"
                            className="h-7"
                            disabled={maxed || requiresWins || !canAfford}
                            onClick={() => buyUpgrade(up.id)}
                          >
                            {maxed ? "Maxed" : requiresWins ? `Need ${up.requiresWins} wins` : "Upgrade"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Separator className="mt-4" />
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShowShop(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
