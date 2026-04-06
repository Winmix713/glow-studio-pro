

# Glow Studio Pro V3 — ComponentSynth Design Overhaul

## Goal
Redesign the entire Glow Studio Pro V3 UI with the ComponentSynth aesthetic: ultra-dark (#050505/#0c0c0c), precision-tool feel, refined sliders with fill-track + drag handles, dot-pattern canvas backgrounds, glass-panel sections, and smooth micro-interactions. All existing functionality (Classic/Studio modes, converters, engine) stays intact — only the visual layer changes.

---

## Key Design Changes

### 1. Global Design System Update (`src/index.css`)
- Replace current theme tokens with ComponentSynth palette: `#050505` body, `#0c0c0c` panels, `#111111` inputs, `white/5` borders
- Typography: Add Geist Sans (display) alongside existing DM Sans; keep DM Mono for code
- Add dot-pattern utility class: `radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)` at 32px spacing
- Add CSS transitions: `all 200ms ease` on interactive elements
- Add `scale(0.97)` press feedback on buttons
- Add staggered reveal animations (`animation-delay: 0ms/80ms/160ms`) for sidebar sections

### 2. Custom ComponentSynth Slider (`src/components/ui/cs-slider.tsx`)
- New slider component matching the reference: dark track (`#111`), filled portion (`#333`) with label text inside, drag grip dots, value readout on right
- Icon slot on left (using Lucide icons instead of Solar/Iconify)
- Pointer-capture drag logic for smooth interaction
- Replace all `<Slider>` usage in Classic & Studio shells

### 3. Custom Toggle Switch (`src/components/ui/cs-toggle.tsx`)
- Compact toggle matching reference: `bg-[#333]` off / `bg-blue-500/20` on with sliding dot
- Icon + label layout

### 4. Editor Orchestrator Redesign (`src/pages/editor/index.tsx`)
- Replace current minimal header with ComponentSynth-style header: logo orb (glow circles), "Glow Studio Pro" title, mode toggle as pill buttons, right-side action buttons (preview mode, settings)
- Rounded app window container (`md:rounded-[2rem]`, `bg-[#0c0c0c]`, `border-white/5`)
- Status bar integrated into bottom of container

### 5. Classic Shell Redesign (`src/components/glow-editor/classic-shell.tsx`)
- Left sidebar: glass-panel sections (`bg-white/[0.02]`, `border-white/5`, `rounded-2xl`) for Layout, Appearance, Color groups
- Use new CS-Slider for all controls (mask size, glow scale, blur intensity)
- Color swatches: rounded circles with gradient fills and active ring
- Segmented toggle for Tailwind/CSS output at bottom
- "Copy Component Code" blue CTA button with glow shadow
- Canvas: dot-pattern background, floating toolbar on right (zoom controls), bottom floating toolbar (undo/redo/export)
- Preview card with hover selection outline (corner dots)

### 6. Studio Shell Redesign (`src/components/glow-editor/studio-shell.tsx`)
- Apply same glass-panel aesthetic to left sidebar sections
- Layer list items: darker rows with hover states, refined icon buttons
- Right sidebar tabs: glass-panel styling per section
- Canvas: dot-pattern background, floating toolbars matching ComponentSynth
- Code tab: dark code viewer with line numbers and syntax highlighting

### 7. Shared Components Update
- `color-controls.tsx`: Glass-panel wrapping, refined color picker with rounded inputs
- `noise-toggle.tsx`: Use new CS-Toggle component
- `status-bar.tsx`: Subtle bottom bar with `bg-[#0c0c0c]/90 backdrop-blur-md`
- `canvas-shapes.tsx`: Add glassmorphism preview card as a component type option

---

## Technical Approach

### Files Created
- `src/components/ui/cs-slider.tsx` — ComponentSynth-style slider
- `src/components/ui/cs-toggle.tsx` — ComponentSynth-style toggle

### Files Modified
- `src/index.css` — New theme tokens, dot-pattern, animations, typography
- `src/pages/editor/index.tsx` — Redesigned header and container
- `src/components/glow-editor/classic-shell.tsx` — Full visual overhaul with glass panels, CS sliders, floating toolbars, code export panel
- `src/components/glow-editor/studio-shell.tsx` — Matching visual overhaul
- `src/components/shared/color-controls.tsx` — Refined styling
- `src/components/shared/noise-toggle.tsx` — Use CS-Toggle
- `src/components/shared/status-bar.tsx` — Glass-blur styling
- `src/components/shared/canvas-shapes.tsx` — Add glassmorphism card preview

### No Changes To
- `src/core/glow-engine/*` — Engine, converters, presets, export, share all untouched
- `src/hooks/*` — History and persistence hooks unchanged

