// ─── Studio Shell — ComponentSynth Design ───

import React, { useCallback, useMemo, useState, useEffect } from "react";
import type { GlowDocument, GlowLayer, BlendMode, CanvasShape, CanvasBgType } from "@/core/glow-engine/state";
import { generateId, createDefaultLayer, CANVAS_SHAPES } from "@/core/glow-engine/state";
import { hexToOklch, oklchToHex, clampToSrgbGamut, randomHex } from "@/core/glow-engine/oklch";
import { getPresetsForMode } from "@/core/glow-engine/presets";
import { exportAsCSS } from "@/core/glow-engine/export/css";
import { exportAsTailwind } from "@/core/glow-engine/export/tailwind";
import { exportAsReactComponent } from "@/core/glow-engine/export/react";
import { exportAsSVG } from "@/core/glow-engine/export/svg";
import { encodeDocumentToUrl } from "@/core/glow-engine/share";
import { GlowLayersRenderer } from "@/components/shared/glow-layers-renderer";
import { CanvasShapeContent } from "@/components/shared/canvas-shapes";
import { OklchSliders, ColorPicker, RecentColors, HarmonyChips } from "@/components/shared/color-controls";
import { NoiseToggle } from "@/components/shared/noise-toggle";
import { CsSlider } from "@/components/ui/cs-slider";
import { CsToggle } from "@/components/ui/cs-toggle";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Trash2, Copy, Eye, EyeOff, Undo2, Redo2, Shuffle, Power,
  Share2, Download, Sun, Moon, ChevronUp, ChevronDown, Layers, Code,
  Palette, Settings, ZoomIn, ZoomOut, Maximize2, Play, Square,
  Move, Droplets, CircleDot,
} from "lucide-react";
import { toast } from "sonner";

const BLEND_MODES: BlendMode[] = ["normal", "screen", "multiply", "overlay", "soft-light", "hard-light", "color-dodge", "color-burn", "lighten", "darken", "difference", "exclusion"];

interface StudioShellProps {
  document: GlowDocument;
  onDocumentChange: (doc: GlowDocument) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const StudioShell = React.memo<StudioShellProps>(({
  document: doc,
  onDocumentChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [zoom, setZoom] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"css" | "tailwind" | "react" | "svg">("css");

  const presets = useMemo(() => getPresetsForMode("studio"), []);
  const selectedLayer = useMemo(() => doc.layers.find((l) => l.id === doc.selectedLayerId), [doc.layers, doc.selectedLayerId]);
  const selectedOklch = useMemo(() => selectedLayer ? hexToOklch(selectedLayer.color) : { l: 0.7, c: 0.2, h: 150 }, [selectedLayer]);

  const update = useCallback((patch: Partial<GlowDocument>) => {
    onDocumentChange({ ...doc, ...patch, meta: { ...doc.meta, updatedAt: new Date().toISOString() } });
  }, [doc, onDocumentChange]);

  const updateLayer = useCallback((layerId: string, patch: Partial<GlowLayer>) => {
    update({ layers: doc.layers.map((l) => l.id === layerId ? { ...l, ...patch } : l) });
  }, [doc.layers, update]);

  const addLayer = useCallback(() => {
    const newLayer = createDefaultLayer(doc.layers.length);
    newLayer.color = randomHex();
    update({ layers: [...doc.layers, newLayer], selectedLayerId: newLayer.id });
  }, [doc.layers, update]);

  const deleteLayer = useCallback((id: string) => {
    const filtered = doc.layers.filter((l) => l.id !== id);
    update({ layers: filtered, selectedLayerId: filtered.length > 0 ? filtered[filtered.length - 1].id : null });
  }, [doc.layers, update]);

  const duplicateLayer = useCallback((id: string) => {
    const src = doc.layers.find((l) => l.id === id);
    if (!src) return;
    const dup = { ...src, id: generateId(), name: `${src.name} copy` };
    const idx = doc.layers.findIndex((l) => l.id === id);
    const newLayers = [...doc.layers];
    newLayers.splice(idx + 1, 0, dup);
    update({ layers: newLayers, selectedLayerId: dup.id });
  }, [doc.layers, update]);

  const moveLayer = useCallback((id: string, dir: -1 | 1) => {
    const idx = doc.layers.findIndex((l) => l.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= doc.layers.length) return;
    const newLayers = [...doc.layers];
    [newLayers[idx], newLayers[newIdx]] = [newLayers[newIdx], newLayers[idx]];
    update({ layers: newLayers });
  }, [doc.layers, update]);

  const handleRandomize = useCallback(() => {
    const newLayers = doc.layers.map((l) => ({ ...l, color: randomHex() }));
    update({ layers: newLayers });
    toast.success("Randomized all layers!");
  }, [doc.layers, update]);

  const handleShare = useCallback(() => {
    const url = encodeDocumentToUrl(doc);
    if (url) navigator.clipboard.writeText(url).then(() => toast.success("Share URL copied!"));
  }, [doc]);

  const exportContent = useMemo(() => {
    switch (exportFormat) {
      case "css": return exportAsCSS(doc);
      case "tailwind": return exportAsTailwind(doc);
      case "react": return exportAsReactComponent(doc);
      case "svg": return exportAsSVG(doc);
    }
  }, [doc, exportFormat]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); onUndo(); }
      else if ((e.metaKey || e.ctrlKey) && (e.key === "Z" || e.key === "y")) { e.preventDefault(); onRedo(); }
      else if (e.key === "p" || e.key === "P") update({ power: !doc.power });
      else if (e.key === "r" || e.key === "R") handleRandomize();
      else if (e.key === "n" || e.key === "N") addLayer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doc.power, onUndo, onRedo, handleRandomize, addLayer, update]);

  const dims = CANVAS_SHAPES[doc.canvas.shape];

  const bgColors: Record<CanvasBgType, string> = {
    dark: "#050505",
    light: "#f5f5f5",
    gradient: "linear-gradient(135deg, #1a1a2e, #16213e)",
    mesh: "linear-gradient(135deg, #0a0a14, #1a0a2e, #0a1a2e)",
    dots: "#050505",
    transparent: "repeating-conic-gradient(#222 0% 25%, #1a1a1a 0% 50%) 50% / 16px 16px",
  };

  return (
    <div className="flex h-full">
      {/* ─── Left Sidebar ─── */}
      <div className="flex w-64 flex-col border-r border-white/5 bg-cs-panel overflow-y-auto p-3 gap-3">
        {/* Toolbar */}
        <div className="cs-glass-sm p-2 flex flex-wrap gap-1">
          <button onClick={onUndo} disabled={!canUndo} className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cs-press" aria-label="Undo"><Undo2 className="h-3.5 w-3.5" /></button>
          <button onClick={onRedo} disabled={!canRedo} className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cs-press" aria-label="Redo"><Redo2 className="h-3.5 w-3.5" /></button>
          <button onClick={handleRandomize} className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cs-press" aria-label="Random"><Shuffle className="h-3.5 w-3.5" /></button>
          <button onClick={() => setExportOpen(true)} className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cs-press" aria-label="Export"><Download className="h-3.5 w-3.5" /></button>
          <button onClick={handleShare} className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cs-press" aria-label="Share"><Share2 className="h-3.5 w-3.5" /></button>
          <button
            onClick={() => update({ power: !doc.power })}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cs-press ${doc.power ? "bg-emerald-500/20 text-emerald-400" : "bg-black/40 text-muted-foreground"}`}
            aria-label="Power toggle"
          >
            <Power className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Layer Manager */}
        <div className="cs-glass-sm p-2.5 flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Layers ({doc.layers.length})</span>
            <button onClick={addLayer} className="w-6 h-6 rounded-md bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors cs-press" aria-label="Add layer">
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-0.5">
            {doc.layers.map((layer) => (
              <div
                key={layer.id}
                className={`flex items-center gap-1.5 rounded-lg p-1.5 text-[11px] cursor-pointer transition-all ${layer.id === doc.selectedLayerId ? "bg-white/[0.06] border border-white/10" : "hover:bg-white/[0.03] border border-transparent"}`}
                onClick={() => update({ selectedLayerId: layer.id })}
              >
                <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { active: !layer.active }); }} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" aria-label={layer.active ? "Hide" : "Show"}>
                  {layer.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 opacity-40" />}
                </button>
                <div className="h-3.5 w-3.5 shrink-0 rounded-md border border-white/10" style={{ background: layer.color }} />
                <span className="flex-1 truncate text-foreground">{layer.name}</span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100" style={{ opacity: layer.id === doc.selectedLayerId ? 1 : undefined }}>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, -1); }} className="text-muted-foreground hover:text-foreground p-0.5" aria-label="Move up"><ChevronUp className="h-3 w-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 1); }} className="text-muted-foreground hover:text-foreground p-0.5" aria-label="Move down"><ChevronDown className="h-3 w-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }} className="text-muted-foreground hover:text-foreground p-0.5" aria-label="Duplicate"><Copy className="h-3 w-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="text-muted-foreground hover:text-destructive p-0.5" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div className="cs-glass-sm p-2.5 space-y-2">
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Templates</span>
          <div className="grid grid-cols-3 gap-1.5">
            {presets.slice(0, 12).map((p) => (
              <button
                key={p.id}
                className="flex flex-col items-center gap-0.5 rounded-lg border border-white/5 bg-white/[0.02] p-1.5 text-[9px] transition-all hover:bg-white/[0.05] hover:border-white/10 cs-press"
                onClick={() => {
                  if (p.layers) {
                    const newLayers = p.layers.map((pl, i) => ({ ...createDefaultLayer(i), ...pl, id: generateId() }));
                    update({
                      layers: newLayers,
                      selectedLayerId: newLayers[0]?.id ?? null,
                      themeMode: p.themeMode ?? doc.themeMode,
                      globalAnimation: p.animation ?? doc.globalAnimation,
                    });
                    toast.success(`Template: ${p.name}`);
                  }
                }}
              >
                <span>{p.icon}</span>
                <span className="truncate text-muted-foreground">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Center Canvas ─── */}
      <div className="flex flex-1 flex-col">
        {/* Canvas Toolbar */}
        <div className="flex items-center justify-between border-b border-white/5 bg-cs-panel/50 backdrop-blur-sm px-3 py-1.5">
          <div className="flex items-center gap-1">
            {(["phone", "card", "hero", "square", "desktop", "tablet"] as CanvasShape[]).map((s) => (
              <button
                key={s}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cs-press ${doc.canvas.shape === s ? "bg-white/10 text-white" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => update({ canvas: { ...doc.canvas, shape: s, width: CANVAS_SHAPES[s].width, height: CANVAS_SHAPES[s].height } })}
              >
                {CANVAS_SHAPES[s].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} aria-label="Zoom out"><ZoomOut className="h-3.5 w-3.5" /></button>
            <span className="w-10 text-center text-[11px] text-muted-foreground font-mono">{Math.round(zoom * 100)}%</span>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" onClick={() => setZoom(Math.min(3, zoom + 0.25))} aria-label="Zoom in"><ZoomIn className="h-3.5 w-3.5" /></button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" onClick={() => setZoom(1)} aria-label="Fit"><Maximize2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-1 items-center justify-center overflow-auto cs-dot-pattern p-8">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/5 shadow-2xl"
            style={{
              width: dims.width * zoom,
              height: dims.height * zoom,
              background: bgColors[doc.canvas.background.type],
            }}
            role="application"
            aria-label="Glow preview canvas"
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: dims.width, height: dims.height }}>
              <GlowLayersRenderer
                layers={doc.layers}
                power={doc.power}
                globalScale={doc.globalScale}
                globalOpacity={doc.globalOpacity}
                globalAnimation={doc.globalAnimation}
                noiseEnabled={doc.noise.enabled}
                noiseIntensity={doc.noise.intensity}
                containerWidth={dims.width}
                containerHeight={dims.height}
              />
              <div className="relative z-10 flex h-full items-center justify-center" style={{ color: doc.themeMode === "dark" ? "#fff" : "#000", width: dims.width, height: dims.height }}>
                <CanvasShapeContent shape={doc.canvas.shape} componentType={doc.componentType} />
              </div>
            </div>
            {/* Corner dots */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      {/* ─── Right Sidebar ─── */}
      <div className="w-72 overflow-y-auto border-l border-white/5 bg-cs-panel p-3">
        <Tabs defaultValue="style" className="h-full flex flex-col">
          <TabsList className="w-full rounded-xl border border-white/5 bg-white/[0.02] p-0.5 h-auto">
            <TabsTrigger value="style" className="flex-1 text-[11px] rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white py-1.5"><Palette className="mr-1 h-3 w-3" />Style</TabsTrigger>
            <TabsTrigger value="global" className="flex-1 text-[11px] rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white py-1.5"><Settings className="mr-1 h-3 w-3" />Global</TabsTrigger>
            <TabsTrigger value="code" className="flex-1 text-[11px] rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white py-1.5"><Code className="mr-1 h-3 w-3" />Code</TabsTrigger>
          </TabsList>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-3 pt-3 flex-1 overflow-y-auto">
            {selectedLayer ? (
              <>
                <div className="cs-glass-sm p-2.5 space-y-2">
                  <Label className="text-[11px] text-muted-foreground">Layer: {selectedLayer.name}</Label>
                  <input
                    className="h-7 w-full rounded-lg border border-white/5 bg-cs-track px-2 text-[11px] text-foreground"
                    value={selectedLayer.name}
                    onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                  />
                </div>

                <div className="cs-glass-sm p-2.5 space-y-2.5">
                  <ColorPicker
                    color={selectedLayer.color}
                    onChange={(hex) => {
                      updateLayer(selectedLayer.id, { color: hex });
                      const recent = [hex, ...doc.colorModel.recentColors.filter((c) => c !== hex)].slice(0, 8);
                      update({ colorModel: { ...doc.colorModel, recentColors: recent } });
                    }}
                    label="Color"
                  />
                  <OklchSliders oklch={selectedOklch} onChange={(oklch) => { const hex = oklchToHex(oklch.l, oklch.c, oklch.h); updateLayer(selectedLayer.id, { color: hex }); }} />
                  <RecentColors colors={doc.colorModel.recentColors} onSelect={(hex) => updateLayer(selectedLayer.id, { color: hex })} />
                  <HarmonyChips baseOklch={selectedOklch} onSelect={(hex) => updateLayer(selectedLayer.id, { color: hex })} />
                </div>

                <div className="cs-glass-sm p-2.5 space-y-2">
                  <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Properties</span>
                  <CsSlider label="Blur" icon={Droplets} value={selectedLayer.blur} min={0} max={200} step={1} onChange={(v) => updateLayer(selectedLayer.id, { blur: v })} formatValue={(v) => `${v}px`} />
                  <CsSlider label="Opacity" icon={CircleDot} value={Math.round(selectedLayer.opacity * 100)} min={0} max={100} step={1} onChange={(v) => updateLayer(selectedLayer.id, { opacity: v / 100 })} formatValue={(v) => `${v}%`} />
                  <CsSlider label="Width" icon={Maximize2} value={selectedLayer.width} min={10} max={800} step={1} onChange={(v) => updateLayer(selectedLayer.id, { width: v })} formatValue={(v) => `${v}px`} />
                  <CsSlider label="Height" icon={Maximize2} value={selectedLayer.height} min={10} max={800} step={1} onChange={(v) => updateLayer(selectedLayer.id, { height: v })} formatValue={(v) => `${v}px`} />
                  <CsSlider label="X Offset" icon={Move} value={selectedLayer.x} min={-400} max={400} step={1} onChange={(v) => updateLayer(selectedLayer.id, { x: v })} formatValue={(v) => `${v}px`} />
                  <CsSlider label="Y Offset" icon={Move} value={selectedLayer.y} min={-400} max={400} step={1} onChange={(v) => updateLayer(selectedLayer.id, { y: v })} formatValue={(v) => `${v}px`} />
                </div>

                <div className="cs-glass-sm p-2.5 space-y-2">
                  <Label className="text-[11px] text-muted-foreground">Blend Mode</Label>
                  <Select value={selectedLayer.blendMode} onValueChange={(v) => updateLayer(selectedLayer.id, { blendMode: v as BlendMode })}>
                    <SelectTrigger className="h-8 text-[11px] rounded-lg border-white/5 bg-cs-track"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLEND_MODES.map((bm) => (
                        <SelectItem key={bm} value={bm} className="text-[11px]">{bm}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Layers className="mb-3 h-8 w-8 text-muted-foreground/20" />
                <p className="text-[11px] text-muted-foreground mb-3">Select a layer to edit</p>
                <button onClick={addLayer} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium border border-primary/20 transition-colors hover:bg-primary/20 cs-press">
                  <Plus className="h-3 w-3" /> Add Layer
                </button>
              </div>
            )}
          </TabsContent>

          {/* Global Tab */}
          <TabsContent value="global" className="space-y-3 pt-3 flex-1 overflow-y-auto">
            <div className="cs-glass-sm p-2.5 space-y-2">
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Master Controls</span>
              <CsSlider label="Scale" value={Math.round(doc.globalScale * 100)} min={50} max={200} step={5} onChange={(v) => update({ globalScale: v / 100 })} formatValue={(v) => (v / 100).toFixed(2)} />
              <CsSlider label="Opacity" value={Math.round(doc.globalOpacity * 100)} min={0} max={100} step={1} onChange={(v) => update({ globalOpacity: v / 100 })} formatValue={(v) => `${v}%`} />
            </div>

            <div className="cs-glass-sm p-2.5 space-y-2">
              <CsToggle label="Animation" icon={Play} checked={doc.globalAnimation.enabled} onChange={(v) => update({ globalAnimation: { ...doc.globalAnimation, enabled: v } })} />
              {doc.globalAnimation.enabled && (
                <CsSlider label="Duration" value={doc.globalAnimation.duration * 10} min={5} max={100} step={5} onChange={(v) => update({ globalAnimation: { ...doc.globalAnimation, duration: v / 10 } })} formatValue={(v) => `${(v / 10).toFixed(1)}s`} />
              )}
            </div>

            <div className="cs-glass-sm p-2.5">
              <NoiseToggle
                enabled={doc.noise.enabled}
                intensity={doc.noise.intensity}
                onToggle={(v) => update({ noise: { ...doc.noise, enabled: v } })}
                onIntensityChange={(v) => update({ noise: { ...doc.noise, intensity: v } })}
              />
            </div>

            <div className="cs-glass-sm p-2.5 space-y-2">
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Theme</span>
              <div className="flex gap-2">
                <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium transition-all cs-press ${doc.themeMode === "dark" ? "bg-white/10 text-white border border-white/10" : "bg-white/[0.03] text-muted-foreground border border-white/5"}`} onClick={() => update({ themeMode: "dark" })}>
                  <Moon className="h-3.5 w-3.5" /> Dark
                </button>
                <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium transition-all cs-press ${doc.themeMode === "light" ? "bg-white/10 text-white border border-white/10" : "bg-white/[0.03] text-muted-foreground border border-white/5"}`} onClick={() => update({ themeMode: "light" })}>
                  <Sun className="h-3.5 w-3.5" /> Light
                </button>
              </div>
            </div>

            <div className="cs-glass-sm p-2.5 space-y-2">
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Canvas Background</span>
              <div className="flex flex-wrap gap-1">
                {(["dark", "light", "gradient", "mesh", "dots", "transparent"] as CanvasBgType[]).map((bg) => (
                  <button
                    key={bg}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all cs-press ${doc.canvas.background.type === bg ? "bg-white/10 text-white border border-white/10" : "bg-white/[0.03] text-muted-foreground border border-white/5 hover:bg-white/[0.06]"}`}
                    onClick={() => update({ canvas: { ...doc.canvas, background: { type: bg } } })}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="pt-3 flex-1 overflow-y-auto space-y-3">
            <div className="cs-glass-sm p-2.5">
              <pre className="max-h-[60vh] overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[10px] text-muted-foreground border border-white/5">
                {exportAsCSS(doc)}
              </pre>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 transition-colors cs-press shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
              onClick={() => { navigator.clipboard.writeText(exportAsCSS(doc)); toast.success("CSS copied!"); }}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Component Code
            </button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-2xl bg-cs-panel border-white/5">
          <DialogHeader>
            <DialogTitle className="text-white">Export Glow Effect</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-3">
            {(["css", "tailwind", "react", "svg"] as const).map((f) => (
              <button
                key={f}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cs-press ${exportFormat === f ? "bg-white/10 text-white border border-white/10" : "bg-white/[0.03] text-muted-foreground border border-white/5"}`}
                onClick={() => setExportFormat(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <pre className="max-h-96 overflow-auto rounded-xl bg-black/40 p-4 font-mono text-[11px] text-muted-foreground border border-white/5">{exportContent}</pre>
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium border border-primary/20 transition-colors cs-press"
            onClick={() => { navigator.clipboard.writeText(exportContent); toast.success("Code copied!"); }}
          >
            <Copy className="h-4 w-4" />
            Copy to Clipboard
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
});
