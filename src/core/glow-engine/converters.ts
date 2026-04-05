// ─── Classic ↔ Studio State Converters ───

import {
  GlowDocument,
  ClassicEditorState,
  GlowLayer,
  LAYER_CONFIG,
  CANVAS_SHAPES,
  generateId,
  createDefaultDocument,
} from "./state";
import { oklchToHex, hexToOklch, clampToSrgbGamut } from "./oklch";

/**
 * Convert a Classic editor state into a full GlowDocument.
 * Each of the 4 LAYER_CONFIG entries becomes an explicit GlowLayer.
 */
export function classicStateToGlowDocument(classic: ClassicEditorState): GlowDocument {
  const doc = createDefaultDocument("studio");
  doc.mode = "studio";
  doc.themeMode = classic.themeMode;
  doc.power = classic.power;
  doc.noise = { enabled: classic.noiseEnabled, intensity: classic.noiseIntensity };
  doc.colorModel = {
    baseOklch: { ...classic.baseOklch },
    recentColors: [...classic.recentColors],
    harmoniesEnabled: classic.harmoniesEnabled,
  };

  const shape = classic.shape;
  const dims = CANVAS_SHAPES[shape];
  doc.canvas = {
    shape,
    width: dims.width,
    height: dims.height,
    background: { type: classic.themeMode === "dark" ? "dark" : "light" },
  };

  // Generate 4 layers from LAYER_CONFIG
  doc.layers = LAYER_CONFIG.map((cfg, i) => {
    const { l, c, h } = classic.baseOklch;
    const newL = Math.max(0, Math.min(1, l + cfg.lightnessShift));
    const newC = Math.max(0, c + cfg.chromaShift);
    const clamped = clampToSrgbGamut(newL, newC, h);
    const color = oklchToHex(clamped.l, clamped.c, clamped.h);

    const baseSize = Math.min(dims.width, dims.height) * classic.glowScale;

    return {
      id: generateId(),
      name: cfg.name,
      active: true,
      color,
      blur: classic.blurIntensity * cfg.blurFactor * 100,
      opacity: cfg.opacityFactor,
      width: baseSize * cfg.widthFactor,
      height: baseSize * cfg.heightFactor,
      x: (classic.lightPosition.x - 0.5) * dims.width * 0.5,
      y: (classic.lightPosition.y - 0.5) * dims.height * 0.5,
      blendMode: cfg.blendMode,
      gradient: "none" as const,
      gradientAngle: 90,
      gradientStops: [],
      layerAnimation: { type: "none" as const, duration: 2, delay: 0 },
    };
  });

  doc.selectedLayerId = doc.layers[0]?.id ?? null;
  doc.meta.source = "classic";
  doc.meta.updatedAt = new Date().toISOString();

  return doc;
}

/**
 * Convert a GlowDocument back into a Classic editor state.
 * Best-effort: averages colors, normalizes blur/size.
 * Returns null if conversion makes no sense (0 layers).
 */
export function glowDocumentToClassicState(doc: GlowDocument): {
  state: ClassicEditorState;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Collect active layers
  const activeLayers = doc.layers.filter((l) => l.active);
  if (activeLayers.length === 0) {
    // Use defaults
    return {
      state: createDefaultClassicState(),
      warnings: ["No active layers found, using defaults."],
    };
  }

  // Check for advanced features that will be lost
  const hasGradients = activeLayers.some((l) => l.gradient && l.gradient !== "none");
  const hasClipMasks = activeLayers.some((l) => l.clipMask);
  const hasAnimations = activeLayers.some((l) => l.layerAnimation?.type && l.layerAnimation.type !== "none");
  const hasGroups = (doc.groups?.length ?? 0) > 0;

  if (hasGradients) warnings.push("Gradient fills will be simplified.");
  if (hasClipMasks) warnings.push("Clip masks will be removed.");
  if (hasAnimations) warnings.push("Per-layer animations will be removed.");
  if (hasGroups) warnings.push("Layer groups will be flattened.");
  if (activeLayers.length > 4) warnings.push(`${activeLayers.length} layers reduced to 4.`);

  // Compute weighted average color
  const totalOpacity = activeLayers.reduce((s, l) => s + l.opacity, 0) || 1;
  let avgL = 0, avgC = 0, avgHx = 0, avgHy = 0;
  for (const layer of activeLayers) {
    const oklch = hexToOklch(layer.color);
    const w = layer.opacity / totalOpacity;
    avgL += oklch.l * w;
    avgC += oklch.c * w;
    avgHx += Math.cos((oklch.h * Math.PI) / 180) * w;
    avgHy += Math.sin((oklch.h * Math.PI) / 180) * w;
  }
  let avgH = (Math.atan2(avgHy, avgHx) * 180) / Math.PI;
  if (avgH < 0) avgH += 360;

  const baseOklch = clampToSrgbGamut(avgL, avgC, avgH);
  const baseColor = oklchToHex(baseOklch.l, baseOklch.c, baseOklch.h);

  // Compute average position
  const dims = CANVAS_SHAPES[doc.canvas.shape];
  const avgX = activeLayers.reduce((s, l) => s + l.x, 0) / activeLayers.length;
  const avgY = activeLayers.reduce((s, l) => s + l.y, 0) / activeLayers.length;

  // Normalize to 0-1 range
  const lightX = Math.max(0, Math.min(1, avgX / (dims.width * 0.5) + 0.5));
  const lightY = Math.max(0, Math.min(1, avgY / (dims.height * 0.5) + 0.5));

  // Average blur
  const avgBlur = activeLayers.reduce((s, l) => s + l.blur, 0) / activeLayers.length;
  const blurIntensity = Math.max(0.1, Math.min(2, avgBlur / 80));

  // Average size → glowScale
  const avgSize = activeLayers.reduce((s, l) => s + Math.max(l.width, l.height), 0) / activeLayers.length;
  const baseMin = Math.min(dims.width, dims.height);
  const glowScale = Math.max(0.3, Math.min(2, avgSize / baseMin));

  return {
    state: {
      power: doc.power,
      themeMode: doc.themeMode,
      baseColor,
      baseOklch,
      shape: doc.canvas.shape,
      lightPosition: { x: lightX, y: lightY },
      maskSize: 80,
      glowScale,
      blurIntensity,
      noiseEnabled: doc.noise.enabled,
      noiseIntensity: doc.noise.intensity,
      activePreset: -1,
      recentColors: [...doc.colorModel.recentColors],
      harmoniesEnabled: doc.colorModel.harmoniesEnabled,
    },
    warnings,
  };
}

export function createDefaultClassicState(): ClassicEditorState {
  return {
    power: true,
    themeMode: "dark",
    baseColor: "#00ff88",
    baseOklch: { l: 0.85, c: 0.25, h: 150 },
    shape: "phone",
    lightPosition: { x: 0.5, y: 0.5 },
    maskSize: 80,
    glowScale: 1,
    blurIntensity: 1,
    noiseEnabled: false,
    noiseIntensity: 0.15,
    activePreset: 0,
    recentColors: [],
    harmoniesEnabled: true,
  };
}

/**
 * Build a GlowDocument from a Classic state (for orchestrator use).
 */
export function classicStateToDocument(classic: ClassicEditorState): GlowDocument {
  return classicStateToGlowDocument(classic);
}
