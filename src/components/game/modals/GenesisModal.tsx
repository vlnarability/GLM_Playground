"use client";

import { useGameStore } from "@/game/state/store";
import {
  CRADLE_WORLDS,
  PRIME_CONDITIONS,
  SACRED_GEOGRAPHIES,
  DORMANT_SEEDS,
  DIFFICULTY_TIERS,
  CRADLE_WORLD_MAP,
  PRIME_CONDITION_MAP,
  SACRED_GEOGRAPHY_MAP,
  DORMANT_SEED_MAP,
  DIFFICULTY_TIER_MAP,
  worldProductionMult,
  worldCapMult,
  worldEpMultiplier,
  worldPopGrowthMult,
} from "@/game/data/genesis";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Egg, CheckCircle2 } from "lucide-react";
import { formatNumber } from "../shared/format";

export function GenesisModal() {
  const show = useGameStore((s) => s.showGenesis);
  const setShow = useGameStore((s) => s.setShowGenesis);
  const unlockedLayers = useGameStore((s) => s.unlockedLayers);
  const genesisSeeds = useGameStore((s) => s.genesisSeeds);
  const authoredWorlds = useGameStore((s) => s.authoredWorlds || []);
  const pending = useGameStore((s) => s.pendingWorldConfig || {});
  const setPendingWorldConfig = useGameStore((s) => s.setPendingWorldConfig);
  const authorWorld = useGameStore((s) => s.authorWorld);

  const isUnlocked = !!unlockedLayers.genesis;
  const wProd = worldProductionMult(authoredWorlds);
  const wCap = worldCapMult(authoredWorlds);
  const wEp = worldEpMultiplier(authoredWorlds);
  const wPop = worldPopGrowthMult(authoredWorlds);

  const canAuthor = !!(pending.cradleWorldId && pending.primeConditionId && pending.sacredGeographyId && pending.dormantSeedId && pending.difficultyTierId);

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Egg className="w-5 h-5" />
            Layer 4 — Genesis
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Author World Configs from 5 component choices. Each world grants permanent production / capacity / EP / pop bonuses.
            </span>
            <Badge variant="outline" className="text-emerald-300 border-emerald-400/40">
              {formatNumber(genesisSeeds, 0)} Seeds
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {!isUnlocked ? (
          <div className="text-center text-muted-foreground py-10">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Genesis is sealed.</p>
            <p className="text-xs mt-1">Perform all 4 Blood Pacts (Layer 3) to unlock Genesis.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="stat-card">
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Aggregated bonuses from {authoredWorlds.length} authored world(s)</div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-cyan-300 border-cyan-400/40">+{(wProd * 100).toFixed(0)}% prod</Badge>
                <Badge variant="outline" className="text-amber-300 border-amber-400/40">+{(wCap * 100).toFixed(0)}% cap</Badge>
                <Badge variant="outline" className="text-emerald-300 border-emerald-400/40">+{(wEp * 100).toFixed(0)}% EP</Badge>
                <Badge variant="outline" className="text-violet-300 border-violet-400/40">+{(wPop * 100).toFixed(0)}% pop</Badge>
              </div>
            </div>

            {/* Author UI */}
            <section className="stat-card">
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Author a new world (costs 1 Genesis Seed)</div>
              <ConfigPicker
                label="Cradle World"
                items={CRADLE_WORLDS.map((c) => ({ id: c.id, name: c.name, icon: c.icon, blurb: c.blurb }))}
                selected={pending.cradleWorldId}
                onSelect={(id) => setPendingWorldConfig({ cradleWorldId: id })}
              />
              <ConfigPicker
                label="Prime Condition"
                items={PRIME_CONDITIONS.map((c) => ({ id: c.id, name: c.name, icon: c.icon, blurb: c.blurb }))}
                selected={pending.primeConditionId}
                onSelect={(id) => setPendingWorldConfig({ primeConditionId: id })}
              />
              <ConfigPicker
                label="Sacred Geography"
                items={SACRED_GEOGRAPHIES.map((c) => ({ id: c.id, name: c.name, icon: c.icon, blurb: c.blurb }))}
                selected={pending.sacredGeographyId}
                onSelect={(id) => setPendingWorldConfig({ sacredGeographyId: id })}
              />
              <ConfigPicker
                label="Dormant Seed"
                items={DORMANT_SEEDS.map((c) => ({ id: c.id, name: c.name, icon: c.icon, blurb: c.blurb }))}
                selected={pending.dormantSeedId}
                onSelect={(id) => setPendingWorldConfig({ dormantSeedId: id })}
              />
              <ConfigPicker
                label="Difficulty Tier"
                items={DIFFICULTY_TIERS.map((c) => ({ id: c.id, name: c.name, icon: c.icon, blurb: c.blurb }))}
                selected={pending.difficultyTierId}
                onSelect={(id) => setPendingWorldConfig({ difficultyTierId: id })}
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  disabled={!canAuthor || genesisSeeds < 1}
                  onClick={() => authorWorld()}
                >
                  Author World (1 Seed)
                </Button>
              </div>
            </section>

            {/* Authored Worlds */}
            <section>
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground mb-1">Authored worlds ({authoredWorlds.length})</div>
              {authoredWorlds.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 text-sm">
                  No worlds authored yet. Author 1 to unlock Layer 5 (Apotheosis).
                </div>
              ) : (
                <div className="space-y-1.5">
                  {authoredWorlds.map((w) => {
                    const cr = CRADLE_WORLD_MAP[w.cradleWorldId];
                    const pc = PRIME_CONDITION_MAP[w.primeConditionId];
                    const sg = SACRED_GEOGRAPHY_MAP[w.sacredGeographyId];
                    const ds = DORMANT_SEED_MAP[w.dormantSeedId];
                    const dt = DIFFICULTY_TIER_MAP[w.difficultyTierId];
                    return (
                      <div key={w.id} className="stat-card flex items-center gap-2 py-2">
                        <span className="text-xl">{cr?.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold">{cr?.name}</span>
                            <Badge variant="outline" className="text-[0.6rem]">{pc?.name}</Badge>
                            <Badge variant="outline" className="text-[0.6rem]">{sg?.name}</Badge>
                            <Badge variant="outline" className="text-[0.6rem]">{ds?.name}</Badge>
                            <Badge variant="outline" className="text-[0.6rem]">{dt?.name}</Badge>
                          </div>
                          <div className="text-[0.6rem] text-muted-foreground mt-0.5">
                            +{((cr?.productionMult || 0) + (dt?.productionMult || 0)) * 100}% prod, +{(pc?.capMult || 0) * 100}% cap, +{((sg?.epMult || 0) + (dt?.epMult || 0)) * 100}% EP, +{(ds?.popGrowthMult || 0) * 100}% pop
                          </div>
                        </div>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        <Separator className="my-2" />
        <div className="text-[0.65rem] text-muted-foreground px-1">
          Authored worlds grant permanent bonuses across all future runs. Author at least 1 world to unlock Layer 5 (Apotheosis).
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShow(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfigPicker({
  label,
  items,
  selected,
  onSelect,
}: {
  label: string;
  items: { id: string; name: string; icon: string; blurb: string }[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mb-2">
      <div className="text-[0.65rem] text-muted-foreground mb-1">{label}</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            className={`stat-card text-left p-1.5 ${selected === it.id ? "border-amber-400/60 bg-amber-500/10" : ""}`}
          >
            <div className="flex items-center gap-1">
              <span className="text-sm">{it.icon}</span>
              <span className="text-[0.65rem] font-medium truncate">{it.name}</span>
            </div>
            <div className="text-[0.55rem] text-muted-foreground mt-0.5 leading-tight line-clamp-2">{it.blurb}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
