/**
 * GlobalCamera.tsx
 *
 * Virtual camera wrapper for the YARVIZ promo composition.
 * Applies frame-based transforms: scale, translate, and motion blur.
 *
 * All animations are deterministic and frame-based using interpolate() from Remotion.
 * NO CSS transitions, NO CSS animations, NO random() calls.
 */

import { interpolate } from "remotion";
import React from "react";
import { Easing } from "../lib/easing";
import { motionBlur } from "../lib/timing";

interface GlobalCameraProps {
  frame: number;
  children: React.ReactNode;
}

interface CameraShot {
  readonly startFrame: number;
  readonly endFrame: number;
  readonly scale: number;
  readonly tx: number;
  readonly ty: number;
  readonly label: string;
}

/**
 * Camera shots timeline (all at 60fps).
 * Each shot defines the scale, translate-x, translate-y over a frame range.
 */
const CAMERA_SHOTS: readonly CameraShot[] = [
  // Scene 1: Static, slightly zoomed in on center
  {
    startFrame: 0,
    endFrame: 60,
    scale: 1.02,
    tx: 0,
    ty: 0,
    label: "scene1-boot",
  },

  // Scene 2 opening: whip-pan zoom to top-left (VOICE ENGINE focus at frame 90)
  {
    startFrame: 60,
    endFrame: 68,
    scale: 1.15,
    tx: -60,
    ty: -30,
    label: "scene2-wipe",
  },
  {
    startFrame: 68,
    endFrame: 90,
    scale: 1.08,
    tx: -30,
    ty: -15,
    label: "scene2-settle",
  },
  {
    startFrame: 90,
    endFrame: 210,
    scale: 1.05,
    tx: -20,
    ty: -10,
    label: "scene2-focus",
  },

  // Scene 2 second camera move
  {
    startFrame: 210,
    endFrame: 218,
    scale: 1.12,
    tx: 0,
    ty: 20,
    label: "scene2-pan2",
  },
  {
    startFrame: 218,
    endFrame: 240,
    scale: 1.03,
    tx: 0,
    ty: 0,
    label: "scene2-settle2",
  },

  // Scene 3: Pull back to show full dashboard
  {
    startFrame: 240,
    endFrame: 255,
    scale: 1.0,
    tx: 0,
    ty: 0,
    label: "scene3-pullback",
  },
  {
    startFrame: 255,
    endFrame: 420,
    scale: 1.0,
    tx: 0,
    ty: 0,
    label: "scene3-static",
  },

  // Scene 4: Macro zoom into dropdown area (right side, slightly down)
  {
    startFrame: 420,
    endFrame: 428,
    scale: 1.18,
    tx: 80,
    ty: 40,
    label: "scene4-macrozoom",
  },
  {
    startFrame: 428,
    endFrame: 600,
    scale: 1.12,
    tx: 60,
    ty: 30,
    label: "scene4-focused",
  },

  // Scene 5: Snap back to center, slight zoom out
  {
    startFrame: 600,
    endFrame: 608,
    scale: 1.0,
    tx: 0,
    ty: 0,
    label: "scene5-reset",
  },
  {
    startFrame: 608,
    endFrame: 720,
    scale: 1.0,
    tx: 0,
    ty: 0,
    label: "scene5-final",
  },
] as const;

/**
 * Determines which easing to use based on shot duration.
 * Fast transitions (8 frames) use snappyOut; slow transitions use linear.
 */
function getEasingForShot(shot: CameraShot): (t: number) => number {
  const duration = shot.endFrame - shot.startFrame;
  if (duration <= 8) {
    return Easing.snappyOut;
  }
  return Easing.linear;
}

/**
 * Get camera state at any frame by interpolating between shots.
 * Automatically handles transitions between adjacent shots.
 */
function getCameraState(
  frame: number
): { scale: number; tx: number; ty: number } {
  // Clamp frame to composition bounds
  const clampedFrame = Math.max(0, Math.min(frame, 720));

  // Find all shots that are active or adjacent to this frame
  let activeShot: CameraShot | null = null;
  let nextShot: CameraShot | null = null;

  for (let i = 0; i < CAMERA_SHOTS.length; i++) {
    const shot = CAMERA_SHOTS[i];
    if (clampedFrame >= shot.startFrame && clampedFrame <= shot.endFrame) {
      activeShot = shot;
      // Look ahead for next shot
      if (i + 1 < CAMERA_SHOTS.length) {
        nextShot = CAMERA_SHOTS[i + 1];
      }
      break;
    }
  }

  // Fallback: use last shot if past all shots
  if (!activeShot) {
    activeShot = CAMERA_SHOTS[CAMERA_SHOTS.length - 1];
  }

  // If we're at the start of a transition, blend to the next shot
  // Otherwise, stay within the current shot
  const isTransitioning = nextShot && clampedFrame === activeShot.endFrame;

  if (isTransitioning && nextShot) {
    // Transition from activeShot to nextShot
    const easing = getEasingForShot(nextShot);
    const scale = interpolate(clampedFrame, [activeShot.endFrame, nextShot.endFrame], [activeShot.scale, nextShot.scale], {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const tx = interpolate(clampedFrame, [activeShot.endFrame, nextShot.endFrame], [activeShot.tx, nextShot.tx], {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const ty = interpolate(clampedFrame, [activeShot.endFrame, nextShot.endFrame], [activeShot.ty, nextShot.ty], {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { scale, tx, ty };
  }

  // Within a shot: interpolate within the shot's frame range
  const easing = getEasingForShot(activeShot);
  const scale = interpolate(
    clampedFrame,
    [activeShot.startFrame, activeShot.endFrame],
    [activeShot.scale, activeShot.scale],
    {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const tx = interpolate(
    clampedFrame,
    [activeShot.startFrame, activeShot.endFrame],
    [activeShot.tx, activeShot.tx],
    {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const ty = interpolate(
    clampedFrame,
    [activeShot.startFrame, activeShot.endFrame],
    [activeShot.ty, activeShot.ty],
    {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return { scale, tx, ty };
}

/**
 * Compute motion blur amount based on velocity.
 * velocity = distance moved between current and previous frame.
 */
function computeMotionBlur(
  currentTx: number,
  currentTy: number,
  prevTx: number,
  prevTy: number
): number {
  const deltaX = currentTx - prevTx;
  const deltaY = currentTy - prevTy;
  const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return motionBlur(velocity);
}

export function GlobalCamera({ frame, children }: GlobalCameraProps): React.ReactElement {
  const current = getCameraState(frame);
  const previous = getCameraState(Math.max(0, frame - 1));

  const blurAmount = computeMotionBlur(current.tx, current.ty, previous.tx, previous.ty);

  const transformStyle = `scale(${current.scale}) translate(${current.tx}px, ${current.ty}px)`;

  const filterStyle =
    blurAmount > 0.3 ? `blur(${Math.min(blurAmount, 4)}px)` : undefined;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        transform: transformStyle,
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
