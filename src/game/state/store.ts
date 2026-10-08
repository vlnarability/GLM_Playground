"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GameState, GameStore, StageId, TabId } from "./types";
import { emptyResources, emptyCapacities } from "../data/resources";
import { STAGES, STAGE_IDS, nextStage } from "../data/stages";
import { ACTION_MAP } from "../data/actions";
import { SYSTEMS, SYSTEM_MAP, systemCost } from "../data/systems";
import { TECH_MAP, TECHS } from "../data/techs";
import { UPGRADE_MAP, UPGRADES, upgradeCost } from "../data/upgrades";
import { STORY_MAP, STORY_TRIGGERS } from "../data/story";
import { ARCHETYPE_MAP, dominantArchetype } from "../data/archetypes";
import { ACHIEVEMENTS, achievementBonus, type AchievementCheckCtx } from "../data/achievements";
import { EVENTS, eventsForStage, EVENT_MAP } from "../data/events";
import {
  CHALLENGES,
  CHALLENGE_MAP,
  getMaxRepeats,
  getChallengeDebuffAtRepeat,
  challengeMasteryBonusFromRepeats,
  type ChallengeEffects,
} from "../data/challenges";
import { countChallengesCompleted } from "../data/prestigeLayers";
import {
  FORESIGHT_NODES,
  FORESIGHT_NODE_MAP,
  FORESIGHT_ROUTE_MAP,
  foresightBonus,
  routeBonus,
  countForesightNodes,
  FORESIGHT_NODES_REQUIRED_FOR_LAYER_3,
} from "../data/foresight";
import {
  OFFERINGS,
  OFFERING_MAP,
  RITUALS,
  RITUAL_MAP,
  SCRIPTS,
  BLOOD_PACTS,
  BLOOD_PACT_MAP,
  offeringDivinityAtRepeat,
  activeRitualProductionBonus,
  activeRitualCapBonus,
  activeRitualEpBonus,
  activeRitualPopBonus,
  transcendenceDivinityPerSecond,
  allBloodPactsUsed,
} from "../data/transcendence";
import {
  CRADLE_WORLDS,
  PRIME_CONDITIONS,
  SACRED_GEOGRAPHIES,
  DORMANT_SEEDS,
  DIFFICULTY_TIERS,
  worldProductionMult,
  worldCapMult,
  worldEpMultiplier,
  worldPopGrowthMult,
  hasAuthoredWorld,
  type WorldConfig,
} from "../data/genesis";
import {
  DIVINE_LAWS,
  DIVINE_LAW_MAP,
  WORSHIP_MODES,
  WORSHIP_MODE_MAP,
  MIRACLES,
  MIRACLE_MAP,
  HERESY_RESPONSES,
  HERESY_RESPONSE_MAP,
  divineLawBonus,
  worshipModeBonus,
  heresyRateMult,
  heresyResponseProductionMult,
  hasEnactedThreeLaws,
} from "../data/apotheosis";
import {
  RELIC_LOADOUTS,
  RELIC_LOADOUT_MAP,
  LOGIC_CORES,
  LOGIC_CORE_MAP,
  relicBonus,
  logicCoreBonus,
} from "../data/singularity";
import {
  HYBRID_LINEAGES,
  HYBRID_LINEAGE_MAP,
  OMNIPOTENCE_STANCES,
  OMNIPOTENCE_STANCE_MAP,
  hybridBonus,
  instabilityRateMult,
  effectiveInstabilityRate,
  isOmnipotenceComplete,
  type OmnipotenceStanceId,
} from "../data/omnipotence";
import {
  PRAYER_CHANNELS,
  PRAYER_CHANNEL_MAP,
  DIVINE_MASKS,
  DIVINE_MASK_MAP,
  WORSHIP_POLARITIES,
  WORSHIP_POLARITY_MAP,
  prayerChannelCost,
  prayerChannelBonus,
  divineMaskBonus,
  worshipPolarityBonus,
  prayerRate,
  isDivinityComplete,
} from "../data/divinity_layer";
import {
  ECHO_TYPES,
  ECHO_TYPE_MAP,
  FORK_SCENARIOS,
  FORK_SCENARIO_MAP,
  FUTURE_DEBT_TIERS,
  FUTURE_DEBT_TIER_MAP,
  echoBonus,
  forkBonus,
  activeDebtBonus,
  isInfinityComplete,
} from "../data/infinity";
import {
  TESTAMENT_CLAUSES,
  TESTAMENT_CLAUSE_MAP,
  CANONIZATIONS,
  CANONIZATION_MAP,
  PERMANENCE_WEAVES,
  PERMANENCE_WEAVE_MAP,
  ENDING_CHOICES,
  ENDING_CHOICE_MAP,
  testamentClauseBonus,
  canonizationBonus,
  permanenceWeaveBonus,
  cosmicBoonBonus,
  isEternityComplete,
} from "../data/eternity";
import {
  STAGE_INDEX_TO_THEME,
  LAYER_ID_TO_THEME,
} from "../data/themes";
import { ACTIVE_ABILITIES, ACTIVE_ABILITY_MAP } from "../data/activeAbilities";
import {
  TRIAL_REALMS,
  TRIAL_REALM_MAP,
  PLAYABLE_REALM_IDS,
  makeDefaultRealmState,
  REALM_GROWTH_BREAKS_GOAL,
  REALM_GROWTH_PASSIVE_FILL_PER_SEC,
  REALM_DISCONTENT_HAPPINESS_THRESHOLD,
  REALM_DISCONTENT_SURVIVE_SECONDS,
  REALM_DISCONTENT_GOLD_GOAL,
  REALM_SWIFTNESS_TIME_LIMIT,
} from "../data/trialRealms";

const STORAGE_KEY = "evolution_idle_v2";

// ===== REBUILD: L1-6 helper factories =====
function makeInitialFollowerGrid(): Array<{ state: string; type: string }> {
  // 8×4 = 32 cells. All start faithful.
  return Array.from({ length: 32 }, () => ({ state: "faithful", type: "follower" }));
}

function makeInitialDimensions() {
  return [
    { id: 0, name: "Alpha", speed: 1, pop: 8, stageIndex: 0, resources: 0, reachedGalactic: false },
    { id: 1, name: "Beta", speed: 0.5, pop: 8, stageIndex: 0, resources: 0, reachedGalactic: false },
    { id: 2, name: "Gamma", speed: 0.25, pop: 8, stageIndex: 0, resources: 0, reachedGalactic: false },
  ];
}

function initialRunState(): Partial<GameState> {
  const resources = emptyResources();
  const capacities = emptyCapacities();
  resources.atp = 15;
  resources.glucose = 20;
  resources.happiness = 75;
  return {
    stageIndex: 0,
    time: 0,
    population: 8,
    populationProgress: 0,
    maxPopulation: 8,
    resources,
    capacities,
    ownedSystems: {},
    systemEnabled: {},
    technologies: {},
    archetypeAffinity: {},
    lockedArchetype: null,
    log: ["New run started. The first spark stirs."],
  };
}

function initialMetaState(): Partial<GameState> {
  return {
    evolutionPoints: 0,
    totalRuns: 0,
    galacticWins: 0,
    stageClearCounts: Object.fromEntries(STAGE_IDS.map((s) => [s, 0])) as Record<StageId, number>,
    fastestCellClear: 0,
    totalEventsResolved: 0,
    totalPlayTime: 0,
    totalActions: 0,
    totalSystemsBuilt: 0,
    totalTechResearched: 0,
    upgrades: Object.fromEntries(UPGRADES.map((u) => [u.id, 0])),
    storyUnlocked: { first_spark: true },
    storyAcknowledged: {},
    archive: [],
    archivedArchetypes: [],
    unlockedLayers: { evolution: true, enlightenment: false, transcendence: false, genesis: false, apotheosis: false, singularity: false, omnipotence: false, divinity: false, infinity: false, eternity: false },
    achievements: {},
    newAchievements: [],
    // Layer 1 — Challenges
    unlockedChallenges: false,
    activeChallenge: null,
    completedChallenges: {},
    challengeRepeatCounts: {},
    showChallenges: false,
    // Auto-action timers (game-time markers for periodic automation)
    autoTimers: { system: 0, tech: 0, evolve: 0, challenge: 0 },

    // Layer 2 — Enlightenment (Foresight)
    divinity: 0,
    foresightNodes: {},
    activeForesightRoute: null,
    showEnlightenment: false,

    // Layer 3 — Transcendence
    transcendenceOfferingsUsed: {},
    purchasedRituals: {},
    activeTemporaryRituals: {},
    activeScripts: {},
    bloodPactsUsed: {},
    scriptTimers: {},
    showTranscendence: false,

    // Layer 4 — Genesis
    genesisSeeds: 0,
    authoredWorlds: [],
    pendingWorldConfig: {},
    showGenesis: false,

    // Layer 5 — Apotheosis
    faith: 0,
    enactedDivineLaws: {},
    activeWorshipMode: null,
    performedMiracles: {},
    miracleTimers: {},
    heresy: 0,
    activeHeresyResponse: "hr_ignore",
    showApotheosis: false,

    // Layer 6 — Singularity
    singularityCores: 0,
    equippedRelics: {},
    activeLogicCores: {},
    logicCoreTimers: {},
    showSingularity: false,

    // Layer 7 — Omnipotence
    equippedHybrids: {},
    activeOmnipotenceStance: "balanced",
    instability: 0,
    peakInstability: 0,
    showOmnipotence: false,

    // Layer 8 — Divinity (the layer; not the resource)
    prayer: 0,
    prayerChannelLevels: {},
    activeDivineMask: null,
    activeWorshipPolarity: null,
    showDivinityLayer: false,

    // Layer 9 — Infinity
    echoes: 0,
    purchasedEchoes: {},
    resolvedForks: {},
    takenFutureDebts: {},
    repaidFutureDebts: {},
    showInfinity: false,

    // Layer 10 — Eternity
    testamentClauses: 0,
    purchasedTestamentClauses: {},
    activeCanonizations: {},
    activePermanenceWeaves: {},
    chosenEnding: null,
    cosmicBoonStacks: 0,
    showEternity: false,

    currentTab: "actions",
    speed: 1,
    paused: false,
    showShop: false,
    showEvolve: false,
    showSettings: false,
    activeStoryPopup: "first_spark",
    activeEvent: null,
    eventCooldown: 60, // first event can fire after 60s
    eventHistory: [],
    hasSeenIntro: false,
    lastSaved: Date.now(),
    tutorialStep: 0,
    tutorialActive: true,
    tutorialDismissed: false,
    eventFrequency: "normal",

    // Theme customization (Part 1)
    activeStageTheme: "stage-cell",
    activeLayerTheme: null,
    activeSpecialTheme: null,
    unlockedThemes: { "stage-cell": true },

    // ===== QUICK WINS =====
    // WIN 2 — Active abilities (runtime, persisted across refresh)
    activeAbilityCooldowns: {},
    activeAbilityEffects: {},
    // WIN 3 — Ritual combo tracking
    lastRitualTime: 0,
    lastRitualId: null,
    ritualComboCount: 0,
    ritualComboTimer: 0,
    // WIN 5 — Prestige Points (universal currency)
    prestigePoints: 0,
    // WIN 7 — Random layer event timers (game-time markers)
    layerEventTimers: { trial_of_fortune: 0, vision: 0, divine_whim: 0, heresy_surge: 0 },

    // ===== REBUILD: LAYERS 1-6 UNIQUE GAMEPLAY LOOPS =====
    // Layer 1 — Trial Realms
    activeTrialRealm: null,
    trialRealmState: {},
    trialRealmsCompleted: {},
    // Layer 2 — Constellation Map
    constellationNodes: {},
    constellationRevealed: {},
    // Layer 3 — Divine Market
    marketPrices: { food: 10, water: 8, materials: 15, science: 20, gold: 25, energy: 30 },
    priceHistory: { food: [10], water: [8], materials: [15], science: [20], gold: [25], energy: [30] },
    marketOwnedResources: {},
    marketTickTimer: 10,
    // Layer 4 — Sacred Grid (5×4 = 20 cells)
    worldGrid: Array(20).fill(null),
    worldGridSeeds: Array(20).fill(null),
    // Layer 5 — Heresy Web (8×4 = 32 follower cells)
    followerGrid: makeInitialFollowerGrid(),
    heresySpreadTimer: 10,
    // Layer 6 — Dimension Engine (3 parallel dimensions)
    dimensions: makeInitialDimensions(),
    dimensionRiftTimer: 60,
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialRunState(),
      ...initialMetaState(),

      // ============ TICK ============
      tick: (dt) => {
        const s = get();
        if (s.paused) return;

        // ---- Temporal Acceleration: +0.5× effective speed per level ----
        const temporalLvl = s.upgrades["temporal_acceleration"] || 0;
        const temporalMult = 1 + temporalLvl * 0.5;
        // ---- Prestige Speed Bonus: +50% per total run (Part 2c) ----
        const prestigeSpeedMult = 1 + (s.totalRuns || 0) * 0.5;
        // ---- QUICK WIN 5 — Universal Speed upgrade: +10% per level ----
        const universalSpeedLvlTick = s.upgrades["universal_speed"] || 0;
        const universalSpeedMultTick = 1 + universalSpeedLvlTick * 0.10;
        const realDt = dt * s.speed * temporalMult * prestigeSpeedMult * universalSpeedMultTick;

        // ---- Deep Memory: +5% production per level per total run ----
        const deepMemLvl = s.upgrades["deep_memory"] || 0;
        const deepMemMult = 1 + deepMemLvl * 0.05 * (s.totalRuns || 0);

        const autoLvl = s.upgrades["inherited_efficiency"] || 0;
        let autoMult = (1 + autoLvl * 0.15) * deepMemMult;

        // ---- Active challenge debuff (scaled by repeat level) ----
        let challengeDebuff: ChallengeEffects = {};
        if (s.activeChallenge && s.unlockedChallenges) {
          const ch = CHALLENGE_MAP[s.activeChallenge];
          if (ch) {
            const repeat = s.challengeRepeatCounts?.[s.activeChallenge] || 0;
            challengeDebuff = getChallengeDebuffAtRepeat(ch, repeat);
            if (challengeDebuff.productionMult !== undefined) {
              autoMult *= challengeDebuff.productionMult;
            }
          }
        }

        // ---- Layers 2-6: aggregate additive bonuses (production, cap, pop, ep, cost) ----
        const foresight = foresightBonus(s.foresightNodes || {});
        const route = routeBonus(s.activeForesightRoute);
        const ritualProd = activeRitualProductionBonus(s.purchasedRituals || {}, s.activeTemporaryRituals || {});
        const ritualCap = activeRitualCapBonus(s.purchasedRituals || {}, s.activeTemporaryRituals || {});
        const ritualPop = activeRitualPopBonus(s.purchasedRituals || {}, s.activeTemporaryRituals || {});
        const wProd = worldProductionMult(s.authoredWorlds || []);
        const wCap = worldCapMult(s.authoredWorlds || []);
        const wPop = worldPopGrowthMult(s.authoredWorlds || []);
        const dLaw = divineLawBonus(s.enactedDivineLaws || {});
        const wMode = worshipModeBonus(s.activeWorshipMode);
        const hResp = heresyResponseProductionMult(s.activeHeresyResponse);
        const relics = relicBonus(s.equippedRelics || {});
        const cores = logicCoreBonus(s.activeLogicCores || {});
        // Layer 7 — Omnipotence (hybrids + stance)
        const hybrids = hybridBonus(s.equippedHybrids || {}, s.activeOmnipotenceStance);
        // Layer 8 — Divinity (prayer channels + mask + polarity)
        const chanBonus = prayerChannelBonus(s.prayerChannelLevels || {});
        const maskBonus = divineMaskBonus(s.activeDivineMask);
        const polarityBonus = worshipPolarityBonus(s.activeWorshipPolarity);
        // Layer 9 — Infinity (echoes + forks + active debt)
        const echoB = echoBonus(s.purchasedEchoes || {});
        const forkB = forkBonus(s.resolvedForks || {});
        const debtB = activeDebtBonus(s.takenFutureDebts || {}, s.repaidFutureDebts || {});
        // Layer 10 — Eternity (testament + canonizations + weaves + cosmic boon)
        const testB = testamentClauseBonus(s.purchasedTestamentClauses || {});
        const canonB = canonizationBonus(s.activeCanonizations || {});
        const weaveB = permanenceWeaveBonus(s.activePermanenceWeaves || {});
        const cosmicBoon = cosmicBoonBonus(s.cosmicBoonStacks || 0);

        const layerProdBonus =
          foresight.productionMult + route.productionMult + ritualProd +
          wProd + dLaw.productionMult + wMode.productionMult + hResp +
          relics.productionMult + cores.productionMult +
          hybrids.productionMult + chanBonus.productionMult + maskBonus.productionMult +
          polarityBonus.productionMult + echoB.productionMult + forkB.productionMult +
          debtB.productionMult + testB.productionMult + canonB.productionMult +
          weaveB.productionMult + cosmicBoon;
        const layerCapBonus =
          foresight.capMult + route.capMult + ritualCap + wCap +
          dLaw.capMult + relics.capMult + cores.capMult +
          hybrids.capMult + chanBonus.capMult + maskBonus.capMult +
          polarityBonus.capMult + echoB.capMult + forkB.capMult +
          debtB.capMult + testB.capMult + canonB.capMult + weaveB.capMult;
        const layerPopBonus =
          foresight.popGrowthMult + route.popGrowthMult + ritualPop + wPop +
          dLaw.popGrowthMult + relics.popGrowthMult +
          hybrids.popGrowthMult + chanBonus.popGrowthMult + maskBonus.popGrowthMult +
          polarityBonus.popGrowthMult + echoB.popGrowthMult + forkB.popGrowthMult +
          debtB.popGrowthMult + testB.popGrowthMult + canonB.popGrowthMult +
          weaveB.popGrowthMult;

        // QUICK WIN 2 — Active abilities: Surge (×3 prod) + Overclock (×2 layer bonuses)
        const surgeActive = (s.activeAbilityEffects?.surge || 0) > 0;
        const overclockActive = (s.activeAbilityEffects?.overclock || 0) > 0;
        // QUICK WIN 3 — Divine Combo: +50% all production while ritualComboTimer > 0
        const divineComboActive = (s.ritualComboTimer || 0) > 0;
        // QUICK WIN 5 — Universal Boost upgrade: +5% all production per level
        const universalBoostLvl = s.upgrades["universal_boost"] || 0;
        const universalBoostMult = 1 + universalBoostLvl * 0.05;

        // Miracle: double production (one-shot temporary effect)
        const miracleDouble = (s.miracleTimers?.mir_genesis || 0) > 0;

        // Apply: overclock multiplies layer bonuses (foresight, ritual, relics, etc.) by 2
        const layerProdBonusApplied = layerProdBonus * (overclockActive ? 2 : 1);
        // Surge multiplies total production output (after layer bonus & miracle)
        const surgeMult = surgeActive ? 3 : 1;
        const divineComboMult = divineComboActive ? 1.5 : 1;
        // REBUILD L1 — Realm of Swiftness: 5× production while realm is active
        const realmSwiftnessActive = s.activeTrialRealm === "realm_swiftness";
        const realmSwiftnessMult = realmSwiftnessActive ? 5 : 1;
        autoMult *= (1 + layerProdBonusApplied) * (miracleDouble ? 2 : 1) * surgeMult * divineComboMult * universalBoostMult * realmSwiftnessMult;

        const techMult = techMultiplier(s, "production");
        const capBoostLvl = s.upgrades["expansive_vaults"] || 0;
        let capMult = 1 + capBoostLvl * 0.20;
        capMult *= (1 + layerCapBonus);
        if (challengeDebuff.capMult !== undefined) capMult *= challengeDebuff.capMult;
        const hasAutoBalancer = (s.upgrades["auto_balancer"] || 0) > 0;

        // Archetype bonus
        const archetype = s.lockedArchetype ? ARCHETYPE_MAP[s.lockedArchetype] : null;
        const archAllMult = archetype?.bonus.allProductionMult || 0;
        const archPopMult = archetype?.bonus.populationGrowthMult || 0;
        const archCapMult = archetype?.bonus.capMult || 0;

        const resources = { ...s.resources };
        let capacities = recomputeCapacitiesFresh(s, capMult + archCapMult);

        // Cost reduction (frugality) — also used by auto-buyer
        // Layers 2-6: foresight cost reduction (additive, negative = cheaper)
        const layerCostReduction = foresight.costMult;
        const costReduction = (s.upgrades["frugality"] || 0) * 0.04 + Math.max(0, -layerCostReduction);
        // Challenge cost multiplier (debuff)
        const challengeCostMult = challengeDebuff.costMult ?? 1;

        // Apply system production — with cap-aware pausing
        for (const [sysId, count] of Object.entries(s.ownedSystems)) {
          if (!count) continue;
          const sys = SYSTEM_MAP[sysId];
          if (!sys) continue;
          if (sys.requiredTech && !s.technologies[sys.requiredTech]) continue;

          // Check if system is manually disabled
          const manuallyEnabled = s.systemEnabled[sysId] !== false; // default true
          if (!manuallyEnabled && !hasAutoBalancer) continue;

          // Cap-aware logic: if all output resources are at cap, idle the system
          // (don't produce, don't consume upkeep — no waste)
          const outputsCapped = Object.keys(sys.produces).length > 0 &&
            Object.keys(sys.produces).every((r) => {
              const cap = capacities[r] || 0;
              return (resources[r] || 0) >= cap - 0.01;
            });

          if (outputsCapped) {
            // System idles — no production, no upkeep
            continue;
          }

          const stageMult = sys.stage === STAGES[s.stageIndex].id ? 1 : 0.5;
          const mult = autoMult * techMult * stageMult * (1 + archAllMult);

          // Per-resource archetype bonus
          const produces = sys.produces as Record<string, number>;
          for (const [r, v] of Object.entries(produces)) {
            const archResBonus = archetype?.bonus.productionMult?.[r] || 0;
            const rate = v * count * mult * (1 + archResBonus);
            resources[r] = (resources[r] || 0) + rate * realDt;
          }
          // Upkeep
          if (sys.upkeep) {
            const upkeep = sys.upkeep as Record<string, number>;
            for (const [r, v] of Object.entries(upkeep)) {
              resources[r] = (resources[r] || 0) - v * count * realDt;
            }
          }
        }

        // Clamp resources to capacities (no overflow)
        for (const r of Object.keys(resources)) {
          const cap = capacities[r];
          if (cap != null && resources[r] > cap) resources[r] = cap;
          if (resources[r] < 0) resources[r] = 0;
        }

        // Slow passive ATP for cell (keeps early game from stalling)
        if (STAGES[s.stageIndex].id === "cell") {
          resources.atp = Math.min(capacities.atp || 30, resources.atp + 0.5 * realDt);
        }

        // Population growth with progress bar
        // QUICK WIN 1: 3× faster base rate (0.015 → 0.045) — waiting for pop is the #1 fun killer
        let popGrowthRate = 0.045; // base per second
        const happiness = resources.happiness || 50;
        popGrowthRate *= (1 + (happiness - 40) / 200);
        popGrowthRate *= (1 + archPopMult);
        // Layers 2-6: aggregate pop-growth bonus
        popGrowthRate *= (1 + layerPopBonus);
        const curStage = STAGES[s.stageIndex];
        if (["creature", "tribal", "civilization", "empire"].includes(curStage.id)) {
          const foodCap = capacities.food || 1;
          const waterCap = capacities.water || 1;
          const foodPct = (resources.food || 0) / foodCap;
          const waterPct = (resources.water || 0) / waterCap;
          if (foodPct < 0.1) popGrowthRate *= 0.3;
          if (waterPct < 0.1) popGrowthRate *= 0.3;
        }
        // Challenge pop-growth debuff
        if (challengeDebuff.popGrowthMult !== undefined) {
          popGrowthRate *= challengeDebuff.popGrowthMult;
        }

        let populationProgress = (s.populationProgress || 0) + popGrowthRate * realDt;
        let population = s.population;
        while (populationProgress >= 1) {
          populationProgress -= 1;
          population += 1;
        }

        const maxPopulation = Math.max(s.maxPopulation || 0, population);

        const newTime = s.time + realDt;

        // ---- Auto-Builder: every 8s, buy cheapest affordable system ----
        let ownedSystems = s.ownedSystems;
        let systemEnabled = s.systemEnabled;
        let archetypeAffinity = s.archetypeAffinity;
        let totalSystemsBuilt = s.totalSystemsBuilt || 0;
        let autoTimers = { ...s.autoTimers };
        let technologies = s.technologies;
        let totalTechResearched = s.totalTechResearched || 0;

        // ---- Auto-Builder: every 8s (5s after first prestige — Part 2a), buy cheapest affordable system ----
        // After first Galactic win (galacticWins >= 1), the auto-buyer is FREE (no shop upgrade needed).
        const hasAutoSystemBuyer = (s.upgrades["auto_system_buyer"] || 0) > 0 || (s.galacticWins || 0) >= 1;
        const systemBuyerInterval = (s.galacticWins || 0) >= 1 ? 5 : 8;
        if (hasAutoSystemBuyer && newTime - (autoTimers.system || 0) >= systemBuyerInterval) {
          const stageId = STAGES[s.stageIndex].id;
          const totalSystemsNow = Object.values(ownedSystems).reduce((a, b) => a + b, 0);
          const maxSystemsCap = challengeDebuff.maxSystems ?? Infinity;
          const canExceedCap = totalSystemsNow < maxSystemsCap;
          const disableMilitary = !!challengeDebuff.disableMilitary;

          const candidates = SYSTEMS.filter((sys) => sys.stage === stageId)
            .map((sys) => {
              const owned = ownedSystems[sys.id] || 0;
              if (sys.maxOwned && owned >= sys.maxOwned) return null;
              if (sys.requiredTech && !technologies[sys.requiredTech]) return null;
              if (disableMilitary && sys.category === "Military") return null;
              const cost = systemCost(sys, owned, costReduction);
              const scaledCost: Record<string, number> = {};
              let totalCost = 0;
              let canAfford = true;
              for (const [r, v] of Object.entries(cost)) {
                const scaled = Math.ceil((v as number) * challengeCostMult);
                scaledCost[r] = scaled;
                totalCost += scaled;
                if ((resources[r] || 0) < scaled) canAfford = false;
              }
              return { sys, scaledCost, totalCost, canAfford };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null && x.canAfford);

          if (canExceedCap && candidates.length > 0) {
            candidates.sort((a, b) => a.totalCost - b.totalCost);
            const pick = candidates[0];
            // Apply purchase
            const newResources = { ...resources };
            for (const [r, v] of Object.entries(pick.scaledCost)) {
              newResources[r] -= v;
            }
            Object.assign(resources, newResources);
            ownedSystems = { ...ownedSystems, [pick.sys.id]: (ownedSystems[pick.sys.id] || 0) + 1 };
            if (systemEnabled[pick.sys.id] === undefined) {
              systemEnabled = { ...systemEnabled, [pick.sys.id]: true };
            }
            if (pick.sys.grantsAffinity) {
              archetypeAffinity = { ...archetypeAffinity };
              const arch = pick.sys.grantsAffinity.archetype;
              archetypeAffinity[arch] = (archetypeAffinity[arch] || 0) + pick.sys.grantsAffinity.amount;
            }
            totalSystemsBuilt += 1;
            autoTimers.system = newTime;
          } else {
            // Even if no purchase happened, advance the timer so we don't retry every tick.
            autoTimers.system = newTime;
          }
        }

        // ---- Auto-Researcher: every 12s (8s after first prestige — Part 2a), research cheapest affordable tech ----
        // After first Galactic win, auto-researcher is FREE (no shop upgrade needed).
        const hasAutoTechBuyer = (s.upgrades["auto_tech_buyer"] || 0) > 0 || (s.galacticWins || 0) >= 1;
        const techBuyerInterval = (s.galacticWins || 0) >= 1 ? 8 : 12;
        if (hasAutoTechBuyer && newTime - (autoTimers.tech || 0) >= techBuyerInterval) {
          const stageId = STAGES[s.stageIndex].id;
          const disableTech = !!challengeDebuff.disableTech;
          const disableMilitary = !!challengeDebuff.disableMilitary;

          if (!disableTech) {
            const techCandidates = TECHS.filter((t) => t.stage === stageId && !technologies[t.id])
              .map((t) => {
                if (t.requires) {
                  for (const req of t.requires) {
                    if (!technologies[req]) return null;
                  }
                }
                if (disableMilitary && t.branch === "Conflict") return null;
                const cost = t.cost as Record<string, number>;
                const scaledCost: Record<string, number> = {};
                let totalCost = 0;
                let canAfford = true;
                for (const [r, v] of Object.entries(cost)) {
                  const scaled = Math.ceil(v * challengeCostMult);
                  scaledCost[r] = scaled;
                  totalCost += scaled;
                  if ((resources[r] || 0) < scaled) canAfford = false;
                }
                return { t, scaledCost, totalCost, canAfford };
              })
              .filter((x): x is NonNullable<typeof x> => x !== null && x.canAfford);

            if (techCandidates.length > 0) {
              techCandidates.sort((a, b) => a.totalCost - b.totalCost);
              const pick = techCandidates[0];
              const newResources = { ...resources };
              for (const [r, v] of Object.entries(pick.scaledCost)) {
                newResources[r] -= v;
              }
              Object.assign(resources, newResources);
              technologies = { ...technologies, [pick.t.id]: true };
              if (pick.t.grantsAffinity) {
                archetypeAffinity = { ...archetypeAffinity };
                const arch = pick.t.grantsAffinity.archetype;
                archetypeAffinity[arch] = (archetypeAffinity[arch] || 0) + pick.t.grantsAffinity.amount;
              }
              totalTechResearched += 1;
              autoTimers.tech = newTime;
            } else {
              autoTimers.tech = newTime;
            }
          } else {
            autoTimers.tech = newTime;
          }
        }

        // ---- Auto-Evolver: check every 2s, trigger evolve if threshold met ----
        // After first Galactic win, auto-evolver is FREE (no shop upgrade needed) and uses threshold = 1.0.
        const autoEvolveLvl = s.upgrades["auto_evolver"] || 0;
        const hasAutoEvolver = autoEvolveLvl > 0 || (s.galacticWins || 0) >= 1;
        if (hasAutoEvolver && newTime - (autoTimers.evolve || 0) >= 2) {
          autoTimers.evolve = newTime;
          const stage = STAGES[s.stageIndex];
          const next = nextStage(stage.id);
          if (next) {
            // After first prestige (galacticWins >= 1), use threshold = 1.0 (meet base requirements).
            // Otherwise: 1.0, 1.2, 1.4, 1.6, 1.8 per auto-evolver level.
            const threshold = (s.galacticWins || 0) >= 1 ? 1.0 : (1 + autoEvolveLvl * 0.2);
            const reqs = stage.evolveRequires;
            const evolveBoost = 1 - Math.min(0.30, (s.upgrades["evolutionary_momentum"] || 0) * 0.05);
            const totalSystemsNow = Object.values(ownedSystems).reduce((a, b) => a + b, 0);
            const totalTechNow = Object.keys(technologies).length;
            if (
              population >= reqs.minPopulation * evolveBoost * threshold &&
              totalSystemsNow >= reqs.minSystems * evolveBoost * threshold &&
              totalTechNow >= reqs.minTech * evolveBoost * threshold
            ) {
              // Defer evolve to next tick to avoid mutating state mid-set.
              setTimeout(() => get().evolveStage(), 0);
            }
          }
        }

        // Check story triggers
        const newStory = { ...s.storyUnlocked };
        let activePopup = s.activeStoryPopup;
        const ctx = { ...s, resources, ownedSystems };
        for (const trig of STORY_TRIGGERS) {
          if (!newStory[trig.id] && trig.condition(ctx)) {
            newStory[trig.id] = true;
            if (!activePopup) activePopup = trig.id;
          }
        }

        // Check achievements periodically (every ~2 seconds of game time)
        let achievements = s.achievements;
        let newAchievements = s.newAchievements;
        const checkInterval = 2.0;
        const lastCheck = (s as any)._lastAchCheck || 0;
        if (newTime - lastCheck >= checkInterval) {
          const curState = { ...s, resources, ownedSystems, technologies, time: newTime } as GameState;
          const result = checkAchievements(curState);
          if (result.newOnes.length > 0) {
            achievements = result.earned;
            newAchievements = [...(newAchievements || []), ...result.newOnes];
          } else if (Object.keys(result.earned).length !== Object.keys(achievements || {}).length) {
            achievements = result.earned;
          }
          (s as any)._lastAchCheck = newTime; // not persisted, just a runtime marker
        }

        // Random event firing — only if no popup/modal is active, and not blocked by challenge
        let activeEvent = s.activeEvent;
        let eventCooldown = (s.eventCooldown || 0) - realDt;
        if (eventCooldown < 0) eventCooldown = 0;
        const eventFreq = s.eventFrequency || "normal";
        const eventsAllowed = !challengeDebuff.disableEvents;
        if (eventFreq !== "off" && eventsAllowed && !activeEvent && !activePopup && eventCooldown === 0) {
          const stageId = STAGES[s.stageIndex].id;
          const possible = eventsForStage(stageId, newTime);
          if (possible.length > 0) {
            const totalWeight = possible.reduce((sum, e) => sum + e.weight, 0);
            const roll = Math.random() * totalWeight;
            let cum = 0;
            for (const ev of possible) {
              cum += ev.weight;
              if (roll < cum) {
                activeEvent = ev.id;
                const base = eventFreq === "frequent" ? 30 : 90;
                const range = eventFreq === "frequent" ? 30 : 90;
                eventCooldown = base + Math.random() * range;
                break;
              }
            }
          }
        }

        // ---- Challenge completion check (every 5s) ----
        let completedChallenges = s.completedChallenges;
        let challengeRepeatCounts = s.challengeRepeatCounts;
        let activeChallenge = s.activeChallenge;
        let unlockedLayers = s.unlockedLayers;
        // QUICK WIN 5 — Prestige Points (universal currency). Earned from layer activity.
        let prestigePoints = s.prestigePoints || 0;
        if (s.activeChallenge && s.unlockedChallenges && newTime - (autoTimers.challenge || 0) >= 5) {
          autoTimers.challenge = newTime;
          const ch = CHALLENGE_MAP[s.activeChallenge];
          if (ch) {
            let isComplete = false;
            switch (ch.completeWhen.type) {
              case "reachPopulation":
                if (population >= ch.completeWhen.value) isComplete = true;
                break;
              case "reachStage":
                if (STAGES[s.stageIndex].id === ch.completeWhen.stage) isComplete = true;
                break;
              case "clearStage": {
                const targetIdx = STAGE_IDS.indexOf(ch.completeWhen.stage);
                if (s.stageIndex > targetIdx) isComplete = true;
                break;
              }
              case "reachGalactic":
                if (s.stageIndex >= STAGES.length - 1) isComplete = true;
                break;
              case "stockpileResource":
                if ((resources[ch.completeWhen.resource] || 0) >= ch.completeWhen.value) isComplete = true;
                break;
            }
            if (isComplete) {
              const completedCount = (s.completedChallenges?.[s.activeChallenge] || 0) + 1;
              completedChallenges = { ...(s.completedChallenges || {}), [s.activeChallenge]: completedCount };
              challengeRepeatCounts = { ...(s.challengeRepeatCounts || {}) };
              delete challengeRepeatCounts[s.activeChallenge];
              const chName = ch.name;
              activeChallenge = null;
              // QUICK WIN 5 — +1 Prestige Point for completing a trial
              prestigePoints += 1;
              // Enlightenment unlocks at 3 challenges completed (not 10)
              const totalChallengesCompleted = countChallengesCompleted(completedChallenges);
              if (totalChallengesCompleted >= 3 && !unlockedLayers.enlightenment) {
                unlockedLayers = { ...unlockedLayers, enlightenment: true };
              }
              // Defer log so we don't race with set()
              setTimeout(() => get().addToLog(`Trial complete: ${chName} (repeat ${completedCount}). Mastery bonus made permanent. (+1 Prestige Point)`), 0);
            }
          }
        }

        // ---- Layers 2-6: passive currency generation, timer decay, unlock chain ----
        let divinity = s.divinity || 0;
        let faith = s.faith || 0;
        let heresy = s.heresy || 0;
        let activeTemporaryRituals = s.activeTemporaryRituals || {};
        let miracleTimers = s.miracleTimers || {};
        const activeScripts = s.activeScripts || {};
        let scriptTimers = s.scriptTimers || {};
        const activeLogicCores = s.activeLogicCores || {};
        let logicCoreTimers = s.logicCoreTimers || {};
        let bloodPactsUsed = s.bloodPactsUsed || {};
        const activeHeresyResponse = s.activeHeresyResponse || "hr_ignore";

        // Decay temporary ritual timers
        if (Object.keys(activeTemporaryRituals).length > 0) {
          activeTemporaryRituals = { ...activeTemporaryRituals };
          let changed = false;
          for (const id of Object.keys(activeTemporaryRituals)) {
            const remaining = activeTemporaryRituals[id] - realDt;
            if (remaining <= 0) {
              delete activeTemporaryRituals[id];
              changed = true;
            } else {
              activeTemporaryRituals[id] = remaining;
              changed = true;
            }
          }
          void changed;
        }

        // Decay miracle timers
        if (Object.keys(miracleTimers).length > 0) {
          miracleTimers = { ...miracleTimers };
          for (const id of Object.keys(miracleTimers)) {
            const remaining = miracleTimers[id] - realDt;
            if (remaining <= 0) {
              delete miracleTimers[id];
            } else {
              miracleTimers[id] = remaining;
            }
          }
        }

        // QUICK WIN 2 — Decay active ability cooldowns + effect timers
        let activeAbilityCooldowns = s.activeAbilityCooldowns || {};
        let activeAbilityEffects = s.activeAbilityEffects || {};
        if (Object.keys(activeAbilityCooldowns).length > 0) {
          activeAbilityCooldowns = { ...activeAbilityCooldowns };
          for (const id of Object.keys(activeAbilityCooldowns)) {
            const remaining = Math.max(0, activeAbilityCooldowns[id] - realDt);
            if (remaining <= 0) delete activeAbilityCooldowns[id];
            else activeAbilityCooldowns[id] = remaining;
          }
        }
        if (Object.keys(activeAbilityEffects).length > 0) {
          activeAbilityEffects = { ...activeAbilityEffects };
          for (const id of Object.keys(activeAbilityEffects)) {
            const remaining = Math.max(0, activeAbilityEffects[id] - realDt);
            if (remaining <= 0) delete activeAbilityEffects[id];
            else activeAbilityEffects[id] = remaining;
          }
        }

        // QUICK WIN 3 — Decay ritual combo bonus timer
        let ritualComboTimer = Math.max(0, (s.ritualComboTimer || 0) - realDt);

        // QUICK WIN 7 — Random layer events (log-only state mutations)
        let layerEventTimers = { ...(s.layerEventTimers || { trial_of_fortune: 0, vision: 0, divine_whim: 0, heresy_surge: 0 }) };
        // Layer 1 — Trial of Fortune: every 120s, +20% of capacity to 2 random primary resources
        if (newTime - (layerEventTimers.trial_of_fortune || 0) >= 120 && (layerEventTimers.trial_of_fortune || 0) > 0) {
          layerEventTimers.trial_of_fortune = newTime;
          const primRes = ["glucose", "proteins", "lipids", "food", "water", "materials", "wood", "stone", "production", "gold", "influence", "energy", "alloys", "data"];
          const picks: string[] = [];
          for (let i = 0; i < 2 && primRes.length > 0; i++) {
            const idx = Math.floor(Math.random() * primRes.length);
            picks.push(primRes.splice(idx, 1)[0]);
          }
          for (const r of picks) {
            const cap = capacities[r] || 50;
            resources[r] = Math.min(cap, (resources[r] || 0) + cap * 0.20);
          }
          setTimeout(() => get().addToLog(`🎲 Trial of Fortune! +20% capacity to ${picks.join(", ")}.`), 0);
        } else if ((layerEventTimers.trial_of_fortune || 0) === 0) {
          // First-time initialization — wait 120s before first fire
          layerEventTimers.trial_of_fortune = newTime;
        }
        // Layer 2 — Vision: every 90s (after enlightenment unlocked), +5 Divinity
        if (unlockedLayers.enlightenment) {
          if ((layerEventTimers.vision || 0) === 0) {
            layerEventTimers.vision = newTime;
          } else if (newTime - layerEventTimers.vision >= 90) {
            layerEventTimers.vision = newTime;
            divinity += 5;
            setTimeout(() => get().addToLog("👁️ Vision! +5 Divinity granted."), 0);
          }
        }
        // Layer 3 — Divine Whim: every 120s (after transcendence unlocked), +30 Divinity (≈ half a ritual's cost)
        if (unlockedLayers.transcendence) {
          if ((layerEventTimers.divine_whim || 0) === 0) {
            layerEventTimers.divine_whim = newTime;
          } else if (newTime - layerEventTimers.divine_whim >= 120) {
            layerEventTimers.divine_whim = newTime;
            divinity += 30;
            setTimeout(() => get().addToLog("🌀 Divine Whim! Ritual energies surge (+30 Divinity)."), 0);
          }
        }
        // Layer 5 — Heresy Surge: every 90s (after apotheosis unlocked), +10 heresy (BAD event)
        if (unlockedLayers.apotheosis) {
          if ((layerEventTimers.heresy_surge || 0) === 0) {
            layerEventTimers.heresy_surge = newTime;
          } else if (newTime - layerEventTimers.heresy_surge >= 90) {
            layerEventTimers.heresy_surge = newTime;
            heresy = Math.min(100, heresy + 10);
            setTimeout(() => get().addToLog("🔥 Heresy Surge! +10 heresy accrued — the flock doubts."), 0);
          }
        }

        // Layer 3 — Divinity generation from active rituals + tithe script
        if (unlockedLayers.transcendence) {
          const titheActive = !!activeScripts["script_divinity_tithe"];
          const divPerSec = transcendenceDivinityPerSecond(activeTemporaryRituals, titheActive);
          if (divPerSec > 0) divinity += divPerSec * realDt;

          // Divinity Tithe script: drains 1% of all resources per second
          if (titheActive) {
            const drained: Record<string, number> = {};
            for (const r of Object.keys(resources)) {
              if ((resources[r] || 0) > 1) {
                const drain = (resources[r] || 0) * 0.01 * realDt;
                drained[r] = drain;
              }
            }
            for (const [r, v] of Object.entries(drained)) {
              resources[r] = Math.max(0, (resources[r] || 0) - v);
            }
          }

          // Auto-scripts (Layer 3)
          // Auto-Libation: every 30s, perform cheapest affordable offering
          if (activeScripts["script_auto_offering"] && newTime - (scriptTimers["script_auto_offering"] || 0) >= 30) {
            scriptTimers = { ...scriptTimers, script_auto_offering: newTime };
            const candidates = OFFERINGS.filter((o) => {
              for (const [r, v] of Object.entries(o.cost)) {
                if ((resources[r] || 0) < (v as number)) return false;
              }
              return true;
            });
            if (candidates.length > 0) {
              const pick = candidates.reduce((a, b) => (a.divinityGain < b.divinityGain ? a : b));
              for (const [r, v] of Object.entries(pick.cost)) {
                resources[r] = Math.max(0, (resources[r] || 0) - (v as number));
              }
              const repeats = (s.transcendenceOfferingsUsed?.[pick.id] || 0);
              divinity += offeringDivinityAtRepeat(pick, repeats);
              setTimeout(() => get().addToLog(`Auto-Libation performed ${pick.name}.`), 0);
            }
          }

          // Auto-Ritual: every 120s, perform Silent Hour if affordable & inactive
          if (activeScripts["script_auto_ritual"] && newTime - (scriptTimers["script_auto_ritual"] || 0) >= 120) {
            scriptTimers = { ...scriptTimers, script_auto_ritual: newTime };
            const r = RITUAL_MAP["ritual_silent_hour"];
            if (r && !(s.purchasedRituals?.["ritual_silent_hour"]) && !(activeTemporaryRituals["ritual_silent_hour"] > 0) && divinity >= r.cost) {
              divinity -= r.cost;
              activeTemporaryRituals = { ...activeTemporaryRituals, ritual_silent_hour: r.durationSec || 0 };
              setTimeout(() => get().addToLog(`Ritualist performed ${r.name}.`), 0);
            }
          }

          // Auto-Blood Pact: every 300s, perform cheapest unused blood pact if affordable
          if (activeScripts["script_auto_blood_pact"] && newTime - (scriptTimers["script_auto_blood_pact"] || 0) >= 300) {
            scriptTimers = { ...scriptTimers, script_auto_blood_pact: newTime };
            const candidates = BLOOD_PACTS.filter((p) => !bloodPactsUsed[p.id] && population >= p.popCost);
            if (candidates.length > 0) {
              const pick = candidates.reduce((a, b) => (a.popCost < b.popCost ? a : b));
              population -= pick.popCost;
              divinity += pick.divinityGain;
              bloodPactsUsed = { ...bloodPactsUsed, [pick.id]: true };
              setTimeout(() => get().addToLog(`Crimson Ledger performed ${pick.name} (-${pick.popCost} pop, +${pick.divinityGain} Divinity).`), 0);
            }
          }

          // Auto-prestige: every 600s, prestige if at Galactic stage
          if (activeScripts["script_auto_prestige"] && s.stageIndex >= STAGES.length - 1 && newTime - (scriptTimers["script_auto_prestige"] || 0) >= 600) {
            scriptTimers = { ...scriptTimers, script_auto_prestige: newTime };
            setTimeout(() => {
              get().addToLog("Cycle of Becoming: auto-prestige triggered.");
              get().triggerPrestige();
            }, 0);
          }
        }

        // Layer 5 — Faith generation, heresy accrual (Apotheosis)
        if (unlockedLayers.apotheosis) {
          faith += wMode.faithPerSec * realDt;
          // Heresy gain = worship mode's heresyPerSec × divine law heresy mult × heresy response mult
          const heresyGain = wMode.heresyPerSec * dLaw.heresyRateMult * heresyRateMult(activeHeresyResponse);
          if (heresyGain > 0) {
            heresy = Math.min(100, heresy + heresyGain * realDt);
            if (heresy >= 100) {
              // Run ends — force prestige (deferred to avoid mid-set race)
              heresy = 100;
              setTimeout(() => {
                get().addToLog("Heresy has reached 100. The god is cast down — the run ends in ruin.");
                get().triggerPrestige();
              }, 0);
            }
          }
        }

        // Layer 6 — Logic Core automation (Singularity)
        if (unlockedLayers.singularity) {
          // Architect Core: every 10s, buy cheapest affordable system (faster than Auto-Builder)
          if (activeLogicCores["core_architect"] && newTime - (logicCoreTimers["core_architect"] || 0) >= 10) {
            logicCoreTimers = { ...logicCoreTimers, core_architect: newTime };
            const stageId = STAGES[s.stageIndex].id;
            const candidates = SYSTEMS.filter((sys) => sys.stage === stageId)
              .map((sys) => {
                const owned = ownedSystems[sys.id] || 0;
                if (sys.maxOwned && owned >= sys.maxOwned) return null;
                if (sys.requiredTech && !technologies[sys.requiredTech]) return null;
                const cost = systemCost(sys, owned, costReduction);
                const scaledCost: Record<string, number> = {};
                let totalCost = 0;
                let canAfford = true;
                for (const [r, v] of Object.entries(cost)) {
                  const scaled = Math.ceil((v as number) * challengeCostMult);
                  scaledCost[r] = scaled;
                  totalCost += scaled;
                  if ((resources[r] || 0) < scaled) canAfford = false;
                }
                return { sys, scaledCost, totalCost, canAfford };
              })
              .filter((x): x is NonNullable<typeof x> => x !== null && x.canAfford);
            if (candidates.length > 0) {
              candidates.sort((a, b) => a.totalCost - b.totalCost);
              const pick = candidates[0];
              for (const [r, v] of Object.entries(pick.scaledCost)) {
                resources[r] -= v;
              }
              ownedSystems = { ...ownedSystems, [pick.sys.id]: (ownedSystems[pick.sys.id] || 0) + 1 };
              if (systemEnabled[pick.sys.id] === undefined) {
                systemEnabled = { ...systemEnabled, [pick.sys.id]: true };
              }
              totalSystemsBuilt += 1;
            }
          }

          // Sage Core: every 15s, research cheapest affordable tech (faster than Auto-Researcher)
          if (activeLogicCores["core_sage"] && newTime - (logicCoreTimers["core_sage"] || 0) >= 15) {
            logicCoreTimers = { ...logicCoreTimers, core_sage: newTime };
            const stageId = STAGES[s.stageIndex].id;
            const techCands = TECHS.filter((t) => t.stage === stageId && !technologies[t.id])
              .map((t) => {
                if (t.requires) {
                  for (const req of t.requires) {
                    if (!technologies[req]) return null;
                  }
                }
                const cost = t.cost as Record<string, number>;
                let canAfford = true;
                let totalCost = 0;
                for (const [r, v] of Object.entries(cost)) {
                  const scaled = Math.ceil(v * challengeCostMult);
                  totalCost += scaled;
                  if ((resources[r] || 0) < scaled) canAfford = false;
                }
                return { t, totalCost, canAfford };
              })
              .filter((x): x is NonNullable<typeof x> => x !== null && x.canAfford);
            if (techCands.length > 0) {
              techCands.sort((a, b) => a.totalCost - b.totalCost);
              const pick = techCands[0];
              for (const [r, v] of Object.entries(pick.t.cost)) {
                const scaled = Math.ceil((v as number) * challengeCostMult);
                resources[r] = Math.max(0, resources[r] - scaled);
              }
              technologies = { ...technologies, [pick.t.id]: true };
              totalTechResearched += 1;
            }
          }

          // Chronicler Core: every 60s, perform cheapest affordable offering (Layer 3 helper)
          if (activeLogicCores["core_chronicler"] && unlockedLayers.transcendence && newTime - (logicCoreTimers["core_chronicler"] || 0) >= 60) {
            logicCoreTimers = { ...logicCoreTimers, core_chronicler: newTime };
            const candidates = OFFERINGS.filter((o) => {
              for (const [r, v] of Object.entries(o.cost)) {
                if ((resources[r] || 0) < (v as number)) return false;
              }
              return true;
            });
            if (candidates.length > 0) {
              const pick = candidates.reduce((a, b) => (a.divinityGain < b.divinityGain ? a : b));
              for (const [r, v] of Object.entries(pick.cost)) {
                resources[r] = Math.max(0, (resources[r] || 0) - (v as number));
              }
              const repeats = (s.transcendenceOfferingsUsed?.[pick.id] || 0);
              divinity += offeringDivinityAtRepeat(pick, repeats);
            }
          }
        }

        // ---- Layer 7 — Omnipotence: instability accrual ----
        let instability = s.instability || 0;
        let peakInstability = s.peakInstability || 0;
        if (unlockedLayers.omnipotence) {
          const rate = effectiveInstabilityRate(s.equippedHybrids || {}, s.activeOmnipotenceStance);
          if (rate > 0) {
            instability = Math.min(100, instability + rate * realDt);
            peakInstability = Math.max(peakInstability, instability);
            if (instability >= 100) {
              instability = 100;
              peakInstability = 100;
              setTimeout(() => {
                get().addToLog("Instability has reached 100. The hybrid god tears itself apart — the run ends.");
                get().triggerPrestige();
              }, 0);
            }
          }
        }

        // ---- Layer 8 — Divinity (layer): Prayer generation ----
        let prayer = s.prayer || 0;
        if (unlockedLayers.divinity) {
          const pRate = prayerRate(population, s.prayerChannelLevels || {}, s.activeDivineMask, s.activeWorshipPolarity);
          if (pRate > 0) prayer += pRate * realDt;
        }

        // ---- Layer unlock chain (Layers 3-6) ----
        // Layer 3 (Transcendence): 10+ foresight nodes purchased
        if (unlockedLayers.enlightenment && !unlockedLayers.transcendence) {
          if (countForesightNodes(s.foresightNodes || {}) >= FORESIGHT_NODES_REQUIRED_FOR_LAYER_3) {
            unlockedLayers = { ...unlockedLayers, transcendence: true };
            setTimeout(() => get().addToLog("10 Foresight nodes reached. Transcendence layer unlocked."), 0);
          }
        }
        // Layer 4 (Genesis): all 4 blood pacts used at least once
        if (unlockedLayers.transcendence && !unlockedLayers.genesis) {
          if (allBloodPactsUsed(bloodPactsUsed)) {
            unlockedLayers = { ...unlockedLayers, genesis: true };
            setTimeout(() => get().addToLog("All 4 Blood Pacts performed. Genesis layer unlocked."), 0);
          }
        }
        // Layer 5 (Apotheosis): authored at least 1 world config
        if (unlockedLayers.genesis && !unlockedLayers.apotheosis) {
          if (hasAuthoredWorld(s.authoredWorlds || [])) {
            unlockedLayers = { ...unlockedLayers, apotheosis: true };
            setTimeout(() => get().addToLog("First world authored. Apotheosis layer unlocked."), 0);
          }
        }
        // Layer 6 (Singularity): enacted 3+ divine laws
        if (unlockedLayers.apotheosis && !unlockedLayers.singularity) {
          if (hasEnactedThreeLaws(s.enactedDivineLaws || {})) {
            unlockedLayers = { ...unlockedLayers, singularity: true };
            setTimeout(() => get().addToLog("3 Divine Laws enacted. Singularity layer unlocked."), 0);
          }
        }
        // Layer 7 (Omnipotence): 3+ active logic cores
        const activeCoreCount = Object.values(s.activeLogicCores || {}).filter(Boolean).length;
        if (unlockedLayers.singularity && !unlockedLayers.omnipotence) {
          if (activeCoreCount >= 3) {
            unlockedLayers = { ...unlockedLayers, omnipotence: true };
            setTimeout(() => get().addToLog("3 Logic Cores activated. Omnipotence layer unlocked."), 0);
          }
        }
        // Layer 8 (Divinity): peak instability ≥ 80
        if (unlockedLayers.omnipotence && !unlockedLayers.divinity) {
          if (isOmnipotenceComplete(peakInstability)) {
            unlockedLayers = { ...unlockedLayers, divinity: true };
            setTimeout(() => get().addToLog("Peak instability reached 80. Divinity layer unlocked."), 0);
          }
        }
        // Layer 9 (Infinity): 3+ prayer channels leveled AND polarity chosen
        if (unlockedLayers.divinity && !unlockedLayers.infinity) {
          if (isDivinityComplete(s.prayerChannelLevels || {}, s.activeWorshipPolarity)) {
            unlockedLayers = { ...unlockedLayers, infinity: true };
            setTimeout(() => get().addToLog("Prayer channels and polarity set. Infinity layer unlocked."), 0);
          }
        }
        // Layer 10 (Eternity): forks resolved + debt repaid
        if (unlockedLayers.infinity && !unlockedLayers.eternity) {
          if (isInfinityComplete(s.resolvedForks || {}, s.takenFutureDebts || {}, s.repaidFutureDebts || {})) {
            unlockedLayers = { ...unlockedLayers, eternity: true };
            setTimeout(() => get().addToLog("All forks resolved and debts repaid. Eternity layer unlocked."), 0);
          }
        }

        // ---- Theme auto-unlock (Part 1f) ----
        let unlockedThemes = { ...(s.unlockedThemes || { "stage-cell": true }) };
        let themesChanged = false;
        // Stage themes — unlock the theme for the current stage index
        const stageThemeId = STAGE_INDEX_TO_THEME[s.stageIndex];
        if (stageThemeId && !unlockedThemes[stageThemeId]) {
          unlockedThemes[stageThemeId] = true;
          themesChanged = true;
        }
        // Layer themes — unlock the matching overlay when a layer unlocks
        for (const [layerId, themeId] of Object.entries(LAYER_ID_TO_THEME)) {
          if (unlockedLayers[layerId] && !unlockedThemes[themeId]) {
            unlockedThemes[themeId] = true;
            themesChanged = true;
          }
        }
        // Special themes
        if ((s.galacticWins || 0) >= 1 && !unlockedThemes["special-void"]) {
          unlockedThemes["special-void"] = true;
          themesChanged = true;
        }
        const achCount = Object.values(achievements || {}).filter(Boolean).length;
        if (achCount >= 10 && !unlockedThemes["special-retro"]) {
          unlockedThemes["special-retro"] = true;
          themesChanged = true;
        }
        const allLayersUnlocked = !!(unlockedLayers.evolution && unlockedLayers.enlightenment && unlockedLayers.transcendence && unlockedLayers.genesis && unlockedLayers.apotheosis && unlockedLayers.singularity && unlockedLayers.omnipotence && unlockedLayers.divinity && unlockedLayers.infinity && unlockedLayers.eternity);
        if (allLayersUnlocked && !unlockedThemes["special-cosmic"]) {
          unlockedThemes["special-cosmic"] = true;
          themesChanged = true;
        }
        void themesChanged;

        // ===== REBUILD: LAYERS 1-6 UNIQUE GAMEPLAY LOOPS — tick processing =====
        // Layer 1 — Trial Realms: progress the active realm's mini-game
        let activeTrialRealm = s.activeTrialRealm;
        let trialRealmState = { ...(s.trialRealmState || {}) };
        let trialRealmsCompleted = { ...(s.trialRealmsCompleted || {}) };
        if (activeTrialRealm && PLAYABLE_REALM_IDS.includes(activeTrialRealm)) {
          const st = { ...(trialRealmState[activeTrialRealm] || makeDefaultRealmState(activeTrialRealm)) };
          switch (activeTrialRealm) {
            case "realm_growth": {
              st.energy = Math.min(100, (st.energy || 0) + REALM_GROWTH_PASSIVE_FILL_PER_SEC * realDt);
              break;
            }
            case "realm_discontent": {
              // Happiness oscillates as a sine wave centered on 50, amplitude 35, period 12s
              st.timer = (st.timer || 0) + realDt;
              const phase = (st.timer / 12) * Math.PI * 2;
              const target = 50 + Math.sin(phase) * 35;
              // Drift toward target slowly
              st.happiness = (st.happiness || 50) + (target - (st.happiness || 50)) * 0.1 * realDt;
              st.happiness = Math.max(0, Math.min(100, st.happiness));
              // Survival timer only progresses while happiness is above the threshold
              st.survivedTime = (st.survivedTime || 0) + ((st.happiness || 0) >= REALM_DISCONTENT_HAPPINESS_THRESHOLD ? realDt : 0);
              if ((st.happiness || 0) < REALM_DISCONTENT_HAPPINESS_THRESHOLD) {
                st.happinessBelowThreshold = true;
              }
              // Check completion: survived ≥ 90s AND gold ≥ 200
              if ((st.survivedTime || 0) >= REALM_DISCONTENT_SURVIVE_SECONDS && (st.gold || 0) >= REALM_DISCONTENT_GOLD_GOAL && !st.completed) {
                st.completed = true;
                trialRealmsCompleted[activeTrialRealm] = true;
                setTimeout(() => get().addToLog("Realm of Discontent conquered! Permanent reward granted."), 0);
              }
              break;
            }
            case "realm_swiftness": {
              st.timeLeft = Math.max(0, (st.timeLeft || REALM_SWIFTNESS_TIME_LIMIT) - realDt);
              if (st.timeLeft <= 0 && !st.completed) {
                // Time expired; failed unless we already reached Galactic
                if (!st.reachedGalactic) {
                  setTimeout(() => get().addToLog("Realm of Swiftness: time expired — run failed."), 0);
                  activeTrialRealm = null;
                }
              }
              if (s.stageIndex >= STAGES.length - 1) {
                st.reachedGalactic = true;
                if (!st.completed) {
                  st.completed = true;
                  trialRealmsCompleted[activeTrialRealm] = true;
                  setTimeout(() => get().addToLog("Realm of Swiftness conquered! +15% all production speed."), 0);
                }
              }
              break;
            }
          }
          // Auto-close realm if completed (Growth handled in the breakthrough action)
          if (st.completed && activeTrialRealm !== "realm_growth") {
            activeTrialRealm = null;
          }
          trialRealmState[activeTrialRealm || s.activeTrialRealm!] = st;
        }

        // Layer 3 — Divine Market: random-walk prices every 10s
        let marketPrices = { ...(s.marketPrices || {}) };
        let priceHistory = { ...(s.priceHistory || {}) };
        let marketOwnedResources = { ...(s.marketOwnedResources || {}) };
        let marketTickTimer = (s.marketTickTimer || 10) - realDt;
        if (marketTickTimer <= 0) {
          marketTickTimer = 10;
          for (const r of Object.keys(marketPrices)) {
            const cur = marketPrices[r] || 10;
            const drift = (Math.random() - 0.5) * 0.6; // ±30%
            let next = cur * (1 + drift);
            next = Math.max(1, Math.min(200, next));
            marketPrices[r] = next;
            const hist = (priceHistory[r] || []).slice(-19);
            hist.push(next);
            priceHistory[r] = hist;
          }
        }
        // Divine-dends — passive Divinity from owned resource types (100+ units → +1 Div/s)
        if (unlockedLayers.transcendence) {
          let dividends = 0;
          for (const r of Object.keys(marketOwnedResources)) {
            if ((marketOwnedResources[r] || 0) >= 100) dividends += 1;
          }
          if (dividends > 0) divinity += dividends * realDt;
        }

        // Layer 5 — Heresy Web: spread every 10s (independent of the global heresy meter)
        let followerGrid = s.followerGrid ? s.followerGrid.slice() : makeInitialFollowerGrid();
        let heresySpreadTimer = (s.heresySpreadTimer || 10) - realDt;
        if (unlockedLayers.apotheosis && heresySpreadTimer <= 0) {
          heresySpreadTimer = 10;
          const next = followerGrid.map((c) => ({ ...c }));
          // Spread from each heretical cell to one random adjacent faithful cell
          for (let i = 0; i < next.length; i++) {
            if (next[i].state !== "heretical") continue;
            const row = Math.floor(i / 8);
            const col = i % 8;
            const neighbors = [
              col > 0 ? i - 1 : -1,
              col < 7 ? i + 1 : -1,
              row > 0 ? i - 8 : -1,
              row < 3 ? i + 8 : -1,
            ].filter((n) => n >= 0 && next[n].state === "faithful");
            if (neighbors.length === 0) continue;
            const target = neighbors[Math.floor(Math.random() * neighbors.length)];
            next[target].state = "heretical";
          }
          followerGrid = next;
        }

        // Layer 6 — Dimension Engine: parallel dimension progress
        let dimensions = (s.dimensions || makeInitialDimensions()).map((d) => ({ ...d }));
        let dimensionRiftTimer = (s.dimensionRiftTimer || 60) - realDt;
        for (const d of dimensions) {
          if (d.reachedGalactic) continue;
          // Each dimension accrues resources & population at its own speed
          d.resources += d.pop * 0.1 * d.speed * realDt;
          // Pop grows slowly (1 per 5s at speed 1)
          d.pop += 0.2 * d.speed * realDt;
          // Stage up: every 100 resources → advance stage
          while (d.resources >= 100 && d.stageIndex < STAGES.length - 1) {
            d.resources -= 100;
            d.stageIndex += 1;
          }
          if (d.stageIndex >= STAGES.length - 1) {
            d.reachedGalactic = true;
          }
        }
        if (dimensionRiftTimer <= 0) {
          // Rift event — transfer resources between two random dimensions
          dimensionRiftTimer = 60;
          if (dimensions.length >= 2) {
            const fromIdx = Math.floor(Math.random() * dimensions.length);
            let toIdx = Math.floor(Math.random() * dimensions.length);
            while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * dimensions.length);
            const transfer = Math.min(dimensions[fromIdx].resources, 25);
            dimensions[fromIdx].resources -= transfer;
            dimensions[toIdx].resources += transfer;
            setTimeout(() => get().addToLog(`🌀 Rift event! ${dimensions[fromIdx].name} → ${dimensions[toIdx].name}: ${transfer.toFixed(1)} resources transferred.`), 0);
          }
        }

        set({
          resources,
          capacities,
          time: newTime,
          population,
          maxPopulation,
          populationProgress,
          storyUnlocked: newStory,
          activeStoryPopup: activePopup,
          achievements,
          newAchievements,
          activeEvent,
          eventCooldown,
          ownedSystems,
          systemEnabled,
          archetypeAffinity,
          technologies,
          totalSystemsBuilt,
          totalTechResearched,
          autoTimers,
          completedChallenges,
          challengeRepeatCounts,
          activeChallenge,
          unlockedLayers,
          unlockedThemes,
          totalPlayTime: (s.totalPlayTime || 0) + realDt,
          // Layer 2-6 currency + state
          divinity,
          faith,
          heresy,
          activeTemporaryRituals,
          miracleTimers,
          activeScripts,
          scriptTimers,
          activeLogicCores,
          logicCoreTimers,
          bloodPactsUsed,
          // Layer 7-8 state
          instability,
          peakInstability,
          prayer,
          // QUICK WINS — runtime timers + universal currency
          activeAbilityCooldowns,
          activeAbilityEffects,
          ritualComboTimer,
          layerEventTimers,
          prestigePoints,
          // REBUILD L1-6 — runtime state for the new mini-games
          activeTrialRealm,
          trialRealmState,
          trialRealmsCompleted,
          marketPrices,
          priceHistory,
          marketOwnedResources,
          marketTickTimer,
          followerGrid,
          heresySpreadTimer,
          dimensions,
          dimensionRiftTimer,
        });
      },

      // ============ ACTIONS ============
      performAction: (actionId) => {
        const s = get();
        const action = ACTION_MAP[actionId];
        if (!action) return;
        if (action.stage !== STAGES[s.stageIndex].id) return;

        const res = { ...s.resources };

        // Check if all output resources are at cap — if so, block (no waste)
        const outputs = Object.entries(action.produces);
        if (outputs.length > 0) {
          const allCapped = outputs.every(([r]) => {
            const cap = s.capacities[r] || 0;
            return (res[r] || 0) >= cap - 0.001;
          });
          if (allCapped) return; // action wasted — block it
        }

        // Check costs
        if (action.cost) {
          for (const [r, v] of Object.entries(action.cost)) {
            if ((res[r] || 0) < (v as number)) return;
          }
          for (const [r, v] of Object.entries(action.cost)) {
            res[r] -= v as number;
          }
        }

        // Manual action multiplier
        // (quickened_hands removed; no upgrade scales manual actions now)
        const mult = 1;
        const techMult = techMultiplier(s, "manual");
        const finalMult = mult * techMult;

        // Archetype per-resource bonus
        const archetype = s.lockedArchetype ? ARCHETYPE_MAP[s.lockedArchetype] : null;

        for (const [r, v] of Object.entries(action.produces)) {
          const cap = s.capacities[r] || 0;
          const archResBonus = archetype?.bonus.productionMult?.[r] || 0;
          const totalArchMult = 1 + archResBonus + (archetype?.bonus.allProductionMult || 0);
          const amount = (v as number) * finalMult * totalArchMult;
          res[r] = Math.min(cap, (res[r] || 0) + amount);
        }

        set({
          resources: res,
          totalActions: (s.totalActions || 0) + 1,
        });
      },

      buySystem: (systemId, qty) => {
        const s = get();
        const sys = SYSTEM_MAP[systemId];
        if (!sys) return;
        if (sys.stage !== STAGES[s.stageIndex].id) return;
        // Check tech prerequisite
        if (sys.requiredTech && !s.technologies[sys.requiredTech]) return;

        // ---- Active challenge restrictions ----
        let challengeDebuff: ChallengeEffects = {};
        if (s.activeChallenge && s.unlockedChallenges) {
          const ch = CHALLENGE_MAP[s.activeChallenge];
          if (ch) {
            const repeat = s.challengeRepeatCounts?.[s.activeChallenge] || 0;
            challengeDebuff = getChallengeDebuffAtRepeat(ch, repeat);
          }
        }
        const challengeCostMult = challengeDebuff.costMult ?? 1;
        if (challengeDebuff.disableMilitary && sys.category === "Military") {
          get().addToLog(`Trial ${CHALLENGE_MAP[s.activeChallenge!]?.name} forbids military systems.`);
          return;
        }
        if (challengeDebuff.maxSystems !== undefined) {
          const totalSystems = Object.values(s.ownedSystems).reduce((a, b) => a + b, 0);
          if (totalSystems >= challengeDebuff.maxSystems) {
            get().addToLog(`Trial ${CHALLENGE_MAP[s.activeChallenge!]?.name} caps you at ${challengeDebuff.maxSystems} systems.`);
            return;
          }
        }

        const costReduction = (s.upgrades["frugality"] || 0) * 0.04
          + Math.max(0, -(foresightBonus(s.foresightNodes || {}).costMult));
        let owned = s.ownedSystems[systemId] || 0;
        if (sys.maxOwned && owned >= sys.maxOwned) return;

        const res = { ...s.resources };
        const ownedSystems = { ...s.ownedSystems };
        const systemEnabled = { ...s.systemEnabled };
        const archetypeAffinity = { ...s.archetypeAffinity };

        let bought = 0;
        for (let i = 0; i < qty; i++) {
          if (sys.maxOwned && owned + bought >= sys.maxOwned) break;
          if (challengeDebuff.maxSystems !== undefined) {
            const totalSystems = Object.values(ownedSystems).reduce((a, b) => a + b, 0);
            if (totalSystems + bought >= challengeDebuff.maxSystems) break;
          }
          const cost = systemCost(sys, owned + bought, costReduction);
          let canAfford = true;
          for (const [r, v] of Object.entries(cost)) {
            const scaled = Math.ceil((v as number) * challengeCostMult);
            if ((res[r] || 0) < scaled) {
              canAfford = false;
              break;
            }
          }
          if (!canAfford) break;
          for (const [r, v] of Object.entries(cost)) {
            const scaled = Math.ceil((v as number) * challengeCostMult);
            res[r] -= scaled;
          }
          bought++;
        }

        if (bought === 0) return;

        ownedSystems[systemId] = owned + bought;
        // New systems are enabled by default
        if (systemEnabled[systemId] === undefined) systemEnabled[systemId] = true;

        // Apply archetype affinity grant
        if (sys.grantsAffinity) {
          const arch = sys.grantsAffinity.archetype;
          archetypeAffinity[arch] = (archetypeAffinity[arch] || 0) + sys.grantsAffinity.amount * bought;
        }

        // Trigger story
        const newStory = { ...s.storyUnlocked };
        let activePopup = s.activeStoryPopup;
        for (const trig of STORY_TRIGGERS) {
          if (!newStory[trig.id] && trig.condition({ ...s, resources: res, ownedSystems })) {
            newStory[trig.id] = true;
            if (!activePopup) activePopup = trig.id;
          }
        }

        set({
          resources: res,
          ownedSystems,
          systemEnabled,
          archetypeAffinity,
          storyUnlocked: newStory,
          activeStoryPopup: activePopup,
          totalSystemsBuilt: (s.totalSystemsBuilt || 0) + bought,
        });
        get().addToLog(`Built ${bought}× ${sys.name}.`);
      },

      toggleSystem: (systemId) => {
        const s = get();
        if (!s.ownedSystems[systemId]) return;
        const systemEnabled = { ...s.systemEnabled };
        systemEnabled[systemId] = systemEnabled[systemId] === false ? true : false;
        set({ systemEnabled });
      },

      enableAllSystems: (enabled) => {
        const s = get();
        const systemEnabled: Record<string, boolean> = {};
        for (const id of Object.keys(s.ownedSystems)) {
          systemEnabled[id] = enabled;
        }
        set({ systemEnabled });
      },

      buyTech: (techId) => {
        const s = get();
        const tech = TECH_MAP[techId];
        if (!tech) return;
        if (s.technologies[techId]) return;
        if (tech.stage !== STAGES[s.stageIndex].id) return;
        if (tech.requires) {
          for (const req of tech.requires) {
            if (!s.technologies[req]) return;
          }
        }

        // ---- Active challenge restrictions ----
        let challengeDebuff: ChallengeEffects = {};
        if (s.activeChallenge && s.unlockedChallenges) {
          const ch = CHALLENGE_MAP[s.activeChallenge];
          if (ch) {
            const repeat = s.challengeRepeatCounts?.[s.activeChallenge] || 0;
            challengeDebuff = getChallengeDebuffAtRepeat(ch, repeat);
          }
        }
        const challengeCostMult = challengeDebuff.costMult ?? 1;
        if (challengeDebuff.disableTech) {
          get().addToLog(`Trial ${CHALLENGE_MAP[s.activeChallenge!]?.name} forbids all tech research.`);
          return;
        }
        if (challengeDebuff.disableMilitary && tech.branch === "Conflict") {
          get().addToLog(`Trial ${CHALLENGE_MAP[s.activeChallenge!]?.name} forbids military tech.`);
          return;
        }

        const res = { ...s.resources };
        const layerTechCostMult = 1 - Math.max(0, -(foresightBonus(s.foresightNodes || {}).costMult));
        for (const [r, v] of Object.entries(tech.cost)) {
          const scaled = Math.ceil((v as number) * challengeCostMult * layerTechCostMult);
          if ((res[r] || 0) < scaled) return;
        }
        for (const [r, v] of Object.entries(tech.cost)) {
          const scaled = Math.ceil((v as number) * challengeCostMult * layerTechCostMult);
          res[r] -= scaled;
        }
        const technologies = { ...s.technologies, [techId]: true };
        const archetypeAffinity = { ...s.archetypeAffinity };
        if (tech.grantsAffinity) {
          archetypeAffinity[tech.grantsAffinity.archetype] =
            (archetypeAffinity[tech.grantsAffinity.archetype] || 0) + tech.grantsAffinity.amount;
        }
        set({
          resources: res,
          technologies,
          archetypeAffinity,
          totalTechResearched: (s.totalTechResearched || 0) + 1,
        });
        get().addToLog(`Researched ${tech.name}.`);
      },

      buyUpgrade: (upgradeId) => {
        const s = get();
        const up = UPGRADE_MAP[upgradeId];
        if (!up) return;
        if (up.requiresWins && s.galacticWins < up.requiresWins) return;
        const owned = s.upgrades[upgradeId] || 0;
        if (owned >= up.maxLevel) return;
        const cost = upgradeCost(up, owned);
        if (s.evolutionPoints < cost) return;
        const upgrades = { ...s.upgrades, [upgradeId]: owned + 1 };
        set({
          evolutionPoints: s.evolutionPoints - cost,
          upgrades,
        });
        get().addToLog(`Purchased ${up.name} (Lv ${owned + 1}).`);
      },

      evolveStage: () => {
        const s = get();
        const stage = STAGES[s.stageIndex];
        const next = nextStage(stage.id);
        if (!next) {
          get().triggerPrestige();
          return;
        }
        const reqs = stage.evolveRequires;
        const evolveBoost = 1 - Math.min(0.30, (s.upgrades["evolutionary_momentum"] || 0) * 0.05);
        const totalSystems = Object.values(s.ownedSystems).reduce((a, b) => a + b, 0);
        const totalTech = Object.keys(s.technologies).length;
        const score = computeScore(s);

        if (s.population < reqs.minPopulation * evolveBoost) return;
        if (totalSystems < reqs.minSystems * evolveBoost) return;
        if (totalTech < reqs.minTech * evolveBoost) return;
        // Score is NOT a requirement — it only affects EP earned at prestige

        const nextStageIdx = s.stageIndex + 1;
        const nextStageDef = STAGES[nextStageIdx];

        const resources = { ...s.resources };

        // Give starting resources for the new stage to prevent deadlocks
        const stageStartBonus: Record<string, Record<string, number>> = {
          creature: { food: 15, water: 10, materials: 5 },
          tribal: { wood: 15, stone: 5, clay: 3 },
          civilization: { production: 20, gold: 15 },
          empire: { influence: 5, gold: 30 },
          solar: { energy: 25, alloys: 8 },
          galactic: { data: 15, energy: 40 },
        };
        const startBonus = stageStartBonus[nextStageDef.id];
        if (startBonus) {
          for (const [r, v] of Object.entries(startBonus)) {
            resources[r] = (resources[r] || 0) + v;
          }
          get().addToLog(`Starting resources granted: ${Object.entries(startBonus).map(([r,v]) => `${v} ${r}`).join(', ')}`);
        }

        const capBoostLvl = s.upgrades["expansive_vaults"] || 0;
        const capMult = 1 + capBoostLvl * 0.20;
        const archetype = s.lockedArchetype ? ARCHETYPE_MAP[s.lockedArchetype] : null;
        const archCapMult = archetype?.bonus.capMult || 0;
        const capacities = recomputeCapacitiesFresh(s, capMult + archCapMult);

        const newStory = { ...s.storyUnlocked };
        const storyId = STORY_MAP[
          nextStageDef.id === "creature" ? "first_body_stirs"
          : nextStageDef.id === "tribal" ? "fire_remembered"
          : nextStageDef.id === "civilization" ? "cities_learn_to_dream"
          : nextStageDef.id === "empire" ? "distance_begins_to_obey"
          : nextStageDef.id === "solar" ? "sky_stops_being_a_wall"
          : "galaxy_takes_a_shape"
        ];
        if (storyId) newStory[storyId.id] = true;

        // Lock archetype when evolving from Creature → Tribal
        let lockedArchetype = s.lockedArchetype;
        if (stage.id === "creature" && !lockedArchetype) {
          const dom = dominantArchetype(s.archetypeAffinity);
          if (dom) {
            lockedArchetype = dom;
            get().addToLog(`Lineage locked: ${ARCHETYPE_MAP[dom].name}.`);
          } else {
            lockedArchetype = "humanoid"; // default fallback
            get().addToLog(`Lineage locked: Humanoid (no drift).`);
          }
        }

        const stageClearCounts = { ...s.stageClearCounts, [stage.id]: (s.stageClearCounts[stage.id] || 0) + 1 };

        // Auto-switch active stage theme if the player was on the previous stage's theme.
        // (Respects player's manual selection if they had a different theme active.)
        const prevStageThemeId = STAGE_INDEX_TO_THEME[s.stageIndex];
        const newStageThemeId = STAGE_INDEX_TO_THEME[nextStageIdx];
        let activeStageTheme = s.activeStageTheme || "stage-cell";
        if (newStageThemeId && activeStageTheme === prevStageThemeId) {
          activeStageTheme = newStageThemeId;
        }
        // Unlock the new stage's theme
        const unlockedThemes = { ...(s.unlockedThemes || { "stage-cell": true }) };
        if (newStageThemeId && !unlockedThemes[newStageThemeId]) {
          unlockedThemes[newStageThemeId] = true;
        }

        // Track fastest Cell clear
        let fastestCellClear = s.fastestCellClear || 0;
        if (stage.id === "cell") {
          const clearTime = s.time;
          if (fastestCellClear === 0 || clearTime < fastestCellClear) {
            fastestCellClear = clearTime;
          }
        }

        // Check achievements after stage clear
        const postEvolveState = { ...s, stageClearCounts, lockedArchetype, fastestCellClear } as GameState;
        const achResult = checkAchievements(postEvolveState);
        const newAchievements = achResult.newOnes.length > 0
          ? [...(s.newAchievements || []), ...achResult.newOnes]
          : s.newAchievements;

        set({
          stageIndex: nextStageIdx,
          resources,
          capacities,
          storyUnlocked: newStory,
          activeStoryPopup: storyId?.id || s.activeStoryPopup,
          stageClearCounts,
          fastestCellClear,
          lockedArchetype,
          achievements: achResult.earned,
          newAchievements,
          activeStageTheme,
          unlockedThemes,
        });
        get().addToLog(`Evolved to ${nextStageDef.name}. ${nextStageDef.tagline}`);
      },

      triggerPrestige: () => {
        const s = get();
        const stage = STAGES[s.stageIndex];
        const score = computeScore(s);
        const stageMult = [1, 2, 4, 8, 16, 32, 64][s.stageIndex] || 1;
        let epEarned = Math.max(1, Math.floor(Math.sqrt(score / 100) * stageMult));

        // ---- Cosmic Understanding: +25% EP per level ----
        const cosmicLvl = s.upgrades["cosmic_understanding"] || 0;
        epEarned = Math.max(1, Math.floor(epEarned * (1 + cosmicLvl * 0.25)));

        // ---- Layers 2-6: aggregate EP multiplier (foresight, route, ritual, world, law, relic, core) ----
        const fs = foresightBonus(s.foresightNodes || {});
        const rb = routeBonus(s.activeForesightRoute);
        const ritualEp = activeRitualEpBonus(s.purchasedRituals || {}, s.activeTemporaryRituals || {});
        const wEp = worldEpMultiplier(s.authoredWorlds || []);
        const dl = divineLawBonus(s.enactedDivineLaws || {});
        const relicEp = relicBonus(s.equippedRelics || {}).epMult;
        const coreEp = logicCoreBonus(s.activeLogicCores || {}).epMult;
        // Layers 7-10 EP bonus
        const hybridEp = hybridBonus(s.equippedHybrids || {}, s.activeOmnipotenceStance).epMult;
        const chanEp = prayerChannelBonus(s.prayerChannelLevels || {}).epMult;
        const maskEp = divineMaskBonus(s.activeDivineMask).epMult;
        const polEp = worshipPolarityBonus(s.activeWorshipPolarity).epMult;
        const echoEp = echoBonus(s.purchasedEchoes || {}).epMult;
        const forkEp = forkBonus(s.resolvedForks || {}).epMult;
        const debtEp = activeDebtBonus(s.takenFutureDebts || {}, s.repaidFutureDebts || {}).epMult;
        const testEp = testamentClauseBonus(s.purchasedTestamentClauses || {}).epMult;
        const canonEp = canonizationBonus(s.activeCanonizations || {}).epMult;
        const weaveEp = permanenceWeaveBonus(s.activePermanenceWeaves || {}).epMult;
        const layerEpMult = 1 +
          fs.epMult + rb.epMult + ritualEp + wEp + dl.epMult + relicEp + coreEp +
          hybridEp + chanEp + maskEp + polEp + echoEp + forkEp + debtEp +
          testEp + canonEp + weaveEp;
        epEarned = Math.max(1, Math.floor(epEarned * layerEpMult));

        // ---- Layer 2 (Enlightenment): grant Divinity based on score ----
        let divinityGain = 0;
        if (s.unlockedLayers?.enlightenment) {
          divinityGain = Math.max(1, Math.floor(Math.sqrt(score / 200) * stageMult * (1 + fs.divinityMult)));
        }
        // ---- Layer 4 (Genesis): grant Genesis Seeds based on stage ----
        let genesisSeedGain = 0;
        if (s.unlockedLayers?.genesis) {
          genesisSeedGain = Math.max(1, Math.floor(stageMult / 2));
        }
        // ---- Layer 6 (Singularity): grant Singularity Cores based on stage ----
        let singularityCoreGain = 0;
        if (s.unlockedLayers?.singularity) {
          singularityCoreGain = Math.max(1, Math.floor(stageMult / 4));
        }
        // ---- Layer 9 (Infinity): grant Echoes based on stage ----
        let echoGain = 0;
        if (s.unlockedLayers?.infinity) {
          const echoMult = 1 + echoBonus(s.purchasedEchoes || {}).echoMult;
          echoGain = Math.max(1, Math.floor(stageMult / 3 * echoMult));
        }
        // ---- Layer 10 (Eternity): grant Testament Clauses based on stage ----
        let testamentGain = 0;
        if (s.unlockedLayers?.eternity) {
          const testMult = 1 + testamentClauseBonus(s.purchasedTestamentClauses || {}).testamentMult;
          testamentGain = Math.max(1, Math.floor(stageMult / 5 * testMult));
        }

        const archive = [...s.archive];
        const archName = s.lockedArchetype ? ARCHETYPE_MAP[s.lockedArchetype]?.name : "Humanoid";
        archive.unshift({
          runId: `run_${s.totalRuns + 1}`,
          timestamp: Date.now(),
          stage: stage.id,
          archetype: s.lockedArchetype || "humanoid",
          score,
          epEarned,
          duration: s.time,
          ending: s.stageIndex >= 6 ? "Galactic Ascension" : `${stage.name} Evolution (${archName})`,
        });

        const archivedArchetypes = Array.from(new Set([
          ...(s.archivedArchetypes || []),
          ...(s.lockedArchetype ? [s.lockedArchetype] : []),
        ]));

        // ---- Determine if this prestige unlocks challenges ----
        const isFirstGalacticWin = s.stageIndex >= 6 && !s.unlockedChallenges;
        const newUnlockedChallenges = s.unlockedChallenges || isFirstGalacticWin;

        // ---- Fail any in-progress challenge on prestige (challenge not completed) ----
        const failedChallenge = s.activeChallenge;
        const newChallengeRepeatCounts = { ...(s.challengeRepeatCounts || {}) };
        if (failedChallenge) {
          delete newChallengeRepeatCounts[failedChallenge];
        }

        const fresh = initialRunState();

        // ---- Apply new-run upgrades to the fresh state ----
        // Warm Start: +5 per level to atp/glucose/proteins/lipids
        const warmLvl = s.upgrades["warm_start"] || 0;
        if (warmLvl > 0) {
          fresh.resources!.atp = (fresh.resources!.atp || 0) + warmLvl * 5;
          fresh.resources!.glucose = (fresh.resources!.glucose || 0) + warmLvl * 5;
          fresh.resources!.proteins = (fresh.resources!.proteins || 0) + warmLvl * 5;
          fresh.resources!.lipids = (fresh.resources!.lipids || 0) + warmLvl * 5;
        }
        // Ancestral Bounty: +10 of every resource per level
        const ancestralLvl = s.upgrades["ancestral_bounty"] || 0;
        if (ancestralLvl > 0) {
          for (const r of Object.keys(fresh.resources!)) {
            fresh.resources![r] = (fresh.resources![r] || 0) + ancestralLvl * 10;
          }
        }
        // Frontier Spirit: +10 starting pop per level
        const frontierLvl = s.upgrades["frontier_spirit"] || 0;
        let startingPop = 8 + frontierLvl * 10;
        let startingMaxPop = startingPop;
        // Active challenge startPop override (debuff)
        if (s.activeChallenge) {
          const ch = CHALLENGE_MAP[s.activeChallenge];
          if (ch && ch.debuff.effects.startPop !== undefined) {
            startingPop = ch.debuff.effects.startPop;
            startingMaxPop = startingPop;
          }
        }
        fresh.population = startingPop;
        fresh.maxPopulation = startingMaxPop;

        const metaState: Partial<GameState> = {
          evolutionPoints: s.evolutionPoints + epEarned,
          totalRuns: s.totalRuns + 1,
          galacticWins: s.galacticWins + (s.stageIndex >= 6 ? 1 : 0),
          archive,
          archivedArchetypes,
          upgrades: s.upgrades,
          storyUnlocked: { ...s.storyUnlocked, god_opens_its_eyes: true },
          storyAcknowledged: s.storyAcknowledged,
          unlockedLayers: s.unlockedLayers,
          stageClearCounts: s.stageClearCounts,
          fastestCellClear: s.fastestCellClear,
          totalEventsResolved: s.totalEventsResolved,
          totalPlayTime: s.totalPlayTime,
          totalActions: s.totalActions,
          totalSystemsBuilt: s.totalSystemsBuilt,
          totalTechResearched: s.totalTechResearched,
          achievements: s.achievements,
          newAchievements: s.newAchievements,
          // Layer 1 — Challenges
          unlockedChallenges: newUnlockedChallenges,
          activeChallenge: null, // challenge ends on prestige (failed or completed)
          completedChallenges: s.completedChallenges || {},
          challengeRepeatCounts: newChallengeRepeatCounts,
          showChallenges: false,
          // Reset auto-action timers
          autoTimers: { system: 0, tech: 0, evolve: 0, challenge: 0 },

          // Layer 2 — Enlightenment (persist meta state, currency accrues)
          divinity: (s.divinity || 0) + divinityGain,
          foresightNodes: s.foresightNodes || {},
          activeForesightRoute: s.activeForesightRoute,
          showEnlightenment: false,

          // Layer 3 — Transcendence (persist purchases + scripts; reset per-run timers)
          transcendenceOfferingsUsed: s.transcendenceOfferingsUsed || {},
          purchasedRituals: s.purchasedRituals || {},
          activeTemporaryRituals: {}, // reset per-run
          activeScripts: s.activeScripts || {},
          bloodPactsUsed: {}, // reset per-run
          scriptTimers: {}, // reset per-run
          showTranscendence: false,

          // Layer 4 — Genesis (persist authored worlds; reset pending config)
          genesisSeeds: (s.genesisSeeds || 0) + genesisSeedGain,
          authoredWorlds: s.authoredWorlds || [],
          pendingWorldConfig: {},
          showGenesis: false,

          // Layer 5 — Apotheosis (persist laws + worship mode + heresy response; reset heresy + miracle timers)
          faith: s.faith || 0,
          enactedDivineLaws: s.enactedDivineLaws || {},
          activeWorshipMode: s.activeWorshipMode,
          performedMiracles: {}, // reset per-run
          miracleTimers: {}, // reset per-run
          heresy: 0, // reset per-run
          activeHeresyResponse: s.activeHeresyResponse || "hr_ignore",
          showApotheosis: false,

          // Layer 6 — Singularity (persist relics + cores; reset timers)
          singularityCores: (s.singularityCores || 0) + singularityCoreGain,
          equippedRelics: s.equippedRelics || {},
          activeLogicCores: s.activeLogicCores || {},
          logicCoreTimers: {}, // reset per-run
          showSingularity: false,

          // Layer 7 — Omnipotence (persist equipped hybrids + stance; reset instability)
          equippedHybrids: s.equippedHybrids || {},
          activeOmnipotenceStance: s.activeOmnipotenceStance || "balanced",
          instability: 0, // reset per-run
          peakInstability: 0, // reset per-run
          showOmnipotence: false,

          // Layer 8 — Divinity (persist channels + mask + polarity; prayer accrues)
          prayer: (s.prayer || 0), // currency persists (it accrues like divinity)
          prayerChannelLevels: s.prayerChannelLevels || {},
          activeDivineMask: s.activeDivineMask,
          activeWorshipPolarity: s.activeWorshipPolarity,
          showDivinityLayer: false,

          // Layer 9 — Infinity (persist echoes + purchased echoes; reset forks + debts per-run)
          echoes: (s.echoes || 0) + echoGain,
          purchasedEchoes: s.purchasedEchoes || {},
          resolvedForks: {}, // reset per-run
          takenFutureDebts: {}, // reset per-run
          repaidFutureDebts: {}, // reset per-run
          showInfinity: false,

          // Layer 10 — Eternity (persist clauses + canonizations + weaves + cosmic boon; reset ending)
          testamentClauses: (s.testamentClauses || 0) + testamentGain,
          purchasedTestamentClauses: s.purchasedTestamentClauses || {},
          activeCanonizations: s.activeCanonizations || {},
          activePermanenceWeaves: s.activePermanenceWeaves || {},
          chosenEnding: null, // reset per-run (player can choose again)
          cosmicBoonStacks: (s.cosmicBoonStacks || 0) +
            (s.chosenEnding === "reset" ? 1 : 0), // stack on each Reset Universe ending
          showEternity: false,

          // ===== QUICK WINS — prestige reset rules =====
          // prestigePoints is a universal currency — persists across prestiges
          prestigePoints: s.prestigePoints || 0,
          // Active ability cooldowns persist (real-time cooldowns); effect timers reset (per-run)
          activeAbilityCooldowns: s.activeAbilityCooldowns || {},
          activeAbilityEffects: {}, // reset per-run
          // Ritual combo tracking — reset per-run (lastRitualTime is game time)
          lastRitualTime: 0,
          lastRitualId: null,
          ritualComboCount: 0,
          ritualComboTimer: 0,
          // Layer event timers — reset per-run
          layerEventTimers: { trial_of_fortune: 0, vision: 0, divine_whim: 0, heresy_surge: 0 },
        };

        // Check achievements after prestige
        const postState = { ...s, ...metaState } as GameState;
        const achResult = checkAchievements(postState);
        metaState.achievements = achResult.earned;
        if (achResult.newOnes.length > 0) {
          metaState.newAchievements = [...(s.newAchievements || []), ...achResult.newOnes];
        }

        set({
          ...fresh,
          ...metaState,
          currentTab: "actions",
          speed: 1,
          paused: false,
          showShop: false,
          showEvolve: false,
          activeStoryPopup: s.totalRuns === 0 ? "god_opens_its_eyes" : null,
          hasSeenIntro: true,
          lastSaved: Date.now(),
          tutorialActive: false,
        });
        get().addToLog(`Prestige! Earned ${epEarned} Evolution Points.`);
        if (isFirstGalacticWin) {
          get().addToLog("Layer 1 trials unlocked. Visit the Trials button to begin a Challenge.");
        }
        if (failedChallenge) {
          get().addToLog(`Trial abandoned: ${CHALLENGE_MAP[failedChallenge]?.name}. You may try again.`);
        }
        if (divinityGain > 0) {
          get().addToLog(`Layer 2: +${divinityGain} Divinity accrued (Enlightenment).`);
        }
        if (genesisSeedGain > 0) {
          get().addToLog(`Layer 4: +${genesisSeedGain} Genesis Seeds (Genesis).`);
        }
        if (singularityCoreGain > 0) {
          get().addToLog(`Layer 6: +${singularityCoreGain} Singularity Cores (Singularity).`);
        }
        if (echoGain > 0) {
          get().addToLog(`Layer 9: +${echoGain} Echoes (Infinity).`);
        }
        if (testamentGain > 0) {
          get().addToLog(`Layer 10: +${testamentGain} Testament Clauses (Eternity).`);
        }
      },

      setTab: (tab) => set({ currentTab: tab }),
      setSpeed: (speed) => set({ speed }),
      togglePause: () => set((s) => ({ paused: !s.paused })),
      setShowShop: (v) => set({ showShop: v }),
      setShowEvolve: (v) => set({ showEvolve: v }),
      setShowSettings: (v) => set({ showSettings: v }),
      setShowChallenges: (v) => set({ showChallenges: v }),
      setShowEnlightenment: (v) => set({ showEnlightenment: v }),
      setShowTranscendence: (v) => set({ showTranscendence: v }),
      setShowGenesis: (v) => set({ showGenesis: v }),
      setShowApotheosis: (v) => set({ showApotheosis: v }),
      setShowSingularity: (v) => set({ showSingularity: v }),
      setShowOmnipotence: (v) => set({ showOmnipotence: v }),
      setShowDivinityLayer: (v) => set({ showDivinityLayer: v }),
      setShowInfinity: (v) => set({ showInfinity: v }),
      setShowEternity: (v) => set({ showEternity: v }),

      // ---- Layer 1: Challenges ----
      // Activating a challenge records the current repeat level (= completed count).
      // Each repeat makes the debuff 20% stronger AND the eventual mastery bonus 50% bigger.
      setActiveChallenge: (challengeId) => {
        const s = get();
        if (!challengeId) {
          // Clearing an active challenge without completing it.
          if (s.activeChallenge) {
            const newRepeatCounts = { ...(s.challengeRepeatCounts || {}) };
            delete newRepeatCounts[s.activeChallenge];
            set({ activeChallenge: null, challengeRepeatCounts: newRepeatCounts });
          } else {
            set({ activeChallenge: null });
          }
          return;
        }
        const ch = CHALLENGE_MAP[challengeId];
        if (!ch) return;
        if (!s.unlockedChallenges) return;

        const hasMastery = (s.upgrades["challenge_mastery"] || 0) > 0;
        const maxRepeats = getMaxRepeats(hasMastery);
        const completed = s.completedChallenges?.[challengeId] || 0;
        if (completed >= maxRepeats) {
          get().addToLog(`${ch.name} already mastered ${maxRepeats} times. No more repeats available.`);
          return;
        }

        // Block starting if the player is already past the completeWhen condition (prevents cheese).
        const alreadyComplete = checkChallengeComplete(ch, s);
        if (alreadyComplete) {
          get().addToLog(`Cannot start ${ch.name}: your current state already meets its goal. Prestige or progress further first.`);
          return;
        }

        set({
          activeChallenge: challengeId,
          challengeRepeatCounts: {
            ...(s.challengeRepeatCounts || {}),
            [challengeId]: completed, // next repeat = completed count
          },
        });
        get().addToLog(`Trial begun: ${ch.name} (repeat ${completed + 1}/${maxRepeats}).`);
      },

      // ============ LAYER 2 — ENLIGHTENMENT (FORESIGHT) ============
      purchaseForesightNode: (nodeId) => {
        const s = get();
        if (!s.unlockedLayers?.enlightenment) return;
        const node = FORESIGHT_NODE_MAP[nodeId];
        if (!node) return;
        if (s.foresightNodes?.[nodeId]) return;
        if (node.requires && !s.foresightNodes?.[node.requires]) return;
        if ((s.divinity || 0) < node.cost) return;
        set({
          divinity: (s.divinity || 0) - node.cost,
          foresightNodes: { ...(s.foresightNodes || {}), [nodeId]: true },
          // QUICK WIN 5 — +1 Prestige Point for purchasing a foresight node
          prestigePoints: (s.prestigePoints || 0) + 1,
        });
        get().addToLog(`Foresight: purchased ${node.name} (-${node.cost} Divinity). (+1 PP)`);
      },

      setForesightRoute: (routeId) => {
        const s = get();
        if (!s.unlockedLayers?.enlightenment) return;
        if (routeId !== null && !FORESIGHT_ROUTE_MAP[routeId]) return;
        set({ activeForesightRoute: routeId });
        const r = routeId ? FORESIGHT_ROUTE_MAP[routeId] : null;
        get().addToLog(r ? `Foresight route chosen: ${r.name}.` : "Foresight route cleared.");
      },

      // ============ LAYER 3 — TRANSCENDENCE ============
      performOffering: (offeringId) => {
        const s = get();
        if (!s.unlockedLayers?.transcendence) return;
        const o = OFFERING_MAP[offeringId];
        if (!o) return;
        const res = { ...s.resources };
        for (const [r, v] of Object.entries(o.cost)) {
          if ((res[r] || 0) < (v as number)) return;
        }
        for (const [r, v] of Object.entries(o.cost)) {
          res[r] -= v as number;
        }
        const repeats = s.transcendenceOfferingsUsed?.[offeringId] || 0;
        const gain = offeringDivinityAtRepeat(o, repeats);
        set({
          resources: res,
          divinity: (s.divinity || 0) + gain,
          transcendenceOfferingsUsed: {
            ...(s.transcendenceOfferingsUsed || {}),
            [offeringId]: repeats + 1,
          },
        });
        get().addToLog(`Offering: ${o.name} (+${gain} Divinity).`);
      },

      performRitual: (ritualId) => {
        const s = get();
        if (!s.unlockedLayers?.transcendence) return;
        const r = RITUAL_MAP[ritualId];
        if (!r) return;
        if (r.kind === "permanent") {
          if (s.purchasedRituals?.[ritualId]) return;
        } else {
          if ((s.activeTemporaryRituals?.[ritualId] || 0) > 0) return;
        }
        if ((s.divinity || 0) < r.cost) return;

        // QUICK WIN 3 — Ritual combo tracking: 3 different rituals within 60s grants +50% production for 30s
        const now = s.time;
        const sinceLast = now - (s.lastRitualTime || 0);
        let comboCount = s.ritualComboCount || 0;
        let comboTimer = s.ritualComboTimer || 0;
        // Reset combo if more than 60s since last ritual, or if same ritual as last
        if (sinceLast > 60 || s.lastRitualId === ritualId) {
          comboCount = 0;
        }
        comboCount += 1;
        // When combo hits 3 (3 different rituals within 60s), grant Divine Combo bonus
        if (comboCount >= 3) {
          comboTimer = 30; // +50% all production for 30s
          comboCount = 0;
          setTimeout(() => get().addToLog("🌟 Divine Combo! +50% all production for 30s."), 0);
        } else {
          setTimeout(() => get().addToLog(`Ritual combo: ${comboCount}/3 — perform ${3 - comboCount} more different ritual(s) within ${Math.max(0, 60 - sinceLast).toFixed(0)}s for a Divine Combo.`), 0);
        }

        if (r.kind === "permanent") {
          set({
            divinity: (s.divinity || 0) - r.cost,
            purchasedRituals: { ...(s.purchasedRituals || {}), [ritualId]: true },
            // QUICK WIN 3 — combo tracking
            lastRitualTime: now,
            lastRitualId: ritualId,
            ritualComboCount: comboCount,
            ritualComboTimer: comboTimer,
            // QUICK WIN 5 — +1 Prestige Point for performing a ritual
            prestigePoints: (s.prestigePoints || 0) + 1,
          });
          get().addToLog(`Ritual (permanent): ${r.name} enacted (-${r.cost} Divinity). (+1 PP)`);
        } else {
          set({
            divinity: (s.divinity || 0) - r.cost,
            activeTemporaryRituals: {
              ...(s.activeTemporaryRituals || {}),
              [ritualId]: r.durationSec || 0,
            },
            // QUICK WIN 3 — combo tracking
            lastRitualTime: now,
            lastRitualId: ritualId,
            ritualComboCount: comboCount,
            ritualComboTimer: comboTimer,
            // QUICK WIN 5 — +1 Prestige Point for performing a ritual
            prestigePoints: (s.prestigePoints || 0) + 1,
          });
          get().addToLog(`Ritual (temporary): ${r.name} begun for ${r.durationSec}s (-${r.cost} Divinity). (+1 PP)`);
        }
      },

      toggleScript: (scriptId) => {
        const s = get();
        if (!s.unlockedLayers?.transcendence) return;
        const script = SCRIPTS.find((x) => x.id === scriptId);
        if (!script) return;
        const activeScripts = { ...(s.activeScripts || {}) };
        activeScripts[scriptId] = !activeScripts[scriptId];
        set({ activeScripts });
        get().addToLog(`${script.name} ${activeScripts[scriptId] ? "enabled" : "disabled"}.`);
      },

      performBloodPact: (tierId) => {
        const s = get();
        if (!s.unlockedLayers?.transcendence) return;
        const pact = BLOOD_PACT_MAP[tierId];
        if (!pact) return;
        if (s.bloodPactsUsed?.[tierId]) {
          get().addToLog(`${pact.name} already performed this run.`);
          return;
        }
        if (s.population < pact.popCost) {
          get().addToLog(`Not enough population for ${pact.name} (need ${pact.popCost}).`);
          return;
        }
        set({
          population: s.population - pact.popCost,
          maxPopulation: Math.max(s.maxPopulation || 0, s.population - pact.popCost),
          divinity: (s.divinity || 0) + pact.divinityGain,
          bloodPactsUsed: { ...(s.bloodPactsUsed || {}), [tierId]: true },
          // QUICK WIN 5 — +2 Prestige Points for performing a blood pact (high cost → higher reward)
          prestigePoints: (s.prestigePoints || 0) + 2,
        });
        get().addToLog(`Blood Pact: ${pact.name} (-${pact.popCost} pop, +${pact.divinityGain} Divinity). (+2 PP)`);
      },

      // ============ LAYER 4 — GENESIS ============
      setPendingWorldConfig: (cfg) => {
        const s = get();
        if (!s.unlockedLayers?.genesis) return;
        set({ pendingWorldConfig: { ...(s.pendingWorldConfig || {}), ...cfg } });
      },

      authorWorld: () => {
        const s = get();
        if (!s.unlockedLayers?.genesis) return;
        const p = s.pendingWorldConfig || {};
        if (!p.cradleWorldId || !p.primeConditionId || !p.sacredGeographyId || !p.dormantSeedId || !p.difficultyTierId) {
          get().addToLog("Select all 5 world components before authoring.");
          return;
        }
        const seedCost = 1;
        if ((s.genesisSeeds || 0) < seedCost) {
          get().addToLog(`Need ${seedCost} Genesis Seed to author a world.`);
          return;
        }
        const world: WorldConfig = {
          id: `world_${Date.now()}`,
          cradleWorldId: p.cradleWorldId!,
          primeConditionId: p.primeConditionId!,
          sacredGeographyId: p.sacredGeographyId!,
          dormantSeedId: p.dormantSeedId!,
          difficultyTierId: p.difficultyTierId!,
          createdAt: Date.now(),
        };
        set({
          genesisSeeds: (s.genesisSeeds || 0) - seedCost,
          authoredWorlds: [...(s.authoredWorlds || []), world],
          pendingWorldConfig: {},
        });
        get().addToLog(`World authored (${world.cradleWorldId}/${world.difficultyTierId}). Permanent bonuses applied.`);
      },

      // ============ LAYER 5 — APOTHEOSIS ============
      enactDivineLaw: (lawId) => {
        const s = get();
        if (!s.unlockedLayers?.apotheosis) return;
        const law = DIVINE_LAW_MAP[lawId];
        if (!law) return;
        if (s.enactedDivineLaws?.[lawId]) return;
        if ((s.faith || 0) < law.faithCost) return;
        set({
          faith: (s.faith || 0) - law.faithCost,
          enactedDivineLaws: { ...(s.enactedDivineLaws || {}), [lawId]: true },
          // QUICK WIN 5 — +1 Prestige Point for enacting a divine law
          prestigePoints: (s.prestigePoints || 0) + 1,
        });
        get().addToLog(`Divine Law enacted: ${law.name} (-${law.faithCost} Faith). (+1 PP)`);
      },

      setWorshipMode: (modeId) => {
        const s = get();
        if (!s.unlockedLayers?.apotheosis) return;
        if (modeId !== null && !WORSHIP_MODE_MAP[modeId]) return;
        set({ activeWorshipMode: modeId });
        const m = modeId ? WORSHIP_MODE_MAP[modeId] : null;
        get().addToLog(m ? `Worship mode: ${m.name}.` : "Worship mode cleared.");
      },

      performMiracle: (miracleId) => {
        const s = get();
        if (!s.unlockedLayers?.apotheosis) return;
        const m = MIRACLE_MAP[miracleId];
        if (!m) return;
        if ((s.faith || 0) < m.faithCost) return;
        if (m.effect === "doubleProduction" && (s.miracleTimers?.[miracleId] || 0) > 0) {
          get().addToLog(`${m.name} already active.`);
          return;
        }
        const res = { ...s.resources };
        let pop = s.population;
        let faith = (s.faith || 0) - m.faithCost;
        let heresy = s.heresy || 0;
        const miracleTimers = { ...(s.miracleTimers || {}) };
        const performedMiracles = { ...(s.performedMiracles || {}), [miracleId]: (s.performedMiracles?.[miracleId] || 0) + 1 };
        switch (m.effect) {
          case "instantFaith":
            faith += m.magnitude;
            break;
          case "instantPop":
            pop += m.magnitude;
            break;
          case "instantResources":
            for (const r of Object.keys(res)) {
              const cap = s.capacities[r] || 0;
              if (cap > 0) res[r] = Math.min(cap, (res[r] || 0) + cap * m.magnitude);
            }
            break;
          case "reduceHeresy":
            heresy = Math.max(0, heresy - m.magnitude);
            break;
          case "doubleProduction":
            miracleTimers[miracleId] = m.magnitude;
            break;
        }
        set({
          resources: res,
          population: pop,
          maxPopulation: Math.max(s.maxPopulation || 0, pop),
          faith,
          heresy,
          miracleTimers,
          performedMiracles,
        });
        get().addToLog(`Miracle: ${m.name}.`);
      },

      setHeresyResponse: (responseId) => {
        const s = get();
        if (!s.unlockedLayers?.apotheosis) return;
        if (!HERESY_RESPONSE_MAP[responseId]) return;
        set({ activeHeresyResponse: responseId });
        const r = HERESY_RESPONSE_MAP[responseId];
        get().addToLog(`Heresy response: ${r.name}.`);
      },

      // ============ LAYER 6 — SINGULARITY ============
      toggleRelicLoadout: (relicId) => {
        const s = get();
        if (!s.unlockedLayers?.singularity) return;
        const relic = RELIC_LOADOUT_MAP[relicId];
        if (!relic) return;
        const equippedRelics = { ...(s.equippedRelics || {}) };
        // Omega shard is exclusive — equipping it unequips everything else
        if (relicId === "relic_omega") {
          if (equippedRelics[relicId]) {
            delete equippedRelics[relicId];
          } else {
            for (const k of Object.keys(equippedRelics)) delete equippedRelics[k];
            equippedRelics[relicId] = true;
          }
        } else {
          // Equipping another relic unequips omega if it's active
          if (equippedRelics.relic_omega) delete equippedRelics.relic_omega;
          if (equippedRelics[relicId]) {
            delete equippedRelics[relicId];
          } else {
            equippedRelics[relicId] = true;
          }
        }
        set({ equippedRelics });
        // QUICK WIN 5 — +1 Prestige Point when binding (equipping) a relic (not on unequip)
        if (equippedRelics[relicId]) {
          set({ prestigePoints: (get().prestigePoints || 0) + 1 });
          get().addToLog(`${relic.name} equipped. (+1 PP)`);
        } else {
          get().addToLog(`${relic.name} unequipped.`);
        }
      },

      toggleLogicCore: (coreId) => {
        const s = get();
        if (!s.unlockedLayers?.singularity) return;
        const core = LOGIC_CORE_MAP[coreId];
        if (!core) return;
        const activeLogicCores = { ...(s.activeLogicCores || {}) };
        activeLogicCores[coreId] = !activeLogicCores[coreId];
        set({ activeLogicCores });
        get().addToLog(`${core.name} ${activeLogicCores[coreId] ? "activated" : "deactivated"}.`);
      },

      // ============ REBUILD L1-6 — NEW MINI-GAME ACTIONS ============
      // ---- Layer 1 — Trial Realms ----
      setActiveTrialRealm: (realmId) => {
        const s = get();
        if (realmId === null) {
          set({ activeTrialRealm: null });
          return;
        }
        if (!TRIAL_REALM_MAP[realmId]) return;
        const realmState = { ...(s.trialRealmState || {}) };
        if (!realmState[realmId]) {
          realmState[realmId] = makeDefaultRealmState(realmId);
        }
        set({ activeTrialRealm: realmId, trialRealmState: realmState });
      },

      realmBreakthrough: () => {
        const s = get();
        const realmId = s.activeTrialRealm;
        if (realmId !== "realm_growth") return;
        const rs = { ...(s.trialRealmState || {}) };
        const st = { ...(rs.realm_growth || makeDefaultRealmState("realm_growth")) };
        if ((st.energy || 0) < 100) return;
        st.energy = 0;
        st.breaks = (st.breaks || 0) + 1;
        st.breakCostMult = (st.breakCostMult || 1) * 1.2;
        // Population gain +50% of current population
        const popGain = Math.max(2, Math.floor(s.population * 0.5));
        const newPop = s.population + popGain;
        const trialRealmsCompleted = { ...(s.trialRealmsCompleted || {}) };
        if (st.breaks >= REALM_GROWTH_BREAKS_GOAL) {
          st.completed = true;
          trialRealmsCompleted.realm_growth = true;
          setTimeout(() => get().addToLog(`Realm of Growth conquered! 10 Break-Throughs performed. +10% population growth permanently.`), 0);
        }
        rs.realm_growth = st;
        set({
          population: newPop,
          maxPopulation: Math.max(s.maxPopulation || 0, newPop),
          trialRealmState: rs,
          trialRealmsCompleted,
          activeTrialRealm: st.completed ? null : s.activeTrialRealm,
        });
        get().addToLog(`🌱 Break-Through #${st.breaks}! +${popGain} population.`);
      },

      realmDiscontentAction: (action) => {
        const s = get();
        const realmId = s.activeTrialRealm;
        if (realmId !== "realm_discontent") return;
        const rs = { ...(s.trialRealmState || {}) };
        const st = { ...(rs.realm_discontent || makeDefaultRealmState("realm_discontent")) };
        const resources = { ...s.resources };
        switch (action) {
          case "celebrate":
            st.happiness = Math.min(100, (st.happiness || 50) + 20);
            resources.gold = Math.max(0, (resources.gold || 0) - 10);
            break;
          case "tax":
            st.gold = (st.gold || 0) + 20;
            resources.gold = (resources.gold || 0) + 20;
            st.happiness = Math.max(0, (st.happiness || 50) - 15);
            break;
          case "ignore":
            st.happiness = Math.min(100, (st.happiness || 50) + 5);
            st.gold = (st.gold || 0) + 5;
            resources.gold = (resources.gold || 0) + 5;
            break;
        }
        rs.realm_discontent = st;
        set({ trialRealmState: rs, resources });
      },

      // ---- Layer 2 — Constellation Map ----
      illuminateConstellationNode: (nodeId) => {
        const s = get();
        if (!s.unlockedLayers?.enlightenment) return;
        const node = FORESIGHT_NODE_MAP[nodeId];
        if (!node) return;
        if (s.foresightNodes?.[nodeId]) return;
        if (node.requires && !s.foresightNodes?.[node.requires]) return;
        if ((s.divinity || 0) < node.cost) return;
        set({
          divinity: (s.divinity || 0) - node.cost,
          foresightNodes: { ...(s.foresightNodes || {}), [nodeId]: true },
          constellationNodes: { ...(s.constellationNodes || {}), [nodeId]: true },
          prestigePoints: (s.prestigePoints || 0) + 1,
        });
        get().addToLog(`✦ Illuminated: ${node.name} (-${node.cost} Divinity). (+1 PP)`);
      },

      stargazeReveal: () => {
        const s = get();
        if (!s.unlockedLayers?.enlightenment) return;
        // Costs 25 Divinity — reveals connections (visual only)
        if ((s.divinity || 0) < 25) return;
        const revealed = { ...(s.constellationRevealed || {}) };
        for (const n of FORESIGHT_NODES) revealed[n.id] = true;
        set({ divinity: (s.divinity || 0) - 25, constellationRevealed: revealed });
        get().addToLog("✦ Stargaze: hidden connections revealed (-25 Divinity).");
      },

      supernovaIlluminate: (nodeId) => {
        const s = get();
        if (!s.unlockedLayers?.enlightenment) return;
        // Costs 50 Divinity — illuminates the target node (if affordable) AND auto-illuminates any adjacent already-revealed nodes
        const target = FORESIGHT_NODE_MAP[nodeId];
        if (!target) return;
        if ((s.divinity || 0) < 50) return;
        // Find grid index of the target node and its neighbors (5×4 grid, 20 nodes total)
        const idx = FORESIGHT_NODES.findIndex((n) => n.id === nodeId);
        if (idx < 0) return;
        const row = Math.floor(idx / 5);
        const col = idx % 5;
        const neighborIdx: number[] = [];
        if (col > 0) neighborIdx.push(idx - 1);
        if (col < 4) neighborIdx.push(idx + 1);
        if (row > 0) neighborIdx.push(idx - 5);
        if (row < 3) neighborIdx.push(idx + 5);
        const foresightNodes = { ...(s.foresightNodes || {}) };
        const constellationNodes = { ...(s.constellationNodes || {}) };
        let ignited = 0;
        if (!foresightNodes[nodeId] && (!target.requires || foresightNodes[target.requires])) {
          foresightNodes[nodeId] = true;
          constellationNodes[nodeId] = true;
          ignited++;
        }
        for (const ni of neighborIdx) {
          const nNode = FORESIGHT_NODES[ni];
          if (!nNode || foresightNodes[nNode.id]) continue;
          if (nNode.requires && !foresightNodes[nNode.requires]) continue;
          foresightNodes[nNode.id] = true;
          constellationNodes[nNode.id] = true;
          ignited++;
        }
        set({
          divinity: (s.divinity || 0) - 50,
          foresightNodes,
          constellationNodes,
          prestigePoints: (s.prestigePoints || 0) + ignited,
        });
        get().addToLog(`✦ Supernova: ${ignited} node(s) illuminated (-50 Divinity). (+${ignited} PP)`);
      },

      blackHoleReset: () => {
        const s = get();
        if (!s.unlockedLayers?.enlightenment) return;
        // Refund 50% of spent Divinity (cost basis) and clear all constellation nodes
        let refund = 0;
        for (const n of FORESIGHT_NODES) {
          if (s.foresightNodes?.[n.id]) refund += Math.floor(n.cost * 0.5);
        }
        set({
          divinity: (s.divinity || 0) + refund,
          foresightNodes: {},
          constellationNodes: {},
          constellationRevealed: {},
          activeForesightRoute: null,
        });
        get().addToLog(`✦ Black Hole: refunded ${refund} Divinity. Constellation reset.`);
      },

      // ---- Layer 3 — Divine Market ----
      marketBuyResource: (resourceId, qty) => {
        const s = get();
        if (!s.unlockedLayers?.transcendence) return;
        const price = s.marketPrices?.[resourceId] || 10;
        const totalCost = price * qty;
        if ((s.divinity || 0) < totalCost) return;
        const owned = { ...(s.marketOwnedResources || {}) };
        owned[resourceId] = (owned[resourceId] || 0) + qty;
        set({
          divinity: (s.divinity || 0) - totalCost,
          marketOwnedResources: owned,
        });
        get().addToLog(`🛒 Bought ${qty} ${resourceId} @ ${price.toFixed(1)} Div each (-${totalCost.toFixed(1)} Divinity).`);
      },

      marketSellResource: (resourceId, qty) => {
        const s = get();
        if (!s.unlockedLayers?.transcendence) return;
        const owned = { ...(s.marketOwnedResources || {}) };
        const have = owned[resourceId] || 0;
        if (have < qty) return;
        const price = s.marketPrices?.[resourceId] || 10;
        owned[resourceId] = have - qty;
        if (owned[resourceId] <= 0) delete owned[resourceId];
        set({
          divinity: (s.divinity || 0) + price * qty,
          marketOwnedResources: owned,
        });
        get().addToLog(`🛒 Sold ${qty} ${resourceId} @ ${price.toFixed(1)} Div each (+${(price * qty).toFixed(1)} Divinity).`);
      },

      marketOffering: (resourceId, qty) => {
        // Convert owned market resources → Divinity scaled by current price
        const s = get();
        if (!s.unlockedLayers?.transcendence) return;
        const owned = { ...(s.marketOwnedResources || {}) };
        const have = owned[resourceId] || 0;
        if (have < qty) return;
        const price = s.marketPrices?.[resourceId] || 10;
        // High price → more Divinity per unit
        const gain = Math.floor(qty * price * 1.5);
        owned[resourceId] = have - qty;
        if (owned[resourceId] <= 0) delete owned[resourceId];
        set({
          divinity: (s.divinity || 0) + gain,
          marketOwnedResources: owned,
        });
        get().addToLog(`💎 Offering: ${qty} ${resourceId} → +${gain} Divinity (price ${price.toFixed(1)}).`);
      },

      // ---- Layer 4 — Sacred Grid ----
      placeGridTile: (cellIndex, tileType) => {
        const s = get();
        if (!s.unlockedLayers?.genesis) return;
        if (cellIndex < 0 || cellIndex >= 20) return;
        const grid = (s.worldGrid || Array(20).fill(null)).slice();
        if (grid[cellIndex] !== null) return;
        grid[cellIndex] = tileType;
        // Reveal dormant seeds on adjacent empty cells (1 in 3 chance of a seed appearing)
        const seeds = (s.worldGridSeeds || Array(20).fill(null)).slice();
        const row = Math.floor(cellIndex / 5);
        const col = cellIndex % 5;
        const neighborIdx = [
          col > 0 ? cellIndex - 1 : -1,
          col < 4 ? cellIndex + 1 : -1,
          row > 0 ? cellIndex - 5 : -1,
          row < 3 ? cellIndex + 5 : -1,
        ].filter((i) => i >= 0 && grid[i] === null && !seeds[i]);
        for (const ni of neighborIdx) {
          if (Math.random() < 0.33) seeds[ni] = "seed_dormant";
        }
        set({ worldGrid: grid, worldGridSeeds: seeds });
        get().addToLog(`🗺️ Placed ${tileType} tile on cell ${cellIndex + 1}.`);
      },

      resetWorldGrid: () => {
        const s = get();
        if (!s.unlockedLayers?.genesis) return;
        set({ worldGrid: Array(20).fill(null), worldGridSeeds: Array(20).fill(null) });
        get().addToLog("🗺️ Sacred Grid reset.");
      },

      // ---- Layer 5 — Heresy Web ----
      convertFollower: (cellIndex) => {
        const s = get();
        if (!s.unlockedLayers?.apotheosis) return;
        if (cellIndex < 0 || cellIndex >= 32) return;
        const grid = (s.followerGrid || makeInitialFollowerGrid()).map((c) => ({ ...c }));
        if (grid[cellIndex].state === "faithful") return; // already faithful
        const cost = 5;
        if ((s.divinity || 0) < cost) return;
        grid[cellIndex].state = "faithful";
        set({ divinity: (s.divinity || 0) - cost, followerGrid: grid });
      },

      purgeFollower: (cellIndex) => {
        const s = get();
        if (!s.unlockedLayers?.apotheosis) return;
        if (cellIndex < 0 || cellIndex >= 32) return;
        const grid = (s.followerGrid || makeInitialFollowerGrid()).map((c) => ({ ...c }));
        if (grid[cellIndex].state === "empty") return;
        grid[cellIndex].state = "empty";
        // Faith drop minor
        const faithDrop = 2;
        set({ followerGrid: grid, faith: Math.max(0, (s.faith || 0) - faithDrop) });
      },

      initFollowerGrid: () => {
        const s = get();
        if (!s.unlockedLayers?.apotheosis) return;
        set({ followerGrid: makeInitialFollowerGrid() });
        get().addToLog("Flock restored to 32 faithful followers.");
      },

      // ---- Layer 6 — Dimension Engine ----
      setDimensionSpeed: (dimId, speed) => {
        const s = get();
        if (!s.unlockedLayers?.singularity) return;
        const dims = (s.dimensions || makeInitialDimensions()).map((d) => ({ ...d }));
        const d = dims.find((x) => x.id === dimId);
        if (!d) return;
        if (![1, 0.5, 0.25].includes(speed)) return;
        d.speed = speed;
        set({ dimensions: dims });
      },

      syncDimension: (fromId, toId) => {
        const s = get();
        if (!s.unlockedLayers?.singularity) return;
        const cost = 50;
        if ((s.divinity || 0) < cost) return;
        const dims = (s.dimensions || makeInitialDimensions()).map((d) => ({ ...d }));
        const from = dims.find((x) => x.id === fromId);
        const to = dims.find((x) => x.id === toId);
        if (!from || !to || from.id === to.id) return;
        // Copy progress: stageIndex and population (not resources — to prevent full duplication)
        to.stageIndex = Math.max(to.stageIndex, from.stageIndex);
        to.pop = Math.max(to.pop, Math.floor(from.pop * 0.5));
        if (from.reachedGalactic) to.reachedGalactic = true;
        set({ divinity: (s.divinity || 0) - cost, dimensions: dims });
        get().addToLog(`🔄 Sync: ${from.name} → ${to.name} (-50 Divinity).`);
      },

      initDimensions: () => {
        const s = get();
        if (!s.unlockedLayers?.singularity) return;
        set({ dimensions: makeInitialDimensions() });
        get().addToLog("Dimension Engine initialized — three parallel timelines.");
      },

      // ============ LAYER 7 — OMNIPOTENCE ============
      toggleHybridLineage: (hybridId) => {
        const s = get();
        if (!s.unlockedLayers?.omnipotence) return;
        const hybrid = HYBRID_LINEAGE_MAP[hybridId];
        if (!hybrid) return;
        const equippedHybrids = { ...(s.equippedHybrids || {}) };
        if (equippedHybrids[hybridId]) {
          delete equippedHybrids[hybridId];
        } else {
          equippedHybrids[hybridId] = true;
        }
        set({ equippedHybrids });
        get().addToLog(`${hybrid.name} ${equippedHybrids[hybridId] ? "equipped" : "unequipped"}.`);
      },

      setOmnipotenceStance: (stanceId) => {
        const s = get();
        if (!s.unlockedLayers?.omnipotence) return;
        const stance = OMNIPOTENCE_STANCE_MAP[stanceId as OmnipotenceStanceId];
        if (!stance) return;
        set({ activeOmnipotenceStance: stanceId });
        get().addToLog(`Stance: ${stance.name}.`);
      },

      // ============ LAYER 8 — DIVINITY (LAYER) ============
      levelPrayerChannel: (channelId) => {
        const s = get();
        if (!s.unlockedLayers?.divinity) return;
        const channel = PRAYER_CHANNEL_MAP[channelId];
        if (!channel) return;
        const curLevel = s.prayerChannelLevels?.[channelId] || 0;
        if (curLevel >= channel.maxLevel) return;
        const cost = prayerChannelCost(channel, curLevel);
        if ((s.prayer || 0) < cost) return;
        set({
          prayer: (s.prayer || 0) - cost,
          prayerChannelLevels: {
            ...(s.prayerChannelLevels || {}),
            [channelId]: curLevel + 1,
          },
        });
        get().addToLog(`Prayer Channel leveled: ${channel.name} → ${curLevel + 1}.`);
      },

      setDivineMask: (maskId) => {
        const s = get();
        if (!s.unlockedLayers?.divinity) return;
        if (maskId !== null && !DIVINE_MASK_MAP[maskId]) return;
        set({ activeDivineMask: maskId });
        const m = maskId ? DIVINE_MASK_MAP[maskId] : null;
        get().addToLog(m ? `Divine Mask: ${m.name}.` : "Divine Mask cleared.");
      },

      setWorshipPolarity: (polarityId) => {
        const s = get();
        if (!s.unlockedLayers?.divinity) return;
        if (polarityId !== null && !WORSHIP_POLARITY_MAP[polarityId]) return;
        set({ activeWorshipPolarity: polarityId });
        const p = polarityId ? WORSHIP_POLARITY_MAP[polarityId] : null;
        get().addToLog(p ? `Worship Polarity: ${p.name}.` : "Worship Polarity cleared.");
      },

      // ============ LAYER 9 — INFINITY ============
      purchaseEcho: (echoId) => {
        const s = get();
        if (!s.unlockedLayers?.infinity) return;
        const echo = ECHO_TYPE_MAP[echoId];
        if (!echo) return;
        if (s.purchasedEchoes?.[echoId]) return;
        if ((s.echoes || 0) < echo.cost) return;
        set({
          echoes: (s.echoes || 0) - echo.cost,
          purchasedEchoes: { ...(s.purchasedEchoes || {}), [echoId]: true },
        });
        get().addToLog(`Echo purchased: ${echo.name} (-${echo.cost} Echoes).`);
      },

      resolveFork: (forkId, branchId) => {
        const s = get();
        if (!s.unlockedLayers?.infinity) return;
        const fork = FORK_SCENARIO_MAP[forkId];
        if (!fork) return;
        if (s.resolvedForks?.[forkId]) return; // already resolved
        const branch = fork.branches.find((b) => b.id === branchId);
        if (!branch) return;
        set({
          resolvedForks: { ...(s.resolvedForks || {}), [forkId]: branchId },
        });
        get().addToLog(`Fork resolved: ${fork.name} → ${branch.label}.`);
      },

      takeFutureDebt: (debtId) => {
        const s = get();
        if (!s.unlockedLayers?.infinity) return;
        const debt = FUTURE_DEBT_TIER_MAP[debtId];
        if (!debt) return;
        if (s.takenFutureDebts?.[debtId]) return;
        set({
          takenFutureDebts: { ...(s.takenFutureDebts || {}), [debtId]: true },
        });
        get().addToLog(`Future Debt taken: ${debt.name}. Repay ${debt.repaymentCost} Echoes later.`);
      },

      repayFutureDebt: (debtId) => {
        const s = get();
        if (!s.unlockedLayers?.infinity) return;
        const debt = FUTURE_DEBT_TIER_MAP[debtId];
        if (!debt) return;
        if (!s.takenFutureDebts?.[debtId]) return;
        if (s.repaidFutureDebts?.[debtId]) return;
        if ((s.echoes || 0) < debt.repaymentCost) return;
        set({
          echoes: (s.echoes || 0) - debt.repaymentCost,
          repaidFutureDebts: { ...(s.repaidFutureDebts || {}), [debtId]: true },
        });
        get().addToLog(`Future Debt repaid: ${debt.name} (-${debt.repaymentCost} Echoes).`);
      },

      // ============ LAYER 10 — ETERNITY ============
      purchaseTestamentClause: (clauseId) => {
        const s = get();
        if (!s.unlockedLayers?.eternity) return;
        const clause = TESTAMENT_CLAUSE_MAP[clauseId];
        if (!clause) return;
        if (s.purchasedTestamentClauses?.[clauseId]) return;
        if ((s.testamentClauses || 0) < clause.cost) return;
        set({
          testamentClauses: (s.testamentClauses || 0) - clause.cost,
          purchasedTestamentClauses: { ...(s.purchasedTestamentClauses || {}), [clauseId]: true },
        });
        get().addToLog(`Testament Clause enacted: ${clause.name} (-${clause.cost} Clauses).`);
      },

      toggleCanonization: (canonId) => {
        const s = get();
        if (!s.unlockedLayers?.eternity) return;
        const canon = CANONIZATION_MAP[canonId];
        if (!canon) return;
        const activeCanonizations = { ...(s.activeCanonizations || {}) };
        if (activeCanonizations[canonId]) {
          delete activeCanonizations[canonId];
        } else {
          // Canonization requires payment only on first activation
          if ((s.testamentClauses || 0) < canon.cost) return;
          activeCanonizations[canonId] = true;
          set({
            testamentClauses: (s.testamentClauses || 0) - canon.cost,
            activeCanonizations,
          });
          get().addToLog(`Canonization enacted: ${canon.name} (-${canon.cost} Clauses).`);
          return;
        }
        set({ activeCanonizations });
        get().addToLog(`Canonization removed: ${canon.name}.`);
      },

      togglePermanenceWeave: (weaveId) => {
        const s = get();
        if (!s.unlockedLayers?.eternity) return;
        const weave = PERMANENCE_WEAVE_MAP[weaveId];
        if (!weave) return;
        const activePermanenceWeaves = { ...(s.activePermanenceWeaves || {}) };
        if (activePermanenceWeaves[weaveId]) {
          delete activePermanenceWeaves[weaveId];
        } else {
          if ((s.testamentClauses || 0) < weave.cost) return;
          activePermanenceWeaves[weaveId] = true;
          set({
            testamentClauses: (s.testamentClauses || 0) - weave.cost,
            activePermanenceWeaves,
          });
          get().addToLog(`Permanence Weave enacted: ${weave.name} (-${weave.cost} Clauses).`);
          return;
        }
        set({ activePermanenceWeaves });
        get().addToLog(`Permanence Weave removed: ${weave.name}.`);
      },

      chooseEnding: (endingId) => {
        const s = get();
        if (!s.unlockedLayers?.eternity) return;
        const ending = ENDING_CHOICE_MAP[endingId];
        if (!ending) return;
        set({ chosenEnding: endingId });
        get().addToLog(`Ending chosen: ${ending.name}. ${ending.desc}`);
        if (endingId === "reset") {
          // Trigger an immediate prestige to begin the fresh universe.
          setTimeout(() => {
            get().addToLog("The universe is reset. A new cosmos stirs.");
            get().triggerPrestige();
          }, 0);
        }
      },

      // ============ THEME CUSTOMIZATION (Part 1) ============
      setStageTheme: (id) => {
        const s = get();
        const unlocked = s.unlockedThemes || { "stage-cell": true };
        if (!unlocked[id]) {
          get().addToLog(`Theme ${id} is locked.`);
          return;
        }
        set({ activeStageTheme: id });
        get().addToLog(`Stage theme: ${id}.`);
      },

      setLayerTheme: (id) => {
        const s = get();
        if (id === null) {
          set({ activeLayerTheme: null });
          get().addToLog("Layer overlay cleared.");
          return;
        }
        const unlocked = s.unlockedThemes || { "stage-cell": true };
        if (!unlocked[id]) {
          get().addToLog(`Overlay ${id} is locked.`);
          return;
        }
        set({ activeLayerTheme: id });
        get().addToLog(`Divine overlay: ${id}.`);
      },

      setSpecialTheme: (id) => {
        const s = get();
        if (id === null) {
          set({ activeSpecialTheme: null });
          get().addToLog("Special theme cleared — reverting to stage+layer theme.");
          return;
        }
        const unlocked = s.unlockedThemes || { "stage-cell": true };
        if (!unlocked[id]) {
          get().addToLog(`Special theme ${id} is locked.`);
          return;
        }
        set({ activeSpecialTheme: id });
        get().addToLog(`Special theme: ${id}.`);
      },

      // ===== QUICK WINS =====
      // WIN 2 — useActiveAbility: triggers the active ability for a given prestige layer
      useActiveAbility: (layerId) => {
        const s = get();
        const ability = ACTIVE_ABILITY_MAP[layerId];
        if (!ability) return;
        // Must have the layer unlocked
        if (layerId !== "evolution") {
          if (!s.unlockedLayers?.[layerId]) return;
        } else {
          // Layer 1 (Evolution) requires unlockedChallenges (first Galactic win) — keeps it as a meaningful perk
          if (!s.unlockedChallenges) return;
        }
        // Check cooldown
        const cooldowns = { ...(s.activeAbilityCooldowns || {}) };
        if ((cooldowns[ability.id] || 0) > 0) return;

        // Apply effect
        const patch: Partial<GameState> = {};
        const effectsPatch: Record<string, number> = { ...(s.activeAbilityEffects || {}) };
        switch (ability.effect.kind) {
          case "instant_pop": {
            const pop = s.population + (ability.effect.magnitude || 0);
            patch.population = pop;
            patch.maxPopulation = Math.max(s.maxPopulation || 0, pop);
            break;
          }
          case "instant_divinity": {
            patch.divinity = (s.divinity || 0) + (ability.effect.magnitude || 0);
            break;
          }
          case "temp_surge": {
            effectsPatch["surge"] = ability.effect.durationSec || 10;
            break;
          }
          case "instant_genesis_seed": {
            patch.genesisSeeds = (s.genesisSeeds || 0) + (ability.effect.magnitude || 1);
            break;
          }
          case "reduce_heresy": {
            patch.heresy = Math.max(0, (s.heresy || 0) - (ability.effect.magnitude || 0));
            break;
          }
          case "temp_overclock": {
            effectsPatch["overclock"] = ability.effect.durationSec || 15;
            break;
          }
        }
        // Set cooldown
        cooldowns[ability.id] = ability.cooldownSec;
        patch.activeAbilityCooldowns = cooldowns;
        patch.activeAbilityEffects = effectsPatch;
        set(patch);
        get().addToLog(`${ability.name} activated! (${ability.cooldownSec}s cooldown)`);
      },

      // WIN 5 — buyUniversalUpgrade: spends Prestige Points on universal upgrades
      buyUniversalUpgrade: (upgradeId) => {
        const s = get();
        const up = UPGRADE_MAP[upgradeId];
        if (!up) return;
        if (up.category !== "universal") return;
        const owned = s.upgrades[upgradeId] || 0;
        if (owned >= up.maxLevel) return;
        const cost = upgradeCost(up, owned);
        if ((s.prestigePoints || 0) < cost) return;
        const upgrades = { ...s.upgrades, [upgradeId]: owned + 1 };
        set({
          prestigePoints: (s.prestigePoints || 0) - cost,
          upgrades,
        });
        get().addToLog(`Purchased ${up.name} (Lv ${owned + 1}) for ${cost} Prestige Points.`);
      },

      dismissTutorial: () => set({ tutorialActive: false, tutorialDismissed: true }),
      setEventFrequency: (freq) => set({ eventFrequency: freq }),

      resolveEvent: (eventId, choiceId) => {
        const s = get();
        const ev = EVENT_MAP[eventId];
        if (!ev) {
          set({ activeEvent: null });
          return;
        }
        const choice = ev.choices.find((c) => c.id === choiceId);
        if (!choice) {
          set({ activeEvent: null });
          return;
        }
        // Apply effects
        const res = { ...s.resources };
        if (choice.resourceChanges) {
          for (const [r, v] of Object.entries(choice.resourceChanges)) {
            const cap = s.capacities[r] || Infinity;
            res[r] = Math.max(0, Math.min(cap, (res[r] || 0) + (v as number)));
          }
        }
        let pop = s.population;
        if (choice.populationChange) {
          pop = Math.max(0, pop + choice.populationChange);
        }
        if (choice.happinessChange) {
          const cap = s.capacities.happiness || 100;
          res.happiness = Math.max(0, Math.min(cap, (res.happiness || 0) + choice.happinessChange));
        }
        const archetypeAffinity = { ...s.archetypeAffinity };
        if (choice.affinityChange) {
          for (const ac of choice.affinityChange) {
            archetypeAffinity[ac.archetype] = (archetypeAffinity[ac.archetype] || 0) + ac.amount;
          }
        }
        // Record in event history
        const eventHistory = [
          {
            eventId: ev.id,
            eventName: ev.name,
            eventIcon: ev.icon,
            choiceId: choice.id,
            choiceLabel: choice.label,
            timestamp: Date.now(),
            gameTime: s.time,
          },
          ...(s.eventHistory || []),
        ].slice(0, 50); // keep last 50
        set({
          resources: res,
          population: pop,
          maxPopulation: Math.max(s.maxPopulation || 0, pop),
          archetypeAffinity,
          activeEvent: null,
          eventHistory,
          totalEventsResolved: (s.totalEventsResolved || 0) + 1,
        });
        if (choice.logMsg) get().addToLog(`${ev.name}: ${choice.logMsg}`);

        // Check achievements after event resolution
        const postEventState = get();
        const achResult = checkAchievements(postEventState);
        if (achResult.newOnes.length > 0) {
          set({
            achievements: achResult.earned,
            newAchievements: [...(postEventState.newAchievements || []), ...achResult.newOnes],
          });
        }
      },

      dismissStory: (id) => {
        const s = get();
        const ack = { ...s.storyAcknowledged, [id]: true };
        set({ activeStoryPopup: null, storyAcknowledged: ack });
      },

      dismissAchievementToast: () => {
        set({ newAchievements: [] });
      },

      applyOfflineProgress: () => {
        const s = get();
        if (!s.lastSaved) return null;
        const elapsedSec = Math.floor((Date.now() - s.lastSaved) / 1000);
        // Only apply if away for more than 30 seconds
        if (elapsedSec < 30) return null;
        // Cap: base 24h, +24h per temporal_reserves tier
        const tempReservesLvl = s.upgrades["temporal_reserves"] || 0;
        const maxBank = 86400 + tempReservesLvl * 86400;
        const appliedDt = Math.min(elapsedSec, maxBank);
        if (appliedDt < 30) return null;

        // Snapshot resources before to compute gains
        const before = { ...s.resources };

        // Apply tick at compressed speed (cap at 86400 per call to avoid huge loops)
        // We simulate in chunks of 3600s (1 hour) to stay performant
        const chunkSize = 3600;
        let remaining = appliedDt;
        // Temporarily set speed to 1 and call tick with large dt
        while (remaining > 0) {
          const chunk = Math.min(chunkSize, remaining);
          get().tick(chunk);
          remaining -= chunk;
          // Re-read state in case it changed
          const cur = get();
          if (cur.paused) break;
        }

        const after = get();
        const resourcesGained: Record<string, number> = {};
        for (const r of Object.keys(after.resources)) {
          const gain = (after.resources[r] || 0) - (before[r] || 0);
          if (Math.abs(gain) > 0.01) resourcesGained[r] = gain;
        }

        get().addToLog(`Offline progress: simulated ${Math.floor(appliedDt / 60)}m ${Math.floor(appliedDt % 60)}s away.`);

        return { elapsed: appliedDt, resourcesGained, applied: true };
      },

      addToLog: (msg) => {
        const s = get();
        const ts = new Date().toLocaleTimeString();
        const entry = `[${ts}] ${msg}`;
        const log = [entry, ...s.log].slice(0, 100);
        set({ log });
      },

      hardReset: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
        const fresh = { ...initialRunState(), ...initialMetaState() };
        set(fresh);
      },

      debugUnlockAll: () => {
        const s = get();
        set({
          unlockedChallenges: true,
          galacticWins: Math.max(s.galacticWins, 1),
          enlightenmentUnlocked: true,
          transcendenceUnlocked: true,
          genesisUnlocked: true,
          apotheosisUnlocked: true,
          singularityUnlocked: true,
          omnipotenceUnlocked: true,
          divinityUnlocked: true,
          infinityUnlocked: true,
          eternityUnlocked: true,
          unlockedLayers: {
            evolution: true,
            enlightenment: true,
            transcendence: true,
            genesis: true,
            apotheosis: true,
            singularity: true,
            omnipotence: true,
            divinity: true,
            infinity: true,
            eternity: true,
          },
          evolutionPoints: (s.evolutionPoints || 0) + 1000,
          divinity: (s.divinity || 0) + 500,
        });
        get().addToLog("DEBUG: All prestige layers unlocked. +1000 EP, +500 Divinity granted.");
      },

      saveGame: () => {
        set({ lastSaved: Date.now() });
      },

      loadGame: () => {
        // Handled by persist middleware
      },

      exportSave: () => {
        const s = get();
        return btoa(unescape(encodeURIComponent(JSON.stringify(s))));
      },

      importSave: (data) => {
        try {
          const parsed = JSON.parse(decodeURIComponent(escape(atob(data))));
          set(parsed);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
      version: 8,
      partialize: (s) => s,
      // Migrate old saves (v1, v2, v3) to new structure
      migrate: (persisted: any, version: number) => {
        if (!persisted) return persisted;
        if (version < 2) {
          if (!persisted.systemEnabled) persisted.systemEnabled = {};
          if (!persisted.archetypeAffinity) persisted.archetypeAffinity = {};
          if (persisted.lockedArchetype === undefined) persisted.lockedArchetype = null;
          if (persisted.populationProgress === undefined) persisted.populationProgress = 0;
          if (!persisted.achievements) persisted.achievements = {};
          if (!persisted.newAchievements) persisted.newAchievements = [];
          if (persisted.upgrades) {
            if (persisted.upgrades.auto_balancer === undefined) persisted.upgrades.auto_balancer = 0;
            if (persisted.upgrades.archetype_insight === undefined) persisted.upgrades.archetype_insight = 0;
          }
        }
        // v3 migration: upgrade overhaul (removed quickened_hands, rival_insight)
        // + new Layer-1 challenge state + auto-action timers.
        if (version < 3 && persisted.upgrades) {
          // Remove dead upgrades
          delete persisted.upgrades.quickened_hands;
          delete persisted.upgrades.rival_insight;
          // Ensure every current upgrade entry exists at level 0 if not already present
          for (const up of UPGRADES) {
            if (persisted.upgrades[up.id] === undefined) persisted.upgrades[up.id] = 0;
          }
        }
        // Always ensure achievements fields exist (even on v3)
        if (!persisted.achievements) persisted.achievements = {};
        if (!persisted.newAchievements) persisted.newAchievements = [];
        if (persisted.showSettings === undefined) persisted.showSettings = false;
        if (persisted.tutorialDismissed === undefined) persisted.tutorialDismissed = false;
        if (persisted.maxPopulation === undefined) persisted.maxPopulation = persisted.population || 8;
        if (persisted.fastestCellClear === undefined) persisted.fastestCellClear = 0;
        if (persisted.activeEvent === undefined) persisted.activeEvent = null;
        if (persisted.eventCooldown === undefined) persisted.eventCooldown = 60;
        if (!persisted.eventHistory) persisted.eventHistory = [];
        if (persisted.totalEventsResolved === undefined) persisted.totalEventsResolved = 0;
        if (persisted.totalPlayTime === undefined) persisted.totalPlayTime = 0;
        if (persisted.totalActions === undefined) persisted.totalActions = 0;
        if (persisted.totalSystemsBuilt === undefined) persisted.totalSystemsBuilt = 0;
        if (persisted.totalTechResearched === undefined) persisted.totalTechResearched = 0;
        if (!persisted.eventFrequency) persisted.eventFrequency = "normal";
        // v3: Layer 1 challenge state
        if (persisted.unlockedChallenges === undefined) persisted.unlockedChallenges = false;
        if (persisted.activeChallenge === undefined) persisted.activeChallenge = null;
        if (!persisted.completedChallenges) persisted.completedChallenges = {};
        if (!persisted.challengeRepeatCounts) persisted.challengeRepeatCounts = {};
        if (persisted.showChallenges === undefined) persisted.showChallenges = false;
        // v3: auto-action timers
        if (!persisted.autoTimers) persisted.autoTimers = { system: 0, tech: 0, evolve: 0, challenge: 0 };

        // v4 migration: Layers 2-6 state fields
        // Layer 2 — Enlightenment (Foresight)
        if (persisted.divinity === undefined) persisted.divinity = 0;
        if (!persisted.foresightNodes) persisted.foresightNodes = {};
        if (persisted.activeForesightRoute === undefined) persisted.activeForesightRoute = null;
        if (persisted.showEnlightenment === undefined) persisted.showEnlightenment = false;
        // Layer 3 — Transcendence
        if (!persisted.transcendenceOfferingsUsed) persisted.transcendenceOfferingsUsed = {};
        if (!persisted.purchasedRituals) persisted.purchasedRituals = {};
        if (!persisted.activeTemporaryRituals) persisted.activeTemporaryRituals = {};
        if (!persisted.activeScripts) persisted.activeScripts = {};
        if (!persisted.bloodPactsUsed) persisted.bloodPactsUsed = {};
        if (!persisted.scriptTimers) persisted.scriptTimers = {};
        if (persisted.showTranscendence === undefined) persisted.showTranscendence = false;
        // Layer 4 — Genesis
        if (persisted.genesisSeeds === undefined) persisted.genesisSeeds = 0;
        if (!persisted.authoredWorlds) persisted.authoredWorlds = [];
        if (!persisted.pendingWorldConfig) persisted.pendingWorldConfig = {};
        if (persisted.showGenesis === undefined) persisted.showGenesis = false;
        // Layer 5 — Apotheosis
        if (persisted.faith === undefined) persisted.faith = 0;
        if (!persisted.enactedDivineLaws) persisted.enactedDivineLaws = {};
        if (persisted.activeWorshipMode === undefined) persisted.activeWorshipMode = null;
        if (!persisted.performedMiracles) persisted.performedMiracles = {};
        if (!persisted.miracleTimers) persisted.miracleTimers = {};
        if (persisted.heresy === undefined) persisted.heresy = 0;
        if (persisted.activeHeresyResponse === undefined) persisted.activeHeresyResponse = "hr_ignore";
        if (persisted.showApotheosis === undefined) persisted.showApotheosis = false;
        // Layer 6 — Singularity
        if (persisted.singularityCores === undefined) persisted.singularityCores = 0;
        if (!persisted.equippedRelics) persisted.equippedRelics = {};
        if (!persisted.activeLogicCores) persisted.activeLogicCores = {};
        if (!persisted.logicCoreTimers) persisted.logicCoreTimers = {};
        if (persisted.showSingularity === undefined) persisted.showSingularity = false;
        // unlockedLayers should always exist (v3+); ensure all 10 layer flags exist
        if (!persisted.unlockedLayers) persisted.unlockedLayers = { evolution: true };
        if (persisted.unlockedLayers.enlightenment === undefined) persisted.unlockedLayers.enlightenment = false;
        if (persisted.unlockedLayers.transcendence === undefined) persisted.unlockedLayers.transcendence = false;
        if (persisted.unlockedLayers.genesis === undefined) persisted.unlockedLayers.genesis = false;
        if (persisted.unlockedLayers.apotheosis === undefined) persisted.unlockedLayers.apotheosis = false;
        if (persisted.unlockedLayers.singularity === undefined) persisted.unlockedLayers.singularity = false;

        // v5 migration: Layers 7-10 state fields
        // Layer 7 — Omnipotence
        if (!persisted.equippedHybrids) persisted.equippedHybrids = {};
        if (persisted.activeOmnipotenceStance === undefined) persisted.activeOmnipotenceStance = "balanced";
        if (persisted.instability === undefined) persisted.instability = 0;
        if (persisted.peakInstability === undefined) persisted.peakInstability = 0;
        if (persisted.showOmnipotence === undefined) persisted.showOmnipotence = false;
        if (persisted.unlockedLayers.omnipotence === undefined) persisted.unlockedLayers.omnipotence = false;
        // Layer 8 — Divinity (layer)
        if (persisted.prayer === undefined) persisted.prayer = 0;
        if (!persisted.prayerChannelLevels) persisted.prayerChannelLevels = {};
        if (persisted.activeDivineMask === undefined) persisted.activeDivineMask = null;
        if (persisted.activeWorshipPolarity === undefined) persisted.activeWorshipPolarity = null;
        if (persisted.showDivinityLayer === undefined) persisted.showDivinityLayer = false;
        if (persisted.unlockedLayers.divinity === undefined) persisted.unlockedLayers.divinity = false;
        // Layer 9 — Infinity
        if (persisted.echoes === undefined) persisted.echoes = 0;
        if (!persisted.purchasedEchoes) persisted.purchasedEchoes = {};
        if (!persisted.resolvedForks) persisted.resolvedForks = {};
        if (!persisted.takenFutureDebts) persisted.takenFutureDebts = {};
        if (!persisted.repaidFutureDebts) persisted.repaidFutureDebts = {};
        if (persisted.showInfinity === undefined) persisted.showInfinity = false;
        if (persisted.unlockedLayers.infinity === undefined) persisted.unlockedLayers.infinity = false;
        // Layer 10 — Eternity
        if (persisted.testamentClauses === undefined) persisted.testamentClauses = 0;
        if (!persisted.purchasedTestamentClauses) persisted.purchasedTestamentClauses = {};
        if (!persisted.activeCanonizations) persisted.activeCanonizations = {};
        if (!persisted.activePermanenceWeaves) persisted.activePermanenceWeaves = {};
        if (persisted.chosenEnding === undefined) persisted.chosenEnding = null;
        if (persisted.cosmicBoonStacks === undefined) persisted.cosmicBoonStacks = 0;
        if (persisted.showEternity === undefined) persisted.showEternity = false;
        if (persisted.unlockedLayers.eternity === undefined) persisted.unlockedLayers.eternity = false;

        // v6 migration: Theme customization fields
        if (persisted.activeStageTheme === undefined) persisted.activeStageTheme = "stage-cell";
        if (persisted.activeLayerTheme === undefined) persisted.activeLayerTheme = null;
        if (persisted.activeSpecialTheme === undefined) persisted.activeSpecialTheme = null;
        if (!persisted.unlockedThemes) persisted.unlockedThemes = { "stage-cell": true };

        // v7 migration: Quick Wins — active abilities, ritual combos, prestige points, layer event timers
        if (!persisted.activeAbilityCooldowns) persisted.activeAbilityCooldowns = {};
        if (!persisted.activeAbilityEffects) persisted.activeAbilityEffects = {};
        if (persisted.lastRitualTime === undefined) persisted.lastRitualTime = 0;
        if (persisted.lastRitualId === undefined) persisted.lastRitualId = null;
        if (persisted.ritualComboCount === undefined) persisted.ritualComboCount = 0;
        if (persisted.ritualComboTimer === undefined) persisted.ritualComboTimer = 0;
        if (persisted.prestigePoints === undefined) persisted.prestigePoints = 0;
        if (!persisted.layerEventTimers) {
          persisted.layerEventTimers = { trial_of_fortune: 0, vision: 0, divine_whim: 0, heresy_surge: 0 };
        }
        // Ensure the new universal upgrades exist in upgrades record
        if (persisted.upgrades) {
          if (persisted.upgrades.universal_boost === undefined) persisted.upgrades.universal_boost = 0;
          if (persisted.upgrades.universal_speed === undefined) persisted.upgrades.universal_speed = 0;
        }

        // v8 migration: REBUILD L1-6 unique gameplay loops
        if (persisted.activeTrialRealm === undefined) persisted.activeTrialRealm = null;
        if (!persisted.trialRealmState) persisted.trialRealmState = {};
        if (!persisted.trialRealmsCompleted) persisted.trialRealmsCompleted = {};
        if (!persisted.constellationNodes) persisted.constellationNodes = {};
        if (!persisted.constellationRevealed) persisted.constellationRevealed = {};
        if (!persisted.marketPrices) persisted.marketPrices = { food: 10, water: 8, materials: 15, science: 20, gold: 25, energy: 30 };
        if (!persisted.priceHistory) persisted.priceHistory = { food: [10], water: [8], materials: [15], science: [20], gold: [25], energy: [30] };
        if (!persisted.marketOwnedResources) persisted.marketOwnedResources = {};
        if (persisted.marketTickTimer === undefined) persisted.marketTickTimer = 10;
        if (!persisted.worldGrid) persisted.worldGrid = Array(20).fill(null);
        if (!persisted.worldGridSeeds) persisted.worldGridSeeds = Array(20).fill(null);
        if (!persisted.followerGrid) persisted.followerGrid = Array.from({ length: 32 }, () => ({ state: "faithful", type: "follower" }));
        if (persisted.heresySpreadTimer === undefined) persisted.heresySpreadTimer = 10;
        if (!persisted.dimensions) persisted.dimensions = [
          { id: 0, name: "Alpha", speed: 1, pop: 8, stageIndex: 0, resources: 0, reachedGalactic: false },
          { id: 1, name: "Beta", speed: 0.5, pop: 8, stageIndex: 0, resources: 0, reachedGalactic: false },
          { id: 2, name: "Gamma", speed: 0.25, pop: 8, stageIndex: 0, resources: 0, reachedGalactic: false },
        ];
        if (persisted.dimensionRiftTimer === undefined) persisted.dimensionRiftTimer = 60;

        return persisted;
      },
    }
  )
);

// ============ HELPERS ============

function techMultiplier(s: GameState, target: "production" | "manual" | "capacity"): number {
  let mult = 1;
  for (const [techId, owned] of Object.entries(s.technologies)) {
    if (!owned) continue;
    const tech = TECH_MAP[techId];
    if (!tech || !tech.multiplier) continue;
    if (tech.multiplier.target === target || tech.multiplier.target === "production") {
      mult += tech.multiplier.value;
    }
  }
  // Achievement production bonus
  const ctx = buildAchievementCtx(s);
  mult += achievementBonus(s.achievements || {}, ctx, "production");
  // Layer 1 — Challenge mastery bonus (aggregated across all completed repeats).
  if (s.completedChallenges) {
    const agg = challengeMasteryBonusFromRepeats(s.completedChallenges);
    mult += agg.productionMult;
  }
  return mult;
}

// Check whether a challenge's completeWhen condition is already met given the
// current game state. Used by setActiveChallenge to prevent cheese starts.
function checkChallengeComplete(
  ch: { completeWhen: import("../data/challenges").ChallengeCompleteWhen },
  s: GameState
): boolean {
  switch (ch.completeWhen.type) {
    case "reachPopulation":
      return s.population >= ch.completeWhen.value;
    case "reachStage":
      return STAGES[s.stageIndex].id === ch.completeWhen.stage;
    case "clearStage": {
      const targetIdx = STAGE_IDS.indexOf(ch.completeWhen.stage);
      return s.stageIndex > targetIdx;
    }
    case "reachGalactic":
      return s.stageIndex >= STAGES.length - 1;
    case "stockpileResource":
      return (s.resources[ch.completeWhen.resource] || 0) >= ch.completeWhen.value;
    default:
      return false;
  }
}

function buildAchievementCtx(s: GameState): AchievementCheckCtx {
  const systemsDiscoveredCount = Object.keys(s.ownedSystems).filter((id) => (s.ownedSystems[id] || 0) > 0).length;
  const techResearchedCount = Object.keys(s.technologies).filter((id) => s.technologies[id]).length;
  const upgradesOwnedCount = Object.values(s.upgrades).filter((c) => c > 0).length;
  const storyUnlockedCount = Object.keys(s.storyUnlocked).filter((id) => s.storyUnlocked[id]).length;
  return {
    galacticWins: s.galacticWins,
    totalRuns: s.totalRuns,
    stageClearCounts: s.stageClearCounts,
    archivedArchetypes: s.archivedArchetypes || [],
    storyUnlockedCount,
    systemsDiscoveredCount,
    techResearchedCount,
    upgradesOwnedCount,
    maxPopulation: s.maxPopulation || 0,
    fastestCellClear: s.fastestCellClear || 0,
    totalEventsResolved: s.totalEventsResolved || 0,
  };
}

// Check all achievements; return new ones earned
function checkAchievements(s: GameState): { earned: Record<string, boolean>; newOnes: string[] } {
  const ctx = buildAchievementCtx(s);
  const earned = { ...(s.achievements || {}) };
  const newOnes: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!earned[ach.id] && ach.check(ctx)) {
      earned[ach.id] = true;
      newOnes.push(ach.id);
    }
  }
  return { earned, newOnes };
}

function computeScore(s: GameState): number {
  const totalSystems = Object.values(s.ownedSystems).reduce((a, b) => a + b, 0);
  const totalTech = Object.keys(s.technologies).length;
  const resourceSum = Object.values(s.resources).reduce((a, b) => a + b, 0);
  return Math.floor(
    s.population * 2 +
    totalSystems * 5 +
    totalTech * 10 +
    resourceSum * 0.5 +
    s.time * 0.1
  );
}

// Recompute all capacities from scratch based on owned systems
function recomputeCapacitiesFresh(s: GameState, capMult: number): Record<string, number> {
  const base = emptyCapacities();
  const caps: Record<string, number> = {};
  for (const r of Object.keys(base)) {
    let cap = (base[r] || 50) * capMult;
    for (const sys of SYSTEMS) {
      const count = s.ownedSystems[sys.id] || 0;
      if (!count || !sys.capacityBoost) continue;
      const boost = sys.capacityBoost[r];
      if (boost) cap += (boost as number) * count * capMult;
    }
    caps[r] = cap;
  }
  return caps;
}

// Export helper for components to compute whether an action is capped
export function isActionCapped(
  produces: Record<string, number>,
  resources: Record<string, number>,
  capacities: Record<string, number>
): boolean {
  const outputs = Object.entries(produces);
  if (outputs.length === 0) return false;
  return outputs.every(([r]) => {
    const cap = capacities[r] || 0;
    return (resources[r] || 0) >= cap - 0.001;
  });
}

// Export helper for whether a system is currently capped (idling)
export function isSystemCapped(
  sysId: string,
  resources: Record<string, number>,
  capacities: Record<string, number>
): boolean {
  const sys = SYSTEM_MAP[sysId];
  if (!sys) return false;
  const produces = Object.keys(sys.produces);
  if (produces.length === 0) return false;
  return produces.every((r) => {
    const cap = capacities[r] || 0;
    return (resources[r] || 0) >= cap - 0.01;
  });
}

// Export for components
export { STAGES, STAGE_IDS, SYSTEMS, TECHS, UPGRADES, ARCHETYPE_MAP };
