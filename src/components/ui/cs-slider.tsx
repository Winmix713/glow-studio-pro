// ─── ComponentSynth Slider ───

import React, { useRef, useState, useCallback } from "react";
import type { LucideIcon } from "lucide-react";

interface CsSliderProps {
  label: string;
  icon?: LucideIcon;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export const CsSlider = React.memo<CsSliderProps>(({
  label,
  icon: Icon,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = x / rect.width;
    const raw = min + pct * (max - min);
    const stepped = Math.round(raw / step) * step;
    const clamped = Math.max(min, Math.min(max, stepped));
    onChange(clamped);
  }, [min, max, step, onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    updateValue(e.clientX);
    trackRef.current?.setPointerCapture(e.pointerId);
  }, [updateValue]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging) updateValue(e.clientX);
  }, [isDragging, updateValue]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    trackRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  const displayValue = formatValue ? formatValue(value) : (
    step < 1 ? value.toFixed(step < 0.01 ? 3 : 2) : String(value)
  );

  return (
    <div className="flex items-center gap-2.5 w-full">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <div
        ref={trackRef}
        className="flex-1 h-8 bg-cs-track rounded-xl flex items-center relative overflow-hidden cursor-ew-resize border border-white/5 group touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Fill */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-cs-fill group-hover:bg-cs-fill-hover transition-colors rounded-xl flex items-center justify-between px-3"
          style={{ width: `${Math.max(15, percentage)}%` }}
        >
          <span className="text-[11px] text-white/80 font-medium whitespace-nowrap overflow-hidden">
            {label}
          </span>
          {/* Drag grip dots */}
          <div className="flex gap-[2px] ml-2 shrink-0">
            <div className="w-[2px] h-2.5 bg-white/20 rounded-full" />
            <div className="w-[2px] h-2.5 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground w-10 text-right font-medium font-mono shrink-0">
        {displayValue}
      </span>
    </div>
  );
});

CsSlider.displayName = "CsSlider";
