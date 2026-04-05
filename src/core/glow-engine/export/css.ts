// ─── CSS Export ───

import type { GlowDocument, GlowLayer } from "../state";

function layerToCSS(layer: GlowLayer, index: number): string {
  const lines: string[] = [];
  lines.push(`.glow-layer-${index + 1} {`);
  lines.push(`  position: absolute;`);
  lines.push(`  width: ${layer.width}px;`);
  lines.push(`  height: ${layer.height}px;`);
  lines.push(`  top: 50%;`);
  lines.push(`  left: 50%;`);
  lines.push(`  transform: translate(calc(-50% + ${layer.x}px), calc(-50% + ${layer.y}px));`);
  lines.push(`  border-radius: 50%;`);

  if (layer.gradient && layer.gradient !== "none" && layer.gradientStops?.length) {
    const stops = layer.gradientStops.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (layer.gradient === "linear") {
      lines.push(`  background: linear-gradient(${layer.gradientAngle ?? 90}deg, ${stops});`);
    } else if (layer.gradient === "radial") {
      lines.push(`  background: radial-gradient(circle, ${stops});`);
    } else if (layer.gradient === "conic") {
      lines.push(`  background: conic-gradient(from ${layer.gradientAngle ?? 0}deg, ${stops});`);
    }
  } else {
    lines.push(`  background: ${layer.color};`);
  }

  lines.push(`  filter: blur(${layer.blur}px);`);
  lines.push(`  opacity: ${layer.opacity};`);
  lines.push(`  mix-blend-mode: ${layer.blendMode};`);

  if (layer.clipMask) {
    lines.push(`  mask-image: url(${layer.clipMask.url});`);
    lines.push(`  mask-size: ${layer.clipMask.fit};`);
    lines.push(`  -webkit-mask-image: url(${layer.clipMask.url});`);
    lines.push(`  -webkit-mask-size: ${layer.clipMask.fit};`);
  }

  lines.push(`}`);
  return lines.join("\n");
}

export function exportAsCSS(doc: GlowDocument): string {
  const activeLayers = doc.layers.filter((l) => l.active);
  const lines: string[] = [];

  lines.push(`.glow-container {`);
  lines.push(`  position: relative;`);
  lines.push(`  width: ${doc.canvas.width}px;`);
  lines.push(`  height: ${doc.canvas.height}px;`);
  lines.push(`  overflow: hidden;`);
  if (doc.globalScale !== 1) lines.push(`  transform: scale(${doc.globalScale});`);
  if (doc.globalOpacity !== 1) lines.push(`  opacity: ${doc.globalOpacity};`);
  lines.push(`}`);
  lines.push("");

  activeLayers.forEach((layer, i) => {
    lines.push(layerToCSS(layer, i));
    lines.push("");
  });

  if (doc.noise.enabled) {
    lines.push(`.glow-noise {`);
    lines.push(`  position: absolute;`);
    lines.push(`  inset: 0;`);
    lines.push(`  opacity: ${doc.noise.intensity};`);
    lines.push(`  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");`);
    lines.push(`  mix-blend-mode: overlay;`);
    lines.push(`  pointer-events: none;`);
    lines.push(`}`);
  }

  // Animation keyframes
  if (doc.globalAnimation.enabled) {
    lines.push("");
    lines.push(`@keyframes glow-pulse {`);
    lines.push(`  0%, 100% { transform: scale(1); opacity: 1; }`);
    lines.push(`  50% { transform: scale(1.05); opacity: 0.8; }`);
    lines.push(`}`);
    lines.push(`.glow-container { animation: glow-pulse ${doc.globalAnimation.duration}s ease-in-out infinite; }`);
  }

  return lines.join("\n");
}
