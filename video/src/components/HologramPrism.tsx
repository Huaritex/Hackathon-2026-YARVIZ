import React from "react";
import { interpolate } from "remotion";
import { Easing } from "../lib/easing";
import { COLORS, rgba } from "../lib/color";

interface HologramPrismProps {
  frame: number;
  x: number;
  y: number;
  size?: number;
  opacity?: number;
}

export function HologramPrism({
  frame,
  x,
  y,
  size = 40,
  opacity: baseOpacity = 1,
}: HologramPrismProps): React.ReactElement {
  // ─── Float oscillation ────────────────────────────────────────────────────
  const floatY = Math.sin(frame * 0.03) * 6;

  // ─── Inner diamond rotation ────────────────────────────────────────────────
  const innerRotation = frame * 0.4;
  const outerRotation = frame * -0.18;

  // ─── Opacity pulse ─────────────────────────────────────────────────────────
  const opacityPulse = 0.7 + 0.3 * Math.sin(frame * 0.05);
  const resolvedOpacity = baseOpacity * opacityPulse;

  // ─── Scene 5 glow intensification (frames 640–660) ────────────────────────
  const scene5GlowIntensity = interpolate(frame, [640, 660], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  // Glow radius grows in Scene 5
  const glowBlur = 4 + scene5GlowIntensity * 10;
  const glowOpacityBoost = scene5GlowIntensity * 0.4;

  // ─── Derived size values ───────────────────────────────────────────────────
  const half = size * 0.5;
  const innerHalf = half * 0.6;
  const cornerLen = half * 0.3;

  // Scan line y positions inside diamond (3 lines)
  const scanLines = [
    -innerHalf * 0.5,
    0,
    innerHalf * 0.5,
  ];

  // Absolute position on canvas
  const computedY = y + floatY;

  return (
    <svg
      width={size * 4}
      height={size * 4}
      viewBox={`${-size * 2} ${-size * 2} ${size * 4} ${size * 4}`}
      style={{
        position: "absolute",
        left: x - size * 2,
        top: computedY - size * 2,
        overflow: "visible",
        opacity: resolvedOpacity,
        pointerEvents: "none",
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={`prism-glow-${x}-${y}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={glowBlur} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient
          id={`prism-grad-${x}-${y}`}
          x1={-half}
          y1={-half}
          x2={half}
          y2={half}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={COLORS.accentIndigo} stopOpacity="0.9" />
          <stop offset="50%" stopColor={COLORS.accentTeal} stopOpacity="0.7" />
          <stop offset="100%" stopColor={COLORS.accentIndigo} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* ── Outer ambient glow disc ── */}
      <circle
        cx="0"
        cy="0"
        r={half * 1.5}
        fill={rgba(COLORS.accentTeal, 0.04 + glowOpacityBoost * 0.12)}
      />

      {/* ── Outer diamond border ── */}
      <polygon
        points={`0,${-half} ${half},0 0,${half} ${-half},0`}
        stroke={`url(#prism-grad-${x}-${y})`}
        strokeWidth="1.2"
        fill={rgba(COLORS.accentIndigo, 0.06)}
        transform={`rotate(${outerRotation})`}
        filter={`url(#prism-glow-${x}-${y})`}
      />

      {/* ── Inner rotating diamond ── */}
      <g transform={`rotate(${innerRotation})`}>
        <polygon
          points={`0,${-innerHalf} ${innerHalf},0 0,${innerHalf} ${-innerHalf},0`}
          stroke={COLORS.accentTeal}
          strokeWidth="1"
          fill={rgba(COLORS.accentTeal, 0.1 + glowOpacityBoost * 0.1)}
          filter={`url(#prism-glow-${x}-${y})`}
        />

        {/* Scan lines inside inner diamond (clipped to rhombus shape) */}
        {scanLines.map((lineY, i) => {
          // Compute x span of rhombus at this y level
          const halfSpan = innerHalf * (1 - Math.abs(lineY) / innerHalf) * 0.85;
          return (
            <line
              key={i}
              x1={-halfSpan}
              y1={lineY}
              x2={halfSpan}
              y2={lineY}
              stroke={COLORS.accentTeal}
              strokeWidth="0.5"
              strokeOpacity={0.35 + 0.15 * Math.sin(frame * 0.06 + i * 1.2)}
            />
          );
        })}

        {/* Center core dot */}
        <circle
          cx="0"
          cy="0"
          r={half * 0.12}
          fill={COLORS.accentTeal}
          fillOpacity={0.8 + 0.2 * Math.sin(frame * 0.09)}
        />
      </g>

      {/* ── Corner accent marks (L-shaped, teal, outside outer diamond) ── */}
      {/* Top corner */}
      <g transform={`translate(0, ${-half - 4})`} strokeWidth="1.2" stroke={COLORS.accentTeal} strokeOpacity="0.7">
        <line x1={-cornerLen * 0.5} y1="0" x2={cornerLen * 0.5} y2="0" />
        <line x1="0" y1={-cornerLen * 0.5} x2="0" y2={cornerLen * 0.5} />
      </g>
      {/* Right corner */}
      <g transform={`translate(${half + 4}, 0)`} strokeWidth="1.2" stroke={COLORS.accentTeal} strokeOpacity="0.7">
        <line x1={-cornerLen * 0.5} y1="0" x2={cornerLen * 0.5} y2="0" />
        <line x1="0" y1={-cornerLen * 0.5} x2="0" y2={cornerLen * 0.5} />
      </g>
      {/* Bottom corner */}
      <g transform={`translate(0, ${half + 4})`} strokeWidth="1.2" stroke={COLORS.accentTeal} strokeOpacity="0.7">
        <line x1={-cornerLen * 0.5} y1="0" x2={cornerLen * 0.5} y2="0" />
        <line x1="0" y1={-cornerLen * 0.5} x2="0" y2={cornerLen * 0.5} />
      </g>
      {/* Left corner */}
      <g transform={`translate(${-half - 4}, 0)`} strokeWidth="1.2" stroke={COLORS.accentTeal} strokeOpacity="0.7">
        <line x1={-cornerLen * 0.5} y1="0" x2={cornerLen * 0.5} y2="0" />
        <line x1="0" y1={-cornerLen * 0.5} x2="0" y2={cornerLen * 0.5} />
      </g>

      {/* ── Scene 5 intensified glow ring ── */}
      {scene5GlowIntensity > 0 && (
        <circle
          cx="0"
          cy="0"
          r={half * 1.2}
          stroke={COLORS.accentTeal}
          strokeWidth={1 + scene5GlowIntensity * 2}
          strokeOpacity={scene5GlowIntensity * 0.5}
          fill="none"
          filter={`url(#prism-glow-${x}-${y})`}
        />
      )}
    </svg>
  );
}
