// ─── OKLCH Color Controls ───

import React, { useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import type { OklchColor } from "@/core/glow-engine/oklch";
import { oklchToHex, hexToOklch, clampToSrgbGamut, computeHarmonies } from "@/core/glow-engine/oklch";

interface OklchSlidersProps {
  oklch: OklchColor;
  onChange: (oklch: OklchColor) => void;
}

export const OklchSliders = React.memo<OklchSlidersProps>(({ oklch, onChange }) => {
  const handleL = useCallback((v: number[]) => {
    const clamped = clampToSrgbGamut(v[0], oklch.c, oklch.h);
    onChange({ ...clamped, l: v[0] });
  }, [oklch, onChange]);

  const handleC = useCallback((v: number[]) => {
    const clamped = clampToSrgbGamut(oklch.l, v[0], oklch.h);
    onChange(clamped);
  }, [oklch, onChange]);

  const handleH = useCallback((v: number[]) => {
    const clamped = clampToSrgbGamut(oklch.l, oklch.c, v[0]);
    onChange(clamped);
  }, [oklch, onChange]);

  const currentHex = oklchToHex(oklch.l, oklch.c, oklch.h);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md border border-border" style={{ background: currentHex }} />
        <span className="font-mono text-xs text-muted-foreground">{currentHex}</span>
      </div>
      <SliderRow label="Lightness" value={oklch.l} min={0} max={1} step={0.01} onChange={handleL} />
      <SliderRow label="Chroma" value={oklch.c} min={0} max={0.4} step={0.005} onChange={handleC} />
      <SliderRow label="Hue" value={oklch.h} min={0} max={360} step={1} onChange={handleH} />
    </div>
  );
});

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number[]) => void;
}

const SliderRow = React.memo<SliderRowProps>(({ label, value, min, max, step, onChange }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-muted-foreground">{value.toFixed(label === "Hue" ? 0 : 3)}</span>
    </div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={onChange} className="w-full" />
  </div>
));

// ─── Color Picker with Hex Input ───

interface ColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label?: string;
}

export const ColorPicker = React.memo<ColorPickerProps>(({ color, onChange, label }) => (
  <div className="flex items-center gap-2">
    {label && <span className="text-xs text-muted-foreground">{label}</span>}
    <input
      type="color"
      value={color}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
    />
    <input
      type="text"
      value={color}
      onChange={(e) => {
        const v = e.target.value;
        if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
      }}
      className="h-8 w-24 rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground"
    />
  </div>
));

// ─── Recent Colors ───

interface RecentColorsProps {
  colors: string[];
  onSelect: (hex: string) => void;
}

export const RecentColors = React.memo<RecentColorsProps>(({ colors, onSelect }) => {
  if (colors.length === 0) return null;
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">Recent Colors</span>
      <div className="flex flex-wrap gap-1">
        {colors.map((c, i) => (
          <button
            key={`${c}-${i}`}
            onClick={() => onSelect(c)}
            className="h-6 w-6 rounded border border-border transition-transform hover:scale-110"
            style={{ background: c }}
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>
    </div>
  );
});

// ─── Harmony Chips ───

interface HarmonyChipsProps {
  baseOklch: OklchColor;
  onSelect: (hex: string) => void;
}

export const HarmonyChips = React.memo<HarmonyChipsProps>(({ baseOklch, onSelect }) => {
  const groups = computeHarmonies(baseOklch);
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.name} className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">{group.name}</span>
          <div className="flex gap-1">
            {group.colors.map((c, i) => (
              <button
                key={i}
                onClick={() => onSelect(c.hex)}
                className="h-7 w-7 rounded-md border border-border transition-transform hover:scale-110"
                style={{ background: c.hex }}
                title={`${c.label}: ${c.hex}`}
                aria-label={`${group.name} ${c.label} ${c.hex}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
