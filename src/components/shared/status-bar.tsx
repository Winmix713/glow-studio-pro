// ─── Status Bar ───

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
  <div className="flex h-7 items-center justify-between border-t border-border bg-muted/50 px-3 text-[10px] text-muted-foreground" role="status" aria-live="polite">
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${power ? "bg-green-500" : "bg-red-500"}`} />
        {power ? "ON" : "OFF"}
      </span>
      <span>Mode: {mode === "classic" ? "Classic" : "Studio"}</span>
      <span>Shape: {shape}</span>
    </div>
    <div className="flex items-center gap-3">
      <span>Layers: {layerCount}</span>
      {activeLayerName && <span>Active: {activeLayerName}</span>}
    </div>
  </div>
));
