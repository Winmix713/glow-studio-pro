// ─── Glow Layers Renderer (shared between Classic & Studio previews) ───

import React, { useMemo } from "react";
import type { GlowLayer, AnimationConfig } from "@/core/glow-engine/state";

interface GlowLayersRendererProps {
  layers: GlowLayer[];
  power: boolean;
  globalScale: number;
  globalOpacity: number;
  globalAnimation: AnimationConfig;
  noiseEnabled: boolean;
  noiseIntensity: number;
  containerWidth: number;
  containerHeight: number;
}

export const GlowLayersRenderer = React.memo<GlowLayersRendererProps>(({
  layers,
  power,
  globalScale,
  globalOpacity,
  globalAnimation,
  noiseEnabled,
  noiseIntensity,
  containerWidth,
  containerHeight,
}) => {
  const activeLayers = useMemo(() => layers.filter((l) => l.active), [layers]);

  if (!power) return null;

  const animStyle: React.CSSProperties = globalAnimation.enabled
    ? { animation: `glowPulse ${globalAnimation.duration}s ease-in-out infinite` }
    : {};

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        transform: `scale(${globalScale})`,
        opacity: globalOpacity,
        ...animStyle,
      }}
    >
      {activeLayers.map((layer) => {
        let bg: string;
        if (layer.gradient && layer.gradient !== "none" && layer.gradientStops?.length) {
          const stops = layer.gradientStops.map((s) => `${s.color} ${s.position}%`).join(", ");
          if (layer.gradient === "linear") bg = `linear-gradient(${layer.gradientAngle ?? 90}deg, ${stops})`;
          else if (layer.gradient === "radial") bg = `radial-gradient(circle, ${stops})`;
          else bg = `conic-gradient(from ${layer.gradientAngle ?? 0}deg, ${stops})`;
        } else {
          bg = layer.color;
        }

        const layerStyle: React.CSSProperties = {
          position: "absolute",
          width: layer.width,
          height: layer.height,
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${layer.x}px), calc(-50% + ${layer.y}px))`,
          borderRadius: "50%",
          background: bg,
          filter: `blur(${layer.blur}px)`,
          opacity: layer.opacity,
          mixBlendMode: layer.blendMode as any,
        };

        if (layer.clipMask) {
          layerStyle.maskImage = `url(${layer.clipMask.url})`;
          layerStyle.maskSize = layer.clipMask.fit;
          layerStyle.WebkitMaskImage = `url(${layer.clipMask.url})`;
          layerStyle.WebkitMaskSize = layer.clipMask.fit;
        }

        // Per-layer animation
        if (layer.layerAnimation?.type && layer.layerAnimation.type !== "none") {
          const dur = layer.layerAnimation.duration;
          const del = layer.layerAnimation.delay;
          layerStyle.animation = `layerAnim_${layer.layerAnimation.type} ${dur}s ease-in-out ${del}s infinite`;
        }

        return <div key={layer.id} style={layerStyle} />;
      })}

      {noiseEnabled && (
        <div
          className="absolute inset-0"
          style={{
            opacity: noiseIntensity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
});
