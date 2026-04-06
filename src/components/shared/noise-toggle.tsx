// ─── Noise Toggle (ComponentSynth) ───

import React from "react";
import { CsSlider } from "@/components/ui/cs-slider";
import { CsToggle } from "@/components/ui/cs-toggle";
import { Sparkles } from "lucide-react";

interface NoiseToggleProps {
  enabled: boolean;
  intensity: number;
  onToggle: (enabled: boolean) => void;
  onIntensityChange: (intensity: number) => void;
}

export const NoiseToggle = React.memo<NoiseToggleProps>(({ enabled, intensity, onToggle, onIntensityChange }) => (
  <div className="space-y-2">
    <CsToggle label="Noise Texture" icon={Sparkles} checked={enabled} onChange={onToggle} />
    {enabled && (
      <CsSlider
        label="Intensity"
        value={Math.round(intensity * 100)}
        min={0}
        max={50}
        step={1}
        onChange={(v) => onIntensityChange(v / 100)}
        formatValue={(v) => `${v}%`}
      />
    )}
  </div>
));
