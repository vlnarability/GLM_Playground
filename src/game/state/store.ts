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

const STORAGE_KEY = "evolution_idle_v2";

function initialRunState(): Partial<GameState> {
  const resources = emptyResources();
  const capacities = emptyCapacities();
  resources.atp = 5;
  resources.glucose = 8;
  resources.happiness = 75;
  return {
    stageIndex: 0,
    time: 0,
    population: 8,
    populationProgress: 0,
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

        const autoLvl = s.upgrades["inherited_efficiency"] || 0;
        const autoMult = 1 + autoLvl * 0.15;
        const techMult = techMultiplier(s, "production");
        const capBoostLvl = s.upgrades["expansive_vaults"] || 0;
        const capMult = 1 + capBoostLvl * 0.20;
        const hasAutoBalancer = (s.upgrades["auto_balancer"] || 0) > 0;

        // Archetype bonus
        const archetype = s.lockedArchetype ? ARCHETYPE_MAP[s.lockedArchetype] : null;
        const archAllMult = archetype?.bonus.allProductionMult || 0;
        const archPopMult = archetype?.bonus.populationGrowthMult || 0;
        const archCapMult = archetype?.bonus.capMult || 0;

        const resources = { ...s.resources };
        let capacities = recomputeCapacitiesFresh(s, capMult + archCapMult);

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
          resources.atp = Math.min(capacities.atp || 30, resources.atp + 0.1 * realDt);
        }

        // Happiness drift toward 50 baseline if no source
        // (prevents permanent high happiness from start)
        // — disabled: let systems/tech maintain it

        // Population growth with progress bar
        // Growth rate scales with happiness and food/water availability
        let popGrowthRate = 0.015; // base per second
        const happiness = resources.happiness || 50;
        popGrowthRate *= (1 + (happiness - 40) / 200); // happiness 100 → +30%, happiness 20 → -10%
        popGrowthRate *= (1 + archPopMult);
        // Penalty if food/water are critically low (creature+)
        const curStage = STAGES[s.stageIndex];
        if (["creature", "tribal", "civilization", "empire"].includes(curStage.id)) {
          const foodCap = capacities.food || 1;
          const waterCap = capacities.water || 1;
          const foodPct = (resources.food || 0) / foodCap;
          const waterPct = (resources.water || 0) / waterCap;
          if (foodPct < 0.1) popGrowthRate *= 0.3;
          if (waterPct < 0.1) popGrowthRate *= 0.3;
        }

        let populationProgress = (s.populationProgress || 0) + popGrowthRate * realDt;
        let population = s.population;
        while (populationProgress >= 1) {
          populationProgress -= 1;
          population += 1;
        }

        const newTime = s.time + realDt;

        // Check story triggers
        const newStory = { ...s.storyUnlocked };
        let activePopup = s.activeStoryPopup;
        const ctx = { ...s, resources, ownedSystems: s.ownedSystems };
        for (const trig of STORY_TRIGGERS) {
          if (!newStory[trig.id] && trig.condition(ctx)) {
            newStory[trig.id] = true;
            if (!activePopup) activePopup = trig.id;
          }
        }

        set({
          resources,
          capacities,
          time: newTime,
          population,
          populationProgress,
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
        const manualLvl = s.upgrades["quickened_hands"] || 0;
        const mult = 1 + manualLvl * 0.25;
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

        set({ resources: res });
      },

      buySystem: (systemId, qty) => {
        const s = get();
        const sys = SYSTEM_MAP[systemId];
        if (!sys) return;
        if (sys.stage !== STAGES[s.stageIndex].id) return;
        // Check tech prerequisite
        if (sys.requiredTech && !s.technologies[sys.requiredTech]) return;

        const costReduction = (s.upgrades["frugality"] || 0) * 0.04;
        let owned = s.ownedSystems[systemId] || 0;
        if (sys.maxOwned && owned >= sys.maxOwned) return;

        const res = { ...s.resources };
        const ownedSystems = { ...s.ownedSystems };
        const systemEnabled = { ...s.systemEnabled };
        const archetypeAffinity = { ...s.archetypeAffinity };

        let bought = 0;
        for (let i = 0; i < qty; i++) {
          if (sys.maxOwned && owned + bought >= sys.maxOwned) break;
          const cost = systemCost(sys, owned + bought, costReduction);
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
        const res = { ...s.resources };
        for (const [r, v] of Object.entries(tech.cost)) {
          if ((res[r] || 0) < (v as number)) return;
        }
        for (const [r, v] of Object.entries(tech.cost)) {
          res[r] -= v as number;
        }
        const technologies = { ...s.technologies, [techId]: true };
        const archetypeAffinity = { ...s.archetypeAffinity };
        if (tech.grantsAffinity) {
          archetypeAffinity[tech.grantsAffinity.archetype] =
            (archetypeAffinity[tech.grantsAffinity.archetype] || 0) + tech.grantsAffinity.amount;
        }
        set({ resources: res, technologies, archetypeAffinity });
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
        if (score < reqs.minScore * evolveBoost) return;

        const nextStageIdx = s.stageIndex + 1;
        const nextStageDef = STAGES[nextStageIdx];

        const resources = { ...s.resources };
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

        set({
          stageIndex: nextStageIdx,
          resources,
          capacities,
          storyUnlocked: newStory,
          activeStoryPopup: storyId?.id || s.activeStoryPopup,
          stageClearCounts,
          lockedArchetype,
        });
        get().addToLog(`Evolved to ${nextStageDef.name}. ${nextStageDef.tagline}`);
      },

      triggerPrestige: () => {
        const s = get();
        const stage = STAGES[s.stageIndex];
        const score = computeScore(s);
        const stageMult = [1, 2, 4, 8, 16, 32, 64][s.stageIndex] || 1;
        const epEarned = Math.max(1, Math.floor(Math.sqrt(score / 100) * stageMult));

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

        const fresh = initialRunState();
        set({
          ...fresh,
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
      version: 2,
      partialize: (s) => s,
      // Migrate old saves (v1) to new structure
      migrate: (persisted: any, version: number) => {
        if (!persisted) return persisted;
        if (version < 2) {
          // Add new fields with defaults
          if (!persisted.systemEnabled) persisted.systemEnabled = {};
          if (!persisted.archetypeAffinity) persisted.archetypeAffinity = {};
          if (persisted.lockedArchetype === undefined) persisted.lockedArchetype = null;
          if (persisted.populationProgress === undefined) persisted.populationProgress = 0;
          // Ensure new upgrades exist
          if (persisted.upgrades) {
            if (persisted.upgrades.auto_balancer === undefined) persisted.upgrades.auto_balancer = 0;
            if (persisted.upgrades.archetype_insight === undefined) persisted.upgrades.archetype_insight = 0;
          }
        }
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
  return mult;
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
