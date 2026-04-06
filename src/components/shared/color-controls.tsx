// ─── OKLCH Color Controls (ComponentSynth) ───

import React, { useCallback } from "react";
import { CsSlider } from "@/components/ui/cs-slider";
import type { OklchColor } from "@/core/glow-engine/oklch";
import { oklchToHex, hexToOklch, clampToSrgbGamut, computeHarmonies } from "@/core/glow-engine/oklch";
import { Sun, Palette, RotateCw } from "lucide-react";

interface OklchSlidersProps {
  oklch: OklchColor;
  onChange: (oklch: OklchColor) => void;
}

export const OklchSliders = React.memo<OklchSlidersProps>(({ oklch, onChange }) => {
  const handleL = useCallback((v: number) => {
    const val = v / 100;
    const clamped = clampToSrgbGamut(val, oklch.c, oklch.h);
    onChange({ ...clamped, l: val });
  }, [oklch, onChange]);

  const handleC = useCallback((v: number) => {
    const val = v / 1000;
    const clamped = clampToSrgbGamut(oklch.l, val, oklch.h);
    onChange(clamped);
  }, [oklch, onChange]);

  const handleH = useCallback((v: number) => {
    const clamped = clampToSrgbGamut(oklch.l, oklch.c, v);
    onChange(clamped);
  }, [oklch, onChange]);

  const currentHex = oklchToHex(oklch.l, oklch.c, oklch.h);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg border border-white/10" style={{ background: currentHex }} />
        <span className="font-mono text-[11px] text-muted-foreground">{currentHex}</span>
      </div>
      <CsSlider label="Lightness" icon={Sun} value={Math.round(oklch.l * 100)} min={0} max={100} step={1} onChange={handleL} />
      <CsSlider label="Chroma" icon={Palette} value={Math.round(oklch.c * 1000)} min={0} max={400} step={5} onChange={handleC} formatValue={(v) => (v / 1000).toFixed(3)} />
      <CsSlider label="Hue" icon={RotateCw} value={Math.round(oklch.h)} min={0} max={360} step={1} onChange={handleH} formatValue={(v) => `${v}°`} />
    </div>
  );
});

// ─── Color Picker with Hex Input ───

interface ColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label?: string;
}

export const ColorPicker = React.memo<ColorPickerProps>(({ color, onChange, label }) => (
  <div className="flex items-center gap-2">
    {label && <span className="text-[11px] text-muted-foreground">{label}</span>}
    <input
      type="color"
      value={color}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-7 cursor-pointer rounded-lg border border-white/10 bg-transparent"
    />
    <input
      type="text"
      value={color}
      onChange={(e) => {
        const v = e.target.value;
        if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
      }}
      className="h-7 w-24 rounded-lg border border-white/5 bg-cs-track px-2 font-mono text-[11px] text-foreground"
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
    <div className="space-y-1.5">
      <span className="text-[11px] text-muted-foreground">Recent Colors</span>
      <div className="flex flex-wrap gap-1">
        {colors.map((c, i) => (
          <button
            key={`${c}-${i}`}
            onClick={() => onSelect(c)}
            className="h-6 w-6 rounded-lg border border-white/10 transition-transform hover:scale-110 cs-press"
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
    <div className="space-y-2.5">
      {groups.map((group) => (
        <div key={group.name} className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">{group.name}</span>
          <div className="flex gap-1">
            {group.colors.map((c, i) => (
              <button
                key={i}
                onClick={() => onSelect(c.hex)}
                className="h-6 w-6 rounded-lg border border-white/10 transition-transform hover:scale-110 cs-press"
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
