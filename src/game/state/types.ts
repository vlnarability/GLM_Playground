// Core game type definitions for Evolution Idle

export type ResourceId =
  | "atp" | "glucose" | "proteins" | "lipids" | "elements"
  | "food" | "water" | "materials" | "organic_matter" | "knowledge" | "culture"
  | "wood" | "lumber" | "stone" | "clay" | "science" | "happiness" | "military_power"
  | "production" | "gold" | "influence" | "energy" | "alloys" | "data"
  | "divinity" | "evolution_points" | "enlightenment_points" | "transcendence_points";

export type StageId =
  | "cell" | "creature" | "tribal" | "civilization" | "empire" | "solar" | "galactic";

export type TabId =
  | "actions" | "systems" | "production" | "tech" | "story"
  | "codex" | "achievements" | "archive" | "log" | "shop";

export interface ResourceDef {
  id: ResourceId;
  name: string;
  category: "primary" | "divinity" | "meta";
  firstStage: StageId;
  color: string;
  icon: string; // emoji
}

export interface StageAction {
  id: string;
  name: string;
  desc: string;
  stage: StageId;
  icon: string;
  cost?: Partial<Record<ResourceId, number>>;
  produces: Partial<Record<ResourceId, number>>;
  cooldown?: number; // seconds
  unlockRequirement?: string;
  scaleWith?: "population" | "happiness" | "tech";
}

export interface SystemDef {
  id: string;
  name: string;
  desc: string;
  stage: StageId;
  icon: string;
  category: string;
  baseCost: Partial<Record<ResourceId, number>>;
  costGrowth: number; // multiplier per owned
  produces: Partial<Record<ResourceId, number>>;
  capacityBoost?: Partial<Record<ResourceId, number>>;
  upkeep?: Partial<Record<ResourceId, number>>;
  maxOwned?: number;
  requiredTech?: string;
  grantsAffinity?: { archetype: string; amount: number };
}

export interface TechDef {
  id: string;
  name: string;
  desc: string;
  stage: StageId;
  cost: Partial<Record<ResourceId, number>>;
  branch: string;
  tier: number;
  requires?: string[];
  effects: string;
  multiplier?: { target: "production" | "manual" | "capacity"; value: number };
  grantsAffinity?: { archetype: string; amount: number };
}

export interface StageDef {
  id: StageId;
  name: string;
  tagline: string;
  desc: string;
  icon: string;
  accent: string; // hex
  bgGradient: string; // css
  duration: string;
  evolveRequires: {
    minPopulation: number;
    minSystems: number;
    minTech: number;
    minScore: number;
  };
  storyIntro: string;
  storyOutro: string;
}

export interface UpgradeDef {
  id: string;
  name: string;
  desc: (level: number) => string;
  baseCost: number;
  maxLevel: number;
  costGrowth: number;
  category: "manual" | "automation" | "economy" | "prestige";
  requiresWins?: number;
  effect: { type: "manual_mult" | "auto_mult" | "cost_reduction" | "start_bonus" | "cap_boost" | "evolve_boost"; value: number };
}

export interface StoryEntry {
  id: string;
  title: string;
  body: string;
  stage: StageId | "meta";
  layer: string;
  trigger: string;
  category: "primary" | "stage" | "layer" | "choice" | "milestone";
}

export interface ArchiveEntry {
  runId: string;
  timestamp: number;
  stage: StageId;
  archetype: string;
  score: number;
  epEarned: number;
  duration: number;
  ending: string;
  notes?: string;
  favorite?: boolean;
}

export interface GameState {
  // Run state
  stageIndex: number;
  time: number;
  population: number;
  populationProgress: number; // 0-1 toward next population point
  maxPopulation: number; // peak population this run (for achievements)
  resources: Record<string, number>;
  capacities: Record<string, number>;
  ownedSystems: Record<string, number>;
  systemEnabled: Record<string, boolean>; // per-system on/off toggle
  technologies: Record<string, boolean>;
  archetypeAffinity: Record<string, number>; // drift during run
  lockedArchetype: string | null; // locked at Creature→Tribal
  log: string[];

  // Meta state
  evolutionPoints: number;
  totalRuns: number;
  galacticWins: number;
  stageClearCounts: Record<StageId, number>;
  fastestCellClear: number; // seconds, best time clearing Cell stage
  upgrades: Record<string, number>;
  storyUnlocked: Record<string, boolean>;
  storyAcknowledged: Record<string, boolean>;
  archive: ArchiveEntry[];
  archivedArchetypes: string[];
  unlockedLayers: Record<string, boolean>;
  achievements: Record<string, boolean>; // earned achievements
  newAchievements: string[]; // queue of newly-earned achievement IDs for toast

  // UI state
  currentTab: TabId;
  speed: number;
  paused: boolean;
  showShop: boolean;
  showEvolve: boolean;
  showSettings: boolean;
  activeStoryPopup: string | null;
  activeEvent: string | null; // ID of the currently-offered random event
  eventCooldown: number; // seconds until next event can fire
  hasSeenIntro: boolean;
  lastSaved: number;

  // Tutorial
  tutorialStep: number;
  tutorialActive: boolean;
  tutorialDismissed: boolean;
}

export interface GameStore extends GameState {
  // Actions
  tick: (dt: number) => void;
  performAction: (actionId: string) => void;
  buySystem: (systemId: string, qty: number) => void;
  toggleSystem: (systemId: string) => void;
  enableAllSystems: (enabled: boolean) => void;
  buyTech: (techId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  evolveStage: () => void;
  triggerPrestige: () => void;
  setTab: (tab: TabId) => void;
  setSpeed: (speed: number) => void;
  togglePause: () => void;
  setShowShop: (v: boolean) => void;
  setShowEvolve: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  dismissTutorial: () => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  dismissStory: (id: string) => void;
  dismissAchievementToast: () => void;
  applyOfflineProgress: () => { elapsed: number; resourcesGained: Record<string, number>; applied: boolean } | null;
  hardReset: () => void;
  saveGame: () => void;
  loadGame: () => void;
  exportSave: () => string;
  importSave: (data: string) => boolean;
  addToLog: (msg: string) => void;
}
