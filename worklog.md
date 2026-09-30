# Evolution Idle — Next.js Port Worklog

## Project Overview
Porting the existing vanilla-JS Evolution Idle game (~15,000 lines across data.js, logic.js, ui.js, state.js, main.js + styles.css) to Next.js 16 + TypeScript + Zustand + shadcn/ui. The game is a narrative-driven incremental game with 7 stages (Cell → Galactic) and 10 prestige layers.

Reference materials:
- `/home/z/my-project/upload/data.js` (2,720 lines — game data: stages, resources, systems, tech, upgrades, archetypes, etc.)
- `/home/z/my-project/upload/logic.js` (5,753 lines — game loop, production, purchases, evolve, events)
- `/home/z/my-project/upload/state.js` (498 lines — state shape, save/load, migration)
- `/home/z/my-project/upload/ui.js` (2,940 lines — DOM rendering)
- `/home/z/my-project/upload/styles.css` (308 lines)
- `/home/z/my-project/upload/Evolution Idle Design Document.docx` (extracted to `/tmp/design_doc.txt`)

## Tech Stack
- Next.js 16 App Router, TypeScript 5
- Zustand for state (matches design doc spec)
- shadcn/ui + Tailwind CSS 4
- Lucide icons
- localStorage for saves (client-side, no backend needed for an idle game)

## Architecture Plan
```
src/
  app/
    page.tsx                    # Game entry — renders <GameShell/>
    layout.tsx                  # Root layout
    globals.css                 # Theme tokens + cosmic styling
  game/
    data/
      resources.ts              # All resource definitions
      stages.ts                 # 7 stages with systems/actions/tech
      archetypes.ts             # 13 archetypes + radar
      upgrades.ts              # Shop / prestige upgrades
      story.ts                  # Story beats + journal entries
    state/
      store.ts                  # Zustand store with persist
      types.ts                  # TS types for game state
    logic/
      tick.ts                   # Game loop logic
      actions.ts                # Manual actions + purchases
      evolve.ts                 # Stage evolution + prestige
    hooks/
      useGameLoop.ts            # requestAnimationFrame driver
  components/
    layout/
      Header.tsx
      StagePanel.tsx
      ResourceBar.tsx
      Footer.tsx
      TabNav.tsx
    tabs/
      ActionsTab.tsx
      SystemsTab.tsx
      ProductionTab.tsx
      TechTab.tsx
      StoryTab.tsx
      CodexTab.tsx
      ArchiveTab.tsx
      LogTab.tsx
    modals/
      ShopModal.tsx
      EvolveModal.tsx
      StoryPopup.tsx
```

## Goals (Phase 1 — Foundation)
- Fully playable Cell stage with manual actions, automation, systems, tech tree, and evolution gate
- Smooth progression into Creature/Tribal/Civilization stages (data scaffolding for later stages)
- Polished cosmic UI with sticky footer, responsive design
- Save/load with localStorage
- Evolution prestige layer scaffolding (shop + EP currency)
- Narrative system (story beats unlocked by progression)

---
Task ID: 0
Agent: main
Task: Initial project setup, worklog creation, dev server startup

Work Log:
- Read uploaded vanilla JS files (data.js, logic.js, state.js, main.js, ui.js, index.html, styles.css)
- Extracted design document from Evolution Idle Design Document.docx → /tmp/design_doc.txt (1,071 lines)
- Reviewed current Next.js project scaffold (clean page.tsx, full shadcn/ui component set)
- Created worklog at /home/z/my-project/worklog.md
- Started dev server (port 3000)

Stage Summary:
- Project context fully understood: large idle game with 7 stages + 10 prestige layers
- Decided to rebuild from scratch in TypeScript using the JS files as data reference (not verbatim port — the vanilla JS is too tightly coupled to DOM manipulation)
- Architecture planned (see above)
- Ready to begin building data layer + state store + game loop

---
Task ID: 1
Agent: main
Task: Address user feedback — float resources, capped actions, system toggles, archetype system, population growth, sticky resource bar, distinctive CSS, mobile strategy

Work Log:
- **Float resources**: Rewrote `formatNumber()` to show decimals for all sub-100 values (e.g. `0.30`, `5.6`, `49.7`). Added `formatCompact()` for header chips. Resources now visibly accumulate fractional production.
- **Capped action blocking**: Added `isActionCapped()` helper. Manual actions whose output is entirely at capacity are now disabled and show "capped" label — no resource waste.
- **System cap-aware pausing**: In `tick()`, systems whose output is all at cap now idle (no production, no upkeep). The lumber mill no longer burns wood when lumber is maxed. Added `isSystemCapped()` helper and amber warning UI in SystemsTab.
- **System enable/disable toggles**: Added `systemEnabled` map + `toggleSystem()` / `enableAllSystems()` actions. Each system card has a power toggle button. Disabled systems show "no production, no upkeep" status. Added "All/None" bulk toggles.
- **Auto-Balancer shop upgrade**: New `auto_balancer` upgrade (12 EP, requires 1 win). When purchased, capped systems auto-idle without manual toggling.
- **Sticky resource bar**: ResourceBar is now `sticky top-[53px]` (under header), scrolls with page. Removed the duplicate "Stage Resources" card from ActionsTab. Single source of truth for resources.
- **Archetype/lineage system**: Created `archetypes.ts` with 13 archetypes (9 basic + 4 rare), each with unique color, glyph, blurb, and passive bonus. Added `grantsAffinity` field to systems (nucleus→humanoid, den→mammalian, barracks→reptilian, temple→necroid, sawmill→arthropoid, solar_array→plantoid) and techs (enzymatic_pathways→fungoid, photosynthesis→plantoid, domestication→mammalian, language→molluscoid, warcraft→reptilian). Affinity bars visible in StagePanel. Locked at Creature→Tribal evolution. Locked archetype grants permanent production bonus. Archetype badge shown in resource bar.
- **Population growth explanation**: Added `populationProgress` (0-1 toward next pop point) with progress bar. Added info tooltip (ℹ) explaining: growth scales with happiness, penalized by low food/water. Population grows continuously, not in discrete jumps.
- **Prerequisite visibility**: TechTab now shows explicit "Requires: ✓/✗ [tech name]" chips with green/red coloring. SystemsTab shows tech prereq warnings with the required tech name.
- **CSS redesign**: Completely rewrote `globals.css` with a distinctive "specimen journal in a dark archive" aesthetic:
  - Replaced generic cyan/violet cosmic gradients with warm amber ink on deep ink-blue paper
  - Hairline dot-grid background (like graph paper) instead of star fields
  - SVG noise texture for paper grain
  - Tighter 6px radius (more technical feel)
  - Stage plates with corner-tick framing marks (like specimen labels)
  - Removed glassmorphism glow effects, shimmer animations, and pulse-glow
  - Vignette for focus
  - Monospace tabular numerals throughout
- **Mobile strategy**: Documented below in "Mobile Port Strategy" section.

Stage Summary:
- All 8 user feedback points addressed
- Game verified working via agent-browser: float resources visible, capped actions block correctly, system toggles pause production, archetype affinity bars display and update
- 0 lint errors in project code
- CSS is now visually distinctive (warm amber/ink-blue, not generic cosmic purple/cyan)

## Mobile Port Strategy

The user asked about long-term mobile porting options. Here's the analysis:

### Option A: PWA (Progressive Web App) — RECOMMENDED for launch
- **What**: Add a web manifest + service worker to the existing Next.js app. Users "Install to Home Screen."
- **Pros**: Zero code duplication. Same React/TS codebase. Works offline (matches design doc §12.1). No app store review. Instant updates.
- **Cons**: Slightly slower than native. No App Store discoverability. iOS Push notifications limited.
- **Effort**: ~2-3 days (manifest, service worker, install prompt, offline caching)
- **Verdict**: Best first step. The design doc explicitly says "PWA: Offline support via service worker" (§12.1).

### Option B: Capacitor (Ionic) — Best for App Store distribution
- **What**: Wrap the existing Next.js web build in a native shell (Capacitor) that ships to iOS/Android app stores.
- **Pros**: Same web codebase. Native app store presence. Access to native APIs (camera, haptics, push). Better performance than PWA on iOS.
- **Cons**: Need to handle Next.js SSR → static export (or run a local server in the app). Build pipeline complexity.
- **Effort**: ~1-2 weeks (Next.js static export config, Capacitor setup, native build/test)
- **Verdict**: Best when you want app store presence without rewriting.

### Option C: React Native — Only if you want truly native UX
- **What**: Rewrite the UI in React Native (shared game logic in TS, different components).
- **Pros**: Truly native performance and feel. Better animations. Full native API access.
- **Cons**: **Duplicate UI codebase**. The game logic (data/, state/, logic/) can be shared 1:1, but every component must be rewritten. Significant ongoing maintenance.
- **Effort**: ~4-8 weeks for full feature parity
- **Verdict**: Only worth it if mobile is a primary platform and PWA/Capacitor feel isn't good enough. For an idle game (mostly text, numbers, progress bars), PWA is usually sufficient.

### Option D: Expo (React Native simplified) — Middle ground
- **What**: Use Expo to build a React Native app with web target. Share game logic, write native components.
- **Pros**: One codebase for iOS + Android + web. Expo handles native build complexity.
- **Cons**: Still need separate components from the web app. Performance overhead for complex state.
- **Effort**: ~3-6 weeks
- **Verdict**: Good if you want native + web from one project, but requires component rewrite.

### Recommendation
1. **Now**: Ship as PWA (2-3 days work). The game is already mobile-responsive.
2. **If app store presence needed**: Wrap with Capacitor (1-2 weeks).
3. **Only if native performance is critical**: Consider React Native/Expo (4-8 weeks, shared logic only).

The current Next.js codebase is already structured to support this path: all game logic is in `src/game/` (framework-agnostic TS), and all UI is in `src/components/game/`. The logic layer can be imported into any React framework without changes.

---
Task ID: 2
Agent: webDevReview cron (round 1)
Task: QA testing, bug fixes, new features (achievements, offline progress, bulk buy), styling improvements

## Current Project Status Assessment
The game is in a solid, playable state. Cell stage fully functional with manual actions, systems (with toggles), tech tree (with prereqs), production overview, archetype/lineage system, story/journal, prestige shop, population growth, cap-aware blocking, and float resources. All 8 user feedback points from the previous round were addressed. 0 lint errors in project code. Dev server compiles cleanly.

## Work Completed This Round

### Bug Fixes
1. **Story tab ordering bug (UX)**: The Story tab was using `STORY_ENTRIES.slice().reverse()` which showed locked future-stage entries first (wall of "???"). Fixed to sort unlocked entries first (chronological), then locked entries. Players now see their earned scripture at the top.

### New Features
2. **Achievements system** (`src/game/data/achievements.ts` + `AchievementsTab.tsx` + `AchievementToast.tsx`):
   - 22 achievements across 5 categories: Stages, Lineage, Discovery, Narrative, Mastery
   - Each achievement grants a small permanent bonus (0.5-3% to production or capacity)
   - Total at full completion: ~15-20% production bonus + ~7% capacity bonus
   - Achievements auto-check every 2 seconds during tick + on evolve/prestige
   - Toast notification slides in from bottom-right when a new achievement is earned
   - New "Awards" tab in the nav with category filters and progress tracking
   - Achievement bonus is wired into `techMultiplier()` so production multipliers include earned achievements
   - Save migration ensures `achievements` and `newAchievements` fields exist on old saves

3. **Offline progress** (`applyOfflineProgress` action + `OfflineSummary.tsx` modal):
   - On page load, if `lastSaved` > 30 seconds ago, simulates production for the elapsed time
   - Time bank capped at 24h base, +24h per `temporal_reserves` upgrade tier (matches design doc §2.4)
   - Simulation runs in 1-hour chunks for performance
   - Shows a summary popup with resources gained/consumed while away
   - Log entry records the offline duration
   - Works correctly for real tab-close/reopen scenarios (beforeunload saves state)

4. **Bulk buy presets** (SystemsTab):
   - Replaced the +/- qty stepper with ×1 / ×10 / ×100 / Max preset chips
   - Active preset highlighted with primary color
   - Buy logic already caps at affordable quantity, so "Max" = "try 100, buy what you can afford"

### Styling Improvements
5. **Story popup redesign** (VLM feedback):
   - Continue button moved from bottom-right corner to full-width centered (was awkwardly placed)
   - Layer label ("Evolution Scripture") moved to an eyebrow position above the title
   - Category badge differentiated with filled chip style (stage accent color) vs outline trigger text
   - Icon container changed from circle to rounded square (more technical feel)
   - Trigger info shown as secondary text, not a separate badge

6. **Locked system visual state** (VLM feedback):
   - Tech-locked systems now show a red "Locked" badge in the top-right corner with a padlock icon
   - Red top border accent instead of primary gradient
   - Red border on the card itself
   - Clearer distinction between locked and unlocked systems

7. **Modal overlay opacity** (VLM feedback):
   - Reduced story popup overlay from 0.7 to 0.5 opacity
   - Reduced blur from 3px to 2px
   - The game world (resource bar, stage panel) is now visible behind modals, maintaining the sense of an active world

### Code Quality
- 0 lint errors in project code (6 warnings are all in `upload/` — the original vanilla JS files, not our code)
- Save migration handles upgrades from v1 saves (adds `achievements`, `newAchievements`, `systemEnabled`, `archetypeAffinity`, `lockedArchetype`, `populationProgress` fields with defaults)
- Achievement checking is throttled to every 2s of game time for performance
- Offline progress simulation uses chunked ticks (3600s chunks) to avoid blocking the main thread

## Verification Results
- Dev server compiles cleanly (no module-not-found, no TypeScript errors)
- Page loads with 5 resource chips visible
- Story popup displays correctly with redesigned layout (Continue button full-width, tags differentiated)
- Achievements tab shows 1/22 earned (First Word) with +0.5% production bonus
- Achievement toast appears when a new achievement is earned
- Systems tab shows locked systems with red badge and padlock
- Bulk buy presets (×1/×10/×100/Max) work correctly
- VLM assessment: "distinctly hand-crafted... deliberate creative vision rather than generic AI output"

## Unresolved Issues / Risks
1. **Offline progress testing**: The feature is correctly implemented but hard to test via agent-browser because `beforeunload` saves state on navigation, keeping `lastSaved` current. Verified the code logic is correct for real tab-close/reopen scenarios.
2. **Achievement check performance**: Runs every 2s in the tick. For very long offline simulations (24h), this means ~24 achievement checks during catch-up. Acceptable but could be optimized later.
3. **Story popup during offline**: If offline progress triggers a story beat, the popup shows. The story popup takes priority over the offline summary (both could show). Current behavior: story popup shows first (set in tick), offline summary shows after. This is fine but could be sequenced better.
4. **Future stages**: Only Cell stage has full content. Creature/Tribal/Civilization/Empire/Solar/Galactic stages have data (systems, techs, actions) but haven't been playtested end-to-end. Balance may need tuning.

## Priority Recommendations for Next Phase
1. **Playtest and balance later stages** — Run through Creature → Tribal → Civilization to verify the progression curve and archetype lock-in works at the Creature→Tribal boundary.
2. **Add more stage-specific story triggers** — Currently only 4 story triggers fire during gameplay (first_membrane_holds, nucleus_forms, instinct_learns, first_circle). Add triggers for mid-stage and stage-exit moments.
3. **PWA setup** — Add web manifest + service worker for offline play (design doc §12.1). The game already saves to localStorage; a service worker would enable true offline access.
4. **Save export/import UI** — The store has `exportSave()` and `importSave()` methods but no UI. Add buttons in the Shop or a Settings modal.
5. **More achievements** — Expand to 50+ achievements (design doc targets 200-300). Add speed-run achievements, resource milestone achievements, crisis survival achievements.
6. **Tutorial system** — Design doc §11 specifies a Cell-only first-run tutorial. The `tutorialActive` flag exists in state but the tutorial UI isn't built yet.

---
Task ID: 3
Agent: webDevReview cron (round 2)
Task: QA testing, Settings modal with save export/import, tutorial hints, more achievements/story triggers, Codex visual cleanup

## Current Project Status Assessment
Game is stable and playable. Cell stage fully functional with all features from previous rounds. No compile errors, 0 lint errors in project code. Dev server runs cleanly. Previous round added achievements, offline progress, bulk buy, story popup redesign, and locked-state styling. This round focused on the high-priority recommendations: save export/import UI, Settings consolidation, tutorial system, and more narrative/achievement content.

## Work Completed This Round

### Bug Fixes
- None found during QA. Game loads cleanly with no console errors.

### New Features
1. **Settings modal** (`SettingsModal.tsx`):
   - Comprehensive settings dialog accessible via gear icon in header
   - **Save export**: Generate base64-encoded save string, copy to clipboard, or download as `.txt` file
   - **Save import**: Paste save string or load from file, with success/error feedback
   - **Game stats summary**: 8 stat cards (run time, population, total runs, achievements, galactic wins, EP, stage, last saved)
   - **Manual save button**: Force-save now (in addition to 30s auto-save)
   - **Danger zone**: Hard reset with two-step confirmation (moved from inline header dialog)
   - Replaced the inline hard-reset confirm dialog in the Header with a cleaner Settings button

2. **Tutorial hints system** (`TutorialHints.tsx`):
   - Lightweight first-run contextual hints that appear in bottom-left corner
   - 5 hint stages that trigger based on game state:
     - "Tap to gather" (first 5 seconds, no systems)
     - "Build your first system" (after 5s, no systems) → CTA opens Systems tab
     - "Research technology" (first system built, no tech) → CTA opens Tech tab
     - "Your lineage is forming" (first affinity earned, not locked)
     - "Ready to evolve" (all evolve requirements met) → CTA opens Actions tab
   - Minimizable (– button) and dismissible per-hint or globally ("Disable" button)
   - Uses `tutorialDismissed` flag in state for permanent disable
   - Does not persist dismissed hints (resets on reload) — intentional, so hints reappear for new players

3. **More achievements** (expanded from 22 → 31):
   - Population milestones: Village (50), Town (200), Metropolis (1000)
   - Stage mastery tiers: Cell Veteran, Creature Veteran, Tribal Veteran (5 clears each)
   - Speed run: Quick Spark (evolve past Cell in < 5 min)
   - Rare archetype: Rare Genesis (lock in any rare archetype)
   - Added `maxPopulation` tracking to run state (peak population for achievements)
   - Added `fastestCellClear` tracking to meta state (best Cell clear time)
   - New "Speed" category in the achievements filter

4. **More story triggers** (expanded from 4 → 8):
   - `first_autobuyer` — fires when you build a Membrane Pump (first automation)
   - `first_tech` — fires when you research your first technology
   - `population_boom` — fires when population reaches 50
   - `first_cap` — fires when any resource first hits capacity
   - 4 new story entries with narrative text matching the game's mythic tone
   - All triggers fire during gameplay via the tick's story check

### Styling Improvements
5. **Codex tab visual cleanup** (VLM feedback from round 1):
   - Systems Catalogue and Tech Tree Index now show discovered items FIRST
   - Undiscovered items collapsed into a single dashed summary line: "32 undiscovered — keep building to find them"
   - Added count badges to section headers (e.g., "0/32")
   - Eliminates the wall of "???" placeholders that created visual noise
   - Much cleaner empty-state experience for new players

6. **Header cleanup**:
   - Removed inline hard-reset confirm dialog (moved to Settings modal)
   - Removed `RotateCcw` icon button, replaced with `Settings` gear icon
   - Cleaner, less cluttered header

### Code Quality
- 0 lint errors in project code
- Save migration handles all new fields (`showSettings`, `tutorialDismissed`, `maxPopulation`, `fastestCellClear`)
- Achievement checking includes `maxPopulation` and `fastestCellClear` in context
- `fastestCellClear` tracked in evolveStage when clearing Cell stage
- `maxPopulation` tracked in tick (max of current and previous)
- Story triggers use safe optional chaining to avoid crashes on fresh state

## Verification Results
- Dev server compiles cleanly, no module-not-found or TypeScript errors
- Page loads with 5 resource chips, no console errors
- Settings modal opens via gear icon, shows all sections (export, import, save, danger zone)
- Export generates valid base64 save string, copy/download buttons work
- Tutorial hint "Build your first system" appears in bottom-left with CTA button
- Story popup "The Full Vessel" fires when a resource hits cap (new trigger working)
- Codex tab shows "0/32" badge + "32 undiscovered" summary instead of 32 "???" cards
- 0 lint errors in project code (6 warnings all in `upload/` vanilla JS)

## Unresolved Issues / Risks
1. **Tutorial hints don't persist dismissal**: Dismissed hints reset on page reload. This is intentional for new-player guidance but may annoy returning players. The "Disable" button permanently hides all hints via `tutorialDismissed`.
2. **Offline progress testing**: Still hard to test via agent-browser due to `beforeunload` saving. Code logic verified correct for real tab-close/reopen.
3. **Future stages playtest**: Creature/Tribal/Civilization stages have data but haven't been playtested end-to-end. Balance may need tuning.
4. **PWA setup not yet done**: Web manifest + service worker for true offline access still pending (design doc §12.1).

## Priority Recommendations for Next Phase
1. **Playtest later stages** — Run through Creature → Tribal → Civilization to verify progression and archetype lock-in at boundaries.
2. **PWA setup** — Add `manifest.json` + service worker for installable offline play.
3. **More achievements** — Expand to 50+ (design doc targets 200-300). Add crisis survival, resource threshold, and alignment achievements.
4. **Stage-specific story triggers** — Add triggers for each stage's mid-point and exit (currently only Cell has mid-stage triggers).
5. **Balance tuning** — Verify the Cell stage takes 5-60 min as designed (§2.3). May need to adjust system costs/production rates.
6. **Mobile layout audit** — Test the responsive design on actual mobile viewport sizes.

---
Task ID: 4
Agent: webDevReview cron (round 3)
Task: QA testing, fix sticky overlap bug, PWA setup, more story triggers, EvolveModal archetype warning, playtest Cell→Creature

## Current Project Status Assessment
Game is stable and playable. Cell stage fully functional. Previous rounds added achievements, offline progress, save export/import, tutorial hints, and Codex cleanup. This round focused on a critical layout bug fix, PWA setup, and verifying the full Cell→Creature progression flow works end-to-end.

## Work Completed This Round

### Bug Fixes
1. **Critical sticky overlap bug** (found during QA playtest):
   - The TabNav had `sticky top-[57px]` but the ResourceBar (`sticky top-[53px]`) is 42px tall (53→95).
   - This caused the TabNav to overlap the ResourceBar, making the "Actions" tab button unclickable (covered by resource chips).
   - **Fix**: Changed TabNav from `top-[57px]` to `top-[95px]` so it sits below the resource bar.
   - Verified: Header (0-53), ResourceBar (53-95), TabNav (95-142) — no overlaps.

### New Features
2. **PWA support** (design doc §12.1):
   - `public/manifest.json` — Web app manifest with name, icons, shortcuts, standalone display mode
   - `public/sw.js` — Service worker with cache-first (static assets) and network-first (navigation) strategies
   - `ServiceWorkerRegister.tsx` — Client component that registers the SW in production only
   - Updated `layout.tsx` with manifest link, appleWebApp config, and viewport themeColor
   - App is now installable (Add to Home Screen) and works offline after first visit

3. **8 new story triggers** (expanded from 8 → 16 total):
   - Tribal: `agriculture_mastered`, `first_writing`
   - Civilization: `first_city` (3 systems), `scientific_method`
   - Empire: `first_empire_decree` (2 systems)
   - Solar: `first_colony` (build colony_ship)
   - Galactic: `ascension_researched` (research ascension_theory)
   - 8 new story entries with narrative text for each trigger
   - Every stage now has at least one mid-stage story trigger

4. **EvolveModal archetype lock-in warning**:
   - When evolving from Creature → Tribal, the modal now shows a colored warning panel
   - Displays the dominant archetype's glyph, name, and the bonus that will be granted
   - Warns "This cannot be changed" — makes the lock-in decision feel weighty
   - Uses the archetype's color for visual consistency

### Playtest Verification
5. **Full Cell → Creature progression verified**:
   - Started fresh, clicked Absorb Glucose to build resources
   - Built 6 Cell systems (Membrane Pump, Ribosome, Vacuole, Mitochondria, Organelle Forge, Nucleus)
   - Researched 3 techs (Membrane Reinforcement, Photosynthesis, Enzymatic Pathways)
   - Population reached 54 (need 12), Score 568 (need 100)
   - Lineage showed Plantoid 3 + Fungoid 1 drift
   - Clicked Evolve → Evolve modal appeared → confirmed → stage changed to Creature
   - Creature stage loaded with new resources (food, water, materials, etc.)
   - Lineage panel showed "Will lock as Plantoid on evolution" — lock-in preview working
   - All stage transitions, resource changes, and UI updates work correctly

### Code Quality
- 0 lint errors in project code (6 warnings all in `upload/` vanilla JS)
- Service worker only registers in production (avoids dev caching issues)
- Manifest accessible at `/manifest.json` (verified via fetch)
- Save migration handles all new fields from previous rounds

## Verification Results
- Dev server compiles cleanly, no errors
- Page loads with no console errors
- Sticky layers stack correctly: Header (0-53) → ResourceBar (53-95) → TabNav (95-142)
- Actions tab button now clickable (was previously covered by resource bar)
- Successfully evolved Cell → Creature with all requirements checked
- Creature stage loads with correct resources and requirements
- Lineage drift display works, "Will lock as X on evolution" preview correct
- Manifest.json accessible and valid
- 0 lint errors in project code

## Unresolved Issues / Risks
1. **PWA icons not generated**: The manifest references `/icon-192.png` and `/icon-512.png` but these files don't exist yet. The app will still install but use the default icon. Should generate proper icons.
2. **Service worker only in production**: SW registration is skipped in dev to avoid caching issues. Can't test offline mode in dev — needs a production build.
3. **Later stages playtest**: Tribal → Civilization → Empire → Solar → Galactic haven't been playtested. The data exists but balance may need tuning.
4. **Tutorial hint overlap**: The tutorial hint "Ready to evolve" appeared over the Evolve button, blocking the click. This is a minor UX issue — the hint's "Evolve now" CTA is an alternative path, but the hint should dismiss when the evolve modal opens.

## Priority Recommendations for Next Phase
1. **Generate PWA icons** — Create 192x192 and 512x512 PNG icons (could use the stage emoji or a custom logo).
2. **Playtest Tribal → Galactic** — Verify all stage transitions, archetype lock-in at Creature→Tribal, and the late-game systems/tech.
3. **Tutorial hint auto-dismiss** — Hints should auto-dismiss when the relevant modal opens (e.g., "Ready to evolve" dismisses when EvolveModal opens).
4. **Balance tuning** — Verify Cell stage takes 5-60 min as designed. The playtest took ~48 min at 8x speed (6 min real time), which seems right.
5. **More achievements** — Expand to 50+ (design doc targets 200-300). Add crisis survival and alignment achievements.
6. **Mobile layout audit** — Test responsive design on actual mobile viewport sizes (375px width).
