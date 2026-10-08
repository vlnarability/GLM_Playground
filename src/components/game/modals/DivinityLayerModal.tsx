"use client";

import { useGameStore } from "@/game/state/store";
import {
  PRAYER_CHANNELS,
  DIVINE_MASKS,
  WORSHIP_POLARITIES,
  prayerChannelCost,
  prayerChannelBonus,
  divineMaskBonus,
  worshipPolarityBonus,
  prayerRate,
} from "@/game/data/divinity_layer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Church, CheckCircle2, Sparkles } from "lucide-react";
import { formatNumber } from "../shared/format";

export function DivinityLayerModal() {
  const show = useGameStore((s) => s.showDivinityLayer);
  const setShow = useGameStore((s) => s.setShowDivinityLayer);
  const unlockedLayers = useGameStore((s) => s.unlockedLayers);
  const prayer = useGameStore((s) => s.prayer);
  const population = useGameStore((s) => s.population);
  const channelLevels = useGameStore((s) => s.prayerChannelLevels || {});
  const activeMask = useGameStore((s) => s.activeDivineMask);
  const activePolarity = useGameStore((s) => s.activeWorshipPolarity);

  const levelPrayerChannel = useGameStore((s) => s.levelPrayerChannel);
  const setDivineMask = useGameStore((s) => s.setDivineMask);
  const setWorshipPolarity = useGameStore((s) => s.setWorshipPolarity);

  const isUnlocked = !!unlockedLayers.divinity;
  const chanBonus = prayerChannelBonus(channelLevels);
  const maskBonus = divineMaskBonus(activeMask);
  const polBonus = worshipPolarityBonus(activePolarity);
  const pRate = prayerRate(population, channelLevels, activeMask, activePolarity);
  const totalLevels = chanBonus.totalLevels;
  const leveledChannels = PRAYER_CHANNELS.filter((c) => (channelLevels[c.id] || 0) > 0).length;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Church className="w-5 h-5" />
            Layer 8 — Divinity
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Level Prayer Channels (Prayer = pop × 0.001/s base), wear one Divine Mask, align one Worship Polarity. Complete 3+ channels &amp; choose a polarity to unlock Infinity.
            </span>
            <Badge variant="outline" className="text-amber-300 border-amber-400/40">
              {formatNumber(prayer, 1)} Prayer
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <div className="text-center text-muted-foreground py-10">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Divinity is sealed.</p>
            <p className="text-xs mt-1">Reach peak instability ≥ 80 (Layer 7 — Omnipotence) to unlock Divinity.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="stat-card">
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1 flex items-center justify-between">
                <span>{leveledChannels}/6 channels leveled ({totalLevels} total levels)</span>
                <span className="text-amber-300/80">+{pRate.toFixed(3)} Prayer/s</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-cyan-300 border-cyan-400/40">+{((chanBonus.productionMult + maskBonus.productionMult + polBonus.productionMult) * 100).toFixed(0)}% prod</Badge>
                <Badge variant="outline" className="text-amber-300 border-amber-400/40">+{((chanBonus.capMult + maskBonus.capMult + polBonus.capMult) * 100).toFixed(0)}% cap</Badge>
                <Badge variant="outline" className="text-emerald-300 border-emerald-400/40">+{((chanBonus.epMult + maskBonus.epMult + polBonus.epMult) * 100).toFixed(0)}% EP</Badge>
                <Badge variant="outline" className="text-violet-300 border-violet-400/40">+{((chanBonus.popGrowthMult + maskBonus.popGrowthMult + polBonus.popGrowthMult) * 100).toFixed(0)}% pop</Badge>
              </div>
            </div>

            {/* Prayer Channels */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Prayer Channels (leveled)</div>
              <div className="space-y-1.5">
                {PRAYER_CHANNELS.map((c) => {
                  const lvl = channelLevels[c.id] || 0;
                  const maxed = lvl >= c.maxLevel;
                  const cost = prayerChannelCost(c, lvl);
                  const canAfford = prayer >= cost;
                  return (
                    <div key={c.id} className={`stat-card flex items-center gap-3 py-2 ${lvl > 0 ? "border-amber-400/40" : ""}`}>
                      <span className="text-xl shrink-0">{c.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{c.name}</span>
                          <Badge variant="outline" className="text-[0.6rem]">{lvl}/{c.maxLevel}</Badge>
                        </div>
                        <div className="text-[0.65rem] text-muted-foreground leading-snug">{c.desc}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[0.6rem] text-amber-300/80">{cost} Prayer</div>
                        <Button
                          size="sm"
                          className="h-7 mt-1"
                          disabled={maxed || !canAfford}
                          onClick={() => levelPrayerChannel(c.id)}
                        >
                          {maxed ? "Maxed" : "Level"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Divine Masks */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Divine Mask (one active)</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {DIVINE_MASKS.map((m) => {
                  const active = activeMask === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setDivineMask(active ? null : m.id)}
                      className={`stat-card text-left p-2 ${active ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{m.icon}</span>
                        <span className="text-xs font-medium">{m.name}</span>
                        {active && <CheckCircle2 className="w-2.5 h-2.5 text-amber-300 ml-auto" />}
                      </div>
                      <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Worship Polarities */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Worship Polarity (one active)</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {WORSHIP_POLARITIES.map((p) => {
                  const active = activePolarity === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setWorshipPolarity(active ? null : p.id)}
                      className={`stat-card text-left p-2 ${active ? "border-amber-400/60 bg-amber-500/10" : ""}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{p.icon}</span>
                        <span className="text-xs font-medium">{p.name}</span>
                        {active && <CheckCircle2 className="w-2.5 h-2.5 text-amber-300 ml-auto" />}
                      </div>
                      <div className="text-[0.6rem] text-muted-foreground mt-0.5 leading-snug">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <Separator className="my-2" />
        <div className="text-[0.65rem] text-muted-foreground px-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Level 3+ Prayer Channels AND choose a Worship Polarity to unlock Layer 9 (Infinity). Channels, mask, and polarity persist; Prayer accrues.
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShow(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
