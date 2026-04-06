// ─── Classic Shell — ComponentSynth Design ───

import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import type { GlowDocument, ClassicEditorState } from "@/core/glow-engine/state";
import { LAYER_CONFIG, CANVAS_SHAPES } from "@/core/glow-engine/state";
import { oklchToHex, hexToOklch, clampToSrgbGamut, randomOklch } from "@/core/glow-engine/oklch";
import { glowDocumentToClassicState, classicStateToGlowDocument, createDefaultClassicState } from "@/core/glow-engine/converters";
import { getPresetsForMode } from "@/core/glow-engine/presets";
import { GlowLayersRenderer } from "@/components/shared/glow-layers-renderer";
import { CanvasShapeContent } from "@/components/shared/canvas-shapes";
import { OklchSliders, ColorPicker, RecentColors, HarmonyChips } from "@/components/shared/color-controls";
import { NoiseToggle } from "@/components/shared/noise-toggle";
import { CsSlider } from "@/components/ui/cs-slider";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Shuffle, Sun, Moon, Power, Copy, Maximize, Shrink, Focus, Droplets, ZoomIn, ZoomOut } from "lucide-react";
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
  const classicState = useMemo(() => {
    const result = glowDocumentToClassicState(doc);
    return result.state;
  }, [doc]);

  const presets = useMemo(() => getPresetsForMode("classic"), []);
  const [codeTab, setCodeTab] = useState<"tailwind" | "css">("css");

  const commitClassic = useCallback((updates: Partial<ClassicEditorState>) => {
    const newClassic = { ...classicState, ...updates };
    const newDoc = classicStateToGlowDocument(newClassic);
    newDoc.id = doc.id;
    newDoc.mode = "classic";
    onDocumentChange(newDoc);
  }, [classicState, doc.id, onDocumentChange]);

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
      if (e.key === "p" || e.key === "P") commitClassic({ power: !classicState.power });
      else if (e.key === "r" || e.key === "R") handleRandom();
      else if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); onUndo(); }
      else if ((e.metaKey || e.ctrlKey) && (e.key === "Z" || e.key === "y")) { e.preventDefault(); onRedo(); }
      else if (e.key >= "1" && e.key <= "6") {
        const idx = parseInt(e.key) - 1;
        if (idx < presets.length) {
          const p = presets[idx];
          if (p.classicOklch) {
            commitClassic({ baseOklch: { ...p.classicOklch }, activePreset: idx });
            toast.success(`Preset: ${p.name}`);
          }
        }
      } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
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

  const cssCode = useMemo(() => {
    const lines: string[] = [];
    lines.push(`.glow-container {\n  position: relative;\n  width: ${dims.width}px;\n  height: ${dims.height}px;\n  overflow: hidden;\n}`);
    resolvedLayers.forEach((rl, i) => {
      lines.push(`.glow-layer-${i + 1} /* ${rl.name} */ {\n  position: absolute;\n  width: ${Math.round(rl.width)}px;\n  height: ${Math.round(rl.height)}px;\n  top: 50%; left: 50%;\n  transform: translate(calc(-50% + ${Math.round(rl.x)}px), calc(-50% + ${Math.round(rl.y)}px));\n  border-radius: 50%;\n  background: ${rl.color};\n  filter: blur(${Math.round(rl.blur)}px);\n  opacity: ${rl.opacity};\n  mix-blend-mode: ${rl.blendMode};\n}`);
    });
    return lines.join("\n\n");
  }, [resolvedLayers, dims]);

  return (
    <div className="flex h-full flex-col md:flex-row p-4 md:p-5 gap-5">
      {/* Left Sidebar — Properties */}
      <div className="w-full md:w-[280px] shrink-0 overflow-y-auto space-y-4">
        {/* Power & Actions */}
        <div className="cs-glass p-3 space-y-3" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <button onClick={onUndo} disabled={!canUndo} className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cs-press" aria-label="Undo">
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={onRedo} disabled={!canRedo} className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cs-press" aria-label="Redo">
                <Redo2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={handleRandom} className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cs-press" aria-label="Random color">
                <Shuffle className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => commitClassic({ power: !classicState.power })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cs-press ${classicState.power ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-muted-foreground border border-white/5"}`}
              aria-label={classicState.power ? "Turn off" : "Turn on"}
            >
              <Power className="h-3 w-3" />
              {classicState.power ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="cs-glass p-3 space-y-2.5" style={{ animationDelay: "80ms" }}>
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Presets</span>
          <div className="flex flex-wrap gap-2">
            {presets.slice(0, 6).map((p, i) => (
              <button
                key={p.id}
                className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 cs-press ${classicState.activePreset === i ? "border-primary ring-2 ring-primary/30 scale-110" : "border-white/10"}`}
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
        <div className="cs-glass p-3 space-y-2.5" style={{ animationDelay: "160ms" }}>
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Theme</span>
          <div className="flex gap-2">
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all cs-press ${classicState.themeMode === "dark" ? "bg-white/10 text-white border border-white/10" : "bg-white/[0.03] text-muted-foreground border border-white/5"}`}
              onClick={() => commitClassic({ themeMode: "dark" })}
            >
              <Moon className="h-3.5 w-3.5" /> Dark
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all cs-press ${classicState.themeMode === "light" ? "bg-white/10 text-white border border-white/10" : "bg-white/[0.03] text-muted-foreground border border-white/5"}`}
              onClick={() => commitClassic({ themeMode: "light" })}
            >
              <Sun className="h-3.5 w-3.5" /> Light
            </button>
          </div>
        </div>

        {/* Color */}
        <div className="cs-glass p-3 space-y-3">
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Base Color</span>
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
        </div>

        {/* Shape & Light */}
        <div className="cs-glass p-3 space-y-3">
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Shape & Light</span>
          <CsSlider label="Mask Size" icon={Maximize} value={classicState.maskSize} min={20} max={100} step={1} onChange={(v) => commitClassic({ maskSize: v })} formatValue={(v) => `${v}%`} />
          <CsSlider label="Glow Scale" icon={Shrink} value={Math.round(classicState.glowScale * 100)} min={30} max={200} step={5} onChange={(v) => commitClassic({ glowScale: v / 100 })} formatValue={(v) => (v / 100).toFixed(2)} />
          <CsSlider label="Blur" icon={Droplets} value={Math.round(classicState.blurIntensity * 100)} min={10} max={200} step={5} onChange={(v) => commitClassic({ blurIntensity: v / 100 })} formatValue={(v) => (v / 100).toFixed(2)} />

          {/* Light Position Pad */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-muted-foreground">Light Position</span>
            <div
              className="relative h-28 w-full cursor-crosshair rounded-xl border border-white/5 bg-cs-track cs-dot-pattern"
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
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary/30 shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                style={{ left: `${classicState.lightPosition.x * 100}%`, top: `${classicState.lightPosition.y * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="cs-glass p-3 space-y-3">
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Appearance</span>
          <NoiseToggle
            enabled={classicState.noiseEnabled}
            intensity={classicState.noiseIntensity}
            onToggle={(v) => commitClassic({ noiseEnabled: v })}
            onIntensityChange={(v) => commitClassic({ noiseIntensity: v })}
          />
        </div>

        {/* Harmony */}
        <div className="cs-glass p-3 space-y-3">
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Color Harmony</span>
          <HarmonyChips
            baseOklch={classicState.baseOklch}
            onSelect={(hex) => {
              const oklch = hexToOklch(hex);
              commitClassic({ baseOklch: oklch, activePreset: -1 });
            }}
          />
        </div>

        {/* Layer Inspector */}
        <div className="cs-glass p-3 space-y-2.5">
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Layer Inspector</span>
          <div className="space-y-1.5">
            {resolvedLayers.map((rl, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 p-2 text-[11px]">
                <div className="h-3.5 w-3.5 rounded-md shrink-0" style={{ background: rl.color }} />
                <span className="font-medium text-foreground">{rl.name}</span>
                <span className="text-muted-foreground ml-auto font-mono">{Math.round(rl.blur)}px</span>
                <span className="text-muted-foreground font-mono">{(rl.opacity * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code Output */}
        <div className="cs-glass p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Code Output</span>
            <div className="flex rounded-lg border border-white/5 overflow-hidden">
              <button onClick={() => setCodeTab("css")} className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${codeTab === "css" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-foreground"}`}>CSS</button>
              <button onClick={() => setCodeTab("tailwind")} className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${codeTab === "tailwind" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-foreground"}`}>Tailwind</button>
            </div>
          </div>
          <pre className="max-h-40 overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[10px] text-muted-foreground border border-white/5">
            {cssCode}
          </pre>
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 transition-colors cs-press shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
            onClick={() => {
              navigator.clipboard.writeText(cssCode);
              toast.success("Code copied!");
            }}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Component Code
          </button>
        </div>
      </div>

      {/* Center Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Shape Selector - floating top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-white/5 bg-cs-panel/80 backdrop-blur-md p-1">
          {(["phone", "card", "hero", "square"] as const).map((s) => (
            <button
              key={s}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cs-press ${classicState.shape === s ? "bg-white/10 text-white" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => commitClassic({ shape: s })}
              aria-pressed={classicState.shape === s}
            >
              {CANVAS_SHAPES[s].label}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div
          ref={previewRef}
          className="relative cursor-crosshair overflow-hidden rounded-2xl border border-white/5"
          style={{
            width: Math.min(dims.width, 500),
            height: Math.min(dims.height, 500) * (dims.height / dims.width),
            aspectRatio: `${dims.width}/${dims.height}`,
            background: classicState.themeMode === "dark" ? "#050505" : "#f5f5f5",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="application"
          aria-label="Glow preview canvas — drag to move light source"
        >
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 cs-dot-pattern opacity-50 pointer-events-none" />
          
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
          {/* Light indicator */}
          <div
            className="pointer-events-none absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-white/30 shadow-[0_0_12px_rgba(255,255,255,0.3)]"
            style={{
              left: `${classicState.lightPosition.x * 100}%`,
              top: `${classicState.lightPosition.y * 100}%`,
            }}
          />
          {/* Corner dots (selection indicator) */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Floating bottom toolbar */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-white/5 bg-cs-panel/80 backdrop-blur-md p-1">
          <button onClick={onUndo} disabled={!canUndo} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors" aria-label="Undo">
            <Undo2 className="h-3 w-3" />
          </button>
          <button onClick={onRedo} disabled={!canRedo} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors" aria-label="Redo">
            <Redo2 className="h-3 w-3" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-0.5" />
          <button onClick={handleRandom} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Random">
            <Shuffle className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
});
