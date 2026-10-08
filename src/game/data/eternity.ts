// ===========================================================================
// LAYER 10 — ETERNITY
// ===========================================================================
// The final layer. The god becomes an author of permanence. Enact Testament
// Clauses (permanent bonuses, cost Testament Clauses currency), Canonize
// events/archetypes as eternal, weave Permanence across resets, and finally
// choose an Ending: Preserve the universe (gallery mode) or Reset it (fresh
// start + stacking Cosmic Boon). Choosing any ending completes the layer.
// ===========================================================================

// ----- Testament Clauses (8) -----
// Permanent bonuses purchased with Testament Clauses currency (earned at
// prestige when this layer is unlocked).
export interface TestamentClause {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost: number; // Testament Clauses
  bonus: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
    testamentMult?: number; // multiplies Testament Clauses earned on prestige
  };
}

export const TESTAMENT_CLAUSES: TestamentClause[] = [
  {
    id: "clause_bounty",
    name: "Clause of Bounty",
    icon: "🌾",
    desc: "+25% production. The cosmos yields freely.",
    cost: 5,
    bonus: { productionMult: 0.25 },
  },
  {
    id: "clause_vastness",
    name: "Clause of Vastness",
    icon: "🌌",
    desc: "+30% capacity. The vessel is endless.",
    cost: 6,
    bonus: { capMult: 0.30 },
  },
  {
    id: "clause_remembrance",
    name: "Clause of Remembrance",
    icon: "📜",
    desc: "+40% EP. Every run is remembered.",
    cost: 8,
    bonus: { epMult: 0.40 },
  },
  {
    id: "clause_multitude",
    name: "Clause of the Multitude",
    icon: "👥",
    desc: "+30% population growth. The throngs bloom.",
    cost: 6,
    bonus: { popGrowthMult: 0.30 },
  },
  {
    id: "clause_recurrence",
    name: "Clause of Recurrence",
    icon: "🔄",
    desc: "+30% Testament Clauses per prestige. The loop deepens.",
    cost: 12,
    bonus: { testamentMult: 0.30 },
  },
  {
    id: "clause_eternal_throne",
    name: "Clause of the Eternal Throne",
    icon: "👑",
    desc: "+15% to production, cap, EP, pop. The balanced summit.",
    cost: 15,
    bonus: {
      productionMult: 0.15,
      capMult: 0.15,
      epMult: 0.15,
      popGrowthMult: 0.15,
    },
  },
  {
    id: "clause_cosmic_boon",
    name: "Clause of the Cosmic Boon",
    icon: "🌠",
    desc: "+50% production. Stacks with each Reset Universe ending (+10% per stack).",
    cost: 20,
    bonus: { productionMult: 0.50 },
  },
  {
    id: "clause_omega",
    name: "Clause of Omega",
    icon: "Ω",
    desc: "+20% to all four and +20% Testament gain. The final word.",
    cost: 30,
    bonus: {
      productionMult: 0.20,
      capMult: 0.20,
      epMult: 0.20,
      popGrowthMult: 0.20,
      testamentMult: 0.20,
    },
  },
];

export const TESTAMENT_CLAUSE_MAP: Record<string, TestamentClause> = Object.fromEntries(
  TESTAMENT_CLAUSES.map((c) => [c.id, c])
);

// ----- Canonizations (3) -----
// Declare that an event / archetype / system is permanent across resets.
// Each grants a small permanent bonus when active.
export interface Canonization {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost: number; // Testament Clauses
  bonus: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
  };
}

export const CANONIZATIONS: Canonization[] = [
  {
    id: "canon_first_spark",
    name: "Canonize the First Spark",
    icon: "✨",
    desc: "Declare the first cell eternal. +20% production, +10% pop.",
    cost: 10,
    bonus: { productionMult: 0.20, popGrowthMult: 0.10 },
  },
  {
    id: "canon_locked_archetype",
    name: "Canonize the Lineage",
    icon: "🧬",
    desc: "Your dominant archetype persists across resets. +25% EP.",
    cost: 12,
    bonus: { epMult: 0.25 },
  },
  {
    id: "canon_galactic_throne",
    name: "Canonize the Galactic Throne",
    icon: "👑",
    desc: "The galactic throne is eternal. +30% capacity, +15% production.",
    cost: 18,
    bonus: { capMult: 0.30, productionMult: 0.15 },
  },
];

export const CANONIZATION_MAP: Record<string, Canonization> = Object.fromEntries(
  CANONIZATIONS.map((c) => [c.id, c])
);

// ----- Permanence Weaves (3) -----
// Pin a law/mode/route through resets. Permanent passive bonus.
export interface PermanenceWeave {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost: number; // Testament Clauses
  bonus: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
  };
}

export const PERMANENCE_WEAVES: PermanenceWeave[] = [
  {
    id: "weave_law",
    name: "Weave the Law",
    icon: "⚖️",
    desc: "Pin your most-enacted Divine Law through resets. +20% production.",
    cost: 8,
    bonus: { productionMult: 0.20 },
  },
  {
    id: "weave_route",
    name: "Weave the Route",
    icon: "🛤️",
    desc: "Pin your Foresight Route through resets. +20% EP.",
    cost: 10,
    bonus: { epMult: 0.20 },
  },
  {
    id: "weave_mode",
    name: "Weave the Mode",
    icon: "🎶",
    desc: "Pin your Worship Mode through resets. +15% capacity, +15% pop.",
    cost: 10,
    bonus: { capMult: 0.15, popGrowthMult: 0.15 },
  },
];

export const PERMANENCE_WEAVE_MAP: Record<string, PermanenceWeave> = Object.fromEntries(
  PERMANENCE_WEAVES.map((w) => [w.id, w])
);

// ----- Ending Choices (2) -----
// Once chosen, the layer is complete. Preserve = gallery mode (continue
// indefinitely with bonus). Reset = fresh start with stacking Cosmic Boon.
export type EndingChoiceId = "preserve" | "reset";

export interface EndingChoice {
  id: EndingChoiceId;
  name: string;
  icon: string;
  desc: string;
}

export const ENDING_CHOICES: EndingChoice[] = [
  {
    id: "preserve",
    name: "Preserve Universe",
    icon: "🌠",
    desc: "Enter gallery mode — continue indefinitely with all bonuses intact. The story does not end.",
  },
  {
    id: "reset",
    name: "Reset Universe",
    icon: "🔄",
    desc: "Begin a fresh universe from the first cell. Gain a permanent Cosmic Boon (+10% all production) that stacks with each reset.",
  },
];

export const ENDING_CHOICE_MAP: Record<EndingChoiceId, EndingChoice> = Object.fromEntries(
  ENDING_CHOICES.map((e) => [e.id, e])
) as Record<EndingChoiceId, EndingChoice>;

// ----- Helpers -----

/**
 * Aggregated bonus from all purchased Testament Clauses.
 */
export function testamentClauseBonus(
  purchased: Record<string, boolean>
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
  testamentMult: number;
} {
  let productionMult = 0;
  let capMult = 0;
  let epMult = 0;
  let popGrowthMult = 0;
  let testamentMult = 0;
  for (const c of TESTAMENT_CLAUSES) {
    if (!purchased[c.id]) continue;
    productionMult += c.bonus.productionMult || 0;
    capMult += c.bonus.capMult || 0;
    epMult += c.bonus.epMult || 0;
    popGrowthMult += c.bonus.popGrowthMult || 0;
    testamentMult += c.bonus.testamentMult || 0;
  }
  return { productionMult, capMult, epMult, popGrowthMult, testamentMult };
}

/**
 * Aggregated bonus from all active Canonizations.
 */
export function canonizationBonus(
  active: Record<string, boolean>
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
} {
  let productionMult = 0;
  let capMult = 0;
  let epMult = 0;
  let popGrowthMult = 0;
  for (const c of CANONIZATIONS) {
    if (!active[c.id]) continue;
    productionMult += c.bonus.productionMult || 0;
    capMult += c.bonus.capMult || 0;
    epMult += c.bonus.epMult || 0;
    popGrowthMult += c.bonus.popGrowthMult || 0;
  }
  return { productionMult, capMult, epMult, popGrowthMult };
}

/**
 * Aggregated bonus from all woven Permanence Weaves.
 */
export function permanenceWeaveBonus(
  active: Record<string, boolean>
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
} {
  let productionMult = 0;
  let capMult = 0;
  let epMult = 0;
  let popGrowthMult = 0;
  for (const w of PERMANENCE_WEAVES) {
    if (!active[w.id]) continue;
    productionMult += w.bonus.productionMult || 0;
    capMult += w.bonus.capMult || 0;
    epMult += w.bonus.epMult || 0;
    popGrowthMult += w.bonus.popGrowthMult || 0;
  }
  return { productionMult, capMult, epMult, popGrowthMult };
}

/**
 * Cosmic Boon: +10% all production per "Reset Universe" stack.
 */
export function cosmicBoonBonus(stacks: number): number {
  return stacks * 0.10;
}

/**
 * Layer completion: an Ending has been chosen (preserve or reset).
 */
export function isEternityComplete(chosenEnding: string | null | undefined): boolean {
  return chosenEnding === "preserve" || chosenEnding === "reset";
}
