import React from "react";
import { spring, interpolate, useVideoConfig } from "remotion";
import { Easing } from "../lib/easing";
import { COLORS, rgba, lerpColor } from "../lib/color";

type BadgeStatus = "idle" | "active" | "validated" | "complete";

interface RobotCoreBadgeProps {
  frame: number;
  label: string;
  status: BadgeStatus;
  appearFrame: number;
}

// Status accent colors
const STATUS_ACCENT: Record<BadgeStatus, string> = {
  idle: COLORS.statusNeutral,
  active: COLORS.accentIndigo,
  validated: COLORS.accentTeal,
  complete: COLORS.accentTeal,
};

// Status dot fill colors
const STATUS_DOT_BASE: Record<BadgeStatus, string> = {
  idle: COLORS.statusNeutral,
  active: COLORS.accentIndigo,
  validated: COLORS.accentTeal,
  complete: COLORS.accentTeal,
};

export function RobotCoreBadge({
  frame,
  label,
  status,
  appearFrame,
}: RobotCoreBadgeProps): React.ReactElement {
  const { fps } = useVideoConfig();

  // ─── Appear spring: scale 0 → 1 ───────────────────────────────────────────
  const appearScale = spring({
    frame: frame - appearFrame,
    fps,
    config: {
      mass: 0.4,
      damping: 10,
      stiffness: 220,
    },
    from: 0,
    to: 1,
  });

  // Guard against frames before appear
  const isVisible = frame >= appearFrame;
  if (!isVisible) {
    return <></>;
  }

  // ─── Status dot: "active" state pulses gently ──────────────────────────────
  const dotPulseOpacity =
    status === "active"
      ? 0.7 + 0.3 * Math.sin(frame * 0.12)
      : 1;

  // Dot pulse scale (active only)
  const dotPulseScale =
    status === "active"
      ? 1 + 0.18 * Math.sin(frame * 0.1)
      : 1;

  // ─── "validated": dot color interpolates from neutral → teal over 10 frames ─
  let dotColor: string;
  if (status === "validated") {
    const validatedT = interpolate(
      frame,
      [appearFrame, appearFrame + 10],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.snappyOut }
    );
    dotColor = lerpColor(COLORS.statusNeutral, COLORS.accentTeal, validatedT);
  } else {
    dotColor = STATUS_DOT_BASE[status];
  }

  // ─── "complete": teal border glow ─────────────────────────────────────────
  const completeBorderGlow =
    status === "complete"
      ? `0 0 8px ${rgba(COLORS.accentTeal, 0.55)}, 0 0 16px ${rgba(COLORS.accentTeal, 0.25)}`
      : "none";

  // Border color: subtle normally, teal tint for complete
  const borderColor =
    status === "complete"
      ? rgba(COLORS.accentTeal, 0.35)
      : "rgba(255,255,255,0.10)";

  // Left accent line color per status
  const accentColor = STATUS_ACCENT[status];

  // Glow on left accent line for active/validated/complete
  const accentGlow =
    status !== "idle"
      ? `0 0 6px ${rgba(accentColor, 0.7)}`
      : "none";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        maxWidth: 220,
        transform: `scale(${appearScale})`,
        transformOrigin: "left center",
        position: "relative",
        overflow: "hidden",
        borderRadius: 9999,
        background: "rgba(24,24,27,0.85)",
        border: `1px solid ${borderColor}`,
        boxShadow: completeBorderGlow,
        padding: "5px 12px 5px 10px",
        gap: 8,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Left accent vertical bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "15%",
          bottom: "15%",
          width: 2,
          borderRadius: 2,
          background: accentColor,
          boxShadow: accentGlow,
          opacity: status === "idle" ? 0.4 : 0.85,
        }}
      />

      {/* Status dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
          marginLeft: 6,
          opacity: dotPulseOpacity,
          transform: `scale(${dotPulseScale})`,
          boxShadow:
            status !== "idle"
              ? `0 0 5px ${rgba(dotColor, 0.8)}`
              : "none",
        }}
      />

      {/* Label text */}
      <span
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          color: COLORS.textMuted,
          whiteSpace: "nowrap" as const,
          lineHeight: 1,
          userSelect: "none" as const,
        }}
      >
        {label}
      </span>

      {/* "complete" shimmer overlay (subtle teal sweep on repeat) */}
      {status === "complete" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, transparent 0%, ${rgba(COLORS.accentTeal, 0.07)} 50%, transparent 100%)`,
            transform: `translateX(${((frame % 90) / 90) * 200 - 100}%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
