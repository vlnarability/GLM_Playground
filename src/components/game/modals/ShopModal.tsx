"use client";

import { useGameStore } from "@/game/state/store";
import { UPGRADES, upgradeCost } from "@/game/data/upgrades";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, Lock, CheckCircle2, Sparkles } from "lucide-react";
import { formatNumber } from "../shared/format";

export function ShopModal() {
  const showShop = useGameStore((s) => s.showShop);
  const setShowShop = useGameStore((s) => s.setShowShop);
  const evolutionPoints = useGameStore((s) => s.evolutionPoints);
  const prestigePoints = useGameStore((s) => s.prestigePoints);
  const upgrades = useGameStore((s) => s.upgrades);
  const galacticWins = useGameStore((s) => s.galacticWins);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const buyUniversalUpgrade = useGameStore((s) => s.buyUniversalUpgrade);

  const categories = [
    { id: "automation", label: "Automation" },
    { id: "economy", label: "Economy" },
    { id: "acceleration", label: "Acceleration" },
    { id: "prestige", label: "Prestige" },
    { id: "universal", label: "Universal" },
  ] as const;

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
            <div className="flex gap-1">
              <Badge variant="outline" className="text-amber-400 border-amber-400/40">
                🌱 {formatNumber(evolutionPoints, 0)} EP
              </Badge>
              {/* QUICK WIN 5 — Prestige Points (universal currency) */}
              <Badge variant="outline" className="text-fuchsia-300 border-fuchsia-400/40">
                ✦ {formatNumber(prestigePoints, 0)} PP
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {categories.map((cat) => {
            const list = UPGRADES.filter((u) => u.category === cat.id);
            if (list.length === 0) return null;
            const isUniversal = cat.id === "universal";
            return (
              <div key={cat.id}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  {isUniversal && <Sparkles className="w-3 h-3 text-fuchsia-300" />}
                  {cat.label}
                  {isUniversal && (
                    <span className="text-[0.6rem] text-fuchsia-300/80 normal-case tracking-normal italic">
                      · purchased with Prestige Points
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {list.map((up) => {
                    const owned = upgrades[up.id] || 0;
                    const maxed = owned >= up.maxLevel;
                    const requiresWins = up.requiresWins && galacticWins < (up.requiresWins || 0);
                    const cost = upgradeCost(up, owned);
                    const currency = isUniversal ? prestigePoints : evolutionPoints;
                    const canAfford = currency >= cost;
                    const onBuy = isUniversal ? buyUniversalUpgrade : buyUpgrade;
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
                          <span className={`text-xs font-bold ${canAfford ? (isUniversal ? "text-fuchsia-300" : "text-amber-400") : "text-red-400"}`}>
                            {isUniversal ? "✦" : "🌱"} {formatNumber(cost, 0)} {isUniversal ? "PP" : "EP"}
                          </span>
                          <Button
                            size="sm"
                            className="h-7"
                            disabled={maxed || requiresWins || !canAfford}
                            onClick={() => onBuy(up.id)}
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

        <div className="text-[0.65rem] text-muted-foreground px-1 pt-1">
          <span className="text-fuchsia-300/80">Universal upgrades</span> are purchased with Prestige Points,
          earned by completing trials, purchasing foresight nodes, performing rituals & blood pacts, enacting
          divine laws, and binding relics.
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShowShop(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
