import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { Easing } from "../lib/easing";
import { typeProgress, lerp } from "../lib/timing";
import { COLORS, rgba, tealGlow } from "../lib/color";

interface CentralMonolithProps {
  frame: number;
  scene: 1 | 5;
}

// Deterministic micro-particle orbit config (no random)
const PARTICLES: Array<{
  radius: number;
  speed: number;
  phase: number;
  size: number;
}> = [
  { radius: 90, speed: 0.045, phase: 0.0, size: 3 },
  { radius: 105, speed: 0.032, phase: 1.047, size: 2.5 },
  { radius: 78, speed: 0.058, phase: 2.094, size: 2 },
  { radius: 118, speed: 0.028, phase: 3.141, size: 3.5 },
  { radius: 95, speed: 0.05, phase: 4.189, size: 2 },
  { radius: 112, speed: 0.038, phase: 5.236, size: 3 },
];

const BOOT_LABEL = "YARVIZ_BOOT_SEQUENCE";

export function CentralMonolith({ frame, scene }: CentralMonolithProps): React.ReactElement {
  const { fps } = useVideoConfig();

  // ─── Scene 1 animations ───────────────────────────────────────────────────

  // Scale: 0 → 1 over frames 0–15 with overshoot
  const scaleScene1 = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.overshoot,
  });

  // Glow opacity: 0 → 1 peaking exactly at the scale apex (frame 15)
  // GSAP power4Out: luminescence hits full intensity at the overshoot peak
  const glowOpacityScene1 = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.power4Out,
  });

  // Scanline Y progress: sweeps from top (−110) to bottom (+110) of 220px icon
  // over frames 8–18. SVG viewBox is −110 to +110 on Y.
  const scanlineY = interpolate(frame, [8, 18], [-110, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
  const scanlineOpacity = interpolate(
    frame,
    [8, 11, 16, 18],
    [0, 0.85, 0.85, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Eye LED pulse (gentle, ongoing)
  const eyePulse = 0.75 + 0.25 * Math.sin(frame * 0.12);

  // Typed label starting at frame 20, 2 chars/frame
  const typedLabel = typeProgress(frame, 20, BOOT_LABEL, 2);
  const labelOpacity = interpolate(frame, [20, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Scene 5 animations ───────────────────────────────────────────────────

  // Fade in over frames 600–620
  const fadeInScene5 = interpolate(frame, [600, 620], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  // Glow pulse at frame 660: scale 1.0 → 1.05 → 1.0 over 10 frames
  const glowPulseScene5 = interpolate(
    frame,
    [660, 665, 670],
    [1.0, 1.05, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.snappyOut }
  );

  // ─── Resolve final values per scene ───────────────────────────────────────

  const scale = scene === 1 ? scaleScene1 : glowPulseScene5;
  const glowOpacity = scene === 1 ? glowOpacityScene1 : fadeInScene5;
  const wrapperOpacity = scene === 1 ? 1 : fadeInScene5;

  // Prism float (used in both scenes)
  const prismY = Math.sin(frame * 0.05) * 5;
  const prismRotation = frame * 0.8;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: wrapperOpacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Drop-shadow glow layer */}
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${rgba(COLORS.accentTeal, 0.25)} 0%, transparent 70%)`,
          filter: `blur(24px)`,
          opacity: glowOpacity,
          transform: `scale(${scene === 5 ? glowPulseScene5 : 1})`,
          pointerEvents: "none",
        }}
      />

      {/* SVG robot + particles */}
      <svg
        width="200"
        height="220"
        viewBox="-100 -110 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="teal-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="eye-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="body-grad" x1="0" y1="-60" x2="0" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={COLORS.accentIndigo} stopOpacity="0.18" />
            <stop offset="100%" stopColor={COLORS.accentTeal} stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* ── Scan ring beneath robot ── */}
        <ellipse
          cx="0"
          cy="95"
          rx="70"
          ry="10"
          stroke={COLORS.accentTeal}
          strokeWidth="1"
          strokeOpacity={0.35 + 0.15 * Math.sin(frame * 0.07)}
          fill="none"
        />
        <ellipse
          cx="0"
          cy="95"
          rx="55"
          ry="7"
          stroke={COLORS.accentIndigo}
          strokeWidth="0.5"
          strokeOpacity={0.2 + 0.1 * Math.sin(frame * 0.05 + 1)}
          fill="none"
        />

        {/* ── Robot body ── */}
        {/* Main body rectangle */}
        <rect
          x="-38"
          y="5"
          width="76"
          height="85"
          rx="6"
          stroke={COLORS.accentTeal}
          strokeWidth="1.5"
          fill="url(#body-grad)"
          filter="url(#teal-glow)"
        />

        {/* Body circuit lines - horizontal */}
        <line x1="-28" y1="30" x2="28" y2="30" stroke={COLORS.accentIndigo} strokeWidth="0.7" strokeOpacity="0.6" />
        <line x1="-28" y1="50" x2="28" y2="50" stroke={COLORS.accentIndigo} strokeWidth="0.7" strokeOpacity="0.6" />
        <line x1="-28" y1="70" x2="28" y2="70" stroke={COLORS.accentTeal} strokeWidth="0.7" strokeOpacity="0.5" />

        {/* Body circuit lines - vertical connectors */}
        <line x1="-15" y1="30" x2="-15" y2="50" stroke={COLORS.accentTeal} strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1="15" y1="30" x2="15" y2="50" stroke={COLORS.accentTeal} strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1="0" y1="50" x2="0" y2="70" stroke={COLORS.accentIndigo} strokeWidth="0.5" strokeOpacity="0.4" />

        {/* Circuit node dots on body */}
        <circle cx="-15" cy="30" r="1.5" fill={COLORS.accentTeal} fillOpacity="0.8" />
        <circle cx="15" cy="30" r="1.5" fill={COLORS.accentTeal} fillOpacity="0.8" />
        <circle cx="-15" cy="50" r="1.5" fill={COLORS.accentIndigo} fillOpacity="0.8" />
        <circle cx="15" cy="50" r="1.5" fill={COLORS.accentIndigo} fillOpacity="0.8" />
        <circle cx="0" cy="70" r="2" fill={COLORS.accentTeal} fillOpacity={0.6 + 0.3 * Math.sin(frame * 0.1)} />

        {/* Core diamond on body center */}
        <polygon
          points="0,-8 7,0 0,8 -7,0"
          transform="translate(0, 40)"
          stroke={COLORS.accentTeal}
          strokeWidth="1"
          fill="none"
          strokeOpacity="0.9"
        />

        {/* Shoulder connectors */}
        <rect x="-55" y="15" width="17" height="28" rx="3" stroke={COLORS.accentTeal} strokeWidth="1" fill="none" strokeOpacity="0.5" />
        <rect x="38" y="15" width="17" height="28" rx="3" stroke={COLORS.accentTeal} strokeWidth="1" fill="none" strokeOpacity="0.5" />

        {/* Neck connector */}
        <rect x="-8" y="-5" width="16" height="12" rx="2" stroke={COLORS.accentIndigo} strokeWidth="1" fill="none" strokeOpacity="0.6" />

        {/* ── Robot head ── */}
        <rect
          x="-35"
          y="-65"
          width="70"
          height="58"
          rx="10"
          stroke={COLORS.accentTeal}
          strokeWidth="1.5"
          fill={rgba(COLORS.accentTeal, 0.05)}
          filter="url(#teal-glow)"
        />

        {/* Head inner frame */}
        <rect
          x="-28"
          y="-58"
          width="56"
          height="44"
          rx="7"
          stroke={COLORS.accentIndigo}
          strokeWidth="0.6"
          fill="none"
          strokeOpacity="0.4"
        />

        {/* LED Eyes */}
        <circle
          cx="-13"
          cy="-40"
          r="6"
          fill={rgba(COLORS.accentTeal, eyePulse * 0.85)}
          stroke={COLORS.accentTeal}
          strokeWidth="1"
          filter="url(#eye-glow)"
        />
        <circle cx="-13" cy="-40" r="3" fill={COLORS.accentTeal} fillOpacity={eyePulse} />

        <circle
          cx="13"
          cy="-40"
          r="6"
          fill={rgba(COLORS.accentTeal, eyePulse * 0.85)}
          stroke={COLORS.accentTeal}
          strokeWidth="1"
          filter="url(#eye-glow)"
        />
        <circle cx="13" cy="-40" r="3" fill={COLORS.accentTeal} fillOpacity={eyePulse} />

        {/* Head antenna / indicator bar */}
        <line x1="-20" y1="-20" x2="20" y2="-20" stroke={COLORS.accentIndigo} strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="-14" cy="-20" r="1.5" fill={COLORS.accentIndigo} fillOpacity="0.7" />
        <circle cx="0" cy="-20" r="1.5" fill={COLORS.accentTeal} fillOpacity="0.7" />
        <circle cx="14" cy="-20" r="1.5" fill={COLORS.accentIndigo} fillOpacity="0.7" />

        {/* ── Floating prism above head ── */}
        <g transform={`translate(0, ${-90 + prismY})`}>
          {/* Prism stem */}
          <line x1="0" y1="14" x2="0" y2="22" stroke={COLORS.accentTeal} strokeWidth="0.8" strokeOpacity="0.5" />

          {/* Outer diamond */}
          <polygon
            points="0,-14 11,0 0,14 -11,0"
            stroke={COLORS.accentIndigo}
            strokeWidth="1.2"
            fill={rgba(COLORS.accentIndigo, 0.08)}
            transform={`rotate(${prismRotation})`}
          />
          {/* Inner diamond */}
          <polygon
            points="0,-8 7,0 0,8 -7,0"
            stroke={COLORS.accentTeal}
            strokeWidth="1"
            fill={rgba(COLORS.accentTeal, 0.15)}
            transform={`rotate(${-prismRotation * 0.7})`}
            filter="url(#teal-glow)"
          />
          {/* Core dot */}
          <circle cx="0" cy="0" r="2" fill={COLORS.accentTeal} fillOpacity={0.9 + 0.1 * Math.sin(frame * 0.08)} />
        </g>

        {/* ── Scanline sweep (Scene 1 only) ── */}
        {scene === 1 && (
          <line
            x1="-38"
            y1={scanlineY}
            x2="38"
            y2={scanlineY}
            stroke={COLORS.accentTeal}
            strokeWidth="1.5"
            strokeOpacity={scanlineOpacity}
            style={{ filter: `drop-shadow(0 0 3px ${COLORS.accentTeal})` }}
          />
        )}

        {/* ── Micro-particles ── */}
        {PARTICLES.map((p, i) => {
          const angle = frame * p.speed + p.phase;
          const px = Math.cos(angle) * p.radius * 0.5; // flatten to ellipse
          const py = Math.sin(angle) * p.radius * 0.18;
          const pOpacity = 0.4 + 0.3 * Math.sin(frame * 0.08 + p.phase);
          return (
            <circle
              key={i}
              cx={px}
              cy={py - 10}
              r={p.size * 0.5}
              fill={i % 2 === 0 ? COLORS.accentTeal : COLORS.accentIndigo}
              fillOpacity={pOpacity}
            />
          );
        })}
      </svg>

      {/* ── Terminal label (Scene 1 only) ── */}
      {scene === 1 && (
        <div
          style={{
            marginTop: 16,
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: COLORS.accentTeal,
            opacity: labelOpacity,
            textTransform: "uppercase" as const,
            textShadow: `0 0 8px ${rgba(COLORS.accentTeal, 0.7)}`,
            minWidth: 220,
            textAlign: "center" as const,
          }}
        >
          {typedLabel}
          {/* Blinking cursor */}
          <span
            style={{
              opacity: Math.floor(frame * 0.1) % 2 === 0 ? 1 : 0,
              color: COLORS.accentTeal,
            }}
          >
            _
          </span>
        </div>
      )}
    </div>
  );
}
