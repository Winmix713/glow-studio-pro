// ─── SVG Export ───

import type { GlowDocument } from "../state";

export function exportAsSVG(doc: GlowDocument): string {
  const activeLayers = doc.layers.filter((l) => l.active);
  const { width, height } = doc.canvas;
  const cx = width / 2;
  const cy = height / 2;

  const filters = activeLayers.map((layer, i) =>
    `  <filter id="blur${i}"><feGaussianBlur stdDeviation="${layer.blur / 2}" /></filter>`
  ).join("\n");

  const ellipses = activeLayers.map((layer, i) =>
    `  <ellipse cx="${cx + layer.x}" cy="${cy + layer.y}" rx="${layer.width / 2}" ry="${layer.height / 2}" fill="${layer.color}" filter="url(#blur${i})" opacity="${layer.opacity}" style="mix-blend-mode:${layer.blendMode}" />`
  ).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
${filters}
  </defs>
  <rect width="100%" height="100%" fill="${doc.themeMode === 'dark' ? '#0a0a0a' : '#ffffff'}" />
${ellipses}
</svg>`;
}
