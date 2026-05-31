/**
 * GSAP-backed easing library for Remotion compositions.
 *
 * Standard eases (expo, back, elastic, power, bounce, circ, sine) are sourced
 * directly from gsap.parseEase — no re-implementation needed. The two
 * spec-exact cubic-bezier curves (snappyOut, overshoot) keep the precision
 * solver because they require exact control-point matching.
 *
 * All returned functions are (t: number) => number, t ∈ [0, 1].
 * Compatible with Remotion's interpolate() easing parameter.
 * Safe for headless rendering — pure math, no DOM access.
 */

import { gsap } from "gsap";

// ─── Spec-exact cubic-bezier solver ──────────────────────────────────────────
// Used only for the two exact curves mandated by the motion design spec.
// All other eases delegate to gsap.parseEase().

const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;
const SAMPLE_TABLE_SIZE = 11;
const SAMPLE_STEP_SIZE = 1.0 / (SAMPLE_TABLE_SIZE - 1);

function calcBezier(t: number, a1: number, a2: number): number {
  return (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + (3.0 * a1)) * t;
}

function getSlope(t: number, a1: number, a2: number): number {
  return 3.0 * (1.0 - 3.0 * a2 + 3.0 * a1) * t * t + 2.0 * (3.0 * a2 - 6.0 * a1) * t + 3.0 * a1;
}

function binarySubdivide(x: number, lo: number, hi: number, mX1: number, mX2: number): number {
  let cx: number, ct = 0, i = 0;
  do {
    ct = lo + (hi - lo) / 2.0;
    cx = calcBezier(ct, mX1, mX2) - x;
    if (cx > 0.0) hi = ct; else lo = ct;
  } while (Math.abs(cx) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return ct;
}

function newtonRaphson(x: number, guessT: number, mX1: number, mX2: number): number {
  let t = guessT;
  for (let i = 0; i < NEWTON_ITERATIONS; i++) {
    const slope = getSlope(t, mX1, mX2);
    if (slope === 0.0) return t;
    t -= (calcBezier(t, mX1, mX2) - x) / slope;
  }
  return t;
}

function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number): (t: number) => number {
  if (p1x === p1y && p2x === p2y) return (t) => t;

  const sampleValues = new Float32Array(SAMPLE_TABLE_SIZE);
  for (let i = 0; i < SAMPLE_TABLE_SIZE; i++) {
    sampleValues[i] = calcBezier(i * SAMPLE_STEP_SIZE, p1x, p2x);
  }

  function getTForX(x: number): number {
    let intervalStart = 0.0;
    let current = 1;
    const last = SAMPLE_TABLE_SIZE - 1;
    for (; current !== last && sampleValues[current] <= x; current++) intervalStart += SAMPLE_STEP_SIZE;
    current--;
    const dist = (x - sampleValues[current]) / (sampleValues[current + 1] - sampleValues[current]);
    const guessT = intervalStart + dist * SAMPLE_STEP_SIZE;
    const initialSlope = getSlope(guessT, p1x, p2x);
    if (initialSlope >= NEWTON_MIN_SLOPE) return newtonRaphson(x, guessT, p1x, p2x);
    if (initialSlope === 0.0) return guessT;
    return binarySubdivide(x, intervalStart, intervalStart + SAMPLE_STEP_SIZE, p1x, p2x);
  }

  return (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return calcBezier(getTForX(t), p1y, p2y);
  };
}

// ─── GSAP ease helper ─────────────────────────────────────────────────────────

/** Resolve a GSAP ease by name. Falls back to linear on unknown names. */
function gEase(name: string): (t: number) => number {
  const fn = gsap.parseEase(name);
  if (typeof fn !== "function") return (t) => t;
  return fn as (t: number) => number;
}

// ─── Exported easing catalog ──────────────────────────────────────────────────

export const Easing = {
  // ── Spec-exact curves ─────────────────────────────────────────────────────

  /**
   * Snappy UI Ease-Out — cubic-bezier(0.16, 1, 0.3, 1).
   * Ultra-fast initial acceleration, extended deceleration tail.
   * Primary ease for UI slide-ins, pop-overs, viewport transitions.
   */
  snappyOut: cubicBezier(0.16, 1, 0.3, 1),

  /**
   * Overshoot / Elastic Spring — cubic-bezier(0.34, 1.56, 0.64, 1).
   * Overshoots past 1.0 then settles. Interactive triggers, focus points.
   */
  overshoot: cubicBezier(0.34, 1.56, 0.64, 1),

  // ── GSAP-native eases ─────────────────────────────────────────────────────

  /** expo.out — exponential deceleration. Crisp and smooth. */
  expoOut: gEase("expo.out"),

  /** expo.in — exponential acceleration. */
  expoIn: gEase("expo.in"),

  /** expo.inOut — S-curve with exponential inflection. */
  expoInOut: gEase("expo.inOut"),

  /** power4.out — strong quartic deceleration. Whip-pan settle. */
  power4Out: gEase("power4.out"),

  /** power4.in — fast wind-up before departure. */
  power4In: gEase("power4.in"),

  /** power2.out — moderate deceleration. Layout domino shifts. */
  power2Out: gEase("power2.out"),

  /** power2.inOut — gentle S-curve for positional easing. */
  power2InOut: gEase("power2.inOut"),

  /** back.out(1.7) — slight overshoot and settle. Badge pop-in, selection markers. */
  backOut: gEase("back.out(1.7)"),

  /** back.in(1.7) — slight anticipation wind-up. */
  backIn: gEase("back.in(1.7)"),

  /** back.inOut(1.7) — anticipation + overshoot. */
  backInOut: gEase("back.inOut(1.7)"),

  /** elastic.out(1, 0.3) — spring oscillation. Validation pings. */
  elasticOut: gEase("elastic.out(1, 0.3)"),

  /** elastic.out(1, 0.5) — tighter spring with fewer oscillations. */
  elasticOutTight: gEase("elastic.out(1, 0.5)"),

  /** bounce.out — bouncy landing. Scan ring. */
  bounceOut: gEase("bounce.out"),

  /** circ.out — circular arc deceleration. Camera settle after whip-pan. */
  circOut: gEase("circ.out"),

  /** circ.in — circular acceleration. */
  circIn: gEase("circ.in"),

  /** sine.inOut — smooth sinusoidal S-curve. Ambient glow pulses. */
  sineInOut: gEase("sine.inOut"),

  /** sine.out — gentle ease out. Waveform bar animations. */
  sineOut: gEase("sine.out"),

  // ── Utility ───────────────────────────────────────────────────────────────

  /** Linear — no easing. Data stream timing, scan lines. */
  linear: (t: number) => t,

  /** Sharp quadratic out — fast drop then coast. Motion blur decay. */
  sharpOut: (t: number) => 1 - (1 - t) * (1 - t),

  /** Ease in quad — pre-launch wind-up. */
  easeInQuad: (t: number) => t * t,
} as const;

export type EasingFn = (t: number) => number;
