import type { UpgradeDef } from "../state/types";

// Prestige shop upgrades — persist across runs
export const UPGRADES: UpgradeDef[] = [
  {
    id: "quickened_hands",
    name: "Quickened Hands",
    desc: (l) => `Manual actions +${l * 25}%`,
    baseCost: 2,
    maxLevel: 20,
    costGrowth: 1.5,
    category: "manual",
    effect: { type: "manual_mult", value: 0.25 },
  },
  {
    id: "inherited_efficiency",
    name: "Inherited Efficiency",
    desc: (l) => `Passive production +${l * 15}%`,
    baseCost: 3,
    maxLevel: 20,
    costGrowth: 1.5,
    category: "automation",
    effect: { type: "auto_mult", value: 0.15 },
  },
  {
    id: "frugality",
    name: "Frugality",
    desc: (l) => `System and tech costs -${l * 4}%`,
    baseCost: 4,
    maxLevel: 15,
    costGrowth: 1.6,
    category: "economy",
    effect: { type: "cost_reduction", value: 0.04 },
  },
  {
    id: "warm_start",
    name: "Warm Start",
    desc: (l) => `Start each run with +${l * 5} early resources`,
    baseCost: 5,
    maxLevel: 10,
    costGrowth: 1.7,
    category: "economy",
    effect: { type: "start_bonus", value: 5 },
  },
  {
    id: "expansive_vaults",
    name: "Expansive Vaults",
    desc: (l) => `Resource capacity +${l * 20}%`,
    baseCost: 4,
    maxLevel: 10,
    costGrowth: 1.6,
    category: "economy",
    effect: { type: "cap_boost", value: 0.20 },
  },
  {
    id: "evolutionary_momentum",
    name: "Evolutionary Momentum",
    desc: (l) => `Evolve requirements -${Math.min(l * 5, 30)}%`,
    baseCost: 6,
    maxLevel: 6,
    costGrowth: 2.0,
    category: "prestige",
    effect: { type: "evolve_boost", value: 0.05 },
  },
  {
    id: "rival_insight",
    name: "Rival Insight",
    desc: (l) => `Score gain +${l * 10}%`,
    baseCost: 8,
    maxLevel: 10,
    costGrowth: 1.8,
    requiresWins: 1,
    category: "prestige",
    effect: { type: "evolve_boost", value: 0.10 },
  },
  {
    id: "temporal_reserves",
    name: "Temporal Reserves",
    desc: (l) => `Offline time bank +${l * 24} hours`,
    baseCost: 10,
    maxLevel: 10,
    costGrowth: 1.9,
    requiresWins: 2,
    category: "automation",
    effect: { type: "auto_mult", value: 0.0 },
  },
];

export const UPGRADE_MAP: Record<string, UpgradeDef> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u])
);

export function upgradeCost(u: UpgradeDef, owned: number): number {
  return Math.ceil(u.baseCost * Math.pow(u.costGrowth, owned));
}
