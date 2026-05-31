/**
 * VoiceWaveform.tsx
 * Frame-reactive audio waveform representing ElevenLabs voice synthesis.
 * All animation is deterministic and frame-based — no random(), no CSS transitions.
 */

import React from "react";
import { interpolate } from "remotion";

interface VoiceWaveformProps {
  frame: number;
  active: boolean;
  appearFrame: number;
  width?: number;
  height?: number;
}

const BAR_COUNT = 40;

/**
 * Voice transient frames: sharp amplitude spikes at key story moments.
 * Within 8 frames of these, amplitude is multiplied by 2.5.
 */
const TRANSIENT_FRAMES = [150, 180, 240, 420, 600];
const TRANSIENT_WINDOW = 8;
const TRANSIENT_MULTIPLIER = 2.5;

/** Compute transient multiplier at a given frame (max spike nearest frame). */
function getTransientMultiplier(frame: number): number {
  for (const tf of TRANSIENT_FRAMES) {
    const dist = Math.abs(frame - tf);
    if (dist <= TRANSIENT_WINDOW) {
      // Spike: ramps up then down over the window
      const t = 1 - dist / TRANSIENT_WINDOW;
      return 1 + (TRANSIENT_MULTIPLIER - 1) * t;
    }
  }
  return 1;
}

/**
 * Base envelope per bar: taller in the middle, shorter at edges.
 * Returns a value in [0.15, 1.0].
 */
function barBaseEnvelope(index: number, total: number): number {
  const center = (total - 1) / 2;
  const dist = Math.abs(index - center) / center; // 0 at center, 1 at edges
  return 0.15 + 0.85 * (1 - dist * dist);
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  frame,
  active,
  appearFrame,
  width = 280,
  height = 48,
}) => {
  // Appear animation: scale 0→1 over 10 frames
  const scale = interpolate(frame, [appearFrame, appearFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Active amplitude: interpolates from 0 to full over 15 frames
  const activeProgress = active
    ? interpolate(frame, [appearFrame, appearFrame + 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const transientMul = getTransientMultiplier(frame);
  const effectiveAmplitude = activeProgress * transientMul;

  const barWidth = (width / BAR_COUNT) * 0.55;
  const barGap = (width - barWidth * BAR_COUNT) / (BAR_COUNT - 1);
  const minBarHeight = 4;
  const maxBarHeight = height - 4;

  // Build bar heights
  const bars: number[] = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const envelope = barBaseEnvelope(i, BAR_COUNT);
    // Deterministic wave: unique phase per bar
    const wave = Math.sin(frame * 0.15 + i * 0.4);
    // Active: animated height; Inactive: minimum height
    const animatedHeight =
      minBarHeight +
      (maxBarHeight - minBarHeight) * envelope * (0.3 + 0.7 * ((wave + 1) / 2)) * effectiveAmplitude;

    bars.push(Math.max(minBarHeight, animatedHeight));
  }

  // Gradient definition id — unique enough for single-document SVG use
  const gradId = "ywv-grad";

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        display: "inline-block",
        lineHeight: 0,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {bars.map((barHeight, i) => {
          const x = i * (barWidth + barGap);
          const y = (height - barHeight) / 2;
          const isActive = effectiveAmplitude > 0.05;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={barWidth / 2}
              fill={isActive ? `url(#${gradId})` : "#3f3f46"}
              opacity={isActive ? 0.9 : 0.5}
            />
          );
        })}
      </svg>
    </div>
  );
};
