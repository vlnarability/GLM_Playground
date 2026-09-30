"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GameState, GameStore, ResourceId, StageId, TabId } from "./types";
import { emptyResources, emptyCapacities, RESOURCES } from "../data/resources";
import { STAGES, STAGE_IDS, nextStage } from "../data/stages";
import { ACTIONS, ACTION_MAP } from "../data/actions";
import { SYSTEMS, SYSTEM_MAP, systemCost } from "../data/systems";
import { TECH_MAP, TECHS } from "../data/techs";
import { UPGRADE_MAP, UPGRADES, upgradeCost } from "../data/upgrades";
import { STORY_MAP, STORY_TRIGGERS } from "../data/story";

const STORAGE_KEY = "evolution_idle_v1";

function initialRunState(): Partial<GameState> {
  const resources = emptyResources();
  const capacities = emptyCapacities();
  // Starting resources for Cell
  resources.atp = 5;
  resources.glucose = 8;
  resources.happiness = 75;
  return {
    stageIndex: 0,
    time: 0,
    population: 8,
    resources,
    capacities,
    ownedSystems: {},
    technologies: {},
    log: ["New run started. The first spark stirs."],
  };
}

function initialMetaState(): Partial<GameState> {
  return {
    evolutionPoints: 0,
    totalRuns: 0,
    galacticWins: 0,
    stageClearCounts: Object.fromEntries(STAGE_IDS.map((s) => [s, 0])) as Record<StageId, number>,
    upgrades: Object.fromEntries(UPGRADES.map((u) => [u.id, 0])),
    storyUnlocked: { first_spark: true },
    storyAcknowledged: {},
    archive: [],
    archivedArchetypes: [],
    unlockedLayers: { evolution: true },
    currentTab: "actions",
    speed: 1,
    paused: false,
    showShop: false,
    showEvolve: false,
    activeStoryPopup: "first_spark",
    hasSeenIntro: false,
    lastSaved: Date.now(),
    tutorialStep: 0,
    tutorialActive: true,
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
        const realDt = dt * s.speed;

        // Production multipliers
        const manualLvl = s.upgrades["quickened_hands"] || 0;
        const autoLvl = s.upgrades["inherited_efficiency"] || 0;
        const autoMult = 1 + autoLvl * 0.15;
        const prodMult = autoMult * techMultiplier(s, "production");
        const capBoost = 1 + (s.upgrades["expansive_vaults"] || 0) * 0.20;

        const resources = { ...s.resources };
        const capacities = { ...s.capacities };

        // Apply system production
        for (const [sysId, count] of Object.entries(s.ownedSystems)) {
          if (!count) continue;
          const sys = SYSTEM_MAP[sysId];
          if (!sys) continue;
          // Check tech requirements
          if (sys.requiredTech && !s.technologies[sys.requiredTech]) continue;
          const mult = prodMult * (sys.stage === STAGES[s.stageIndex].id ? 1 : 0.5);
          for (const [r, v] of Object.entries(sys.produces)) {
            const rate = (v as number) * count * mult;
            resources[r] = (resources[r] || 0) + rate * realDt;
          }
          // Upkeep
          if (sys.upkeep) {
            for (const [r, v] of Object.entries(sys.upkeep)) {
              resources[r] = (resources[r] || 0) - (v as number) * count * realDt;
            }
          }
          // Capacity boost
          if (sys.capacityBoost && count > 0) {
            for (const [r, v] of Object.entries(sys.capacityBoost)) {
              const base = emptyCapacities()[r] || 50;
              const boost = (v as number) * count;
              capacities[r] = Math.max(capacities[r] || base, base + boost) * capBoost / (capBoost || 1);
              // Only adjust upward
              if ((capacities[r] || 0) < base + boost * capBoost) {
                capacities[r] = base + boost * capBoost;
              }
            }
          }
        }

        // Recompute capacities (base + boosts)
        recomputeCapacities(resources, capacities, s);

        // Clamp resources to capacities
        for (const r of Object.keys(resources)) {
          const cap = capacities[r];
          if (cap != null && resources[r] > cap) resources[r] = cap;
          if (resources[r] < 0) resources[r] = 0;
        }

        // Slow passive ATP for cell (keeps early game from stalling)
        if (STAGES[s.stageIndex].id === "cell") {
          resources.atp = Math.min(capacities.atp || 30, resources.atp + 0.1 * realDt);
        }

        // Population growth (slow)
        const popGrowth = 0.02 * realDt * (1 + (resources.happiness || 50) / 200);
        const newPop = s.population + popGrowth;

        // Time
        const newTime = s.time + realDt;

        // Check story triggers
        const newStory = { ...s.storyUnlocked };
        let activePopup = s.activeStoryPopup;
        for (const trig of STORY_TRIGGERS) {
          if (!newStory[trig.id] && trig.condition({ ...s, resources, ownedSystems: s.ownedSystems })) {
            newStory[trig.id] = true;
            if (!activePopup) activePopup = trig.id;
          }
        }

        set({
          resources,
          capacities,
          time: newTime,
          population: newPop,
          storyUnlocked: newStory,
          activeStoryPopup: activePopup,
        });
      },

      // ============ ACTIONS ============
      performAction: (actionId) => {
        const s = get();
        const action = ACTION_MAP[actionId];
        if (!action) return;
        if (action.stage !== STAGES[s.stageIndex].id) return;

        // Check costs
        const res = { ...s.resources };
        if (action.cost) {
          for (const [r, v] of Object.entries(action.cost)) {
            if ((res[r] || 0) < (v as number)) return; // can't afford
          }
          for (const [r, v] of Object.entries(action.cost)) {
            res[r] -= v as number;
          }
        }

        // Manual action multiplier
        const manualLvl = s.upgrades["quickened_hands"] || 0;
        const mult = 1 + manualLvl * 0.25;
        const techMult = techMultiplier(s, "manual");
        const finalMult = mult * techMult;

        for (const [r, v] of Object.entries(action.produces)) {
          const cap = s.capacities[r] || 50;
          res[r] = Math.min(cap, (res[r] || 0) + (v as number) * finalMult);
        }

        set({ resources: res });
      },

      buySystem: (systemId, qty) => {
        const s = get();
        const sys = SYSTEM_MAP[systemId];
        if (!sys) return;
        if (sys.stage !== STAGES[s.stageIndex].id) return;

        const costReduction = (s.upgrades["frugality"] || 0) * 0.04;
        let owned = s.ownedSystems[systemId] || 0;
        if (sys.maxOwned && owned >= sys.maxOwned) return;

        const res = { ...s.resources };
        const ownedSystems = { ...s.ownedSystems };

        let bought = 0;
        for (let i = 0; i < qty; i++) {
          if (sys.maxOwned && owned + bought >= sys.maxOwned) break;
          const cost = systemCost(sys, owned + bought, costReduction);
          // Check affordability
          let canAfford = true;
          for (const [r, v] of Object.entries(cost)) {
            if ((res[r] || 0) < (v as number)) {
              canAfford = false;
              break;
            }
          }
          if (!canAfford) break;
          for (const [r, v] of Object.entries(cost)) {
            res[r] -= v as number;
          }
          bought++;
        }

        if (bought === 0) return;

        ownedSystems[systemId] = owned + bought;

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
          storyUnlocked: newStory,
          activeStoryPopup: activePopup,
        });
        get().addToLog(`Built ${bought}× ${sys.name}.`);
      },

      buyTech: (techId) => {
        const s = get();
        const tech = TECH_MAP[techId];
        if (!tech) return;
        if (s.technologies[techId]) return;
        if (tech.stage !== STAGES[s.stageIndex].id) return;
        // Check prerequisites
        if (tech.requires) {
          for (const req of tech.requires) {
            if (!s.technologies[req]) return;
          }
        }
        // Check cost
        const res = { ...s.resources };
        for (const [r, v] of Object.entries(tech.cost)) {
          if ((res[r] || 0) < (v as number)) return;
        }
        for (const [r, v] of Object.entries(tech.cost)) {
          res[r] -= v as number;
        }
        const technologies = { ...s.technologies, [techId]: true };
        set({ resources: res, technologies });
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
          // Galactic win!
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
        if (score < reqs.minScore * evolveBoost) return;

        // Trigger evolve
        const nextStageIdx = s.stageIndex + 1;
        const nextStageDef = STAGES[nextStageIdx];

        // Carry forward carryable resources, give some starting resources for new stage
        const resources = { ...s.resources };
        const capacities = recomputeCapacitiesFresh(s, nextStageDef.id);

        // Unlock story
        const newStory = { ...s.storyUnlocked };
        const storyId = STORY_MAP[nextStageDef.id === "creature" ? "first_body_stirs"
          : nextStageDef.id === "tribal" ? "fire_remembered"
          : nextStageDef.id === "civilization" ? "cities_learn_to_dream"
          : nextStageDef.id === "empire" ? "distance_begins_to_obey"
          : nextStageDef.id === "solar" ? "sky_stops_being_a_wall"
          : "galaxy_takes_a_shape"];
        if (storyId) {
          newStory[storyId.id] = true;
        }

        const stageClearCounts = { ...s.stageClearCounts, [stage.id]: (s.stageClearCounts[stage.id] || 0) + 1 };

        set({
          stageIndex: nextStageIdx,
          resources,
          capacities,
          storyUnlocked: newStory,
          activeStoryPopup: storyId?.id || s.activeStoryPopup,
          stageClearCounts,
        });
        get().addToLog(`Evolved to ${nextStageDef.name}. ${nextStageDef.tagline}`);
      },

      triggerPrestige: () => {
        const s = get();
        const stage = STAGES[s.stageIndex];
        const score = computeScore(s);
        // EP formula: sqrt(score / 100) * stage multiplier
        const stageMult = [1, 2, 4, 8, 16, 32, 64][s.stageIndex] || 1;
        const epEarned = Math.max(1, Math.floor(Math.sqrt(score / 100) * stageMult));

        const archive = [...s.archive];
        archive.unshift({
          runId: `run_${s.totalRuns + 1}`,
          timestamp: Date.now(),
          stage: stage.id,
          archetype: "humanoid",
          score,
          epEarned,
          duration: s.time,
          ending: s.stageIndex >= 6 ? "Galactic Ascension" : `${stage.name} Evolution`,
        });

        // Reset run state
        const fresh = initialRunState();
        set({
          ...fresh,
          evolutionPoints: s.evolutionPoints + epEarned,
          totalRuns: s.totalRuns + 1,
          galacticWins: s.galacticWins + (s.stageIndex >= 6 ? 1 : 0),
          archive,
          upgrades: s.upgrades,
          storyUnlocked: s.storyUnlocked,
          storyAcknowledged: s.storyAcknowledged,
          archivedArchetypes: s.archivedArchetypes,
          unlockedLayers: s.unlockedLayers,
          stageClearCounts: s.stageClearCounts,
          currentTab: "actions",
          speed: 1,
          paused: false,
          showShop: false,
          showEvolve: false,
          activeStoryPopup: "god_opens_its_eyes",
          hasSeenIntro: true,
          lastSaved: Date.now(),
          tutorialActive: false,
        });
        get().addToLog(`Prestige! Earned ${epEarned} Evolution Points.`);
      },

      setTab: (tab) => set({ currentTab: tab }),
      setSpeed: (speed) => set({ speed }),
      togglePause: () => set((s) => ({ paused: !s.paused })),
      setShowShop: (v) => set({ showShop: v }),
      setShowEvolve: (v) => set({ showEvolve: v }),

      dismissStory: (id) => {
        const s = get();
        const ack = { ...s.storyAcknowledged, [id]: true };
        set({ activeStoryPopup: null, storyAcknowledged: ack });
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

      saveGame: () => {
        set({ lastSaved: Date.now() });
        // persist middleware auto-saves to localStorage
        if (typeof window !== "undefined") {
          // Force a flush by writing current state
          try {
            const state = get();
            const persistData = {
              state: { ...state },
              version: 1,
            };
            localStorage.setItem(STORAGE_KEY + "_manual", JSON.stringify(persistData));
          } catch (e) {
            // ignore
          }
        }
      },

      loadGame: () => {
        // Handled by persist middleware on hydration
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
      version: 1,
      partialize: (s) => s,
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
  return mult;
}

function computeScore(s: GameState): number {
  const stage = STAGES[s.stageIndex];
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

function recomputeCapacities(
  resources: Record<string, number>,
  capacities: Record<string, number>,
  s: GameState
) {
  // Apply capacity boosts from systems
  const base = emptyCapacities();
  const capBoostLvl = s.upgrades["expansive_vaults"] || 0;
  const capMult = 1 + capBoostLvl * 0.20;
  for (const r of Object.keys(base)) {
    let cap = (base[r] || 50) * capMult;
    for (const sys of SYSTEMS) {
      const count = s.ownedSystems[sys.id] || 0;
      if (!count || !sys.capacityBoost) continue;
      const boost = sys.capacityBoost[r];
      if (boost) cap += (boost as number) * count;
    }
    // Only update if higher (don't shrink during gameplay)
    if (cap > (capacities[r] || 0)) {
      capacities[r] = cap;
    }
  }
}

function recomputeCapacitiesFresh(s: GameState, _stage: StageId): Record<string, number> {
  const base = emptyCapacities();
  const capBoostLvl = s.upgrades["expansive_vaults"] || 0;
  const capMult = 1 + capBoostLvl * 0.20;
  const caps: Record<string, number> = {};
  for (const r of Object.keys(base)) {
    let cap = (base[r] || 50) * capMult;
    for (const sys of SYSTEMS) {
      const count = s.ownedSystems[sys.id] || 0;
      if (!count || !sys.capacityBoost) continue;
      const boost = sys.capacityBoost[r];
      if (boost) cap += (boost as number) * count;
    }
    caps[r] = cap;
  }
  return caps;
}

// Exports for components
export { STAGES, STAGE_IDS, ACTIONS, SYSTEMS, TECHS, UPGRADES, RESOURCES };
