// ─── Glow Studio Pro V3 — Canonical State Model ───

export type EditorMode = "classic" | "studio";
export type ThemeMode = "dark" | "light";
export type BlendMode = "normal" | "screen" | "multiply" | "overlay" | "soft-light" | "hard-light" | "color-dodge" | "color-burn" | "lighten" | "darken" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity";
export type GradientType = "none" | "linear" | "radial" | "conic";
export type ClipMaskFit = "cover" | "contain" | "fill" | "none";
export type AnimationType = "none" | "pulse" | "breathe" | "orbit" | "drift" | "flicker" | "colorShift";
export type CanvasShape = "phone" | "card" | "hero" | "square" | "desktop" | "tablet";
export type CanvasBgType = "dark" | "light" | "gradient" | "mesh" | "dots" | "transparent";
export type ComponentType = "button" | "card" | "header" | "hero" | "input" | "modal" | "nav" | "badge";
export type PresetCategory = "neon" | "nature" | "vibrant" | "minimal";

export interface GradientStop {
  color: string;
  position: number;
}

export interface ClipMask {
  url: string;
  fit: ClipMaskFit;
}

export interface LayerAnimation {
  type: AnimationType;
  duration: number;
  delay: number;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
}

export interface CanvasBackground {
  type: CanvasBgType;
  custom?: string;
}

export interface GlowLayer {
  id: string;
  name: string;
  active: boolean;
  color: string;
  blur: number;
  opacity: number;
  width: number;
  height: number;
  x: number;
  y: number;
  blendMode: BlendMode;
  groupId?: string;
  clipMask?: ClipMask;
  gradient?: GradientType;
  gradientAngle?: number;
  gradientStops?: GradientStop[];
  layerAnimation?: LayerAnimation;
}

export interface LayerGroup {
  id: string;
  name: string;
  opacity: number;
  blendMode: BlendMode;
  collapsed: boolean;
}

export interface CopiedLayerStyle {
  color: string;
  blur: number;
  opacity: number;
  blendMode: BlendMode;
  gradient?: GradientType;
  gradientAngle?: number;
  gradientStops?: GradientStop[];
}

export interface GlowDocument {
  id: string;
  mode: EditorMode;
  themeMode: ThemeMode;
  canvas: {
    shape: CanvasShape;
    width: number;
    height: number;
    background: CanvasBackground;
  };
  colorModel: {
    baseOklch: { l: number; c: number; h: number };
    recentColors: string[];
    harmoniesEnabled: boolean;
  };
  layers: GlowLayer[];
  groups: LayerGroup[];
  globalScale: number;
  globalOpacity: number;
  globalAnimation: AnimationConfig;
  noise: { enabled: boolean; intensity: number };
  power: boolean;
  selectedLayerId: string | null;
  selectedGroupId?: string | null;
  copiedStyle?: CopiedLayerStyle | null;
  componentType?: ComponentType;
  meta: {
    createdAt: string;
    updatedAt: string;
    source: "classic" | "studio" | "import";
  };
}

// ─── Classic Mode State (V2 adapter) ───

export interface ClassicLightPosition {
  x: number;
  y: number;
}

export interface ClassicEditorState {
  power: boolean;
  themeMode: ThemeMode;
  baseColor: string;
  baseOklch: { l: number; c: number; h: number };
  shape: CanvasShape;
  lightPosition: ClassicLightPosition;
  maskSize: number;
  glowScale: number;
  blurIntensity: number;
  noiseEnabled: boolean;
  noiseIntensity: number;
  activePreset: number;
  recentColors: string[];
  harmoniesEnabled: boolean;
}

// ─── Canvas shape dimensions ───

export const CANVAS_SHAPES: Record<CanvasShape, { width: number; height: number; label: string }> = {
  phone: { width: 375, height: 667, label: "Phone" },
  card: { width: 400, height: 260, label: "Card" },
  hero: { width: 800, height: 400, label: "Hero" },
  square: { width: 400, height: 400, label: "Square" },
  desktop: { width: 800, height: 500, label: "Desktop" },
  tablet: { width: 600, height: 800, label: "Tablet" },
};

// ─── Classic layer config ───

export interface ClassicLayerConfig {
  name: string;
  widthFactor: number;
  heightFactor: number;
  blurFactor: number;
  opacityFactor: number;
  blendMode: BlendMode;
  lightnessShift: number;
  chromaShift: number;
}

export const LAYER_CONFIG: ClassicLayerConfig[] = [
  { name: "Background", widthFactor: 1.0, heightFactor: 1.0, blurFactor: 1.2, opacityFactor: 0.3, blendMode: "screen", lightnessShift: -0.1, chromaShift: -0.02 },
  { name: "Medium", widthFactor: 0.7, heightFactor: 0.7, blurFactor: 0.8, opacityFactor: 0.5, blendMode: "screen", lightnessShift: 0, chromaShift: 0 },
  { name: "Core", widthFactor: 0.4, heightFactor: 0.4, blurFactor: 0.5, opacityFactor: 0.7, blendMode: "screen", lightnessShift: 0.1, chromaShift: 0.02 },
  { name: "Highlight", widthFactor: 0.15, heightFactor: 0.15, blurFactor: 0.2, opacityFactor: 0.9, blendMode: "screen", lightnessShift: 0.2, chromaShift: -0.05 },
];

// ─── Create helpers ───

let _idCounter = 0;
export function generateId(): string {
  return `gl_${Date.now()}_${++_idCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createDefaultLayer(index: number = 0): GlowLayer {
  return {
    id: generateId(),
    name: `Layer ${index + 1}`,
    active: true,
    color: "#00ff88",
    blur: 60,
    opacity: 0.6,
    width: 200,
    height: 200,
    x: 0,
    y: 0,
    blendMode: "screen",
    gradient: "none",
    gradientAngle: 90,
    gradientStops: [],
    layerAnimation: { type: "none", duration: 2, delay: 0 },
  };
}

export function createDefaultDocument(mode: EditorMode = "classic"): GlowDocument {
  const now = new Date().toISOString();
  const layers = mode === "classic" ? [] : [createDefaultLayer(0)];

  return {
    id: generateId(),
    mode,
    themeMode: "dark",
    canvas: {
      shape: "phone",
      width: CANVAS_SHAPES.phone.width,
      height: CANVAS_SHAPES.phone.height,
      background: { type: "dark" },
    },
    colorModel: {
      baseOklch: { l: 0.7, c: 0.2, h: 150 },
      recentColors: [],
      harmoniesEnabled: true,
    },
    layers,
    groups: [],
    globalScale: 1,
    globalOpacity: 1,
    globalAnimation: { enabled: false, duration: 3 },
    noise: { enabled: false, intensity: 0.15 },
    power: true,
    selectedLayerId: layers[0]?.id ?? null,
    selectedGroupId: null,
    copiedStyle: null,
    meta: {
      createdAt: now,
      updatedAt: now,
      source: mode === "classic" ? "classic" : "studio",
    },
  };
}
