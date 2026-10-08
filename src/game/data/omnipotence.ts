// ===========================================================================
// LAYER 7 — OMNIPOTENCE
// ===========================================================================
// Beyond the Singularity, the god learns to hold two contradictory
// archetypes at once. Omnipotence is the layer of hybrid lineages: pair two
// archetypes and inherit both bonuses — but each hybrid adds instability, and
// at 100 instability the run collapses. Choose a Stance to trade raw power
// for safety. Peak instability ≥ 80 unlocks Layer 8 (Divinity).
// ===========================================================================

// ----- Hybrid Lineages (8) -----
// Each combines 2 archetypes. Equipping grants their combined bonuses but
// also adds instability per second.
export interface HybridLineage {
  id: string;
  name: string;
  icon: string;
  archetypeA: string;
  archetypeB: string;
  desc: string;
  bonus: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
  };
  instabilityPerSec: number;
}

export const HYBRID_LINEAGES: HybridLineage[] = [
  {
    id: "hybrid_fire_water",
    name: "Tideflame Concord",
    icon: "🌊",
    archetypeA: "mammalian",
    archetypeB: "reptilian",
    desc: "Warm kinship fused with cold predation. +25% production, +10% pop.",
    bonus: { productionMult: 0.25, popGrowthMult: 0.10 },
    instabilityPerSec: 0.04,
  },
  {
    id: "hybrid_sky_root",
    name: "Skyroot Lineage",
    icon: "🍃",
    archetypeA: "avian",
    archetypeB: "plantoid",
    desc: "Flight and photosynthesis. +30% science, +20% cap.",
    bonus: { capMult: 0.20 },
    instabilityPerSec: 0.05,
  },
  {
    id: "hybrid_swarm_throne",
    name: "Swarm-Throne",
    icon: "👑",
    archetypeA: "arthropoid",
    archetypeB: "humanoid",
    desc: "A thousand hands under one crown. +35% production, +15% EP.",
    bonus: { productionMult: 0.35, epMult: 0.15 },
    instabilityPerSec: 0.06,
  },
  {
    id: "hybrid_deep_void",
    name: "Deepvoid Pact",
    icon: "🕳️",
    archetypeA: "molluscoid",
    archetypeB: "necroid",
    desc: "Ancient patience meets silent death. +50% production, +0.10 instability/s.",
    bonus: { productionMult: 0.50 },
    instabilityPerSec: 0.10,
  },
  {
    id: "hybrid_bloom_chitin",
    name: "Bloomchitin Bond",
    icon: "🌹",
    archetypeA: "plantoid",
    archetypeB: "arthropoid",
    desc: "Living scaffolding. +30% cap, +20% pop.",
    bonus: { capMult: 0.30, popGrowthMult: 0.20 },
    instabilityPerSec: 0.05,
  },
  {
    id: "hybrid_silence_song",
    name: "Silencesong",
    icon: "🎶",
    archetypeA: "molluscoid",
    archetypeB: "avian",
    desc: "Where deep patience learns to fly. +25% EP, +15% production.",
    bonus: { epMult: 0.25, productionMult: 0.15 },
    instabilityPerSec: 0.04,
  },
  {
    id: "hybrid_kindling_mycelium",
    name: "Kindling Mycelium",
    icon: "🍄",
    archetypeA: "fungoid",
    archetypeB: "mammalian",
    desc: "Decay feeds the herd. +40% pop, +10% production.",
    bonus: { popGrowthMult: 0.40, productionMult: 0.10 },
    instabilityPerSec: 0.05,
  },
  {
    id: "hybrid_omega_pair",
    name: "Omega Pair",
    icon: "Ω",
    archetypeA: "necroid",
    archetypeB: "humanoid",
    desc: "Death and life, married. +100% production, +0.20 instability/s — the dangerous summit.",
    bonus: { productionMult: 1.0 },
    instabilityPerSec: 0.20,
  },
];

export const HYBRID_LINEAGE_MAP: Record<string, HybridLineage> = Object.fromEntries(
  HYBRID_LINEAGES.map((h) => [h.id, h])
);

// ----- Stances (3) -----
// Stance modifies the rate at which instability accrues AND the magnitude of
// hybrid bonuses that apply. One stance active at a time (default: balanced).
export type OmnipotenceStanceId = "contained" | "balanced" | "embraced";

export interface OmnipotenceStance {
  id: OmnipotenceStanceId;
  name: string;
  icon: string;
  desc: string;
  instabilityMult: number; // multiplies base + hybrid instability rate
  bonusMult: number; // multiplies hybrid bonuses (1 = normal)
}

export const OMNIPOTENCE_STANCES: OmnipotenceStance[] = [
  {
    id: "contained",
    name: "Contained",
    icon: "🛡️",
    desc: "Hold the hybrids in check. 0.5× instability, 0.5× bonuses.",
    instabilityMult: 0.5,
    bonusMult: 0.5,
  },
  {
    id: "balanced",
    name: "Balanced",
    icon: "⚖️",
    desc: "The middle path. Normal instability, normal bonuses.",
    instabilityMult: 1.0,
    bonusMult: 1.0,
  },
  {
    id: "embraced",
    name: "Embraced",
    icon: "🔥",
    desc: "Let the hybrids roar. 1.5× instability, 2× bonuses.",
    instabilityMult: 1.5,
    bonusMult: 2.0,
  },
];

export const OMNIPOTENCE_STANCE_MAP: Record<OmnipotenceStanceId, OmnipotenceStance> = Object.fromEntries(
  OMNIPOTENCE_STANCES.map((s) => [s.id, s])
) as Record<OmnipotenceStanceId, OmnipotenceStance>;

// ----- Instability -----
// Instability accrues over time. At 100 the run ends. Base rate 0.3/s before
// hybrid/stance multipliers. Peak instability ≥ 80 unlocks Layer 8.
export const BASE_INSTABILITY_RATE = 0.3;
export const OMNIPOTENCE_COMPLETE_PEAK = 80;

// ----- Helpers -----

/**
 * Aggregated bonus from all equipped hybrids, scaled by the active stance.
 */
export function hybridBonus(
  equipped: Record<string, boolean>,
  stanceId: OmnipotenceStanceId | string | null | undefined
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
  instabilityPerSec: number;
} {
  let productionMult = 0;
  let capMult = 0;
  let epMult = 0;
  let popGrowthMult = 0;
  let instabilityPerSec = 0;
  const stance =
    stanceId && OMNIPOTENCE_STANCE_MAP[stanceId as OmnipotenceStanceId]
      ? OMNIPOTENCE_STANCE_MAP[stanceId as OmnipotenceStanceId]
      : OMNIPOTENCE_STANCE_MAP.balanced;
  for (const h of HYBRID_LINEAGES) {
    if (!equipped[h.id]) continue;
    productionMult += (h.bonus.productionMult || 0) * stance.bonusMult;
    capMult += (h.bonus.capMult || 0) * stance.bonusMult;
    epMult += (h.bonus.epMult || 0) * stance.bonusMult;
    popGrowthMult += (h.bonus.popGrowthMult || 0) * stance.bonusMult;
    instabilityPerSec += h.instabilityPerSec;
  }
  return { productionMult, capMult, epMult, popGrowthMult, instabilityPerSec };
}

/**
 * Multiplier applied to the base instability rate (BASE + hybrid contribution)
 * given the active stance. Contained = 0.5×, Balanced = 1.0×, Embraced = 1.5×.
 */
export function instabilityRateMult(
  stanceId: OmnipotenceStanceId | string | null | undefined
): number {
  if (!stanceId) return 1;
  const stance = OMNIPOTENCE_STANCE_MAP[stanceId as OmnipotenceStanceId];
  return stance ? stance.instabilityMult : 1;
}

/**
 * Returns the effective instability gain rate (per second) for the current
 * loadout + stance. Includes the base rate.
 */
export function effectiveInstabilityRate(
  equipped: Record<string, boolean>,
  stanceId: OmnipotenceStanceId | string | null | undefined
): number {
  const { instabilityPerSec } = hybridBonus(equipped, stanceId);
  return (BASE_INSTABILITY_RATE + instabilityPerSec) * instabilityRateMult(stanceId);
}

/**
 * Layer 8 (Divinity) unlock: peak instability this run ≥ 80.
 * "Peak" is tracked in state. The player must have flirted with danger.
 */
export function isOmnipotenceComplete(peakInstability: number): boolean {
  return peakInstability >= OMNIPOTENCE_COMPLETE_PEAK;
}
