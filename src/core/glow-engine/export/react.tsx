// ─── React Component Export ───

import type { GlowDocument } from "../state";

export function exportAsReactComponent(doc: GlowDocument): string {
  const activeLayers = doc.layers.filter((l) => l.active);

  const layerConfigs = activeLayers.map((layer) => ({
    color: layer.color,
    blur: layer.blur,
    opacity: layer.opacity,
    width: layer.width,
    height: layer.height,
    x: layer.x,
    y: layer.y,
    blendMode: layer.blendMode,
  }));

  return `import React from 'react';

interface GlowEffectProps {
  className?: string;
  scale?: number;
  opacity?: number;
}

const layers = ${JSON.stringify(layerConfigs, null, 2)};

export const GlowEffect: React.FC<GlowEffectProps> = ({ className, scale = 1, opacity = 1 }) => (
  <div
    className={className}
    style={{
      position: 'relative',
      width: '${doc.canvas.width}px',
      height: '${doc.canvas.height}px',
      overflow: 'hidden',
      transform: \`scale(\${scale})\`,
      opacity,
    }}
  >
    {layers.map((layer, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: \`\${layer.width}px\`,
          height: \`\${layer.height}px\`,
          top: '50%',
          left: '50%',
          transform: \`translate(calc(-50% + \${layer.x}px), calc(-50% + \${layer.y}px))\`,
          background: layer.color,
          filter: \`blur(\${layer.blur}px)\`,
          opacity: layer.opacity,
          mixBlendMode: layer.blendMode as any,
          borderRadius: '50%',
        }}
      />
    ))}
${doc.noise.enabled ? `    <div style={{ position: 'absolute', inset: 0, opacity: ${doc.noise.intensity}, mixBlendMode: 'overlay', pointerEvents: 'none' }} />` : ""}
  </div>
);

export default GlowEffect;
`;
}
