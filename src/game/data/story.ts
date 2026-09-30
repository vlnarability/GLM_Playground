import type { StoryEntry, StageId } from "../state/types";
import { SYSTEMS } from "./systems";

// Story beats unlocked by progression
export const STORY_ENTRIES: StoryEntry[] = [
  {
    id: "first_spark",
    title: "First Spark",
    body: "In the warm dark of a young sea, something stirs. A membrane holds. A spark of ATP ignites. " +
      "You are not yet awake — but you are becoming. The first law of this universe is survival.",
    stage: "cell",
    layer: "Evolution",
    trigger: "Run start",
    category: "primary",
  },
  {
    id: "first_membrane_holds",
    title: "First Membrane Holds",
    body: "A thousand small deaths, and one survival. The cell learns to draw glucose through its wall. " +
      "What was fragile becomes durable. The first choice — to persist — has been made.",
    stage: "cell",
    layer: "Evolution",
    trigger: "Buy 3 systems",
    category: "stage",
  },
  {
    id: "nucleus_forms",
    title: "The Nucleus Forms",
    body: "Genetic material curls into a protected core. The cell has become something more than chemistry — " +
      "it has become memory. What it has learned, it can now pass on.",
    stage: "cell",
    layer: "Evolution",
    trigger: "Build a Nucleus",
    category: "milestone",
  },
  {
    id: "cell_endures",
    title: "Cell Endures",
    body: "The cell divides. The membrane holds through a thousand tremors. What was single is now many. " +
      "The first body stirs in the deep.",
    stage: "cell",
    layer: "Evolution",
    trigger: "Evolve to Creature",
    category: "milestone",
  },
  {
    id: "first_body_stirs",
    title: "The First Body Stirs",
    body: "The first body uncurls. Eyes that were spots now see. Hunger that was instinct now becomes want. " +
      "The world is wide and full of teeth. You must move, eat, fear, and remember.",
    stage: "creature",
    layer: "Evolution",
    trigger: "Reach Creature stage",
    category: "primary",
  },
  {
    id: "instinct_learns",
    title: "Instinct Learns",
    body: "The pack returns to the same watering hole. The same path. The same shelter. " +
      "Instinct becomes ritual, and ritual becomes the first fragile shape of culture.",
    stage: "creature",
    layer: "Evolution",
    trigger: "Buy 5 creature systems",
    category: "stage",
  },
  {
    id: "fire_remembered",
    title: "Fire is Remembered",
    body: "The fire holds through the night. The circle of faces becomes a circle of names. " +
      "Story is born — and with story, the first memory that outlives a single life.",
    stage: "tribal",
    layer: "Evolution",
    trigger: "Reach Tribal stage",
    category: "primary",
  },
  {
    id: "first_circle",
    title: "The First Circle",
    body: "Around the fire, the first council meets. Words are slow, gestures are slow, but a decision is made: " +
      "to stay. To build. To remember.",
    stage: "tribal",
    layer: "Evolution",
    trigger: "Build a Totem",
    category: "stage",
  },
  {
    id: "cities_learn_to_dream",
    title: "Cities Learn to Dream",
    body: "Stone rises in courses. Laws are carved beside grain counts. " +
      "The city learns to dream of more than tomorrow — it dreams of empire.",
    stage: "civilization",
    layer: "Evolution",
    trigger: "Reach Civilization",
    category: "primary",
  },
  {
    id: "distance_begins_to_obey",
    title: "Distance Begins to Obey",
    body: "Distance begins to obey. The roads of an empire run long, and along them ride not just grain and gold — " +
      "but the slow weight of rivals who dream the same dreams.",
    stage: "empire",
    layer: "Evolution",
    trigger: "Reach Empire",
    category: "primary",
  },
  {
    id: "sky_stops_being_a_wall",
    title: "The Sky Stops Being a Wall",
    body: "The sky stops being a wall. A ship breaks the sky and does not fall. " +
      "The first new world waits in the dark — and beyond it, a hundred more.",
    stage: "solar",
    layer: "Evolution",
    trigger: "Reach Solar",
    category: "primary",
  },
  {
    id: "galaxy_takes_a_shape",
    title: "The Galaxy Takes a Shape",
    body: "The galaxy takes a shape. A thousand suns answer one banner. " +
      "The question is no longer whether to live — but what kind of life deserves to live forever.",
    stage: "galactic",
    layer: "Evolution",
    trigger: "Reach Galactic",
    category: "primary",
  },
  {
    id: "creation_reaches_stars",
    title: "Creation Reaches the Stars",
    body: "Creation reaches the stars. The god opens its eyes — and sees, for the first time, " +
      "that it has been watching itself all along. Evolution has reached its first ending. " +
      "But the universe is wider than one dream.",
    stage: "galactic",
    layer: "Evolution",
    trigger: "Win the game",
    category: "milestone",
  },
  {
    id: "god_opens_its_eyes",
    title: "The God Opens Its Eyes",
    body: "The god opens its eyes. The long testing is over. " +
      "Now, in the silence between galaxies, it begins to ask: what kind of universe deserves to exist forever?",
    stage: "meta",
    layer: "Enlightenment",
    trigger: "First prestige",
    category: "layer",
  },
  {
    id: "first_autobuyer",
    title: "The First Self",
    body: "A membrane pump hums to life in the dark of the sea. For the first time, the cell does not need to act — " +
      "something else is doing the work of staying alive. The first fragile thread of automation is woven.",
    stage: "cell",
    layer: "Evolution",
    trigger: "Build a Membrane Pump",
    category: "stage",
  },
  {
    id: "first_tech",
    title: "The First Knowing",
    body: "Knowledge crystallizes. Not the slow accumulation of instinct, but a deliberate insight — a thing understood, " +
      "held, and passed on. The cell has learned to learn.",
    stage: "cell",
    layer: "Evolution",
    trigger: "Research your first technology",
    category: "milestone",
  },
  {
    id: "population_boom",
    title: "A Quiet Multiplication",
    body: "The numbers swell. What was one is now many, and the many begin to need more than the sea freely gives. " +
      "Scarcity is born — and with it, the first dim shape of choice.",
    stage: "cell",
    layer: "Evolution",
    trigger: "Reach 50 population",
    category: "milestone",
  },
  {
    id: "first_cap",
    title: "The Full Vessel",
    body: "For the first time, there is enough. More than enough. The vessel is full and the surplus spills away into " +
      "the dark. The cell begins to sense the shape of a thing it does not yet have a word for: waste.",
    stage: "cell",
    layer: "Evolution",
    trigger: "Fill a resource to capacity",
    category: "milestone",
  },
  {
    id: "agriculture_mastered",
    title: "The Seed is Planted",
    body: "The tribe learns to keep what grows. A seed, dropped and forgotten, returns as a stalk. " +
      "Hunger, the ancient enemy, becomes a thing that can be planned against. The first calendar is carved in bone.",
    stage: "tribal",
    layer: "Evolution",
    trigger: "Research Agriculture",
    category: "milestone",
  },
  {
    id: "first_writing",
    title: "The First Mark",
    body: "A scratch on clay. A notch on bone. The first symbol that means the same thing tomorrow as it does today. " +
      "Memory, until now, has lived only in the minds of the old. Now it can outlive them.",
    stage: "tribal",
    layer: "Evolution",
    trigger: "Research Writing",
    category: "milestone",
  },
  {
    id: "first_city",
    title: "The First Walls",
    body: "Stone rises in courses taller than a man. Inside, grain is counted, laws are carved, and the names of " +
      "the dead are written on pillars. Outside, the wild begins to learn the meaning of 'border.'",
    stage: "civilization",
    layer: "Evolution",
    trigger: "Build 3 civilization systems",
    category: "stage",
  },
  {
    id: "scientific_method",
    title: "The Method",
    body: "Not just knowledge — but a way to test knowledge. A question becomes a hypothesis, becomes an experiment, " +
      "becomes a law. The universe, until now a mystery to be endured, becomes a puzzle to be solved.",
    stage: "civilization",
    layer: "Evolution",
    trigger: "Research Scientific Method",
    category: "milestone",
  },
  {
    id: "first_empire_decree",
    title: "The First Decree",
    body: "A word from the throne reshapes provinces. Roads are ordered. Laws are unified. For the first time, " +
      "millions of strangers move to the rhythm of a single will — and the will begins to dream of more.",
    stage: "empire",
    layer: "Evolution",
    trigger: "Build 2 empire systems",
    category: "stage",
  },
  {
    id: "first_colony",
    title: "The First Shore Beyond",
    body: "A ship breaks the sky and does not fall. On a new world, pioneers plant a flag in soil no ancestor " +
      "ever touched. The horizon, until now a wall, becomes a door.",
    stage: "solar",
    layer: "Evolution",
    trigger: "Build a Colony Ship",
    category: "milestone",
  },
  {
    id: "ascension_researched",
    title: "The Path Beyond Matter",
    body: "The equations align. A pattern emerges in the cosmic background — not noise, but a signature. " +
      "The civilization begins to suspect that matter is not the final word, but the first chapter.",
    stage: "galactic",
    layer: "Evolution",
    trigger: "Research Ascension Theory",
    category: "milestone",
  },
];

export const STORY_MAP: Record<string, StoryEntry> = Object.fromEntries(
  STORY_ENTRIES.map((s) => [s.id, s])
);

// Trigger conditions evaluated during gameplay
export interface StoryTrigger {
  id: string;
  condition: (state: any) => boolean;
}

export const STORY_TRIGGERS: StoryTrigger[] = [
  // Cell stage
  { id: "first_membrane_holds", condition: (s) => totalSystems(s) >= 3 },
  { id: "nucleus_forms", condition: (s) => !!s.ownedSystems?.["nucleus"] },
  { id: "first_autobuyer", condition: (s) => !!s.ownedSystems?.["membrane_pump"] },
  { id: "first_tech", condition: (s) => Object.keys(s.technologies || {}).some((k) => s.technologies[k]) },
  { id: "population_boom", condition: (s) => (s.population || 0) >= 50 },
  { id: "first_cap", condition: (s) => hasResourceAtCap(s) },
  // Creature stage
  { id: "instinct_learns", condition: (s) => stageSystemsCount(s, "creature") >= 5 },
  // Tribal stage
  { id: "first_circle", condition: (s) => !!s.ownedSystems?.["totem"] },
  { id: "agriculture_mastered", condition: (s) => !!s.technologies?.["agriculture"] },
  { id: "first_writing", condition: (s) => !!s.technologies?.["writing"] },
  // Civilization stage
  { id: "first_city", condition: (s) => stageSystemsCount(s, "civilization") >= 3 },
  { id: "scientific_method", condition: (s) => !!s.technologies?.["scientific_method"] },
  // Empire stage
  { id: "first_empire_decree", condition: (s) => stageSystemsCount(s, "empire") >= 2 },
  // Solar stage
  { id: "first_colony", condition: (s) => !!s.ownedSystems?.["colony_ship"] },
  // Galactic stage
  { id: "ascension_researched", condition: (s) => !!s.technologies?.["ascension_theory"] },
];

function totalSystems(s: any): number {
  return Object.values(s.ownedSystems || {}).reduce((a: number, b: any) => a + (b || 0), 0) as number;
}

function stageSystemsCount(s: any, stage: StageId): number {
  return SYSTEMS
    .filter((x) => x.stage === stage)
    .reduce((sum, def) => sum + (s.ownedSystems?.[def.id] || 0), 0);
}

function hasResourceAtCap(s: any): boolean {
  if (!s.resources || !s.capacities) return false;
  for (const r of Object.keys(s.resources)) {
    const cap = s.capacities[r];
    if (cap && cap > 0 && (s.resources[r] || 0) >= cap - 0.5) return true;
  }
  return false;
}
