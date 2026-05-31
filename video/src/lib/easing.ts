/**
 * GSAP-inspired cubic bezier easing math for Remotion's interpolate().
 * Remotion's interpolate() accepts an easing function: (t: number) => number, t ∈ [0,1].
 *
 * Implementation mirrors the WebKit/Chromium cubic-bezier solver:
 *   - Precomputed sample table for fast initial guess
 *   - Newton-Raphson refinement for accuracy
 */

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
  return 3.0 * (1.0 - 3.0 * a2 + 3.0 * a1) * t * t + 2.0 * (3.0 * a2 - 6.0 * a1) * t + (3.0 * a1);
}

function binarySubdivide(
  x: number,
  lowerBound: number,
  upperBound: number,
  mX1: number,
  mX2: number
): number {
  let currentX: number;
  let currentT: number;
  let i = 0;

  do {
    currentT = lowerBound + (upperBound - lowerBound) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - x;
    if (currentX > 0.0) {
      upperBound = currentT;
    } else {
      lowerBound = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);

  return currentT;
}

function newtonRaphsonIterate(
  x: number,
  guessT: number,
  mX1: number,
  mX2: number
): number {
  let t = guessT;
  for (let i = 0; i < NEWTON_ITERATIONS; i++) {
    const currentSlope = getSlope(t, mX1, mX2);
    if (currentSlope === 0.0) return t;
    const currentX = calcBezier(t, mX1, mX2) - x;
    t -= currentX / currentSlope;
  }
  return t;
}

/**
 * Cubic bezier solver — Newton-Raphson method.
 * Returns an easing function (t: number) => number.
 * Compatible with Remotion's interpolate() easing parameter.
 */
function cubicBezier(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number
): (t: number) => number {
  // Degenerate case: linear
  if (p1x === p1y && p2x === p2y) {
    return (t: number) => t;
  }

  // Precompute sample table
  const sampleValues = new Float32Array(SAMPLE_TABLE_SIZE);
  for (let i = 0; i < SAMPLE_TABLE_SIZE; i++) {
    sampleValues[i] = calcBezier(i * SAMPLE_STEP_SIZE, p1x, p2x);
  }

  function getTForX(x: number): number {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = SAMPLE_TABLE_SIZE - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= x; currentSample++) {
      intervalStart += SAMPLE_STEP_SIZE;
    }
    currentSample--;

    // Interpolate to get initial guess
    const dist = (x - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * SAMPLE_STEP_SIZE;

    const initialSlope = getSlope(guessForT, p1x, p2x);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(x, guessForT, p1x, p2x);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(x, intervalStart, intervalStart + SAMPLE_STEP_SIZE, p1x, p2x);
    }
  }

  return function (t: number): number {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return calcBezier(getTForX(t), p1y, p2y);
  };
}

export const Easing = {
  /** Snappy UI Ease-Out: cubic-bezier(0.16, 1, 0.3, 1) */
  snappyOut: cubicBezier(0.16, 1, 0.3, 1),

  /** Overshoot / Elastic Spring: cubic-bezier(0.34, 1.56, 0.64, 1) */
  overshoot: cubicBezier(0.34, 1.56, 0.64, 1),

  /** Linear — no easing */
  linear: (t: number): number => t,

  /** Ease in quad */
  easeInQuad: (t: number): number => t * t,

  /** Sharp quadratic out */
  sharpOut: (t: number): number => 1 - (1 - t) * (1 - t),
};
