

# Glow Studio Pro — V3 Implementation Plan

## Overview
A unified professional glow editor with two switchable modes — **Classic** (single-color, auto 4-layer) and **Studio** (unlimited layers, full control) — running on a shared engine with seamless state conversion between modes.

---

## Phase 1: Core Engine (`core/glow-engine/`)

### Shared State Model — `GlowDocument`
- Define the canonical `GlowDocument` type with: `id`, `mode` (classic/studio), `themeMode`, `canvas` (shape, size, background), `colorModel` (baseOklch, recentColors, harmonies), `layers[]`, `groups[]`, `globalAnimation`, `noise`, `meta`
- All persistence, sharing, and export operates on this single type

### OKLCH Color Science — `oklch.ts`
- Consolidate V2's full sRGB↔OKLab↔OKLCH conversion chain and V1's color utilities into one shared module
- Color harmony computation (complementary, analogous, triadic, split-comp)
- Gamut clamping utilities

### State Converters — `converters.ts`
- **Classic → Studio**: Convert 4 auto-generated layers into explicit `GlowLayer[]` with position, blur, opacity, blendMode, color derived from LAYER_CONFIG logic
- **Studio → Classic**: Best-effort reduction — weighted color averaging, blur/size normalization to 4 layers. Drops gradient, clip mask, per-layer animation with user warning toast

### Unified Presets — `presets.ts`
- Merge V2's 6 presets + V1's 18 presets, tagged as `classic`, `studio`, or `both`
- Single preset type with mode filtering in UI

### Export Modules — `export/`
- CSS, Tailwind, React Component, SVG export — all accepting `GlowDocument` as input
- Share URL encoding/decoding with mode field included

---

## Phase 2: V3 Orchestrator (`pages/editor/index.tsx`)

### Mode Switching
- Top bar toggle: "Classic / Studio" with tooltip
- URL parameter support: `?mode=classic|studio`
- On mode switch, run appropriate converter; show warning modal if data loss occurs (Studio→Classic with advanced features)
- Shared undo/redo history (max 50 steps) operating on `GlowDocument`

### Persistence
- `glow-editor-document-v3` — canonical GlowDocument in localStorage (300ms debounce)
- `glow-editor-recent-colors-v3` — shared color history
- `glow-editor-ui-v3` — panel/accordion states

### Share URL
- Single format: `#s=` base64-encoded GlowDocument (includes mode)
- Opens in correct mode automatically

---

## Phase 3: Classic Shell (`classic-shell.tsx`)

Port V2's GlowEditorV2 experience:
- **Preview**: Drag-to-place light source on canvas, shape selector (Phone/Card/Hero/Square), noise overlay
- **Control Panel**: Accordion sections — Presets (6 swatches), Theme toggle, Base Color (native picker + hex + OKLCH sliders), Shape & Light (mask size, glow scale, blur intensity, 2D LightPositionPad), Appearance (noise), Color Harmony, Layer Inspector (read-only 4 layers), Generated CSS
- **Keyboard**: P (power), R (random), 1-6 (presets), arrows (light nudge), ⌘Z/⌘⇧Z (undo/redo)
- Internal state adapter: reads from `GlowDocument`, writes back via converter on each commit

---

## Phase 4: Studio Shell (`studio-shell.tsx`)

Port V1's full editor experience with 3-panel layout:
- **Left Sidebar** (~280px): Layer manager (add/duplicate/reorder/delete), component picker (8 UI elements), template browser (18 presets in 4 categories), user preset manager (save/delete/favorite/import/export), undo/redo/random/export/share/⌘K buttons, power toggle
- **Center Canvas**: Live preview with per-layer rendering (CSS blur + blend modes), gradient fill (linear/radial/conic), clip masks, per-layer animations, drag-to-move layers, zoom controls, background picker, SVG export, status bar
- **Right Sidebar** (~320px): 3 tabs — Style (color + OKLCH sliders + recent colors + harmony + blur/opacity/blend + gradient fill + clip mask + per-layer animation), Global (scale/opacity/animation/noise/theme), Code (live CSS editor)
- **A/B Split View**: Snapshot current state, compare side-by-side
- **Command Palette** (⌘K): Search commands, keyboard navigation

---

## Phase 5: Shared UI Components (`components/shared/`)

- Color controls (OKLCH sliders, color picker, harmony chips, recent colors)
- Noise toggle + intensity slider
- Keyboard shortcut handler
- Status bar component
- Canvas shape content renderers (Phone, Card, Hero, Square, Desktop, Tablet)

---

## Phase 6: Accessibility & Performance

- ARIA live regions for mode/preset/power/shape changes on both shells
- `role="application"` on canvases, consistent `aria-label`s
- `React.memo` on all preview subcomponents, `useMemo` for computed values
- `requestAnimationFrame` throttling for drag/zoom interactions
- Full keyboard navigation in both modes

---

## Design & UX

- **Design system**: DM Sans (body), Syne (headings), DM Mono (code) fonts; OKLCH-based color tokens; glass surface system with backdrop-filter
- **Dark/Light theme** support across both modes
- **Mode indicator** in status bar: "Mode: Classic | Studio"
- **Smooth transition** between modes with state preservation toast feedback

