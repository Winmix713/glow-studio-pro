// ─── Noise Toggle ───

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface NoiseToggleProps {
  enabled: boolean;
  intensity: number;
  onToggle: (enabled: boolean) => void;
  onIntensityChange: (intensity: number) => void;
}

export const NoiseToggle = React.memo<NoiseToggleProps>(({ enabled, intensity, onToggle, onIntensityChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-xs text-muted-foreground">Noise Texture</Label>
      <Switch checked={enabled} onCheckedChange={onToggle} aria-label="Toggle noise overlay" />
    </div>
    {enabled && (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Intensity</span>
          <span className="font-mono text-xs text-muted-foreground">{(intensity * 100).toFixed(0)}%</span>
        </div>
        <Slider value={[intensity]} min={0} max={0.5} step={0.01} onValueChange={(v) => onIntensityChange(v[0])} />
      </div>
    )}
  </div>
));
