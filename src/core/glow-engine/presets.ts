// ─── Unified Preset System ───

import type { GlowLayer, ThemeMode, AnimationConfig } from "./state";
import { generateId } from "./state";

export type PresetMode = "classic" | "studio" | "both";

export interface GlowPreset {
  id: string;
  name: string;
  category: "neon" | "nature" | "vibrant" | "minimal";
  mode: PresetMode;
  icon: string;
  // Classic mode data
  classicColor?: string;
  classicOklch?: { l: number; c: number; h: number };
  // Studio mode data
  layers?: Partial<GlowLayer>[];
  themeMode?: ThemeMode;
  animation?: AnimationConfig;
  noiseIntensity?: number;
}

// Helper to create layers with IDs
function makeLayers(defs: Partial<GlowLayer>[]): Partial<GlowLayer>[] {
  return defs.map((d, i) => ({
    id: generateId(),
    name: `Layer ${i + 1}`,
    active: true,
    blur: 60,
    opacity: 0.6,
    width: 200,
    height: 200,
    x: 0,
    y: 0,
    blendMode: "screen" as const,
    gradient: "none" as const,
    ...d,
  }));
}

export const PRESETS: GlowPreset[] = [
  // ─── Neon Category ───
  {
    id: "neon-blue",
    name: "Neon Blue",
    category: "neon",
    mode: "both",
    icon: "⚡",
    classicColor: "#0088ff",
    classicOklch: { l: 0.65, c: 0.22, h: 250 },
    layers: makeLayers([
      { color: "#001a4d", blur: 120, opacity: 0.3, width: 350, height: 350 },
      { color: "#0055cc", blur: 80, opacity: 0.5, width: 250, height: 250 },
      { color: "#0088ff", blur: 50, opacity: 0.7, width: 150, height: 150 },
      { color: "#66bbff", blur: 20, opacity: 0.9, width: 60, height: 60 },
    ]),
    themeMode: "dark",
  },
  {
    id: "neon-green",
    name: "Neon Green",
    category: "neon",
    mode: "both",
    icon: "⚡",
    classicColor: "#00ff88",
    classicOklch: { l: 0.85, c: 0.25, h: 150 },
    layers: makeLayers([
      { color: "#003322", blur: 120, opacity: 0.3, width: 350, height: 350 },
      { color: "#00aa55", blur: 80, opacity: 0.5, width: 250, height: 250 },
      { color: "#00ff88", blur: 50, opacity: 0.7, width: 150, height: 150 },
      { color: "#88ffcc", blur: 20, opacity: 0.9, width: 60, height: 60 },
    ]),
    themeMode: "dark",
  },
  {
    id: "neon-red",
    name: "Neon Red",
    category: "neon",
    mode: "both",
    icon: "⚡",
    classicColor: "#ff2244",
    classicOklch: { l: 0.6, c: 0.25, h: 25 },
    layers: makeLayers([
      { color: "#4d0011", blur: 120, opacity: 0.3, width: 350, height: 350 },
      { color: "#cc1133", blur: 80, opacity: 0.5, width: 250, height: 250 },
      { color: "#ff2244", blur: 50, opacity: 0.7, width: 150, height: 150 },
      { color: "#ff8899", blur: 20, opacity: 0.9, width: 60, height: 60 },
    ]),
    themeMode: "dark",
  },
  {
    id: "neon-purple",
    name: "Neon Purple",
    category: "neon",
    mode: "both",
    icon: "⚡",
    classicColor: "#aa44ff",
    classicOklch: { l: 0.55, c: 0.28, h: 300 },
    layers: makeLayers([
      { color: "#220044", blur: 120, opacity: 0.3, width: 350, height: 350 },
      { color: "#7722cc", blur: 80, opacity: 0.5, width: 250, height: 250 },
      { color: "#aa44ff", blur: 50, opacity: 0.7, width: 150, height: 150 },
      { color: "#dd99ff", blur: 20, opacity: 0.9, width: 60, height: 60 },
    ]),
    themeMode: "dark",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    category: "neon",
    mode: "studio",
    icon: "⚡",
    layers: makeLayers([
      { color: "#ff00ff", blur: 100, opacity: 0.4, width: 300, height: 300, x: -40 },
      { color: "#00ffff", blur: 80, opacity: 0.5, width: 250, height: 250, x: 40 },
      { color: "#ff4488", blur: 50, opacity: 0.6, width: 180, height: 180 },
      { color: "#ffffff", blur: 15, opacity: 0.8, width: 50, height: 50 },
    ]),
    themeMode: "dark",
  },
  // ─── Nature Category ───
  {
    id: "forest-glow",
    name: "Forest Glow",
    category: "nature",
    mode: "both",
    icon: "🌿",
    classicColor: "#22aa44",
    classicOklch: { l: 0.6, c: 0.18, h: 140 },
    layers: makeLayers([
      { color: "#0a3318", blur: 110, opacity: 0.35, width: 340, height: 340 },
      { color: "#1a7733", blur: 70, opacity: 0.5, width: 240, height: 240 },
      { color: "#22aa44", blur: 45, opacity: 0.65, width: 160, height: 160 },
    ]),
    themeMode: "dark",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    category: "nature",
    mode: "both",
    icon: "🌿",
    classicColor: "#ffaa33",
    classicOklch: { l: 0.8, c: 0.18, h: 70 },
    layers: makeLayers([
      { color: "#4d2800", blur: 120, opacity: 0.3, width: 350, height: 350 },
      { color: "#cc7711", blur: 80, opacity: 0.5, width: 250, height: 250 },
      { color: "#ffaa33", blur: 50, opacity: 0.7, width: 150, height: 150 },
      { color: "#ffdd88", blur: 20, opacity: 0.85, width: 60, height: 60 },
    ]),
    themeMode: "dark",
  },
  {
    id: "ice-crystal",
    name: "Ice Crystal",
    category: "nature",
    mode: "studio",
    icon: "🌿",
    layers: makeLayers([
      { color: "#88ccff", blur: 100, opacity: 0.3, width: 300, height: 300 },
      { color: "#aaddff", blur: 60, opacity: 0.5, width: 200, height: 200 },
      { color: "#ddeeff", blur: 30, opacity: 0.7, width: 100, height: 100 },
    ]),
    themeMode: "dark",
  },
  {
    id: "warm-sunset",
    name: "Warm Sunset",
    category: "nature",
    mode: "studio",
    icon: "🌿",
    layers: makeLayers([
      { color: "#ff4400", blur: 110, opacity: 0.35, width: 320, height: 320, y: 30 },
      { color: "#ff8800", blur: 70, opacity: 0.5, width: 240, height: 240 },
      { color: "#ffcc00", blur: 40, opacity: 0.7, width: 140, height: 140, y: -20 },
    ]),
    themeMode: "dark",
  },
  {
    id: "aurora",
    name: "Aurora",
    category: "nature",
    mode: "studio",
    icon: "🌿",
    layers: makeLayers([
      { color: "#00ff88", blur: 100, opacity: 0.3, width: 350, height: 200, y: -30 },
      { color: "#0088ff", blur: 80, opacity: 0.4, width: 300, height: 180, y: 0 },
      { color: "#aa44ff", blur: 60, opacity: 0.35, width: 250, height: 160, y: 30 },
      { color: "#88ffdd", blur: 30, opacity: 0.6, width: 120, height: 80 },
    ]),
    themeMode: "dark",
    animation: { enabled: true, duration: 4 },
  },
  {
    id: "ocean-deep",
    name: "Ocean Deep",
    category: "nature",
    mode: "studio",
    icon: "🌿",
    layers: makeLayers([
      { color: "#001133", blur: 120, opacity: 0.4, width: 350, height: 350 },
      { color: "#003366", blur: 80, opacity: 0.5, width: 260, height: 260 },
      { color: "#0066aa", blur: 50, opacity: 0.6, width: 160, height: 160 },
    ]),
    themeMode: "dark",
  },
  // ─── Vibrant Category ───
  {
    id: "purple-haze",
    name: "Purple Haze",
    category: "vibrant",
    mode: "both",
    icon: "🎨",
    classicColor: "#8844ff",
    classicOklch: { l: 0.52, c: 0.26, h: 290 },
    layers: makeLayers([
      { color: "#2a0066", blur: 120, opacity: 0.35, width: 350, height: 350 },
      { color: "#6622cc", blur: 80, opacity: 0.5, width: 250, height: 250 },
      { color: "#8844ff", blur: 50, opacity: 0.7, width: 150, height: 150 },
      { color: "#cc99ff", blur: 20, opacity: 0.85, width: 60, height: 60 },
    ]),
    themeMode: "dark",
  },
  {
    id: "fire-blaze",
    name: "Fire Blaze",
    category: "vibrant",
    mode: "studio",
    icon: "🎨",
    layers: makeLayers([
      { color: "#ff2200", blur: 110, opacity: 0.4, width: 320, height: 320 },
      { color: "#ff6600", blur: 70, opacity: 0.55, width: 220, height: 220 },
      { color: "#ffaa00", blur: 40, opacity: 0.7, width: 130, height: 130 },
      { color: "#ffeeaa", blur: 15, opacity: 0.9, width: 50, height: 50 },
    ]),
    themeMode: "dark",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    category: "vibrant",
    mode: "studio",
    icon: "🎨",
    layers: makeLayers([
      { color: "#ff0044", blur: 90, opacity: 0.35, width: 280, height: 280, x: -60 },
      { color: "#ffaa00", blur: 80, opacity: 0.35, width: 260, height: 260, x: -20 },
      { color: "#00ff44", blur: 80, opacity: 0.35, width: 260, height: 260, x: 20 },
      { color: "#0044ff", blur: 90, opacity: 0.35, width: 280, height: 280, x: 60 },
    ]),
    themeMode: "dark",
  },
  // ─── Minimal Category ───
  {
    id: "soft-white",
    name: "Soft White",
    category: "minimal",
    mode: "both",
    icon: "✨",
    classicColor: "#eeeeff",
    classicOklch: { l: 0.95, c: 0.01, h: 270 },
    layers: makeLayers([
      { color: "#ccccdd", blur: 100, opacity: 0.25, width: 300, height: 300 },
      { color: "#ddddee", blur: 60, opacity: 0.4, width: 200, height: 200 },
      { color: "#eeeeff", blur: 30, opacity: 0.6, width: 100, height: 100 },
    ]),
    themeMode: "light",
  },
  {
    id: "mono-glow",
    name: "Mono Glow",
    category: "minimal",
    mode: "both",
    icon: "✨",
    classicColor: "#888899",
    classicOklch: { l: 0.6, c: 0.02, h: 260 },
    layers: makeLayers([
      { color: "#444455", blur: 100, opacity: 0.3, width: 300, height: 300 },
      { color: "#666677", blur: 60, opacity: 0.5, width: 200, height: 200 },
      { color: "#888899", blur: 30, opacity: 0.7, width: 100, height: 100 },
    ]),
    themeMode: "dark",
  },
  {
    id: "rose-mist",
    name: "Rose Mist",
    category: "minimal",
    mode: "both",
    icon: "✨",
    classicColor: "#ffaacc",
    classicOklch: { l: 0.8, c: 0.12, h: 350 },
    layers: makeLayers([
      { color: "#cc6688", blur: 110, opacity: 0.3, width: 320, height: 320 },
      { color: "#ee88aa", blur: 70, opacity: 0.5, width: 220, height: 220 },
      { color: "#ffaacc", blur: 40, opacity: 0.7, width: 130, height: 130 },
      { color: "#ffddee", blur: 15, opacity: 0.85, width: 50, height: 50 },
    ]),
    themeMode: "dark",
  },
  {
    id: "electric-lime",
    name: "Electric Lime",
    category: "neon",
    mode: "both",
    icon: "⚡",
    classicColor: "#ccff00",
    classicOklch: { l: 0.9, c: 0.25, h: 110 },
    layers: makeLayers([
      { color: "#334400", blur: 120, opacity: 0.3, width: 350, height: 350 },
      { color: "#88bb00", blur: 80, opacity: 0.5, width: 250, height: 250 },
      { color: "#ccff00", blur: 50, opacity: 0.7, width: 150, height: 150 },
      { color: "#eeff88", blur: 20, opacity: 0.9, width: 60, height: 60 },
    ]),
    themeMode: "dark",
  },
];

export function getPresetsForMode(mode: "classic" | "studio"): GlowPreset[] {
  return PRESETS.filter((p) => p.mode === mode || p.mode === "both");
}

export function getPresetsByCategory(presets: GlowPreset[], category: string): GlowPreset[] {
  return presets.filter((p) => p.category === category);
}

// ─── User Presets ───

export interface UserPreset {
  id: string;
  name: string;
  favorite: boolean;
  createdAt: string;
  layers: Partial<GlowLayer>[];
  themeMode?: ThemeMode;
}
