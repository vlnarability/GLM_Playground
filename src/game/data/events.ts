// Random events — sporadic occurrences that give the player choices
// Each event has a condition (when it can fire), a description, and choices with effects

import type { ResourceId } from "../state/types";

export interface EventChoice {
  id: string;
  label: string;
  desc: string;
  // Effects: positive numbers add, negative subtract
  resourceChanges?: Partial<Record<ResourceId, number>>;
  populationChange?: number;
  happinessChange?: number;
  affinityChange?: { archetype: string; amount: number }[];
  // Log message to add after choosing
  logMsg?: string;
}

export interface GameEvent {
  id: string;
  name: string;
  desc: string;
  icon: string;
  // Which stages this event can fire in
  stages: string[];
  // Minimum game time before this event can fire (seconds)
  minTime: number;
  // Weight for random selection (higher = more common)
  weight: number;
  choices: EventChoice[];
}

export const EVENTS: GameEvent[] = [
  // ===== CELL EVENTS =====
  {
    id: "chemical_bloom",
    name: "Chemical Bloom",
    desc: "A rare bloom of organic molecules drifts through the warm sea. The cell senses an opportunity — or a threat.",
    icon: "🧪",
    stages: ["cell"],
    minTime: 30,
    weight: 10,
    choices: [
      {
        id: "absorb",
        label: "Absorb the bloom",
        desc: "+15 glucose, +5 proteins. Risk: slight toxicity.",
        resourceChanges: { glucose: 15, proteins: 5, atp: -2 },
        logMsg: "Absorbed the chemical bloom. Gained resources, lost some ATP.",
      },
      {
        id: "avoid",
        label: "Steer clear",
        desc: "Safe, but miss the opportunity.",
        logMsg: "Avoided the chemical bloom. No change.",
      },
    ],
  },
  {
    id: "predator_shadow",
    name: "Shadow in the Deep",
    desc: "Something larger moves in the dark. The cell feels the pressure of a predator's presence.",
    icon: "🌑",
    stages: ["cell"],
    minTime: 60,
    weight: 8,
    choices: [
      {
        id: "hide",
        label: "Contract and hide",
        desc: "Lose 2 ATP, but survive. Gain nothing.",
        resourceChanges: { atp: -2 },
        logMsg: "Hid from the predator. Cost ATP.",
      },
      {
        id: "flee",
        label: "Flee aggressively",
        desc: "Burn 5 glucose to escape faster. +3 ATP from adrenaline.",
        resourceChanges: { glucose: -5, atp: 3 },
        logMsg: "Fled the predator. Burned glucose, gained ATP.",
      },
    ],
  },
  {
    id: "membrane_crack",
    name: "Membrane Stress",
    desc: "The cell wall shows signs of stress. A weak point could rupture — or be reinforced.",
    icon: "💢",
    stages: ["cell"],
    minTime: 90,
    weight: 6,
    choices: [
      {
        id: "reinforce",
        label: "Spend lipids to reinforce",
        desc: "−5 lipids, +10 ATP (reinforced membrane is more efficient).",
        resourceChanges: { lipids: -5, atp: 10 },
        logMsg: "Reinforced the membrane. Spent lipids, gained ATP.",
      },
      {
        id: "ignore",
        label: "Let it heal naturally",
        desc: "−3 ATP. The cell recovers slowly on its own.",
        resourceChanges: { atp: -3 },
        logMsg: "Let the membrane heal naturally. Lost some ATP.",
      },
    ],
  },

  // ===== CREATURE EVENTS =====
  {
    id: "rival_pack",
    name: "Rival Pack",
    desc: "A rival pack encroaches on your territory. They want your watering hole.",
    icon: "🐺",
    stages: ["creature"],
    minTime: 120,
    weight: 8,
    choices: [
      {
        id: "fight",
        label: "Defend the territory",
        desc: "−5 food, +3 knowledge. The pack learns from conflict.",
        resourceChanges: { food: -5, knowledge: 3 },
        affinityChange: [{ archetype: "reptilian", amount: 1 }],
        logMsg: "Defended territory from rival pack. Gained knowledge.",
      },
      {
        id: "share",
        label: "Share the watering hole",
        desc: "−8 food, +5 culture. Diplomacy breeds understanding.",
        resourceChanges: { food: -8, culture: 5 },
        affinityChange: [{ archetype: "mammalian", amount: 1 }],
        logMsg: "Shared territory. Lost food, gained culture.",
      },
    ],
  },
  {
    id: "strange_fruit",
    name: "Strange Fruit",
    desc: "A scout returns with news of a fruit none have seen before. Its smell is intoxicating.",
    icon: "🍎",
    stages: ["creature"],
    minTime: 90,
    weight: 7,
    choices: [
      {
        id: "eat",
        label: "Taste it",
        desc: "+10 food, +2 knowledge. Risk: mild poisoning.",
        resourceChanges: { food: 10, knowledge: 2, water: -2 },
        logMsg: "Tasted the strange fruit. Gained food and knowledge.",
      },
      {
        id: "cultivate",
        label: "Cultivate it",
        desc: "−3 food now, +0.5 food/s long-term (next 60s of production).",
        resourceChanges: { food: -3, knowledge: 1 },
        affinityChange: [{ archetype: "plantoid", amount: 1 }],
        logMsg: "Began cultivating the strange fruit. Plantoid drift.",
      },
    ],
  },

  // ===== TRIBAL EVENTS =====
  {
    id: "harsh_winter",
    name: "Harsh Winter",
    desc: "The cold season arrives early and hard. Food stores will be tested.",
    icon: "❄️",
    stages: ["tribal"],
    minTime: 120,
    weight: 9,
    choices: [
      {
        id: "ration",
        label: "Ration carefully",
        desc: "−5 food, +3 happiness (solidarity through hardship).",
        resourceChanges: { food: -5 },
        happinessChange: 3,
        logMsg: "Rationed food through the harsh winter. Morale held.",
      },
      {
        id: "feast",
        label: "Feast to keep warm",
        desc: "−15 food, +8 happiness. Risk: shortage later.",
        resourceChanges: { food: -15 },
        happinessChange: 8,
        logMsg: "Held a feast against the cold. Morale high, food low.",
      },
    ],
  },
  {
    id: "wandering_elder",
    name: "The Wandering Elder",
    desc: "A stranger arrives at the firelight, bearing old knowledge and older scars.",
    icon: "🧙",
    stages: ["tribal", "civilization"],
    minTime: 180,
    weight: 5,
    choices: [
      {
        id: "welcome",
        label: "Welcome them",
        desc: "+8 knowledge, +3 culture. The elder shares their wisdom.",
        resourceChanges: { knowledge: 8, culture: 3 },
        affinityChange: [{ archetype: "molluscoid", amount: 1 }],
        logMsg: "Welcomed the wandering elder. Gained knowledge and culture.",
      },
      {
        id: "turn_away",
        label: "Turn them away",
        desc: "+2 food (kept your stores). The night grows colder.",
        resourceChanges: { food: 2 },
        logMsg: "Turned the elder away. Kept your stores.",
      },
    ],
  },

  // ===== CIVILIZATION EVENTS =====
  {
    id: "plague_rumor",
    name: "Whispers of Plague",
    desc: "Reports of a spreading sickness reach the capital. The council debates action.",
    icon: "🦠",
    stages: ["civilization", "empire"],
    minTime: 300,
    weight: 6,
    choices: [
      {
        id: "quarantine",
        label: "Quarantine the district",
        desc: "−10 happiness, prevent population loss. Science +5.",
        resourceChanges: { science: 5 },
        happinessChange: -10,
        logMsg: "Quarantined the plague district. Cost happiness, gained science.",
      },
      {
        id: "ignore_plague",
        label: "Hope it passes",
        desc: "No cost now, but risk: −5 population later.",
        populationChange: -5,
        logMsg: "Ignored the plague rumors. Population suffered.",
      },
    ],
  },
  {
    id: "golden_age",
    name: "Signs of a Golden Age",
    desc: "The granaries overflow. The scholars are inspired. The people dream of greatness.",
    icon: "✨",
    stages: ["civilization", "empire"],
    minTime: 200,
    weight: 4,
    choices: [
      {
        id: "celebrate",
        label: "Declare a jubilee",
        desc: "+15 happiness, +5 culture, −10 gold.",
        resourceChanges: { culture: 5, gold: -10 },
        happinessChange: 15,
        logMsg: "Declared a jubilee. Happiness and culture soared.",
      },
      {
        id: "invest",
        label: "Invest the surplus",
        desc: "+10 gold, +5 science. Pragmatic growth.",
        resourceChanges: { gold: 10, science: 5 },
        logMsg: "Invested the surplus into research and treasury.",
      },
    ],
  },

  // ===== EMPIRE EVENTS =====
  {
    id: "border_incursion",
    name: "Border Incursion",
    desc: "A rival power tests your frontier defenses. A small force has crossed the river.",
    icon: "⚔️",
    stages: ["empire"],
    minTime: 200,
    weight: 7,
    choices: [
      {
        id: "respond",
        label: "Send the legion",
        desc: "−5 military_power, +10 influence. Strength answered strength.",
        resourceChanges: { military_power: -5, influence: 10 },
        logMsg: "Responded to the incursion with force. Influence grew.",
      },
      {
        id: "diplomacy",
        label: "Open diplomatic channels",
        desc: "−5 gold, +8 influence, +3 culture. The pen proves mightier.",
        resourceChanges: { gold: -5, influence: 8, culture: 3 },
        logMsg: "Resolved the incursion through diplomacy.",
      },
    ],
  },

  // ===== SOLAR EVENTS =====
  {
    id: "solar_flare",
    name: "Solar Flare",
    desc: "A massive flare erupts from the local star. Energy grids surge — for better or worse.",
    icon: "🔆",
    stages: ["solar", "galactic"],
    minTime: 200,
    weight: 6,
    choices: [
      {
        id: "harvest_flare",
        label: "Harvest the surge",
        desc: "+30 energy, −5 alloys (grids strained).",
        resourceChanges: { energy: 30, alloys: -5 },
        logMsg: "Harvested the solar flare. Energy spiked.",
      },
      {
        id: "shield_systems",
        label: "Shield the grids",
        desc: "−5 energy, +3 science. Learned from the event.",
        resourceChanges: { energy: -5, science: 3 },
        logMsg: "Shielded systems from the flare. Gained research data.",
      },
    ],
  },

  // ===== GALACTIC EVENTS =====
  {
    id: "ancient_signal",
    name: "Ancient Signal",
    desc: "A repeating signal from a dead world. The pattern is too regular to be natural.",
    icon: "📡",
    stages: ["galactic"],
    minTime: 300,
    weight: 5,
    choices: [
      {
        id: "investigate",
        label: "Dispatch a research fleet",
        desc: "−20 energy, +15 data, +10 science. Something answers.",
        resourceChanges: { energy: -20, data: 15, science: 10 },
        logMsg: "Investigated the ancient signal. Gained knowledge.",
      },
      {
        id: "silence",
        label: "Maintain radio silence",
        desc: "Safe, but the mystery deepens. +5 data from background analysis.",
        resourceChanges: { data: 5 },
        logMsg: "Maintained silence. Collected passive data.",
      },
    ],
  },

  // ===== CRISIS EVENTS (can fire in any stage, lower weight) =====
  {
    id: "resource_drought",
    name: "Drought",
    desc: "The land withers. Water grows scarce. The civilization braces for hardship.",
    icon: "🏜️",
    stages: ["creature", "tribal", "civilization", "empire"],
    minTime: 240,
    weight: 3,
    choices: [
      {
        id: "conserve",
        label: "Conserve and endure",
        desc: "−5 happiness, −3 population. The drought passes.",
        happinessChange: -5,
        populationChange: -3,
        logMsg: "Endured the drought through conservation. Lost population.",
      },
      {
        id: "redistribute",
        label: "Redistribute stores",
        desc: "−15 food/water, +5 happiness. Solidarity prevails.",
        resourceChanges: { food: -15, water: -15 },
        happinessChange: 5,
        affinityChange: [{ archetype: "mammalian", amount: 1 }],
        logMsg: "Redistributed stores during the drought. Morale held.",
      },
    ],
  },
  {
    id: "visionary_dream",
    name: "Visionary Dream",
    desc: "A figure of legend reports a dream of impossible clarity — a vision of what the civilization could become.",
    icon: "💭",
    stages: ["tribal", "civilization", "empire"],
    minTime: 200,
    weight: 4,
    choices: [
      {
        id: "embrace_vision",
        label: "Embrace the vision",
        desc: "+10 culture, +5 knowledge. The dream becomes a guiding myth.",
        resourceChanges: { culture: 10, knowledge: 5 },
        affinityChange: [{ archetype: "molluscoid", amount: 1 }],
        logMsg: "Embraced the visionary dream. Culture flourished.",
      },
      {
        id: "dismiss_dream",
        label: "Dismiss it as fantasy",
        desc: "+3 science. The practical mind prevails.",
        resourceChanges: { science: 3 },
        logMsg: "Dismissed the dream. Focused on the practical.",
      },
    ],
  },
  {
    id: "migration_wave",
    name: "Migration Wave",
    desc: "A wave of migrants arrives at the border — fleeing conflict elsewhere. They bring labor, but also need.",
    icon: "🚶",
    stages: ["civilization", "empire"],
    minTime: 250,
    weight: 4,
    choices: [
      {
        id: "welcome_migrants",
        label: "Welcome them",
        desc: "+15 population, −10 food, +3 culture. Diversity strengthens.",
        resourceChanges: { food: -10, culture: 3 },
        populationChange: 15,
        affinityChange: [{ archetype: "humanoid", amount: 1 }],
        logMsg: "Welcomed the migrants. Population grew, food strained.",
      },
      {
        id: "turn_back",
        label: "Turn them back",
        desc: "No change, but the watch grows wary. +2 military.",
        resourceChanges: { military_power: 2 },
        logMsg: "Turned back the migrants. Borders held.",
      },
    ],
  },

  // ===== ALIGNMENT-TILTING EVENTS (shift archetype affinity) =====
  {
    id: "old_warrior",
    name: "The Old Warrior",
    desc: "A veteran offers to train the youth. The way of the sword, or the way of the shield?",
    icon: "🛡️",
    stages: ["tribal", "civilization"],
    minTime: 180,
    weight: 4,
    choices: [
      {
        id: "aggressive_training",
        label: "Train for the offensive",
        desc: "+8 military_power. Reptilian drift.",
        resourceChanges: { military_power: 8 },
        affinityChange: [{ archetype: "reptilian", amount: 2 }],
        logMsg: "Trained the youth for the offensive. Reptilian drift.",
      },
      {
        id: "defensive_training",
        label: "Train for defense",
        desc: "+5 military_power, +3 happiness. Mammalian drift.",
        resourceChanges: { military_power: 5 },
        happinessChange: 3,
        affinityChange: [{ archetype: "mammalian", amount: 2 }],
        logMsg: "Trained for defense. Morale and mammalian drift.",
      },
    ],
  },
  {
    id: "scholars_debate",
    name: "The Great Debate",
    desc: "Two scholars argue in the square: does truth come from observation, or from reasoning alone?",
    icon: "⚖️",
    stages: ["civilization", "empire"],
    minTime: 220,
    weight: 4,
    choices: [
      {
        id: "empiricism",
        label: "Side with the empiricist",
        desc: "+8 science. Avian drift.",
        resourceChanges: { science: 8 },
        affinityChange: [{ archetype: "avian", amount: 2 }],
        logMsg: "Sided with the empiricist. Science advanced.",
      },
      {
        id: "rationalism",
        label: "Side with the rationalist",
        desc: "+6 science, +3 culture. Molluscoid drift.",
        resourceChanges: { science: 6, culture: 3 },
        affinityChange: [{ archetype: "molluscoid", amount: 2 }],
        logMsg: "Sided with the rationalist. Mind and culture deepened.",
      },
    ],
  },
];

export const EVENT_MAP: Record<string, GameEvent> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e])
);

// Get events that can fire in the current stage
export function eventsForStage(stage: string, gameTime: number): GameEvent[] {
  return EVENTS.filter((e) => e.stages.includes(stage) && gameTime >= e.minTime);
}
