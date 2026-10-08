// ===========================================================================
// LAYER 8 — DIVINITY (the layer; NOT the resource)
// ===========================================================================
// The file is `divinity_layer.ts` (not `divinity.ts`) because `divinity` is
// already a prestige currency from Layer 2 (Enlightenment). Divinity-the-
// layer is the layer of prayer: level Prayer Channels (Prayer = pop × 0.001/s),
// wear one Divine Mask, align one Worship Polarity. Completing 3+ channels
// AND choosing a polarity unlocks Layer 9 (Infinity).
// ===========================================================================

// ----- Prayer Channels (6) -----
// Leveled. Each level increases Prayer/sec multiplier and applies a passive
// bonus. Prayer is generated passively based on population (pop × 0.001/s base).
export interface PrayerChannel {
  id: string;
  name: string;
  icon: string;
  desc: string;
  baseCost: number; // Prayer cost for level 1
  costGrowth: number; // cost = base * growth^(level-1)
  maxLevel: number;
  bonusPerLevel: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
    prayerMult?: number; // multiplies the prayer/sec base
  };
}

export const PRAYER_CHANNELS: PrayerChannel[] = [
  {
    id: "pc_chorus",
    name: "Choir of Hours",
    icon: "🎶",
    desc: "+5% production per level. The first prayer, sung daily.",
    baseCost: 20,
    costGrowth: 1.6,
    maxLevel: 10,
    bonusPerLevel: { productionMult: 0.05 },
  },
  {
    id: "pc_vessel",
    name: "Vessel of Light",
    icon: "🕯️",
    desc: "+8% capacity per level. The prayer holds more of every tide.",
    baseCost: 30,
    costGrowth: 1.7,
    maxLevel: 10,
    bonusPerLevel: { capMult: 0.08 },
  },
  {
    id: "pc_remembrance",
    name: "Rite of Remembrance",
    icon: "📜",
    desc: "+10% EP per level. The dead are remembered; the throne remembers.",
    baseCost: 50,
    costGrowth: 1.8,
    maxLevel: 10,
    bonusPerLevel: { epMult: 0.10 },
  },
  {
    id: "pc_fecundity",
    name: "Blessing of Fecundity",
    icon: "🌾",
    desc: "+6% population growth per level. The prayer begets life.",
    baseCost: 35,
    costGrowth: 1.7,
    maxLevel: 10,
    bonusPerLevel: { popGrowthMult: 0.06 },
  },
  {
    id: "pc_amplify",
    name: "Amplifying Spire",
    icon: "🗼",
    desc: "+25% Prayer/sec per level. The prayer feeds itself.",
    baseCost: 80,
    costGrowth: 2.0,
    maxLevel: 5,
    bonusPerLevel: { prayerMult: 0.25 },
  },
  {
    id: "pc_omni",
    name: "Omnipresence Bell",
    icon: "🔔",
    desc: "+3% to production, cap, EP, and pop per level. The balanced chant.",
    baseCost: 100,
    costGrowth: 1.9,
    maxLevel: 10,
    bonusPerLevel: {
      productionMult: 0.03,
      capMult: 0.03,
      epMult: 0.03,
      popGrowthMult: 0.03,
    },
  },
];

export const PRAYER_CHANNEL_MAP: Record<string, PrayerChannel> = Object.fromEntries(
  PRAYER_CHANNELS.map((c) => [c.id, c])
);

/** Returns the cost to upgrade a channel from its current level. */
export function prayerChannelCost(channel: PrayerChannel, currentLevel: number): number {
  return Math.ceil(channel.baseCost * Math.pow(channel.costGrowth, currentLevel));
}

// ----- Divine Masks (6) -----
// One active at a time. Each grants a powerful passive bonus.
export interface DivineMask {
  id: string;
  name: string;
  icon: string;
  desc: string;
  bonus: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
    prayerMult?: number;
  };
}

export const DIVINE_MASKS: DivineMask[] = [
  {
    id: "mask_sun",
    name: "Mask of the Sun",
    icon: "🌞",
    desc: "+30% production. The radiant face.",
    bonus: { productionMult: 0.30 },
  },
  {
    id: "mask_moon",
    name: "Mask of the Moon",
    icon: "🌙",
    desc: "+40% capacity. The patient face.",
    bonus: { capMult: 0.40 },
  },
  {
    id: "mask_star",
    name: "Mask of the Star",
    icon: "⭐",
    desc: "+50% EP. The far-seeing face.",
    bonus: { epMult: 0.50 },
  },
  {
    id: "mask_sea",
    name: "Mask of the Sea",
    icon: "🌊",
    desc: "+40% population growth. The fecund face.",
    bonus: { popGrowthMult: 0.40 },
  },
  {
    id: "mask_void",
    name: "Mask of the Void",
    icon: "🕳️",
    desc: "+100% Prayer/sec. The hungry face.",
    bonus: { prayerMult: 1.0 },
  },
  {
    id: "mask_all",
    name: "Mask of All Faces",
    icon: "🎭",
    desc: "+12% to production, cap, EP, pop, and Prayer. The balanced face.",
    bonus: {
      productionMult: 0.12,
      capMult: 0.12,
      epMult: 0.12,
      popGrowthMult: 0.12,
      prayerMult: 0.12,
    },
  },
];

export const DIVINE_MASK_MAP: Record<string, DivineMask> = Object.fromEntries(
  DIVINE_MASKS.map((m) => [m.id, m])
);

// ----- Worship Polarities (5) -----
// One active at a time. Each grants a directional bonus.
export interface WorshipPolarity {
  id: string;
  name: string;
  icon: string;
  desc: string;
  bonus: {
    productionMult?: number;
    capMult?: number;
    epMult?: number;
    popGrowthMult?: number;
    prayerMult?: number;
  };
}

export const WORSHIP_POLARITIES: WorshipPolarity[] = [
  {
    id: "polarity_growth",
    name: "Polarity of Growth",
    icon: "🌱",
    desc: "+20% production, +20% population growth.",
    bonus: { productionMult: 0.20, popGrowthMult: 0.20 },
  },
  {
    id: "polarity_stasis",
    name: "Polarity of Stasis",
    icon: "🪨",
    desc: "+30% capacity. The still center holds.",
    bonus: { capMult: 0.30 },
  },
  {
    id: "polarity_glory",
    name: "Polarity of Glory",
    icon: "✨",
    desc: "+50% EP. The throne shines brighter.",
    bonus: { epMult: 0.50 },
  },
  {
    id: "polarity_devotion",
    name: "Polarity of Devotion",
    icon: "🙏",
    desc: "+100% Prayer/sec. The prayer becomes a river.",
    bonus: { prayerMult: 1.0 },
  },
  {
    id: "polarity_balance",
    name: "Polarity of Balance",
    icon: "☯️",
    desc: "+10% to all five. The middle way.",
    bonus: {
      productionMult: 0.10,
      capMult: 0.10,
      epMult: 0.10,
      popGrowthMult: 0.10,
      prayerMult: 0.10,
    },
  },
];

export const WORSHIP_POLARITY_MAP: Record<string, WorshipPolarity> = Object.fromEntries(
  WORSHIP_POLARITIES.map((p) => [p.id, p])
);

// ----- Helpers -----

/**
 * Aggregated bonus from all leveled Prayer Channels.
 */
export function prayerChannelBonus(
  levels: Record<string, number>
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
  prayerMult: number;
  totalLevels: number;
} {
  let productionMult = 0;
  let capMult = 0;
  let epMult = 0;
  let popGrowthMult = 0;
  let prayerMult = 0;
  let totalLevels = 0;
  for (const channel of PRAYER_CHANNELS) {
    const lvl = levels[channel.id] || 0;
    if (lvl <= 0) continue;
    totalLevels += lvl;
    const b = channel.bonusPerLevel;
    productionMult += (b.productionMult || 0) * lvl;
    capMult += (b.capMult || 0) * lvl;
    epMult += (b.epMult || 0) * lvl;
    popGrowthMult += (b.popGrowthMult || 0) * lvl;
    prayerMult += (b.prayerMult || 0) * lvl;
  }
  return { productionMult, capMult, epMult, popGrowthMult, prayerMult, totalLevels };
}

/**
 * Bonus from the currently active Divine Mask.
 */
export function divineMaskBonus(
  activeMask: string | null | undefined
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
  prayerMult: number;
} {
  if (!activeMask) return { productionMult: 0, capMult: 0, epMult: 0, popGrowthMult: 0, prayerMult: 0 };
  const mask = DIVINE_MASK_MAP[activeMask];
  if (!mask) return { productionMult: 0, capMult: 0, epMult: 0, popGrowthMult: 0, prayerMult: 0 };
  return {
    productionMult: mask.bonus.productionMult || 0,
    capMult: mask.bonus.capMult || 0,
    epMult: mask.bonus.epMult || 0,
    popGrowthMult: mask.bonus.popGrowthMult || 0,
    prayerMult: mask.bonus.prayerMult || 0,
  };
}

/**
 * Bonus from the currently active Worship Polarity.
 */
export function worshipPolarityBonus(
  activePolarity: string | null | undefined
): {
  productionMult: number;
  capMult: number;
  epMult: number;
  popGrowthMult: number;
  prayerMult: number;
} {
  if (!activePolarity) return { productionMult: 0, capMult: 0, epMult: 0, popGrowthMult: 0, prayerMult: 0 };
  const p = WORSHIP_POLARITY_MAP[activePolarity];
  if (!p) return { productionMult: 0, capMult: 0, epMult: 0, popGrowthMult: 0, prayerMult: 0 };
  return {
    productionMult: p.bonus.productionMult || 0,
    capMult: p.bonus.capMult || 0,
    epMult: p.bonus.epMult || 0,
    popGrowthMult: p.bonus.popGrowthMult || 0,
    prayerMult: p.bonus.prayerMult || 0,
  };
}

/**
 * Compute Prayer/sec generated. Base = population × 0.001/s, scaled by every
 * prayer-mult bonus in the layer.
 */
export function prayerRate(
  population: number,
  channelLevels: Record<string, number>,
  activeMask: string | null | undefined,
  activePolarity: string | null | undefined
): number {
  const base = population * 0.001;
  const chan = prayerChannelBonus(channelLevels);
  const mask = divineMaskBonus(activeMask);
  const pol = worshipPolarityBonus(activePolarity);
  const mult = 1 + chan.prayerMult + mask.prayerMult + pol.prayerMult;
  return base * mult;
}

/**
 * Layer 9 (Infinity) unlock: 3+ prayer channels leveled AND a polarity chosen.
 */
export function isDivinityComplete(
  channelLevels: Record<string, number>,
  activePolarity: string | null | undefined
): boolean {
  const { totalLevels } = prayerChannelBonus(channelLevels);
  const channelsLeveled = PRAYER_CHANNELS.filter((c) => (channelLevels[c.id] || 0) > 0).length;
  return channelsLeveled >= 3 && totalLevels >= 3 && !!activePolarity;
}
