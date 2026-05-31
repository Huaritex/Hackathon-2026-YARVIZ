/**
 * Master transient grid — immutable frame indexes marking key audio/visual beats.
 * 720 frames total @ 60fps = 12 seconds.
 *
 * Scene boundaries:
 *   Scene 1: 0–60
 *   Scene 2: 60–240
 *   Scene 3: 240–420
 *   Scene 4: 420–600
 *   Scene 5: 600–720
 */

export const TRANSIENTS = [
  0,   // Scene 1 start — boot sequence
  15,  // Robot core reveal peak
  30,  // Scanline cross
  45,  // Micro-particles active
  60,  // Scene 2 start — whip-pan zoom
  68,  // Camera snap settled
  90,  // VOICE ENGINE focus active
  120, // First log line appears
  150, // Typing: "Loading YARVIZ voice profile..."
  180, // ElevenLabs badge active
  210, // Camera pan 2
  240, // Scene 3 start — validation begins
  252, // STL READY validation
  270, // FIRMWARE COMPILED validation
  288, // VOICE READY validation
  306, // BEHAVIOR PROFILE SAVED validation
  324, // AVATAR PACK READY validation
  342, // ENCRYPTED validation
  360, // All validated — domino complete
  420, // Scene 4 start — dropdown opens
  432, // Voice options stagger in
  450, // Personality badge selected
  480, // Privacy options
  540, // Hologram options
  600, // Scene 5 start — outro
  602, // Flash peak
  620, // Logo scale in
  640, // Typography tracking disperses
  660, // Final glow pulse
  700, // Waveform pulse
  720, // End
] as const;

export type TransientFrame = (typeof TRANSIENTS)[number];

/**
 * Check if a frame is within N frames of a transient beat.
 */
export function nearTransient(
  frame: number,
  transient: number,
  within = 3
): boolean {
  return Math.abs(frame - transient) <= within;
}

/**
 * Get normalized progress between two transient frames (0–1).
 * Returns 0 before `from`, 1 at or after `to`.
 */
export function transientProgress(
  frame: number,
  from: number,
  to: number
): number {
  if (frame <= from) return 0;
  if (frame >= to) return 1;
  return (frame - from) / (to - from);
}

/** Scene timing constants (frame-based, 60fps). */
export const SCENES = {
  scene1: { start: 0, end: 60 },
  scene2: { start: 60, end: 240 },
  scene3: { start: 240, end: 420 },
  scene4: { start: 420, end: 600 },
  scene5: { start: 600, end: 720 },
} as const;
