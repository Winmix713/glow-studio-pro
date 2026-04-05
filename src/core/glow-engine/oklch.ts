// ─── OKLCH Color Science — Unified Module ───

export interface OklchColor {
  l: number; // 0–1
  c: number; // 0–0.4+
  h: number; // 0–360
}

// ─── sRGB ↔ Linear ───

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// ─── Linear RGB ↔ OKLab ───

function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

// ─── OKLCH ↔ OKLab ───

export function oklchToOklab(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  return [l, c * Math.cos(hRad), c * Math.sin(hRad)];
}

export function oklabToOklch(L: number, a: number, b: number): OklchColor {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

// ─── Hex ↔ RGB ───

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const v = Math.round(Math.max(0, Math.min(1, c)) * 255);
    return v.toString(16).padStart(2, "0");
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ─── Hex ↔ OKLCH ───

export function hexToOklch(hex: string): OklchColor {
  const [r, g, b] = hexToRgb(hex);
  const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const [L, a, bLab] = linearRgbToOklab(lr, lg, lb);
  return oklabToOklch(L, a, bLab);
}

export function oklchToHex(l: number, c: number, h: number): string {
  const [L, a, b] = oklchToOklab(l, c, h);
  const [lr, lg, lb] = oklabToLinearRgb(L, a, b);
  return rgbToHex(linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb));
}

// ─── Gamut Clamping ───

export function clampToSrgbGamut(l: number, c: number, h: number): OklchColor {
  let lo = 0;
  let hi = c;
  let mid = c;

  for (let i = 0; i < 20; i++) {
    mid = (lo + hi) / 2;
    const [L, a, b] = oklchToOklab(l, mid, h);
    const [r, g, bVal] = oklabToLinearRgb(L, a, b);
    const inGamut = r >= -0.001 && r <= 1.001 && g >= -0.001 && g <= 1.001 && bVal >= -0.001 && bVal <= 1.001;
    if (inGamut) lo = mid;
    else hi = mid;
  }

  return { l, c: lo, h };
}

// ─── Color Harmonies ───

export interface HarmonyGroup {
  name: string;
  colors: { hex: string; oklch: OklchColor; label: string }[];
}

export function computeHarmonies(baseOklch: OklchColor): HarmonyGroup[] {
  const { l, c, h } = baseOklch;
  const make = (hShift: number, label: string) => {
    const newH = ((h + hShift) % 360 + 360) % 360;
    const clamped = clampToSrgbGamut(l, c, newH);
    return { hex: oklchToHex(clamped.l, clamped.c, clamped.h), oklch: clamped, label };
  };

  return [
    {
      name: "Complementary",
      colors: [make(0, "Base"), make(180, "Complement")],
    },
    {
      name: "Analogous",
      colors: [make(-30, "-30°"), make(0, "Base"), make(30, "+30°")],
    },
    {
      name: "Triadic",
      colors: [make(0, "Base"), make(120, "+120°"), make(240, "+240°")],
    },
    {
      name: "Split-Comp",
      colors: [make(0, "Base"), make(150, "+150°"), make(210, "+210°")],
    },
  ];
}

// ─── Random Color Generation ───

export function randomOklch(): OklchColor {
  return {
    l: 0.5 + Math.random() * 0.3,
    c: 0.1 + Math.random() * 0.2,
    h: Math.random() * 360,
  };
}

export function randomHex(): string {
  const oklch = randomOklch();
  const clamped = clampToSrgbGamut(oklch.l, oklch.c, oklch.h);
  return oklchToHex(clamped.l, clamped.c, clamped.h);
}
