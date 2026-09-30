"use client";

import { useGameStore } from "@/game/state/store";
import { useGameLoop } from "@/game/hooks/useGameLoop";
import { useKeyboardShortcuts } from "@/game/hooks/useKeyboardShortcuts";
import { STAGES } from "@/game/data/stages";
import { Header } from "./Header";
import { StagePanel } from "./StagePanel";
import { ResourceBar } from "./ResourceBar";
import { TabNav } from "./TabNav";
import { ActionsTab } from "../tabs/ActionsTab";
import { SystemsTab } from "../tabs/SystemsTab";
import { ProductionTab } from "../tabs/ProductionTab";
import { TechTab } from "../tabs/TechTab";
import { StoryTab } from "../tabs/StoryTab";
import { CodexTab } from "../tabs/CodexTab";
import { AchievementsTab } from "../tabs/AchievementsTab";
import { ArchiveTab } from "../tabs/ArchiveTab";
import { LogTab } from "../tabs/LogTab";
import { ShopModal } from "../modals/ShopModal";
import { EvolveModal } from "../modals/EvolveModal";
import { StoryPopup } from "../modals/StoryPopup";
import { AchievementToast } from "../modals/AchievementToast";
import { OfflineSummary } from "../modals/OfflineSummary";
import { SettingsModal } from "../modals/SettingsModal";
import { EventModal } from "../modals/EventModal";
import { TutorialHints } from "./TutorialHints";

export function GameShell() {
  const { offlineSummary, dismissOffline } = useGameLoop();
  useKeyboardShortcuts();
  const currentTab = useGameStore((s) => s.currentTab);
  const stageIndex = useGameStore((s) => s.stageIndex);
  const stage = STAGES[stageIndex];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background layers */}
      <div className="bg-layer-1" />
      <div className="bg-layer-2" />
      <div className="bg-vignette" />

      <Header />

      {/* Sticky resource bar — scrolls with the header, stays pinned under it */}
      <ResourceBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-[112px]">
              <StagePanel />
            </div>
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <TabNav />
            <div className="mt-4 mb-20 md:mb-4">
              {currentTab === "actions" && <ActionsTab />}
              {currentTab === "systems" && <SystemsTab />}
              {currentTab === "production" && <ProductionTab />}
              {currentTab === "tech" && <TechTab />}
              {currentTab === "story" && <StoryTab />}
              {currentTab === "codex" && <CodexTab />}
              {currentTab === "achievements" && <AchievementsTab />}
              {currentTab === "archive" && <ArchiveTab />}
              {currentTab === "log" && <LogTab />}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ShopModal />
      <EvolveModal />
      <StoryPopup />
      <AchievementToast />
      <SettingsModal />
      <EventModal />
      <TutorialHints />
      {offlineSummary && (
        <OfflineSummary
          elapsed={offlineSummary.elapsed}
          resourcesGained={offlineSummary.resourcesGained}
          onClose={dismissOffline}
        />
      )}
    </div>
  );
}
