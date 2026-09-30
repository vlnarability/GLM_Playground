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
