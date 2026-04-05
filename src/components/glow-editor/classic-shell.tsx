// ─── Classic Shell — V2 Experience in V3 ───

import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import type { GlowDocument, ClassicEditorState } from "@/core/glow-engine/state";
import { LAYER_CONFIG, CANVAS_SHAPES } from "@/core/glow-engine/state";
import { oklchToHex, hexToOklch, clampToSrgbGamut, randomOklch } from "@/core/glow-engine/oklch";
import { glowDocumentToClassicState, classicStateToGlowDocument, createDefaultClassicState } from "@/core/glow-engine/converters";
import { getPresetsForMode, type GlowPreset } from "@/core/glow-engine/presets";
import { GlowLayersRenderer } from "@/components/shared/glow-layers-renderer";
import { CanvasShapeContent } from "@/components/shared/canvas-shapes";
import { OklchSliders, ColorPicker, RecentColors, HarmonyChips } from "@/components/shared/color-controls";
import { NoiseToggle } from "@/components/shared/noise-toggle";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Undo2, Redo2, Shuffle, Sun, Moon, Power } from "lucide-react";
import { toast } from "sonner";

interface ClassicShellProps {
  document: GlowDocument;
  onDocumentChange: (doc: GlowDocument) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const ClassicShell = React.memo<ClassicShellProps>(({
  document: doc,
  onDocumentChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  // Derive classic state from document
  const classicState = useMemo(() => {
    const result = glowDocumentToClassicState(doc);
    return result.state;
  }, [doc]);

  const presets = useMemo(() => getPresetsForMode("classic"), []);

  // Commit classic state changes back to document
  const commitClassic = useCallback((updates: Partial<ClassicEditorState>) => {
    const newClassic = { ...classicState, ...updates };
    const newDoc = classicStateToGlowDocument(newClassic);
    newDoc.id = doc.id;
    newDoc.mode = "classic";
    onDocumentChange(newDoc);
  }, [classicState, doc.id, onDocumentChange]);

  // Resolved layers from LAYER_CONFIG
  const resolvedLayers = useMemo(() => {
    const { baseOklch, shape, lightPosition, glowScale, blurIntensity } = classicState;
    const dims = CANVAS_SHAPES[shape];
    const baseSize = Math.min(dims.width, dims.height) * glowScale;

    return LAYER_CONFIG.map((cfg) => {
      const newL = Math.max(0, Math.min(1, baseOklch.l + cfg.lightnessShift));
      const newC = Math.max(0, baseOklch.c + cfg.chromaShift);
      const clamped = clampToSrgbGamut(newL, newC, baseOklch.h);
      return {
        name: cfg.name,
        color: oklchToHex(clamped.l, clamped.c, clamped.h),
        width: baseSize * cfg.widthFactor,
        height: baseSize * cfg.heightFactor,
        blur: blurIntensity * cfg.blurFactor * 100,
        opacity: cfg.opacityFactor,
        blendMode: cfg.blendMode,
        x: (lightPosition.x - 0.5) * dims.width * 0.5,
        y: (lightPosition.y - 0.5) * dims.height * 0.5,
      };
    });
  }, [classicState]);

  const baseHex = useMemo(
    () => oklchToHex(classicState.baseOklch.l, classicState.baseOklch.c, classicState.baseOklch.h),
    [classicState.baseOklch]
  );

  // Light position drag
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    commitClassic({
      lightPosition: {
        x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
      },
    });
  }, [commitClassic]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    commitClassic({
      lightPosition: {
        x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
      },
    });
  }, [isDragging, commitClassic]);

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  // Random color
  const handleRandom = useCallback(() => {
    const newOklch = randomOklch();
    const clamped = clampToSrgbGamut(newOklch.l, newOklch.c, newOklch.h);
    commitClassic({ baseOklch: clamped, activePreset: -1 });
    toast.success("Random color applied!");
  }, [commitClassic]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "p" || e.key === "P") {
        commitClassic({ power: !classicState.power });
      } else if (e.key === "r" || e.key === "R") {
        handleRandom();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "Z" || e.key === "y")) {
        e.preventDefault();
        onRedo();
      } else if (e.key >= "1" && e.key <= "6") {
        const idx = parseInt(e.key) - 1;
        if (idx < presets.length) {
          const p = presets[idx];
          if (p.classicOklch) {
            commitClassic({ baseOklch: { ...p.classicOklch }, activePreset: idx });
            toast.success(`Preset: ${p.name}`);
          }
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const step = e.shiftKey ? 0.1 : 0.02;
        const lp = { ...classicState.lightPosition };
        if (e.key === "ArrowLeft") lp.x = Math.max(0, lp.x - step);
        if (e.key === "ArrowRight") lp.x = Math.min(1, lp.x + step);
        if (e.key === "ArrowUp") lp.y = Math.max(0, lp.y - step);
        if (e.key === "ArrowDown") lp.y = Math.min(1, lp.y + step);
        commitClassic({ lightPosition: lp });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [classicState, commitClassic, handleRandom, onUndo, onRedo, presets]);

  const dims = CANVAS_SHAPES[classicState.shape];

  // Generate document layers for renderer
  const docLayers = useMemo(() => {
    return resolvedLayers.map((rl, i) => ({
      id: `classic-${i}`,
      name: rl.name,
      active: true,
      color: rl.color,
      blur: rl.blur,
      opacity: rl.opacity,
      width: rl.width,
      height: rl.height,
      x: rl.x,
      y: rl.y,
      blendMode: rl.blendMode as any,
      gradient: "none" as const,
      gradientAngle: 90,
      gradientStops: [],
      layerAnimation: { type: "none" as const, duration: 2, delay: 0 },
    }));
  }, [resolvedLayers]);

  // CSS code generation
  const cssCode = useMemo(() => {
    const lines: string[] = [];
    lines.push(`.glow-container {\n  position: relative;\n  width: ${dims.width}px;\n  height: ${dims.height}px;\n  overflow: hidden;\n}`);
    resolvedLayers.forEach((rl, i) => {
      lines.push(`.glow-layer-${i + 1} /* ${rl.name} */ {\n  position: absolute;\n  width: ${Math.round(rl.width)}px;\n  height: ${Math.round(rl.height)}px;\n  top: 50%; left: 50%;\n  transform: translate(calc(-50% + ${Math.round(rl.x)}px), calc(-50% + ${Math.round(rl.y)}px));\n  border-radius: 50%;\n  background: ${rl.color};\n  filter: blur(${Math.round(rl.blur)}px);\n  opacity: ${rl.opacity};\n  mix-blend-mode: ${rl.blendMode};\n}`);
    });
    return lines.join("\n\n");
  }, [resolvedLayers, dims]);

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Preview Panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mb-4 flex items-center gap-2">
          {(["phone", "card", "hero", "square"] as const).map((s) => (
            <Button
              key={s}
              variant={classicState.shape === s ? "default" : "outline"}
              size="sm"
              onClick={() => commitClassic({ shape: s })}
              aria-pressed={classicState.shape === s}
            >
              {CANVAS_SHAPES[s].label}
            </Button>
          ))}
        </div>

        <div
          ref={previewRef}
          className="relative cursor-crosshair overflow-hidden rounded-2xl border border-border"
          style={{
            width: Math.min(dims.width, 500),
            height: Math.min(dims.height, 500) * (dims.height / dims.width),
            aspectRatio: `${dims.width}/${dims.height}`,
            background: classicState.themeMode === "dark" ? "#0a0a0f" : "#f5f5f5",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="application"
          aria-label="Glow preview canvas — drag to move light source"
        >
          <GlowLayersRenderer
            layers={docLayers}
            power={classicState.power}
            globalScale={1}
            globalOpacity={1}
            globalAnimation={{ enabled: false, duration: 3 }}
            noiseEnabled={classicState.noiseEnabled}
            noiseIntensity={classicState.noiseIntensity}
            containerWidth={dims.width}
            containerHeight={dims.height}
          />
          <div className="relative z-10 flex h-full items-center justify-center" style={{ color: classicState.themeMode === "dark" ? "#fff" : "#000" }}>
            <CanvasShapeContent shape={classicState.shape} />
          </div>
          {/* Light position indicator */}
          <div
            className="pointer-events-none absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-white/30"
            style={{
              left: `${classicState.lightPosition.x * 100}%`,
              top: `${classicState.lightPosition.y * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-full overflow-y-auto border-l border-border bg-card p-4 lg:w-80">
        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleRandom} aria-label="Random color">
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant={classicState.power ? "default" : "outline"}
            size="sm"
            onClick={() => commitClassic({ power: !classicState.power })}
            aria-label={classicState.power ? "Turn off" : "Turn on"}
          >
            <Power className="mr-1 h-3 w-3" />
            {classicState.power ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Presets */}
        <div className="mb-4">
          <span className="mb-2 block text-xs font-medium text-muted-foreground">Presets</span>
          <div className="flex flex-wrap gap-2">
            {presets.slice(0, 6).map((p, i) => (
              <button
                key={p.id}
                className={`h-8 w-8 rounded-lg border-2 transition-transform hover:scale-110 ${classicState.activePreset === i ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                style={{ background: p.classicColor }}
                onClick={() => {
                  if (p.classicOklch) {
                    commitClassic({ baseOklch: { ...p.classicOklch }, activePreset: i, themeMode: p.themeMode ?? classicState.themeMode });
                    toast.success(`Preset: ${p.name}`);
                  }
                }}
                aria-label={`Preset ${p.name}`}
                aria-pressed={classicState.activePreset === i}
              />
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="mb-4 flex gap-2">
          <Button
            variant={classicState.themeMode === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => commitClassic({ themeMode: "dark" })}
          >
            <Moon className="mr-1 h-3 w-3" /> Dark
          </Button>
          <Button
            variant={classicState.themeMode === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => commitClassic({ themeMode: "light" })}
          >
            <Sun className="mr-1 h-3 w-3" /> Light
          </Button>
        </div>

        <Accordion type="multiple" defaultValue={["color", "shape"]} className="space-y-1">
          {/* Base Color */}
          <AccordionItem value="color">
            <AccordionTrigger className="text-sm">Base Color</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <ColorPicker
                color={baseHex}
                onChange={(hex) => {
                  const oklch = hexToOklch(hex);
                  commitClassic({ baseOklch: oklch, activePreset: -1 });
                }}
              />
              <OklchSliders
                oklch={classicState.baseOklch}
                onChange={(oklch) => commitClassic({ baseOklch: oklch, activePreset: -1 })}
              />
              <RecentColors
                colors={classicState.recentColors}
                onSelect={(hex) => {
                  const oklch = hexToOklch(hex);
                  commitClassic({ baseOklch: oklch, activePreset: -1 });
                }}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Shape & Light */}
          <AccordionItem value="shape">
            <AccordionTrigger className="text-sm">Shape & Light</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mask Size</span><span>{classicState.maskSize}%</span>
                </div>
                <Slider value={[classicState.maskSize]} min={20} max={100} step={1} onValueChange={(v) => commitClassic({ maskSize: v[0] })} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Glow Scale</span><span>{classicState.glowScale.toFixed(2)}</span>
                </div>
                <Slider value={[classicState.glowScale]} min={0.3} max={2} step={0.05} onValueChange={(v) => commitClassic({ glowScale: v[0] })} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Blur Intensity</span><span>{classicState.blurIntensity.toFixed(2)}</span>
                </div>
                <Slider value={[classicState.blurIntensity]} min={0.1} max={2} step={0.05} onValueChange={(v) => commitClassic({ blurIntensity: v[0] })} />
              </div>
              {/* 2D Light Position Pad */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Light Position</span>
                <div
                  className="relative h-32 w-full cursor-crosshair rounded-lg border border-border bg-background"
                  onPointerDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const update = (ev: PointerEvent) => {
                      commitClassic({
                        lightPosition: {
                          x: Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)),
                          y: Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height)),
                        },
                      });
                    };
                    update(e.nativeEvent);
                    const onMove = (ev: PointerEvent) => update(ev);
                    const onUp = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
                    window.addEventListener("pointermove", onMove);
                    window.addEventListener("pointerup", onUp);
                  }}
                  role="application"
                  aria-label="Light position pad"
                >
                  <div
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary/30"
                    style={{ left: `${classicState.lightPosition.x * 100}%`, top: `${classicState.lightPosition.y * 100}%` }}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appearance */}
          <AccordionItem value="appearance">
            <AccordionTrigger className="text-sm">Appearance</AccordionTrigger>
            <AccordionContent className="pt-2">
              <NoiseToggle
                enabled={classicState.noiseEnabled}
                intensity={classicState.noiseIntensity}
                onToggle={(v) => commitClassic({ noiseEnabled: v })}
                onIntensityChange={(v) => commitClassic({ noiseIntensity: v })}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Color Harmony */}
          <AccordionItem value="harmony">
            <AccordionTrigger className="text-sm">Color Harmony</AccordionTrigger>
            <AccordionContent className="pt-2">
              <HarmonyChips
                baseOklch={classicState.baseOklch}
                onSelect={(hex) => {
                  const oklch = hexToOklch(hex);
                  commitClassic({ baseOklch: oklch, activePreset: -1 });
                }}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Layer Inspector */}
          <AccordionItem value="layers">
            <AccordionTrigger className="text-sm">Layer Inspector</AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-2">
                {resolvedLayers.map((rl, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-border p-2 text-xs">
                    <div className="h-4 w-4 rounded" style={{ background: rl.color }} />
                    <span className="font-medium">{rl.name}</span>
                    <span className="text-muted-foreground">{Math.round(rl.width)}×{Math.round(rl.height)}</span>
                    <span className="text-muted-foreground">blur:{Math.round(rl.blur)}</span>
                    <span className="text-muted-foreground">{(rl.opacity * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Generated CSS */}
          <AccordionItem value="css">
            <AccordionTrigger className="text-sm">Generated CSS</AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="relative">
                <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 font-mono text-xs text-muted-foreground">
                  {cssCode}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1"
                  onClick={() => {
                    navigator.clipboard.writeText(cssCode);
                    toast.success("CSS copied!");
                  }}
                >
                  Copy
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
});
