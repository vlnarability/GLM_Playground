// ===========================================================================
// LAYER 9 — INFINITY
// ===========================================================================
// The god learns to remember future runs and borrow against future selves.
// Infinity is the layer of paradox: Echoes (passive bonuses from past runs,
// cost Echoes currency), Fork Scenarios (permanent branch choice for the run),
// and Future Debt (borrow power now, pay a penalty later). Completing all fork
// scenarios AND repaying all debt unlocks Layer 10 (Eternity).
// ===========================================================================

// ----- Echo Types (6) -----
// Each is purchased once with Echoes currency (earned at prestige when this
// layer is unlocked). Each grants a permanent passive bonus.
export interface EchoType {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost: number; // Echoes
  bonus: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
    echoMult?: number; // multiplies Echoes earned on prestige
  };
}

export const ECHO_TYPES: EchoType[] = [
  {
    id: "echo_first",
    name: "Echo of the First",
    icon: "🌱",
    desc: "+15% production. The first run still whispers.",
    cost: 5,
    bonus: { productionMult: 0.15 },
  },
  {
    id: "echo_throne",
    name: "Echo of the Throne",
    icon: "👑",
    desc: "+20% EP. Past victories compound.",
    cost: 10,
    bonus: { epMult: 0.20 },
  },
  {
    id: "echo_vessel",
    name: "Echo of the Vessel",
    icon: "🏺",
    desc: "+18% capacity. The old vessels still hold.",
    cost: 8,
    bonus: { capMult: 0.18 },
  },
  {
    id: "echo_multitude",
    name: "Echo of the Multitude",
    icon: "👥",
    desc: "+20% population growth. The dead are still with us.",
    cost: 12,
    bonus: { popGrowthMult: 0.20 },
  },
  {
    id: "echo_loop",
    name: "Echo of the Loop",
    icon: "🔄",
    desc: "+25% Echoes earned per prestige. The loop feeds itself.",
    cost: 25,
    bonus: { echoMult: 0.25 },
  },
  {
    id: "echo_omega",
    name: "Echo of Omega",
    icon: "Ω",
    desc: "+10% to all four. The final echo, balanced across every domain.",
    cost: 40,
    bonus: {
      productionMult: 0.10,
      capMult: 0.10,
      epMult: 0.10,
      popGrowthMult: 0.10,
    },
  },
];

export const ECHO_TYPE_MAP: Record<string, EchoType> = Object.fromEntries(
  ECHO_TYPES.map((e) => [e.id, e])
);

// ----- Fork Scenarios (4) -----
// Each fork presents 2 branches; choosing one is permanent for the run.
// Once all 4 forks are resolved, the player advances toward Layer 10.
export interface ForkBranch {
  id: string;
  label: string;
  desc: string;
  bonus: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
  };
}

export interface ForkScenario {
  id: string;
  name: string;
  icon: string;
  desc: string;
  branches: [ForkBranch, ForkBranch];
}

export const FORK_SCENARIOS: ForkScenario[] = [
  {
    id: "fork_origin",
    name: "Fork of Origin",
    icon: "🪵",
    desc: "Where did the god begin?",
    branches: [
      {
        id: "fork_origin_sea",
        label: "Born of the Sea",
        desc: "+25% production. The warm tide is in your blood.",
        bonus: { productionMult: 0.25 },
      },
      {
        id: "fork_origin_void",
        label: "Born of the Void",
        desc: "+30% EP. You remember the dark before light.",
        bonus: { epMult: 0.30 },
      },
    ],
  },
  {
    id: "fork_path",
    name: "Fork of the Path",
    icon: "🛤️",
    desc: "Which road does the god walk?",
    branches: [
      {
        id: "fork_path_growth",
        label: "The Road of Growth",
        desc: "+30% population growth. The road walks itself.",
        bonus: { popGrowthMult: 0.30 },
      },
      {
        id: "fork_path_balance",
        label: "The Road of Balance",
        desc: "+15% production, +15% capacity. The middle way.",
        bonus: { productionMult: 0.15, capMult: 0.15 },
      },
    ],
  },
  {
    id: "fork_throne",
    name: "Fork of the Throne",
    icon: "👑",
    desc: "What does the god rule?",
    branches: [
      {
        id: "fork_throne_glory",
        label: "Throne of Glory",
        desc: "+40% EP. The crown shines.",
        bonus: { epMult: 0.40 },
      },
      {
        id: "fork_throne_iron",
        label: "Throne of Iron",
        desc: "+35% production. The crown is heavy.",
        bonus: { productionMult: 0.35 },
      },
    ],
  },
  {
    id: "fork_end",
    name: "Fork of the End",
    icon: "🌌",
    desc: "How will the god end?",
    branches: [
      {
        id: "fork_end_fire",
        label: "End in Fire",
        desc: "+50% production. Burn bright, burn out.",
        bonus: { productionMult: 0.50 },
      },
      {
        id: "fork_end_ice",
        label: "End in Ice",
        desc: "+40% capacity, +20% EP. The slow, cold forever.",
        bonus: { capMult: 0.40, epMult: 0.20 },
      },
    ],
  },
];

export const FORK_SCENARIO_MAP: Record<string, ForkScenario> = Object.fromEntries(
  FORK_SCENARIOS.map((f) => [f.id, f])
);

// ----- Future Debt Tiers (4) -----
// Borrow power now, repay (with penalty) later. Repayment accrues over time
// or by spending Echoes. Once all 4 debts are repaid, Layer 10 unlocks.
export interface FutureDebtTier {
  id: string;
  name: string;
  icon: string;
  desc: string;
  upfrontBonus: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
  };
  repaymentCost: number; // Echoes required to repay
}

export const FUTURE_DEBT_TIERS: FutureDebtTier[] = [
  {
    id: "debt_small",
    name: "Small Debt",
    icon: "🪙",
    desc: "+10% production now. Repay 5 Echoes later.",
    upfrontBonus: { productionMult: 0.10 },
    repaymentCost: 5,
  },
  {
    id: "debt_medium",
    name: "Medium Debt",
    icon: "💰",
    desc: "+25% EP now. Repay 15 Echoes later.",
    upfrontBonus: { epMult: 0.25 },
    repaymentCost: 15,
  },
  {
    id: "debt_large",
    name: "Large Debt",
    icon: "🏦",
    desc: "+40% capacity now. Repay 30 Echoes later.",
    upfrontBonus: { capMult: 0.40 },
    repaymentCost: 30,
  },
  {
    id: "debt_omega",
    name: "Omega Debt",
    icon: "Ω",
    desc: "+50% production, +30% pop now. Repay 75 Echoes later.",
    upfrontBonus: { productionMult: 0.50, popGrowthMult: 0.30 },
    repaymentCost: 75,
  },
];

export const FUTURE_DEBT_TIER_MAP: Record<string, FutureDebtTier> = Object.fromEntries(
  FUTURE_DEBT_TIERS.map((d) => [d.id, d])
);

// ----- Helpers -----

/**
 * Aggregated bonus from all purchased Echo Types.
 */
export function echoBonus(
  purchased: Record<string, boolean>
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
  echoMult: number;
} {
  let productionMult = 0;
  let capMult = 0;
  let epMult = 0;
  let popGrowthMult = 0;
  let echoMult = 0;
  for (const e of ECHO_TYPES) {
    if (!purchased[e.id]) continue;
    productionMult += e.bonus.productionMult || 0;
    capMult += e.bonus.capMult || 0;
    epMult += e.bonus.epMult || 0;
    popGrowthMult += e.bonus.popGrowthMult || 0;
    echoMult += e.bonus.echoMult || 0;
  }
  return { productionMult, capMult, epMult, popGrowthMult, echoMult };
}

/**
 * Aggregated bonus from all resolved Fork branches this run.
 */
export function forkBonus(
  resolved: Record<string, string>
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
  resolvedCount: number;
} {
  let productionMult = 0;
  let capMult = 0;
  let epMult = 0;
  let popGrowthMult = 0;
  let resolvedCount = 0;
  for (const fork of FORK_SCENARIOS) {
    const branchId = resolved[fork.id];
    if (!branchId) continue;
    const branch = fork.branches.find((b) => b.id === branchId);
    if (!branch) continue;
    resolvedCount += 1;
    productionMult += branch.bonus.productionMult || 0;
    capMult += branch.bonus.capMult || 0;
    epMult += branch.bonus.epMult || 0;
    popGrowthMult += branch.bonus.popGrowthMult || 0;
  }
  return { productionMult, capMult, epMult, popGrowthMult, resolvedCount };
}

/**
 * Bonus from all taken (but not yet repaid) Future Debts. Active debts grant
 * their upfront bonus. Repaid debts grant nothing further (but their
 * repayment is required to advance).
 */
export function activeDebtBonus(
  taken: Record<string, boolean>,
  repaid: Record<string, boolean>
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
  activeCount: number;
} {
  let productionMult = 0;
  let capMult = 0;
  let epMult = 0;
  let popGrowthMult = 0;
  let activeCount = 0;
  for (const d of FUTURE_DEBT_TIERS) {
    if (!taken[d.id]) continue;
    if (repaid[d.id]) continue;
    activeCount += 1;
    productionMult += d.upfrontBonus.productionMult || 0;
    capMult += d.upfrontBonus.capMult || 0;
    epMult += d.upfrontBonus.epMult || 0;
    popGrowthMult += d.upfrontBonus.popGrowthMult || 0;
  }
  return { productionMult, capMult, epMult, popGrowthMult, activeCount };
}

/**
 * Layer 10 (Eternity) unlock: all 4 forks resolved AND all taken debts repaid.
 * (You can take fewer than 4 debts, but any debt taken must be repaid.)
 */
export function isInfinityComplete(
  resolved: Record<string, string>,
  taken: Record<string, boolean>,
  repaid: Record<string, boolean>
): boolean {
  const { resolvedCount } = forkBonus(resolved);
  if (resolvedCount < FORK_SCENARIOS.length) return false;
  for (const d of FUTURE_DEBT_TIERS) {
    if (taken[d.id] && !repaid[d.id]) return false;
  }
  return true;
}
