/**
 * Frame-based timing utilities for Remotion compositions.
 * All animations are deterministic and frame-based — no random values.
 */

import { interpolate } from "remotion";
import { Easing } from "./easing";

/** Frames per second for this composition. */
export const fps = 60;

/** Convert seconds to frame count at 60fps. */
export const toFrames = (seconds: number): number => Math.round(seconds * fps);

/** Clamp a value between min and max (inclusive). */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Frame-based step typing: returns the visible substring of `text` at a given frame.
 *
 * @param frame        - Current frame
 * @param startFrame   - Frame when typing begins
 * @param text         - Full string to type out
 * @param charsPerFrame - Characters revealed per frame (default 2)
 */
export function typeProgress(
  frame: number,
  startFrame: number,
  text: string,
  charsPerFrame = 2
): string {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  return text.slice(0, chars);
}

/**
 * Stagger delay: converts a per-item stagger in seconds to a frame offset.
 * Default 0.02s stagger @ 60fps ≈ 1 frame per item.
 *
 * @param index          - Item index (0-based)
 * @param staggerSeconds - Per-item stagger in seconds (default 0.02)
 */
export function staggerDelay(index: number, staggerSeconds = 0.02): number {
  return Math.round(index * staggerSeconds * fps);
}

/**
 * Frame window progress: returns 0–1 normalized progress within a frame range,
 * with optional easing applied.
 *
 * @param frame          - Current frame
 * @param startFrame     - Window start frame
 * @param durationFrames - Window length in frames
 * @param easing         - Easing function (default: linear)
 */
export function frameProgress(
  frame: number,
  startFrame: number,
  durationFrames: number,
  easing: (t: number) => number = Easing.linear
): number {
  const raw = clamp((frame - startFrame) / durationFrames, 0, 1);
  return easing(raw);
}

/**
 * Deterministic frame-based rotation in degrees.
 *
 * @param frame           - Current frame
 * @param degreesPerFrame - Rotation speed (default 2°/frame)
 */
export function frameRotation(frame: number, degreesPerFrame = 2): number {
  return (frame * degreesPerFrame) % 360;
}

/**
 * Motion blur: returns blur radius in px proportional to velocity.
 * Decays quickly; returns 0 when velocity is near zero.
 *
 * @param velocity - Delta transform units per frame
 * @param scale    - Multiplier (default 0.08)
 */
export function motionBlur(velocity: number, scale = 0.08): number {
  return Math.max(0, Math.abs(velocity) * scale);
}

/**
 * Deterministic sinusoidal pulse seeded to frame — no random values.
 *
 * @param frame     - Current frame
 * @param frequency - Cycles per frame (default 0.05)
 * @param amplitude - Peak amplitude (default 1)
 */
export function pulse(
  frame: number,
  frequency = 0.05,
  amplitude = 1
): number {
  return amplitude * Math.sin(frame * frequency * Math.PI * 2);
}

/**
 * Smooth interpolation between two values over a frame range, with easing.
 * Clamps outside the range (no extrapolation).
 *
 * @param frame      - Current frame
 * @param startFrame - Start of the animation window
 * @param endFrame   - End of the animation window
 * @param from       - Value at startFrame
 * @param to         - Value at endFrame
 * @param easing     - Easing function (default: linear)
 */
export function lerp(
  frame: number,
  startFrame: number,
  endFrame: number,
  from: number,
  to: number,
  easing: (t: number) => number = Easing.linear
): number {
  return interpolate(frame, [startFrame, endFrame], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}
