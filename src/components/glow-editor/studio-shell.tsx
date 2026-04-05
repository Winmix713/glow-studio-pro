// ─── Studio Shell — V1 Full Editor Experience in V3 ───

import React, { useCallback, useMemo, useState, useEffect } from "react";
import type { GlowDocument, GlowLayer, BlendMode, CanvasShape, CanvasBgType } from "@/core/glow-engine/state";
import { generateId, createDefaultLayer, CANVAS_SHAPES } from "@/core/glow-engine/state";
import { hexToOklch, oklchToHex, clampToSrgbGamut, randomHex } from "@/core/glow-engine/oklch";
import { getPresetsForMode, type GlowPreset } from "@/core/glow-engine/presets";
import { exportAsCSS } from "@/core/glow-engine/export/css";
import { exportAsTailwind } from "@/core/glow-engine/export/tailwind";
import { exportAsReactComponent } from "@/core/glow-engine/export/react";
import { exportAsSVG } from "@/core/glow-engine/export/svg";
import { encodeDocumentToUrl } from "@/core/glow-engine/share";
import { GlowLayersRenderer } from "@/components/shared/glow-layers-renderer";
import { CanvasShapeContent } from "@/components/shared/canvas-shapes";
import { OklchSliders, ColorPicker, RecentColors, HarmonyChips } from "@/components/shared/color-controls";
import { NoiseToggle } from "@/components/shared/noise-toggle";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Trash2, Copy, Eye, EyeOff, Undo2, Redo2, Shuffle, Power,
  Share2, Download, Sun, Moon, ChevronUp, ChevronDown, Layers, Code,
  Palette, Settings, ZoomIn, ZoomOut, Maximize2,
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
    update({
      layers: filtered,
      selectedLayerId: filtered.length > 0 ? filtered[filtered.length - 1].id : null,
    });
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
    if (url) {
      navigator.clipboard.writeText(url).then(() => toast.success("Share URL copied!"));
    }
  }, [doc]);

  // Export content
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
    dark: "#0a0a0f",
    light: "#f5f5f5",
    gradient: "linear-gradient(135deg, #1a1a2e, #16213e)",
    mesh: "linear-gradient(135deg, #0a0a14, #1a0a2e, #0a1a2e)",
    dots: "#0a0a0f",
    transparent: "repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 16px 16px",
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left Sidebar ─── */}
        <div className="flex w-64 flex-col border-r border-border bg-card overflow-y-auto">
          <div className="border-b border-border p-3">
            <h2 className="text-xs font-bold tracking-wider text-muted-foreground">GLOW STUDIO PRO</h2>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 border-b border-border p-2">
            <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="Undo"><Undo2 className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="Redo"><Redo2 className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" onClick={handleRandomize} aria-label="Random"><Shuffle className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setExportOpen(true)} aria-label="Export"><Download className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share"><Share2 className="h-3.5 w-3.5" /></Button>
            <Button
              variant={doc.power ? "default" : "outline"}
              size="icon"
              onClick={() => update({ power: !doc.power })}
              aria-label="Power toggle"
            >
              <Power className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Layer Manager */}
          <div className="flex-1 p-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Layers ({doc.layers.length})</span>
              <Button variant="ghost" size="icon" onClick={addLayer} aria-label="Add layer" className="h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {doc.layers.map((layer, i) => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-1.5 rounded-md p-1.5 text-xs cursor-pointer transition-colors ${layer.id === doc.selectedLayerId ? "bg-accent" : "hover:bg-accent/50"}`}
                  onClick={() => update({ selectedLayerId: layer.id })}
                >
                  <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { active: !layer.active }); }} className="shrink-0" aria-label={layer.active ? "Hide layer" : "Show layer"}>
                    {layer.active ? <Eye className="h-3 w-3 text-muted-foreground" /> : <EyeOff className="h-3 w-3 text-muted-foreground/50" />}
                  </button>
                  <div className="h-3.5 w-3.5 shrink-0 rounded" style={{ background: layer.color }} />
                  <span className="flex-1 truncate">{layer.name}</span>
                  <div className="flex gap-0.5">
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, -1); }} className="text-muted-foreground hover:text-foreground" aria-label="Move up"><ChevronUp className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 1); }} className="text-muted-foreground hover:text-foreground" aria-label="Move down"><ChevronDown className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }} className="text-muted-foreground hover:text-foreground" aria-label="Duplicate"><Copy className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="text-muted-foreground hover:text-destructive" aria-label="Delete layer"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="border-t border-border p-2">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">Templates</span>
            <div className="grid grid-cols-3 gap-1.5">
              {presets.slice(0, 12).map((p) => (
                <button
                  key={p.id}
                  className="flex flex-col items-center gap-0.5 rounded-md border border-border p-1.5 text-[9px] transition-colors hover:bg-accent"
                  onClick={() => {
                    if (p.layers) {
                      const newLayers = p.layers.map((pl, i) => ({
                        ...createDefaultLayer(i),
                        ...pl,
                        id: generateId(),
                      }));
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
          <div className="flex items-center justify-between border-b border-border bg-card/50 px-3 py-1.5">
            <div className="flex items-center gap-2">
              {(["phone", "card", "hero", "square", "desktop", "tablet"] as CanvasShape[]).map((s) => (
                <Button
                  key={s}
                  variant={doc.canvas.shape === s ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => update({ canvas: { ...doc.canvas, shape: s, width: CANVAS_SHAPES[s].width, height: CANVAS_SHAPES[s].height } })}
                >
                  {CANVAS_SHAPES[s].label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} aria-label="Zoom out"><ZoomOut className="h-3.5 w-3.5" /></Button>
              <span className="w-12 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(3, zoom + 0.25))} aria-label="Zoom in"><ZoomIn className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(1)} aria-label="Fit"><Maximize2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex flex-1 items-center justify-center overflow-auto bg-muted/30 p-8">
            <div
              className="relative overflow-hidden rounded-2xl border border-border shadow-2xl"
              style={{
                width: dims.width * zoom,
                height: dims.height * zoom,
                background: bgColors[doc.canvas.background.type],
                transform: `scale(1)`,
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
            </div>
          </div>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div className="w-72 overflow-y-auto border-l border-border bg-card">
          <Tabs defaultValue="style" className="h-full">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent">
              <TabsTrigger value="style" className="flex-1 text-xs"><Palette className="mr-1 h-3 w-3" />Style</TabsTrigger>
              <TabsTrigger value="global" className="flex-1 text-xs"><Settings className="mr-1 h-3 w-3" />Global</TabsTrigger>
              <TabsTrigger value="code" className="flex-1 text-xs"><Code className="mr-1 h-3 w-3" />Code</TabsTrigger>
            </TabsList>

            {/* Style Tab */}
            <TabsContent value="style" className="space-y-4 p-3">
              {selectedLayer ? (
                <>
                  <div>
                    <Label className="mb-1 text-xs">Layer: {selectedLayer.name}</Label>
                    <input
                      className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-xs"
                      value={selectedLayer.name}
                      onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                    />
                  </div>

                  <ColorPicker
                    color={selectedLayer.color}
                    onChange={(hex) => {
                      updateLayer(selectedLayer.id, { color: hex });
                      const recent = [hex, ...doc.colorModel.recentColors.filter((c) => c !== hex)].slice(0, 8);
                      update({ colorModel: { ...doc.colorModel, recentColors: recent } });
                    }}
                    label="Color"
                  />

                  <OklchSliders
                    oklch={selectedOklch}
                    onChange={(oklch) => {
                      const hex = oklchToHex(oklch.l, oklch.c, oklch.h);
                      updateLayer(selectedLayer.id, { color: hex });
                    }}
                  />

                  <RecentColors colors={doc.colorModel.recentColors} onSelect={(hex) => updateLayer(selectedLayer.id, { color: hex })} />

                  <HarmonyChips baseOklch={selectedOklch} onSelect={(hex) => updateLayer(selectedLayer.id, { color: hex })} />

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Blur</span><span>{selectedLayer.blur}px</span></div>
                      <Slider value={[selectedLayer.blur]} min={0} max={200} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { blur: v[0] })} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Opacity</span><span>{(selectedLayer.opacity * 100).toFixed(0)}%</span></div>
                      <Slider value={[selectedLayer.opacity]} min={0} max={1} step={0.01} onValueChange={(v) => updateLayer(selectedLayer.id, { opacity: v[0] })} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Width</span><span>{selectedLayer.width}px</span></div>
                      <Slider value={[selectedLayer.width]} min={10} max={800} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { width: v[0] })} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Height</span><span>{selectedLayer.height}px</span></div>
                      <Slider value={[selectedLayer.height]} min={10} max={800} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { height: v[0] })} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>X Offset</span><span>{selectedLayer.x}px</span></div>
                      <Slider value={[selectedLayer.x]} min={-400} max={400} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { x: v[0] })} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Y Offset</span><span>{selectedLayer.y}px</span></div>
                      <Slider value={[selectedLayer.y]} min={-400} max={400} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { y: v[0] })} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Blend Mode</Label>
                    <Select value={selectedLayer.blendMode} onValueChange={(v) => updateLayer(selectedLayer.id, { blendMode: v as BlendMode })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BLEND_MODES.map((bm) => (
                          <SelectItem key={bm} value={bm} className="text-xs">{bm}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                  <Layers className="mb-2 h-8 w-8 opacity-30" />
                  <p>Select a layer to edit</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={addLayer}>
                    <Plus className="mr-1 h-3 w-3" /> Add Layer
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Global Tab */}
            <TabsContent value="global" className="space-y-4 p-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Master Scale</span><span>{doc.globalScale.toFixed(2)}</span></div>
                <Slider value={[doc.globalScale]} min={0.5} max={2} step={0.05} onValueChange={(v) => update({ globalScale: v[0] })} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Master Opacity</span><span>{(doc.globalOpacity * 100).toFixed(0)}%</span></div>
                <Slider value={[doc.globalOpacity]} min={0} max={1} step={0.01} onValueChange={(v) => update({ globalOpacity: v[0] })} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Animation</Label>
                  <Switch checked={doc.globalAnimation.enabled} onCheckedChange={(v) => update({ globalAnimation: { ...doc.globalAnimation, enabled: v } })} />
                </div>
                {doc.globalAnimation.enabled && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Duration</span><span>{doc.globalAnimation.duration}s</span></div>
                    <Slider value={[doc.globalAnimation.duration]} min={0.5} max={10} step={0.5} onValueChange={(v) => update({ globalAnimation: { ...doc.globalAnimation, duration: v[0] } })} />
                  </div>
                )}
              </div>

              <NoiseToggle
                enabled={doc.noise.enabled}
                intensity={doc.noise.intensity}
                onToggle={(v) => update({ noise: { ...doc.noise, enabled: v } })}
                onIntensityChange={(v) => update({ noise: { ...doc.noise, intensity: v } })}
              />

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Theme</Label>
                <div className="flex gap-2">
                  <Button variant={doc.themeMode === "dark" ? "default" : "outline"} size="sm" onClick={() => update({ themeMode: "dark" })}><Moon className="mr-1 h-3 w-3" />Dark</Button>
                  <Button variant={doc.themeMode === "light" ? "default" : "outline"} size="sm" onClick={() => update({ themeMode: "light" })}><Sun className="mr-1 h-3 w-3" />Light</Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Canvas Background</Label>
                <div className="flex flex-wrap gap-1">
                  {(["dark", "light", "gradient", "mesh", "dots", "transparent"] as CanvasBgType[]).map((bg) => (
                    <Button
                      key={bg}
                      variant={doc.canvas.background.type === bg ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-[10px]"
                      onClick={() => update({ canvas: { ...doc.canvas, background: { type: bg } } })}
                    >
                      {bg}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="p-3">
              <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-3 font-mono text-[10px] text-muted-foreground">
                {exportAsCSS(doc)}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  navigator.clipboard.writeText(exportAsCSS(doc));
                  toast.success("CSS copied!");
                }}
              >
                Copy CSS
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Glow Effect</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-3">
            {(["css", "tailwind", "react", "svg"] as const).map((f) => (
              <Button key={f} variant={exportFormat === f ? "default" : "outline"} size="sm" onClick={() => setExportFormat(f)}>
                {f.toUpperCase()}
              </Button>
            ))}
          </div>
          <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 font-mono text-xs">{exportContent}</pre>
          <Button onClick={() => { navigator.clipboard.writeText(exportContent); toast.success("Code copied!"); }}>
            Copy to Clipboard
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
});
