version 1:
""

# Index.tsx — Modern Multi-Layer Glow Editor Studio Dokumentáció

> **Útvonal:** `/editor`  
> **Fájl:** `pages/Index.tsx`  
> **Méret:** ~287 sor (orchestrátor — a logika komponensekben és lib fájlokban él)  
> **Verzió:** v3 — "GLOW Editor Studio / Builder Fusion"

---

## 1. Áttekintés és Cél

Az **Index.tsx** a GLOW Studio modern, multi-layer szerkesztője. A felhasználó **tetszőleges számú réteget** hozhat létre, mindegyiknek saját színnel, mérettel, blur-rel, blend mode-dal, gradient fill-lel, clip mask-kal és per-layer animációval. A felület három panelre oszlik: bal oldali sidebar (rétegkezelés), középső canvas (élő előnézet), jobb oldali sidebar (stílus szerkesztés).

### Miért készült?
- **Professzionális szintű kontroll:** Minden réteg egyedileg szerkeszthető
- **Moduláris architektúra:** Minden funkció külön komponensben és lib fájlban
- **Fejlett funkciók:** A/B összehasonlítás, command palette, share URL, gradient fill, clip mask, layer groups, per-layer animációk
- **Export sokféleség:** CSS, Tailwind, React component, SVG

---

## 2. Architektúra

### 2.1 Orchestrátor Pattern
Az `Index.tsx` egy vékony orchestrátor réteg, amely:
1. **Állapotot kezel** (`usePersistedState`, `useHistory`, `usePresets`)
2. **Eseménykezelőket definiál** (handleStateChange, handleUndo, handleShare stb.)
3. **Komponenseket összekapcsol** (LeftSidebar, GlowPreview, RightSidebar, CommandPalette, ABSplitView, ExportModal)

### 2.2 Fájlstruktúra
```
pages/Index.tsx                    ← Orchestrátor (287 sor)
├── components/glow-editor/
│   ├── LeftSidebar.tsx            ← Bal panel: rétegkezelés, presetek, power
│   ├── GlowPreview.tsx            ← Középső canvas: élő előnézet, drag, zoom
│   ├── RightSidebar.tsx           ← Jobb panel: stílus, globális, kód, export
│   ├── ABSplitView.tsx            ← A/B összehasonlítás panel
│   ├── CommandPalette.tsx         ← ⌘K command palette
│   └── ControlPanel.tsx           ← Alternatív vezérlőpanel (régebbi verzió)
├── hooks/
│   ├── use-glow-editor.ts         ← useHistory + usePresets hooks
│   └── use-persisted-state.ts     ← localStorage perzisztencia
├── lib/
│   ├── glow-types.ts              ← Típusok, INITIAL_STATE, exportAsCSS
│   ├── glow-export.ts             ← Tailwind, React, SVG export
│   ├── glow-presets.ts            ← 18 beépített preset
│   ├── glow-utils.ts              ← Szín utility-k, layer műveletek, randomGlow
│   ├── glow-share.ts              ← URL encode/decode megosztáshoz
│   └── oklch-utils.ts             ← OKLCH színmatematika
```

---

## 3. Állapotkezelés (State Management)

### 3.1 GlowState (lib/glow-types.ts)
```typescript
interface GlowState {
  power: boolean;              // Master power toggle
  themeMode: "dark" | "light"; // Téma
  globalScale: number;         // Globális skálázás (0.5–2.0)
  globalOpacity: number;       // Globális átlátszóság (0–1)
  noiseEnabled: boolean;       // Noise overlay
  noiseIntensity: number;      // Noise intenzitás
  layers: GlowLayer[];         // Rétegek tömbje (korlátlan)
  selectedLayerId: string | null; // Kiválasztott réteg
  animation: AnimationConfig;  // Globális animáció
  canvasBackground?: CanvasBackground; // Canvas háttér
  groups?: LayerGroup[];       // Rétegcsoportok
  selectedGroupId?: string | null;
  copiedStyle?: CopiedLayerStyle | null; // Copy/paste stílus
}
```

### 3.2 GlowLayer
```typescript
interface GlowLayer {
  id: string;
  name: string;
  active: boolean;           // Láthatóság
  color: string;             // Egyedi szín (hex)
  blur: number;              // Blur (px)
  opacity: number;           // Átlátszóság (0–1)
  width: number;             // Szélesség (px)
  height: number;            // Magasság (px)
  x: number;                 // X pozíció offset
  y: number;                 // Y pozíció offset
  blendMode: BlendMode;      // Keverési mód
  groupId?: string;          // Csoport azonosító
  clipMask?: ClipMask;       // Clip mask (kép URL + fit)
  gradient?: GradientType;   // Gradient típus (none/linear/radial/conic)
  gradientAngle?: number;    // Gradient szög
  gradientStops?: GradientStop[]; // Gradient megállók
  layerAnimation?: LayerAnimation; // Per-layer animáció
}
```

### 3.3 Hooks
| Hook | Fájl | Funkció |
|------|------|---------|
| `usePersistedState()` | `hooks/use-persisted-state.ts` | localStorage-ba mentett GlowState (300ms debounce) |
| `useHistory()` | `hooks/use-glow-editor.ts` | Undo/Redo stack (max 50 lépés) |
| `usePresets()` | `hooks/use-glow-editor.ts` | User preset CRUD + import/export |

---

## 4. Fő Komponensek

### 4.1 LeftSidebar (bal oldali panel, ~280px)
**Fájl:** `components/glow-editor/LeftSidebar.tsx`

Tartalma:
- **Header:** "GLOW EDITOR STUDIO" logó + verzió
- **Undo/Redo** gombok
- **Random** gomb — teljes glow randomizálás
- **Export** gomb — ExportModal megnyitás
- **Share** gomb — URL generálás és clipboard másolás
- **⌘K** gomb — Command Palette megnyitás
- **Power toggle** — Master power be/ki
- **Component picker** — UI elem típus választó (Button, Card, Header, Hero, Input, Modal, Nav, Badge)
- **Template browser** — Kategória szűrő (Dark Aesthetics stb.)
- **Layer manager:**
  - Réteg lista (drag handle, visibility toggle, szín swatch, név)
  - Réteg hozzáadás (+)
  - Réteg duplikálás
  - Réteg sorrend (drag-to-reorder)
  - Réteg kiválasztás
- **Templates** szekció — 18 beépített preset 4 kategóriában
- **Preset manager** — User presetek mentés/törlés/kedvenc/import/export

### 4.2 GlowPreview (középső canvas)
**Fájl:** `components/glow-editor/GlowPreview.tsx` (~1308 sor)

Tartalma:
- **Canvas toolbar:** Shape választó (Phone/Card/Hero/Square/Mobile/Tablet/Desktop) + zoom + háttér választó
- **Élő előnézet:**
  - Rétegek renderelése CSS blur-rel és blend mode-dal
  - Gradient fill támogatás (linear/radial/conic)
  - Clip mask támogatás
  - Per-layer animációk
  - Noise overlay
  - Shape-specifikus tartalom (PhoneContent, CardContent stb.)
- **Interakciók:**
  - **Drag-to-move layers:** Rétegek húzása a canvason
  - **Zoom:** Zoom in/out/fit gombok
  - **Layer selection:** Kattintás a rétegre kiválasztja
  - **Background picker:** Canvas háttér váltás (dark/light/gradient/mesh/dots/transparent)
  - **SVG export:** Közvetlen SVG letöltés
- **Status bar:** Canvas méret, rétegszám, aktív réteg neve

### 4.3 RightSidebar (jobb oldali panel, ~320px)
**Fájl:** `components/glow-editor/RightSidebar.tsx`

3 tab-os felület:

#### Style tab
- **Smart Suggestions:** "Boost Glow" és "Harmonize" gombok
- **Active Color:** Szín swatch + hex input
- **OKLCH sliders:** Lightness, Chroma, Hue
- **Recent Colors:** Utolsó használt színek
- **Color Harmony:** Complementary, Analogous, Triadic, Split-Comp
- **Blur slider** (px)
- **Opacity slider**
- **Blend Mode** választó
- **Gradient Fill:** Típus (none/linear/radial/conic), szög, megállók
- **Clip Mask:** Kép URL + fit mód (cover/contain/fill/none)
- **Per-Layer Animation:** Típus (pulse/breathe/orbit/drift/flicker/colorShift), duration, delay

#### Global tab
- **Master Scale** slider
- **Master Opacity** slider
- **Animation** toggle + duration
- **Noise Overlay** toggle + intenzitás
- **Theme Mode** választó

#### Code tab
- **Live CSS Editor:** Szerkeszthető CSS textarea
- **Reset** gomb (visszaállítás a generált CSS-re)
- Slider változások felülírják a manuális szerkesztést

### 4.4 ABSplitView (A/B összehasonlítás)
**Fájl:** `components/glow-editor/ABSplitView.tsx`

- Snapshot készítés az aktuális állapotról
- Egymás melletti összehasonlítás (snapshot vs. élő)
- Bezárás gomb

### 4.5 CommandPalette (⌘K)
**Fájl:** `components/glow-editor/CommandPalette.tsx`

- Keresés az elérhető parancsok között
- Billentyűzet navigáció (↑↓ + Enter)
- Parancsok: Undo, Redo, Export, Share, Randomize, preset betöltés stb.

### 4.6 ExportModal
**Fájl:** `components/glow-editor/RightSidebar.tsx` (ExportModal export)

4 formátum:
- **CSS:** Teljes CSS kód szintaxis-kiemeléssel
- **Tailwind:** Tailwind + inline style JSX
- **React:** Önálló React komponens
- **SVG:** SVG export

---

## 5. Presetek (lib/glow-presets.ts)

18 beépített preset, 4 kategóriában:

| Kategória | Presetek |
|-----------|----------|
| **⚡ Neon** | Neon Blue, Neon Green, Neon Red, Neon Purple, Cyberpunk |
| **🌿 Nature** | Forest Glow, Golden Hour, Ice Crystal, Warm Sunset, Aurora, Ocean Deep |
| **🎨 Vibrant** | Purple Haze, Fire Blaze, Rainbow |
| **✨ Minimal** | Soft White, Mono Glow, Rose Mist |

Minden preset tartalmaz:
- 3–4 réteget egyedi színekkel és paraméterekkel
- Opcionális animáció beállítást
- Noise intenzitás beállítást
- Téma beállítást (dark/light)

---

## 6. Export Formátumok (lib/glow-export.ts)

### 6.1 CSS (`exportAsCSS`)
- `.glow-container` wrapper
- `.glow-layer-N` per-layer CSS
- Gradient, clip mask, per-layer animation keyframes
- Layer group opacity/blend mode öröklés
- Noise overlay

### 6.2 Tailwind (`exportAsTailwind`)
- JSX kód Tailwind osztályokkal + inline style-okkal
- Tailwind config javaslat animációkhoz

### 6.3 React Component (`exportAsReactComponent`)
- Önálló `GlowEffect` komponens
- Props: className, scale, opacity
- Layer konfiguráció beágyazva

### 6.4 SVG (`exportAsSVG`)
- SVG elemek feGaussianBlur filterekkel
- Ellipszisek a rétegekhez
- Blend mode és opacity támogatás

---

## 7. Megosztás (lib/glow-share.ts)

### URL Encoding
```
encodeStateToUrl(state) → base64(encodeURIComponent(JSON.stringify(state)))
```

### Megosztási folyamat
1. `buildShareUrl()` — URL hash-be kódolja az állapotot (`#s=...`)
2. Clipboard API-val másolja a vágólapra
3. Fallback: `window.location.hash` beállítás

### Betöltés
1. `getStateFromCurrentUrl()` — URL hash-ből dekódolja az állapotot
2. `useEffect` az `Index.tsx`-ben ellenőrzi induláskor
3. Toast értesítés: "Loaded shared glow effect!"
4. URL hash törlése a betöltés után

---

## 8. Billentyűparancsok

| Billentyű | Funkció |
|-----------|---------|
| `⌘K` | Command Palette megnyitás |
| `⌘Z` | Undo |
| `⌘⇧Z` / `⌘Y` | Redo |

A Command Palette-en keresztül elérhető további parancsok:
- Random glow generálás
- Export megnyitás
- Share link generálás
- Preset betöltés

---

## 9. Perzisztencia

| Kulcs | Hook | Tartalom |
|-------|------|----------|
| `glow-editor-state-v1` | `usePersistedState` | Teljes GlowState (300ms debounce) |
| `glow-editor-presets-v2` | `usePresets` | User presetek tömbje |

---

## 10. Felhasználói Folyamatok (User Flows)

### 10.1 Új glow létrehozás
1. Oldal betöltés → alapértelmezett 4 réteg (Neon Green preset)
2. Réteg kiválasztás a bal panelen
3. Szín, blur, opacity, méret beállítás a jobb panelen
4. Új réteg hozzáadás (+) vagy duplikálás
5. Rétegek átrendezése drag-gel

### 10.2 Preset használat
1. Bal panel → Templates szekció
2. Kategória szűrés (Neon/Nature/Vibrant/Minimal)
3. Preset kattintás → teljes állapot betöltés
4. Testreszabás a jobb panelen

### 10.3 Export
1. "Export" gomb (bal panel) vagy ⌘K → Export
2. Formátum választás (CSS/Tailwind/React/SVG)
3. Kód másolás a vágólapra

### 10.4 Megosztás
1. "Share" gomb (bal panel)
2. URL generálás és vágólapra másolás
3. Címzett megnyitja az URL-t → állapot automatikusan betöltődik

### 10.5 A/B összehasonlítás
1. A/B toggle gomb (canvas tetején)
2. Snapshot készül az aktuális állapotról
3. Módosítások az élő oldalon
4. Vizuális összehasonlítás

---

## 11. Különbségek a Classic Editortól (GlowEditorV2)

| Jellemző | Index.tsx (Modern) | GlowEditorV2 (Classic) |
|----------|-------------------|----------------------|
| **Rétegek** | Korlátlan, manuális | 4 fix, automatikus |
| **Szín** | Per-layer egyedi | Egyetlen alapszín |
| **Layout** | 3 panel (left/center/right) | 2 panel (preview/control) |
| **Architektúra** | Moduláris (10+ fájl) | Self-contained (1 fájl) |
| **Fényforrás** | Drag-to-move layers | Drag-to-place light |
| **Export** | CSS, Tailwind, React, SVG | Csak CSS |
| **Presetek** | 18 beépített + user | 6 beépített |
| **Gradient** | Linear/Radial/Conic | Nincs |
| **Clip Mask** | Kép alapú | Nincs |
| **Animáció** | Globális + per-layer (6 típus) | Nincs |
| **Layer Groups** | Támogatott | Nincs |
| **Copy/Paste Style** | Támogatott | Nincs |
| **A/B Split** | Támogatott | Nincs |
| **Command Palette** | ⌘K | Nincs |
| **Share URL** | Támogatott | Nincs |
| **Component Picker** | 8 UI elem típus | Nincs |

---

## 12. Technikai Stack

| Technológia | Használat |
|-------------|-----------|
| **React 18+** | UI framework |
| **TypeScript** | Típusbiztonság |
| **Framer Motion** | Animációk (AnimatePresence, motion.div, layoutId) |
| **Tailwind CSS** | Styling (+ CSS custom properties) |
| **Sonner** | Toast értesítések |
| **Lucide React** | Ikonok |
| **React Router** | Routing (/editor útvonal) |
| **heroui-shims** | Custom Slider, Switch, Select, Accordion komponensek |
| **OKLCH** | Perceptuálisan egyenletes színkezelés |

---

## 13. CSS Design System (index.css)

### Fontok
- **DM Sans:** Alap szöveg
- **Syne:** Címsorok és display szöveg
- **DM Mono:** Monospace (kód, értékek)

### Design Tokenek
- OKLCH alapú színrendszer (light/dark téma)
- Glass surface system (backdrop-filter + gradient overlay)
- Editor surface tokenek (editor-surface, editor-border, editor-text-dim)
- Radius skála (xs → 4xl)
- Shadow rendszer (depth, ambient, close, inset)
- Transition timing (fast/normal/slow) + easing curves

### Speciális CSS osztályok
- `.glass-surface` — Üveg hatású felület
- `.control-section` — Sidebar vezérlő kártya
- `.canvas-bg` — Canvas háttér dot pattern-nel
- `.editor-bg` — Editor háttér accent gradient-tel
- `.custom-scrollbar` — Egyedi scrollbar
- `.focus-glow` — Focus glow effekt

""
-----------
version 2:
""

# GlowEditorV2.tsx — Classic Glow Editor Dokumentáció

> **Útvonal:** `/classic`  
> **Fájl:** `pages/GlowEditorV2.tsx`  
> **Méret:** ~3390 sor (önálló, self-contained modul)  
> **Verzió:** v2 — "Classic Single-Color Editor"

---

## 1. Áttekintés és Cél

A **GlowEditorV2** egy önálló, egyetlen fájlban megvalósított CSS glow effekt szerkesztő. A felhasználó **egyetlen alapszínből** hoz létre többrétegű, progresszív blur glow effekteket, amelyeket különböző alakzatokon (Phone, Card, Hero, Square) tekinthet meg élőben.

### Miért készült?
- **Egyszerűbb felhasználói élmény:** Egy szín → automatikusan 4 réteg generálódik
- **Önálló architektúra:** Nincs külső függőség más komponensekre — minden a fájlban van
- **OKLCH színtudomány:** Perceptuálisan egyenletes színmanipuláció
- **Interaktív fényforrás:** Drag-to-place light source a preview-n

---

## 2. Architektúra

### 2.1 Self-Contained Design
Az egész oldal egyetlen fájlban él, beleértve:
- Színkonverziós utility-k (sRGB ↔ OKLab ↔ OKLCH)
- Típusdefiníciók és konstansok
- Reducer + History wrapper
- Context + Provider
- Preview és ControlPanel komponensek
- Layout és belépési pont

### 2.2 Context + Reducer + History Pattern
```
GlowEditorProvider
  └── useReducer(historyReducer)
       └── reducer(state, action)
            └── GlowEditorContext.Provider
                 ├── Preview (reads context)
                 └── ControlPanel (reads context)
```

**Nincs prop drilling** — mindkét fő komponens közvetlenül a `useGlowEditor()` hook-on keresztül éri el az állapotot és az akciókat.

---

## 3. Fő szekciók (kódstruktúra)

| # | Szekció | Sorok | Leírás |
|---|---------|-------|--------|
| 1 | Color Conversion Utilities | 1–220 | Teljes OKLCH színmatematika (sRGB ↔ OKLab ↔ OKLCH) |
| 2 | Types & Constants | 222–307 | Shape, ThemeMode, BlendMode, Preset típusok és PRESETS tömb |
| 3 | Unified Layer Config | 332–417 | `LAYER_CONFIG` — 4 fix réteg definíciója (single source of truth) |
| 4 | Pure Helpers | 418–492 | clamp, normalizeHue, sanitizeColor, hex kezelés, randomHex |
| 5 | Default State | 493–519 | `initialState` — alapértelmezett GlowEditorState |
| 6 | Reducer | 520–656 | 9 action type kezelése (SET_POWER, UPDATE_COLOR, APPLY_PRESET stb.) |
| 7 | History Wrapper | 657–715 | Undo/Redo rendszer (max 50 lépés, SET_HEX_INPUT kihagyva) |
| 8 | Local Storage | 716–777 | Perzisztencia: `glow-editor-state-v1`, `color-history`, `panel-sections` |
| 9 | Context | 778–807 | `GlowEditorContext` + `useGlowEditor()` hook |
| 10 | Provider | 808–1052 | Unified keyboard shortcuts, debounced persist, action callbacks |
| 11 | Shared Hooks | 1053–1079 | `useViewportSize` — ResizeObserver alapú méretfigyelés |
| 12 | Noise SVG | 1080–1095 | Konstans SVG noise pattern + font stílusok |
| 13 | Preview Sub-components | 1096–1605 | Shape tartalmak, toolbar, status bar, GlowLayersRenderer, NoiseOverlay |
| 14 | Preview Component | 1606–1991 | Fő preview: drag-to-place light, keyboard navigation, shape rendering |
| 15 | Control Panel Sub-components | 1992–2576 | Section, SliderRow, Toggle, SwitchRow, PresetSwatch, HarmonyChip, LightPositionPad |
| 16 | Control Panel | 2577–3331 | Fő vezérlőpanel: presets, theme, base color, sliders, harmony, layers, CSS |
| 17 | Layout | 3332–3379 | ARIA live region + Preview + ControlPanel elrendezés |
| 18 | App Entry Point | 3380–3390 | `GlowEditorV2` export — Provider wrapping |

---

## 4. Állapotkezelés (State Management)

### 4.1 GlowEditorState
```typescript
type GlowEditorState = {
  power: boolean;          // Glow be/ki
  themeMode: ThemeMode;    // "dark" | "light"
  shape: Shape;            // "phone" | "card" | "hero" | "square"
  color: ColorState;       // { l, c, h } — OKLCH értékek
  hexInput: string;        // Aktuális hex szín input
  activePreset: string | null; // Aktív preset neve
  glow: GlowState;        // Glow paraméterek (blur, scale, light position stb.)
}
```

### 4.2 GlowState (glow paraméterek)
```typescript
type GlowState = {
  maskSize: number;        // Maszk méret (0–1)
  glowScale: number;       // Glow skálázás (0.3–2.5)
  blurIntensity: number;   // Blur intenzitás szorzó (0.25–2.5)
  lightX: number;          // Fényforrás X pozíció (0–1)
  lightY: number;          // Fényforrás Y pozíció (0–1)
  noiseEnabled: boolean;   // Noise overlay be/ki
  noiseIntensity: number;  // Noise intenzitás (0–1)
}
```

### 4.3 Reducer Actions
| Action | Leírás |
|--------|--------|
| `SET_POWER` | Glow be/kikapcsolás |
| `SET_THEME_MODE` | Sötét/világos téma váltás |
| `SET_SHAPE` | Alakzat váltás (phone/card/hero/square) |
| `UPDATE_COLOR` | OKLCH szín frissítés (L/C/H slider) |
| `SET_HEX_INPUT` | Hex input mező frissítés (history-t nem ír) |
| `APPLY_HEX_COLOR` | Hex szín alkalmazás → OKLCH konverzió |
| `APPLY_PRESET` | Preset alkalmazás (Amber, Rose, Violet stb.) |
| `UPDATE_GLOW` | Glow paraméterek frissítés |
| `LOAD_STATE` | Teljes állapot betöltés |

### 4.4 History (Undo/Redo)
- **Maximum 50 lépés** visszavonás
- `SET_HEX_INPUT` action **nem kerül** a history-ba (csak a végleges APPLY_HEX_COLOR)
- `⌘Z` / `⌘⇧Z` / `⌘Y` billentyűparancsok

---

## 5. LAYER_CONFIG — Rétegrendszer

A klasszikus editor **4 fix rétegből** áll, amelyek a `LAYER_CONFIG` tömbben vannak definiálva:

| Réteg | ID | Méret (%) | Blur (px) | Opacity (dark/light) | Blend Mode | Szín |
|-------|----|-----------|-----------|---------------------|------------|------|
| Background | `bg` | 320% | 150 | 0.35 / 0.32 | screen / normal | Aktív szín |
| Medium | `medium` | 210% | 100 | 0.55 / 0.50 | screen / normal | Aktív szín |
| Core | `core` | 120% | 55 | 0.85 / 0.60 | screen / normal | Aktív szín |
| Highlight | `highlight` | 70% | 45 | 0.40 / 0.65 | normal / normal | Fehér (#fff) |

### resolveLayers() függvény
A `LAYER_CONFIG`-ból téma és shape alapján számítja ki a végleges réteg-paramétereket:
- **Blur skálázás:** `blurBase × (shapeWidth / 360) × blurIntensity`
- **Opacity:** dark/light téma szerint
- **Blend mode:** dark/light téma szerint

---

## 6. Színkezelés — OKLCH Color Science

### 6.1 Miért OKLCH?
- **Perceptuálisan egyenletes:** Azonos számértékű változás azonos vizuális változást eredményez
- **Intuitív paraméterek:** Lightness (fényesség), Chroma (telítettség), Hue (árnyalat)
- **Gamut-biztos:** A konverzió clamping-gel biztosítja az sRGB tartományon belüli értékeket

### 6.2 Konverziós lánc
```
HEX → sRGB → Linear RGB → LMS → OKLab → OKLCH
OKLCH → OKLab → LMS → Linear RGB → sRGB → HEX
```

### 6.3 Sliders
- **Lightness:** 0–100% (fekete → fehér)
- **Chroma:** 0–0.4 (szürke → telített)
- **Hue:** 0–360° (teljes színkör)

### 6.4 Color Harmony
A `computeHarmonies()` függvény 4 harmónia-csoportot generál:
- **Complementary:** +180° hue
- **Analogous:** ±30° hue
- **Triadic:** +120°, +240° hue
- **Split-Complementary:** +150°, +210° hue

---

## 7. Presets

6 beépített preset, 3 kategóriában:

| Kategória | Preset | Hex | L | C | H |
|-----------|--------|-----|---|---|---|
| **Warm** | Amber | #FF9F00 | 78 | 0.18 | 70° |
| **Warm** | Rose | #FF2D55 | 60 | 0.265 | 15° |
| **Cool** | Violet | #7C3AED | 50 | 0.22 | 295° |
| **Cool** | Cyan | #0EA5E9 | 70 | 0.175 | 210° |
| **Natural** | Emerald | #10B981 | 68 | 0.185 | 162° |
| **Natural** | Bone | #F0EDE4 | 94 | 0.018 | 80° |

**Billentyűparancs:** `1`–`6` gombok a presetek gyors alkalmazásához.

---

## 8. Komponensek

### 8.1 Preview (Előnézet)
- **Toolbar:** Shape választó (Phone/Card/Hero/Square) + méret kijelző
- **Canvas:** Interaktív felület drag-to-place fényforrással
- **GlowLayersRenderer:** 4 réteg renderelése CSS blur-rel
- **NoiseOverlay:** SVG fractalNoise alapú textúra
- **ShapeScene:** Alakzat-specifikus tartalom (PhoneContent, CardContent, HeroContent, SquareContent)
- **StatusBar:** Élő OKLCH értékek, hex szín, rétegszám

### 8.2 ControlPanel (Vezérlőpanel)
Jobb oldali 380px széles panel, accordion szekciókkal:

#### Header
- "Glow Editor" cím + OKLCH badge
- Undo/Redo gombok
- Power toggle

#### Presets szekció
- 6 preset swatch, 3 kategóriában (Warm/Cool/Natural)
- Billentyűparancs jelzés (Keys 1–6)

#### Theme Mode
- Dark/Light segmented button

#### Base Color
- Natív color picker + hex input
- OKLCH sliders (Lightness, Chroma, Hue) egyedi SliderRow komponenssel
- Recent Colors (max 8, localStorage-ban tárolva)

#### Shape & Light (accordion)
- Shape és Canvas info kártyák
- Mask Size, Glow Scale, Blur Intensity sliderek
- **LightPositionPad:** 2D drag pad a fényforrás pozícionálásához
- Light X/Y sliderek

#### Appearance (accordion)
- Noise Texture toggle + intenzitás slider
- Mode és Power info kártyák

#### Color Harmony (accordion)
- Base szín megjelenítés
- 4 harmónia-csoport (Complementary, Analogous, Triadic, Split-Comp)
- Kattintható HarmonyChip-ek

#### Layer Inspector (accordion)
- 4 réteg listázása (név, méret, blur, opacity, blend mode)
- Csak olvasható — a rétegek automatikusan generálódnak

#### Generated CSS (accordion)
- Szintaxis-kiemelt CSS kód
- Copy gomb

#### Status Bar (lábléc)
- Status/Shape/Layers info kártyák
- Billentyűparancs referencia (P, C, R, ⌘Z, 1–6)

---

## 9. Interakciók és Billentyűparancsok

| Billentyű | Funkció |
|-----------|---------|
| `P` | Power toggle |
| `R` | Random szín (flash effekttel) |
| `1`–`6` | Preset alkalmazás |
| `⌘Z` | Undo |
| `⌘⇧Z` / `⌘Y` | Redo |
| `←↑→↓` | Fényforrás nudge (Shift = nagyobb lépés) |
| `Space` / `Enter` | Power toggle (preview fókuszban) |
| Dupla kattintás | Random szín (preview-n) |
| Drag | Fényforrás áthelyezés (preview-n és LightPositionPad-on) |

---

## 10. Perzisztencia (localStorage)

| Kulcs | Tartalom |
|-------|----------|
| `glow-editor-state-v1` | Teljes GlowEditorState (debounced 500ms) |
| `glow-editor-color-history` | Utolsó 8 használt szín |
| `glow-editor-panel-sections` | Accordion szekciók nyitott/zárt állapota |

---

## 11. CSS Export

A ControlPanel "Generated CSS" szekciója valós időben generálja a CSS kódot a `LAYER_CONFIG` és az aktuális beállítások alapján:

```css
.glow-container { ... }
.glow-root { mask-image: linear-gradient(...); }
.glow-layer-1 { /* Background */ ... }
.glow-layer-2 { /* Medium */ ... }
.glow-layer-3 { /* Core */ ... }
.glow-layer-4 { /* Highlight */ ... }
.glow-noise { /* Optional */ ... }
```

---

## 12. Akadálymentesség (Accessibility)

- **ARIA live region:** Preset/power/shape változáskor screen reader bejelentés
- **aria-label:** Minden interaktív elemen
- **aria-pressed:** Preset swatchek és segmented buttonök
- **role="application":** Preview canvas és LightPositionPad
- **role="switch":** Toggle komponens
- **Keyboard navigation:** Teljes billentyűzet-támogatás

---

## 13. Teljesítmény-optimalizációk

- **memo():** Minden preview sub-component (PhoneContent, CardContent, GlowLayersRenderer, NoiseOverlay stb.)
- **useCallback():** Minden action és event handler
- **useMemo():** resolvedLayers, harmonyGroups, cssCode, groupedPresets
- **requestAnimationFrame:** Fényforrás drag throttling
- **Debounced persist:** 500ms localStorage mentés
- **SKIP_HISTORY:** SET_HEX_INPUT nem kerül a history-ba (csökkenti a memóriahasználatot)

---

## 14. Különbségek a Modern Editortól (Index.tsx)

| Jellemző | GlowEditorV2 (Classic) | Index.tsx (Modern) |
|----------|----------------------|-------------------|
| Rétegek | 4 fix, automatikus | Korlátlan, manuális |
| Szín | Egyetlen alapszín | Per-layer szín |
| Architektúra | Context + Reducer (self-contained) | Hooks + prop passing |
| Fényforrás | Drag-to-place pad | Drag-to-move layers |
| Export | Csak CSS | CSS, Tailwind, React, SVG |
| Presetek | 6 beépített | 18 beépített + user presets |
| Fájlméret | ~3390 sor (1 fájl) | ~287 sor + 10+ komponens fájl |

""
----------
