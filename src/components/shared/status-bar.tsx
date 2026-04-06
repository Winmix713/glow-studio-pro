// ─── Status Bar (ComponentSynth) ───

import React from "react";
import type { EditorMode, CanvasShape } from "@/core/glow-engine/state";

interface StatusBarProps {
  mode: EditorMode;
  shape: CanvasShape;
  layerCount: number;
  activeLayerName?: string;
  power: boolean;
}

export const StatusBar = React.memo<StatusBarProps>(({ mode, shape, layerCount, activeLayerName, power }) => (
  <div className="flex h-7 items-center justify-between border-t border-white/5 bg-cs-panel/90 backdrop-blur-md px-4 text-[10px] text-muted-foreground" role="status" aria-live="polite">
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1.5">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${power ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-400"}`} />
        {power ? "ON" : "OFF"}
      </span>
      <span className="text-white/20">|</span>
      <span>Mode: {mode === "classic" ? "Classic" : "Studio"}</span>
      <span className="text-white/20">|</span>
      <span>Shape: {shape}</span>
    </div>
    <div className="flex items-center gap-4">
      <span>Layers: {layerCount}</span>
      {activeLayerName && (
        <>
          <span className="text-white/20">|</span>
          <span>Active: {activeLayerName}</span>
        </>
      )}
    </div>
  </div>
));
