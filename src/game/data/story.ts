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
  { id: "first_membrane_holds", condition: (s) => totalSystems(s) >= 3 },
  { id: "nucleus_forms", condition: (s) => !!s.ownedSystems?.["nucleus"] },
  { id: "instinct_learns", condition: (s) => stageSystemsCount(s, "creature") >= 5 },
  { id: "first_circle", condition: (s) => !!s.ownedSystems?.["totem"] },
];

function totalSystems(s: any): number {
  return Object.values(s.ownedSystems || {}).reduce((a: number, b: any) => a + (b || 0), 0) as number;
}

function stageSystemsCount(s: any, stage: StageId): number {
  return SYSTEMS
    .filter((x) => x.stage === stage)
    .reduce((sum, def) => sum + (s.ownedSystems?.[def.id] || 0), 0);
}
