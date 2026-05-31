/**
 * GlobalCamera.tsx
 *
 * Virtual camera wrapper. Applies deterministic per-frame scale+translate+
 * motion-blur transforms to the entire composition (the "macro virtual camera").
 *
 * Architecture:
 *   - CAMERA_SHOTS defines waypoints: each shot's _target_ state plus the frame
 *     range over which the camera moves FROM the previous state TO the target.
 *   - getCameraState() finds the two bracketing waypoints for any frame and
 *     interpolates between them with the shot's GSAP ease.
 *   - Motion blur is derived from the velocity vector between adjacent frames.
 *
 * No CSS transitions / CSS animations / random() calls anywhere.
 */

import { interpolate } from "remotion";
import React from "react";
import { Easing, EasingFn } from "../lib/easing";
import { motionBlur } from "../lib/timing";

interface GlobalCameraProps {
  frame: number;
  children: React.ReactNode;
}

interface CameraWaypoint {
  /** The frame at which this waypoint's target state is fully reached. */
  readonly frame: number;
  /** Target scale at this waypoint. */
  readonly scale: number;
  /** Target translate-x (px) at this waypoint. */
  readonly tx: number;
  /** Target translate-y (px) at this waypoint. */
  readonly ty: number;
  /** GSAP easing to apply from the PREVIOUS waypoint to this one. */
  readonly ease: EasingFn;
  readonly label: string;
}

/**
 * Master camera waypoint timeline (60fps).
 * The camera moves FROM each waypoint's previous state TO the next waypoint
 * over the frame range between them, using the indicated GSAP ease.
 */
const WAYPOINTS: readonly CameraWaypoint[] = [
  // Scene 1: Boot — static, subtle zoom in
  { frame: 0,   scale: 1.02, tx: 0,   ty: 0,   ease: Easing.linear,   label: "boot-start" },

  // Scene 2: Whip-pan to VOICE ENGINE over 8 frames (sharp power4.in push)
  { frame: 68,  scale: 1.15, tx: -60, ty: -30, ease: Easing.power4In,  label: "whip-pan-peak" },
  // Settle to focus state over 22 frames (GSAP expo.out deceleration)
  { frame: 90,  scale: 1.05, tx: -20, ty: -10, ease: Easing.expoOut,   label: "voice-focus" },
  // Hold focus through dashboard display
  { frame: 210, scale: 1.05, tx: -20, ty: -10, ease: Easing.linear,    label: "focus-hold" },

  // Scene 2 → 3: Second camera move — pan down to show full log output (8 frames)
  { frame: 218, scale: 1.12, tx: 0,   ty: 20,  ease: Easing.power4In,  label: "pan2-peak" },
  // Pull back to neutral for Scene 3 (GSAP circ.out arc deceleration)
  { frame: 240, scale: 1.0,  tx: 0,   ty: 0,   ease: Easing.circOut,   label: "pullback" },

  // Scene 3: Static — validation domino runs at native composition scale
  { frame: 420, scale: 1.0,  tx: 0,   ty: 0,   ease: Easing.linear,    label: "scene3-static" },

  // Scene 4: Macro zoom into dropdown area (8-frame sharp push, right + slight down)
  { frame: 428, scale: 1.18, tx: 80,  ty: 40,  ease: Easing.power4In,  label: "dropdown-zoom-peak" },
  // Settle onto dropdown focus (expo.out)
  { frame: 450, scale: 1.12, tx: 60,  ty: 30,  ease: Easing.expoOut,   label: "dropdown-settled" },
  // Hold through Scene 4
  { frame: 600, scale: 1.12, tx: 60,  ty: 30,  ease: Easing.linear,    label: "dropdown-hold" },

  // Scene 5: Snap back to center (8-frame whip, flash masks it)
  { frame: 608, scale: 1.0,  tx: 0,   ty: 0,   ease: Easing.expoOut,   label: "outro-snap" },

  // Final outro — slow breathing zoom-out (1.05 → 1.0 over remaining frames)
  { frame: 660, scale: 1.05, tx: 0,   ty: 0,   ease: Easing.sineInOut, label: "outro-breathe" },
  { frame: 720, scale: 1.0,  tx: 0,   ty: 0,   ease: Easing.sineInOut, label: "outro-end" },
] as const;

// ─── Camera state resolver ────────────────────────────────────────────────────

interface CameraState {
  scale: number;
  tx: number;
  ty: number;
}

function getCameraState(frame: number): CameraState {
  const f = Math.max(0, Math.min(frame, 720));

  // Find the two waypoints that bracket this frame
  let fromIdx = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    if (f >= WAYPOINTS[i].frame && f <= WAYPOINTS[i + 1].frame) {
      fromIdx = i;
      break;
    }
    // Past all waypoints → use last pair
    fromIdx = WAYPOINTS.length - 2;
  }

  const from = WAYPOINTS[fromIdx];
  const to = WAYPOINTS[fromIdx + 1];

  if (from.frame === to.frame) {
    return { scale: to.scale, tx: to.tx, ty: to.ty };
  }

  const ease = to.ease;

  const scale = interpolate(f, [from.frame, to.frame], [from.scale, to.scale], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tx = interpolate(f, [from.frame, to.frame], [from.tx, to.tx], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(f, [from.frame, to.frame], [from.ty, to.ty], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return { scale, tx, ty };
}

// ─── Motion blur ──────────────────────────────────────────────────────────────

function computeMotionBlur(curr: CameraState, prev: CameraState): number {
  const dTx = curr.tx - prev.tx;
  const dTy = curr.ty - prev.ty;
  const dS = (curr.scale - prev.scale) * 200; // scale delta amplified for blur feel
  const velocity = Math.sqrt(dTx * dTx + dTy * dTy + dS * dS);
  return motionBlur(velocity, 0.06);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalCamera({ frame, children }: GlobalCameraProps): React.ReactElement {
  const curr = getCameraState(frame);
  const prev = getCameraState(Math.max(0, frame - 1));

  const blur = computeMotionBlur(curr, prev);
  const filterStyle = blur > 0.3 ? `blur(${Math.min(blur, 3.5).toFixed(2)}px)` : undefined;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        transform: `scale(${curr.scale}) translate(${curr.tx}px, ${curr.ty}px)`,
        transformOrigin: "center center",
        filter: filterStyle,
        willChange: "transform",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
