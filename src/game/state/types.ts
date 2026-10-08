// Core game type definitions for Evolution Idle

import type { WorldConfig } from "../data/genesis";

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
  | "codex" | "achievements" | "archive" | "log" | "shop" | "prestige";

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
  };
  storyIntro: string;
  storyOutro: string;
}

// Upgrade effect types. "manual_mult" and the "manual" category were removed
// (no manual actions scale that way anymore). "acceleration" was added for
// time-warping upgrades, plus several new automation / prestige effects.
export type UpgradeEffectType =
  | "auto_mult"
  | "cost_reduction"
  | "start_bonus"
  | "cap_boost"
  | "evolve_boost"
  | "auto_system_buyer"
  | "auto_tech_buyer"
  | "auto_evolver"
  | "frontier_spirit"
  | "ancestral_bounty"
  | "challenge_mastery"
  | "stage_compression"
  | "temporal_acceleration"
  | "deep_memory"
  | "cosmic_understanding"
  | "universal_boost"
  | "universal_speed";

export interface UpgradeDef {
  id: string;
  name: string;
  desc: (level: number) => string;
  baseCost: number;
  maxLevel: number;
  costGrowth: number;
  category: "automation" | "economy" | "acceleration" | "prestige" | "universal";
  requiresWins?: number;
  effect: { type: UpgradeEffectType; value: number };
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

export interface EventHistoryEntry {
  eventId: string;
  eventName: string;
  eventIcon: string;
  choiceId: string;
  choiceLabel: string;
  timestamp: number;
  gameTime: number;
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
  totalEventsResolved: number; // across all runs
  totalPlayTime: number; // seconds across all runs
  totalActions: number; // manual actions clicked across all runs
  totalSystemsBuilt: number; // systems built across all runs
  totalTechResearched: number; // techs researched across all runs
  upgrades: Record<string, number>;
  storyUnlocked: Record<string, boolean>;
  storyAcknowledged: Record<string, boolean>;
  archive: ArchiveEntry[];
  archivedArchetypes: string[];
  unlockedLayers: Record<string, boolean>;
  achievements: Record<string, boolean>; // earned achievements
  newAchievements: string[]; // queue of newly-earned achievement IDs for toast

  // Layer 1 — Challenges
  unlockedChallenges: boolean; // unlocked after first Galactic win
  activeChallenge: string | null; // challenge id currently in progress
  completedChallenges: Record<string, number>; // challengeId -> repeat count completed
  challengeRepeatCounts: Record<string, number>; // challengeId -> current repeat attempt
  showChallenges: boolean; // challenge modal visibility

  // Auto-action timers (game-time markers for periodic automation)
  autoTimers: { system: number; tech: number; evolve: number; challenge: number };

  // Layer 2 — Enlightenment (Foresight)
  divinity: number; // prestige currency earned at prestige when this layer is unlocked
  foresightNodes: Record<string, boolean>; // purchased foresight node ids
  activeForesightRoute: string | null; // currently active route id
  showEnlightenment: boolean;

  // Layer 3 — Transcendence
  transcendenceOfferingsUsed: Record<string, number>; // offeringId -> repeat count
  purchasedRituals: Record<string, boolean>; // permanent rituals purchased
  activeTemporaryRituals: Record<string, number>; // ritualId -> remaining seconds
  activeScripts: Record<string, boolean>; // scriptId -> on
  bloodPactsUsed: Record<string, boolean>; // tierId -> used this run
  scriptTimers: Record<string, number>; // scriptId -> last-fired game-time
  showTranscendence: boolean;

  // Layer 4 — Genesis
  genesisSeeds: number; // currency for authoring worlds
  authoredWorlds: WorldConfig[]; // list of authored world configs (permanent bonuses)
  pendingWorldConfig: Partial<WorldConfig>; // current authoring selections
  showGenesis: boolean;

  // Layer 5 — Apotheosis
  faith: number; // currency for divine laws / miracles
  enactedDivineLaws: Record<string, boolean>;
  activeWorshipMode: string | null;
  performedMiracles: Record<string, number>; // miracleId -> count
  miracleTimers: Record<string, number>; // miracleId -> remaining seconds (for temporary effects)
  heresy: number; // 0-100; run ends at 100
  activeHeresyResponse: string; // default "hr_ignore"
  showApotheosis: boolean;

  // Layer 6 — Singularity
  singularityCores: number; // currency for relics/logic cores
  equippedRelics: Record<string, boolean>; // relicId -> equipped
  activeLogicCores: Record<string, boolean>; // coreId -> on
  logicCoreTimers: Record<string, number>; // coreId -> last-fired game-time
  showSingularity: boolean;

  // Layer 7 — Omnipotence
  equippedHybrids: Record<string, boolean>; // hybridId -> equipped
  activeOmnipotenceStance: string; // "contained" | "balanced" | "embraced"
  instability: number; // 0-100; run ends at 100
  peakInstability: number; // peak this run (for unlock check)
  showOmnipotence: boolean;

  // Layer 8 — Divinity (the layer; not the resource)
  prayer: number; // currency for prayer channels
  prayerChannelLevels: Record<string, number>; // channelId -> level
  activeDivineMask: string | null; // one active mask
  activeWorshipPolarity: string | null; // one active polarity
  showDivinityLayer: boolean;

  // Layer 9 — Infinity
  echoes: number; // currency for echoes
  purchasedEchoes: Record<string, boolean>; // echoId -> purchased
  resolvedForks: Record<string, string>; // forkId -> chosen branchId
  takenFutureDebts: Record<string, boolean>; // debtId -> taken this run
  repaidFutureDebts: Record<string, boolean>; // debtId -> repaid
  showInfinity: boolean;

  // Layer 10 — Eternity
  testamentClauses: number; // currency for testament clauses
  purchasedTestamentClauses: Record<string, boolean>; // clauseId -> purchased
  activeCanonizations: Record<string, boolean>; // canonId -> active
  activePermanenceWeaves: Record<string, boolean>; // weaveId -> active
  chosenEnding: string | null; // "preserve" | "reset" | null
  cosmicBoonStacks: number; // +1 per "Reset Universe" ending chosen
  showEternity: boolean;

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
  eventHistory: EventHistoryEntry[]; // log of past event choices this run
  hasSeenIntro: boolean;
  lastSaved: number;

  // Tutorial
  tutorialStep: number;
  tutorialActive: boolean;
  tutorialDismissed: boolean;
  // Settings
  eventFrequency: "off" | "normal" | "frequent";

  // Theme customization (Part 1 — Stage Theme System)
  activeStageTheme: string;          // default "stage-cell"
  activeLayerTheme: string | null;   // null = no overlay
  activeSpecialTheme: string | null; // null = none (overrides stage+layer when set)
  unlockedThemes: Record<string, boolean>; // which themes are unlocked

  // ===== QUICK WINS =====
  // WIN 2 — Active ability cooldowns (runtime; persisted across refresh for fairness)
  activeAbilityCooldowns: Record<string, number>; // ability id → seconds remaining
  activeAbilityEffects: Record<string, number>;   // effect id ("surge"|"overclock"|"divine_combo") → seconds remaining

  // WIN 3 — Ritual combo tracking
  lastRitualTime: number;     // game-time of last ritual perform
  lastRitualId: string | null; // for "3 different rituals" requirement
  ritualComboCount: number;   // 0-3 — distinct rituals within 60s window
  ritualComboTimer: number;   // seconds remaining of Divine Combo bonus (+50% production)

  // WIN 5 — Prestige Points (universal currency)
  prestigePoints: number;

  // WIN 7 — Random layer event timers (game-time markers for periodic layer events)
  layerEventTimers: {
    trial_of_fortune: number;
    vision: number;
    divine_whim: number;
    heresy_surge: number;
  };

  // ===== REBUILD: LAYERS 1-6 UNIQUE GAMEPLAY LOOPS =====
  // Layer 1 — Trial Realms (mini-games)
  activeTrialRealm: string | null;              // currently open realm id
  trialRealmState: Record<string, any>;        // per-realm runtime state
  trialRealmsCompleted: Record<string, boolean>;
  // Layer 2 — Constellation Map (visual foresight grid)
  constellationNodes: Record<string, boolean>; // node id → illuminated
  constellationRevealed: Record<string, boolean>; // connections revealed by Stargaze
  // Layer 3 — Divine Market (price simulation)
  marketPrices: Record<string, number>;        // resource id → current price
  priceHistory: Record<string, number[]>;     // resource id → last N prices (sparkline)
  marketOwnedResources: Record<string, number>; // resource id → units owned
  marketTickTimer: number;                     // seconds until next price tick
  // Layer 4 — Sacred Grid (tile placement)
  worldGrid: Array<string | null>;             // 20 cells (5×4); tile type id or null
  worldGridSeeds: Array<string | null>;        // hidden dormant seeds revealed on adjacency
  // Layer 5 — Heresy Web (containment grid)
  followerGrid: Array<{ state: string; type: string }>; // 32 cells (8×4): "faithful"|"heretical"|"empty"; type id
  heresySpreadTimer: number;                   // seconds until next spread tick
  // Layer 6 — Dimension Engine (parallel dimensions)
  dimensions: Array<{
    id: number;
    name: string;
    speed: number;       // 1 | 0.5 | 0.25
    pop: number;
    stageIndex: number;
    resources: number;   // abstract pooled resource
    reachedGalactic: boolean;
  }>;
  dimensionRiftTimer: number;                  // seconds until next rift event
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
  setShowChallenges: (v: boolean) => void;
  setActiveChallenge: (challengeId: string | null) => void;
  dismissTutorial: () => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  setEventFrequency: (freq: "off" | "normal" | "frequent") => void;
  dismissStory: (id: string) => void;
  dismissAchievementToast: () => void;
  applyOfflineProgress: () => { elapsed: number; resourcesGained: Record<string, number>; applied: boolean } | null;
  hardReset: () => void;
  saveGame: () => void;
  loadGame: () => void;
  exportSave: () => string;
  importSave: (data: string) => boolean;
  addToLog: (msg: string) => void;
  debugUnlockAll: () => void;

  // Layer 2 — Enlightenment (Foresight)
  setShowEnlightenment: (v: boolean) => void;
  purchaseForesightNode: (nodeId: string) => void;
  setForesightRoute: (routeId: string | null) => void;

  // Layer 3 — Transcendence
  setShowTranscendence: (v: boolean) => void;
  performOffering: (offeringId: string) => void;
  performRitual: (ritualId: string) => void;
  toggleScript: (scriptId: string) => void;
  performBloodPact: (tierId: string) => void;

  // Layer 4 — Genesis
  setShowGenesis: (v: boolean) => void;
  setPendingWorldConfig: (cfg: Partial<WorldConfig>) => void;
  authorWorld: () => void;

  // Layer 5 — Apotheosis
  setShowApotheosis: (v: boolean) => void;
  enactDivineLaw: (lawId: string) => void;
  setWorshipMode: (modeId: string | null) => void;
  performMiracle: (miracleId: string) => void;
  setHeresyResponse: (responseId: string) => void;

  // Layer 6 — Singularity
  setShowSingularity: (v: boolean) => void;
  toggleRelicLoadout: (relicId: string) => void;
  toggleLogicCore: (coreId: string) => void;

  // Layer 7 — Omnipotence
  setShowOmnipotence: (v: boolean) => void;
  toggleHybridLineage: (hybridId: string) => void;
  setOmnipotenceStance: (stanceId: string) => void;

  // Layer 8 — Divinity (layer)
  setShowDivinityLayer: (v: boolean) => void;
  levelPrayerChannel: (channelId: string) => void;
  setDivineMask: (maskId: string | null) => void;
  setWorshipPolarity: (polarityId: string | null) => void;

  // Layer 9 — Infinity
  setShowInfinity: (v: boolean) => void;
  purchaseEcho: (echoId: string) => void;
  resolveFork: (forkId: string, branchId: string) => void;
  takeFutureDebt: (debtId: string) => void;
  repayFutureDebt: (debtId: string) => void;

  // Layer 10 — Eternity
  setShowEternity: (v: boolean) => void;
  purchaseTestamentClause: (clauseId: string) => void;
  toggleCanonization: (canonId: string) => void;
  togglePermanenceWeave: (weaveId: string) => void;
  chooseEnding: (endingId: "preserve" | "reset") => void;

  // Theme customization
  setStageTheme: (id: string) => void;
  setLayerTheme: (id: string | null) => void;
  setSpecialTheme: (id: string | null) => void;

  // ===== QUICK WINS =====
  // WIN 2 — Active abilities (one per prestige layer)
  useActiveAbility: (layerId: string) => void;
  // WIN 5 — Universal shop upgrade purchase (spends Prestige Points)
  buyUniversalUpgrade: (upgradeId: string) => void;

  // ===== REBUILD: LAYERS 1-6 UNIQUE GAMEPLAY LOOPS =====
  // Layer 1 — Trial Realms
  setActiveTrialRealm: (realmId: string | null) => void;
  realmBreakthrough: () => void;             // Realm of Growth click
  realmDiscontentAction: (action: "celebrate" | "tax" | "ignore") => void;

  // Layer 2 — Constellation Map
  illuminateConstellationNode: (nodeId: string) => void;
  stargazeReveal: () => void;                // active ability: reveal connections
  supernovaIlluminate: (nodeId: string) => void; // illuminate adjacent
  blackHoleReset: () => void;                // refund + reset

  // Layer 3 — Divine Market
  marketBuyResource: (resourceId: string, qty: number) => void;
  marketSellResource: (resourceId: string, qty: number) => void;
  marketOffering: (resourceId: string, qty: number) => void; // spend resource → gain Divinity scaled by price

  // Layer 4 — Sacred Grid
  placeGridTile: (cellIndex: number, tileType: string) => void;
  resetWorldGrid: () => void;

  // Layer 5 — Heresy Web
  convertFollower: (cellIndex: number) => void;
  purgeFollower: (cellIndex: number) => void;
  initFollowerGrid: () => void;

  // Layer 6 — Dimension Engine
  setDimensionSpeed: (dimId: number, speed: number) => void;
  syncDimension: (fromId: number, toId: number) => void;
  initDimensions: () => void;
}
