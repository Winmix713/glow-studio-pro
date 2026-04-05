// ─── Tailwind Export ───

import type { GlowDocument } from "../state";

export function exportAsTailwind(doc: GlowDocument): string {
  const activeLayers = doc.layers.filter((l) => l.active);
  const lines: string[] = [];

  lines.push(`{/* Glow Effect — Tailwind + Inline Styles */}`);
  lines.push(`<div className="relative overflow-hidden" style={{ width: '${doc.canvas.width}px', height: '${doc.canvas.height}px' }}>`);

  activeLayers.forEach((layer, i) => {
    const bg = layer.color;
    lines.push(`  <div`);
    lines.push(`    className="absolute rounded-full"`);
    lines.push(`    style={{`);
    lines.push(`      width: '${layer.width}px',`);
    lines.push(`      height: '${layer.height}px',`);
    lines.push(`      top: '50%',`);
    lines.push(`      left: '50%',`);
    lines.push(`      transform: 'translate(calc(-50% + ${layer.x}px), calc(-50% + ${layer.y}px))',`);
    lines.push(`      background: '${bg}',`);
    lines.push(`      filter: 'blur(${layer.blur}px)',`);
    lines.push(`      opacity: ${layer.opacity},`);
    lines.push(`      mixBlendMode: '${layer.blendMode}',`);
    lines.push(`    }}`);
    lines.push(`  />`);
  });

  if (doc.noise.enabled) {
    lines.push(`  <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{ opacity: ${doc.noise.intensity} }} />`);
  }

  lines.push(`</div>`);
  return lines.join("\n");
}
