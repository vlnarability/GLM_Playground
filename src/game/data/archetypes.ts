// Archetype / lineage system
// 13 archetypes (9 basic + 4 rare). Affinity drifts during a run based on
// systems/tech purchased. Locked at Creature→Tribal evolution. Provides a
// passive bonus for the rest of the run.

export interface ArchetypeDef {
  id: string;
  name: string;
  rarity: "basic" | "rare";
  unlock: "default" | "first_win";
  color: string;
  glyph: string; // a single-character sigil
  blurb: string;
  bonus: {
    label: string;
    // applied as multipliers in tick
    productionMult?: Partial<Record<string, number>>; // resource → multiplier
    allProductionMult?: number;
    populationGrowthMult?: number;
    capMult?: number;
    desc: string;
  };
}

export const ARCHETYPES: ArchetypeDef[] = [
  {
    id: "humanoid",
    name: "Humanoid",
    rarity: "basic",
    unlock: "default",
    color: "#c4b5a0",
    glyph: "☻",
    blurb: "Adaptable, social, tool-building. The generalist's path.",
    bonus: {
      label: "+8% all production",
      allProductionMult: 0.08,
      desc: "Balanced growth across every domain.",
    },
  },
  {
    id: "mammalian",
    name: "Mammalian",
    rarity: "basic",
    unlock: "default",
    color: "#d4956b",
    glyph: "denti",
    blurb: "Warm-blooded, nurturing, social-bonded. Population thrives.",
    bonus: {
      label: "+18% population growth, +10% food",
      populationGrowthMult: 0.18,
      productionMult: { food: 0.10 },
      desc: "Kinship feeds the herd.",
    },
  },
  {
    id: "reptilian",
    name: "Reptilian",
    rarity: "basic",
    unlock: "default",
    color: "#7fae5e",
    glyph: "∿",
    blurb: "Cold, patient, predatory. Discipline in scale and tooth.",
    bonus: {
      label: "+25% military power",
      productionMult: { military_power: 0.25 },
      desc: "The patient predator always wins.",
    },
  },
  {
    id: "avian",
    name: "Avian",
    rarity: "basic",
    unlock: "default",
    color: "#d4b94a",
    glyph: "⋋",
    blurb: "Light-boned, far-sighted, quick. Knowledge travels far.",
    bonus: {
      label: "+20% science & knowledge",
      productionMult: { science: 0.20, knowledge: 0.20 },
      desc: "The horizon is a library.",
    },
  },
  {
    id: "arthropoid",
    name: "Arthropoid",
    rarity: "basic",
    unlock: "default",
    color: "#c66b8a",
    glyph: "✶",
    blurb: "Many-limbed, industrious, hive-minded. Labor multiplies.",
    bonus: {
      label: "+22% production & materials",
      productionMult: { production: 0.22, materials: 0.22 },
      desc: "A thousand hands make light work.",
    },
  },
  {
    id: "molluscoid",
    name: "Molluscoid",
    rarity: "basic",
    unlock: "default",
    color: "#a07fcc",
    glyph: "◯",
    blurb: "Soft, ancient, patient. Culture and science run deep.",
    bonus: {
      label: "+18% culture, +12% science",
      productionMult: { culture: 0.18, science: 0.12 },
      desc: "Intelligence does not require a spine.",
    },
  },
  {
    id: "fungoid",
    name: "Fungoid",
    rarity: "basic",
    unlock: "default",
    color: "#a8b85a",
    glyph: "☂",
    blurb: "Networked, decomposing, immortal. Waste becomes food.",
    bonus: {
      label: "+25% organic matter, +10% food",
      productionMult: { organic_matter: 0.25, food: 0.10 },
      desc: "Nothing is wasted in the mycelium.",
    },
  },
  {
    id: "plantoid",
    name: "Plantoid",
    rarity: "basic",
    unlock: "default",
    color: "#5abf6e",
    glyph: "✿",
    blurb: "Rooted, photosynthetic, enduring. Sunlight is enough.",
    bonus: {
      label: "+28% food, +12% happiness",
      productionMult: { food: 0.28 },
      desc: "Stillness is its own power.",
    },
  },
  {
    id: "aquatic",
    name: "Aquatic",
    rarity: "basic",
    unlock: "default",
    color: "#3fb8d4",
    glyph: "≈",
    blurb: "Fluid, pressure-deep, memory-holding. The sea remembers.",
    bonus: {
      label: "+20% water, +12% science",
      productionMult: { water: 0.20, science: 0.12 },
      desc: "All life began here, and may again.",
    },
  },
  {
    id: "lithoid",
    name: "Lithoid",
    rarity: "rare",
    unlock: "first_win",
    color: "#9c8f7d",
    glyph: "◆",
    blurb: "Stone-born, crystalline, slow. What endures, endures.",
    bonus: {
      label: "+25% stone & alloys, +10% cap",
      productionMult: { stone: 0.25, alloys: 0.25 },
      capMult: 0.10,
      desc: "Patience carved in geological time.",
    },
  },
  {
    id: "necroid",
    name: "Necroid",
    rarity: "rare",
    unlock: "first_win",
    color: "#8a7a98",
    glyph: "☥",
    blurb: "Death-touched, ritual-bound. The past never leaves.",
    bonus: {
      label: "+18% culture, +15% military",
      productionMult: { culture: 0.18, military_power: 0.15 },
      desc: "What is dead may never die.",
    },
  },
  {
    id: "toxoid",
    name: "Toxoid",
    rarity: "rare",
    unlock: "first_win",
    color: "#9fce44",
    glyph: "☣",
    blurb: "Venomous, adaptive, hazardous. Thrives where others can't.",
    bonus: {
      label: "+18% science, +12% production",
      productionMult: { science: 0.18, production: 0.12 },
      desc: "Poison is just a dose of opportunity.",
    },
  },
  {
    id: "extremophile",
    name: "Extremophile",
    rarity: "rare",
    unlock: "first_win",
    color: "#d96b4f",
    glyph: "☢",
    blurb: "Lives where nothing should. The universe is not picky.",
    bonus: {
      label: "+10% all production, +15% cap",
      allProductionMult: 0.10,
      capMult: 0.15,
      desc: "Life finds a way. Always.",
    },
  },
];

export const ARCHETYPE_MAP: Record<string, ArchetypeDef> = Object.fromEntries(
  ARCHETYPES.map((a) => [a.id, a])
);

export function isArchetypeUnlocked(id: string, galacticWins: number): boolean {
  const a = ARCHETYPE_MAP[id];
  if (!a) return false;
  if (a.unlock === "default") return true;
  return galacticWins >= 1;
}

// Compute dominant archetype from affinity map
export function dominantArchetype(affinity: Record<string, number>): string | null {
  let best: string | null = null;
  let bestVal = 0;
  for (const [id, v] of Object.entries(affinity)) {
    if (v > bestVal) {
      bestVal = v;
      best = id;
    }
  }
  return bestVal > 0 ? best : null;
}
