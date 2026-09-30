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
