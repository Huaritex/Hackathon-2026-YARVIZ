/**
 * Frame-based color interpolation utilities for the YARVIZ promo video.
 * No random values — all outputs are deterministic.
 */

/**
 * Parse a hex color string into an [R, G, B] tuple (0–255 each).
 * Handles both "#rrggbb" and "rrggbb" formats.
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

/**
 * Linearly interpolate between two hex colors.
 *
 * @param from - Starting hex color (e.g. "#6366f1")
 * @param to   - Ending hex color
 * @param t    - Blend factor ∈ [0, 1]
 * @returns    rgb(r, g, b) string
 */
export function lerpColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

/** YARVIZ design tokens. */
export const COLORS = {
  bgMain: "#09090b",
  bgCard: "rgba(24,24,27,0.6)",
  accentIndigo: "#6366f1",
  accentTeal: "#14b8a6",
  textHero: "#ffffff",
  textMuted: "#a1a1aa",
  borderSubtle: "rgba(255,255,255,0.08)",
  statusNeutral: "#3f3f46",
  statusReady: "#14b8a6",
  statusActive: "#6366f1",
} as const;

/**
 * Create an rgba() string from a hex color and alpha value.
 *
 * @param hex   - Hex color string
 * @param alpha - Opacity ∈ [0, 1]
 */
export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Teal glow box-shadow string, scaled by intensity.
 *
 * @param intensity - Multiplier for glow radius (default 1)
 */
export function tealGlow(intensity = 1): string {
  return `0 0 ${32 * intensity}px rgba(20,184,166,0.65), 0 0 ${64 * intensity}px rgba(20,184,166,0.3)`;
}

/**
 * Indigo glow box-shadow string, scaled by intensity.
 *
 * @param intensity - Multiplier for glow radius (default 1)
 */
export function indigoGlow(intensity = 1): string {
  return `0 0 ${24 * intensity}px rgba(99,102,241,0.5), 0 0 ${48 * intensity}px rgba(99,102,241,0.25)`;
}
