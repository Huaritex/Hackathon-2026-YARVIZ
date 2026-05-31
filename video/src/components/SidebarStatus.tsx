import React from "react";
import { interpolate, spring } from "remotion";
import { COLORS, lerpColor, rgba } from "../lib/color";
import { Easing } from "../lib/easing";
import { frameProgress } from "../lib/timing";

interface SidebarStatusProps {
  frame: number;
}

// ─── Pipeline item descriptor ─────────────────────────────────────────────────

interface PipelineItem {
  label: string;
  validatedLabel: string;
  validationFrame: number;
  /** Overrides the default "READY" badge text after validation. */
  readyBadgeOverride?: string;
}

const PIPELINE: readonly PipelineItem[] = [
  {
    label: "3D PRINT FILES",
    validatedLabel: "STL READY",
    validationFrame: 252,
  },
  {
    label: "ESP32 FIRMWARE",
    validatedLabel: "FIRMWARE COMPILED",
    validationFrame: 270,
  },
  {
    label: "VOICE ENGINE",
    validatedLabel: "VOICE READY",
    validationFrame: 288,
    readyBadgeOverride: "ELEVENLABS LINKED",
  },
  {
    label: "AI PERSONALITY",
    validatedLabel: "BEHAVIOR PROFILE SAVED",
    validationFrame: 306,
  },
  {
    label: "HOLOGRAM STUDIO",
    validatedLabel: "AVATAR PACK READY",
    validationFrame: 324,
  },
  {
    label: "LOCAL SECURE STORAGE",
    validatedLabel: "ENCRYPTED",
    validationFrame: 342,
  },
] as const;

// ─── Per-item constants ───────────────────────────────────────────────────────
const ITEM_H = 48;
const ITEM_APPEAR_START = 70; // first item
const ITEM_APPEAR_STAGGER = 8; // frames between each item
const ITEM_APPEAR_DURATION = 12;

const DOT_SIZE = 8;
const VALIDATION_COLOR_DURATION = 10; // frames: gray → teal
const PULSE_RING_DURATION = 20; // frames after validationFrame
const ROW_BUMP_DURATION = 6; // frames

// Frame at which Voice Engine gets the focus glow
const VOICE_ENGINE_FOCUS_START = 90;
const VOICE_ENGINE_FOCUS_END = 240;
const VOICE_ENGINE_INDEX = 2;

// Section header timing
const HEADER_APPEAR_FRAME = 65;
const HEADER_APPEAR_DURATION = 15;

// ─── Individual row component ─────────────────────────────────────────────────

interface PipelineRowProps {
  item: PipelineItem;
  index: number;
  frame: number;
  fps: number;
}

function PipelineRow({
  item,
  index,
  frame,
  fps,
}: PipelineRowProps): React.ReactElement {
  const appearStart = ITEM_APPEAR_START + index * ITEM_APPEAR_STAGGER;
  const appearEnd = appearStart + ITEM_APPEAR_DURATION;
  const { validationFrame } = item;
  const isVoiceEngine = index === VOICE_ENGINE_INDEX;

  // ─── Appear: translateY + opacity (GSAP expoOut for snappy domino flow) ─────
  const appearOpacity = interpolate(frame, [appearStart, appearEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.expoOut,
  });

  // Spec: "enters viewport from translateY(24px)" — domino layout flow
  const appearY = interpolate(frame, [appearStart, appearEnd], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.expoOut,
  });

  if (frame < appearStart) {
    return <></>;
  }

  const isValidated = frame >= validationFrame;

  // ─── Dot color: gray → teal over VALIDATION_COLOR_DURATION frames ──────────
  // GSAP power2.out matches spec's "smooth hue/saturation shift" requirement
  const dotColorT = interpolate(
    frame,
    [validationFrame, validationFrame + VALIDATION_COLOR_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.power2Out,
    }
  );
  const dotColor = isValidated
    ? lerpColor(COLORS.statusNeutral, COLORS.accentTeal, dotColorT)
    : COLORS.statusNeutral;

  // ─── Pulse ring: scale 1→2, opacity 1→0 over PULSE_RING_DURATION frames ───
  const pulseRingT = interpolate(
    frame,
    [validationFrame, validationFrame + PULSE_RING_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.linear,
    }
  );
  const pulseRingScale = 1 + pulseRingT; // 1 → 2
  const pulseRingOpacity = isValidated ? 1 - pulseRingT : 0; // 1 → 0 (then stays 0)
  const showPulseRing =
    isValidated && frame <= validationFrame + PULSE_RING_DURATION;

  // ─── Check mark spring ─────────────────────────────────────────────────────
  const checkScale = spring({
    frame: frame - validationFrame,
    fps,
    config: {
      mass: 0.4,
      damping: 10,
      stiffness: 220,
    },
    from: 0,
    to: 1,
  });

  // ─── Row bump: translateY 0 → −4 → 0 over ROW_BUMP_DURATION frames ─────────
  const bumpProgress = frameProgress(
    frame,
    validationFrame,
    ROW_BUMP_DURATION,
    Easing.snappyOut
  );
  // Triangle: up for first half, back for second half
  const bumpY = isValidated
    ? -4 * Math.sin(bumpProgress * Math.PI) // −4 at midpoint, 0 at start/end
    : 0;

  // ─── Label text color: muted → white after validation ─────────────────────
  const labelColorT = interpolate(
    frame,
    [validationFrame, validationFrame + VALIDATION_COLOR_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.snappyOut,
    }
  );
  const labelColor = isValidated
    ? lerpColor(COLORS.textMuted, COLORS.textHero, labelColorT)
    : COLORS.textMuted;

  // ─── Voice Engine: focus glow border (frames 90–240) ─────────────────────
  const focusGlowOpacity = isVoiceEngine
    ? interpolate(
        frame,
        [
          VOICE_ENGINE_FOCUS_START,
          VOICE_ENGINE_FOCUS_START + 8,
          VOICE_ENGINE_FOCUS_END - 8,
          VOICE_ENGINE_FOCUS_END,
        ],
        [0, 1, 1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.snappyOut,
        }
      )
    : 0;

  // ─── Badge label ──────────────────────────────────────────────────────────
  const badgeText = isValidated
    ? (item.readyBadgeOverride ?? "READY")
    : "PENDING";

  const badgeBg = isValidated
    ? rgba(COLORS.accentTeal, 0.15)
    : "rgba(63,63,70,0.35)";

  const badgeColor = isValidated ? COLORS.accentTeal : COLORS.textMuted;
  const badgeBorder = isValidated
    ? rgba(COLORS.accentTeal, 0.35)
    : "rgba(63,63,70,0.5)";

  // ─── Displayed label (changes after validation) ───────────────────────────
  const displayLabel = isValidated ? item.validatedLabel : item.label;

  return (
    <div
      style={{
        position: "relative",
        height: ITEM_H,
        display: "flex",
        alignItems: "center",
        paddingLeft: 16,
        paddingRight: 12,
        borderBottom: `1px solid ${COLORS.borderSubtle}`,
        boxSizing: "border-box",
        opacity: appearOpacity,
        transform: `translateY(${appearY + bumpY}px)`,
        // Focus glow for Voice Engine (frames 90–240)
        ...(focusGlowOpacity > 0
          ? {
              boxShadow: `inset 0 0 0 1px ${rgba(
                COLORS.accentTeal,
                0.45 * focusGlowOpacity
              )}, 0 0 12px ${rgba(
                COLORS.accentTeal,
                0.15 * focusGlowOpacity
              )}`,
              background: rgba(COLORS.accentTeal, 0.03 * focusGlowOpacity),
            }
          : {}),
      }}
    >
      {/* ── Indicator dot container (relative for pulse ring) ── */}
      <div
        style={{
          position: "relative",
          width: DOT_SIZE,
          height: DOT_SIZE,
          flexShrink: 0,
        }}
      >
        {/* Pulse ring */}
        {showPulseRing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: "50%",
              border: `1px solid ${rgba(COLORS.accentTeal, pulseRingOpacity)}`,
              transform: `translate(-50%, -50%) scale(${pulseRingScale})`,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Core dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: "50%",
            background: dotColor,
            transform: "translate(-50%, -50%)",
            boxShadow: isValidated
              ? `0 0 8px ${rgba(COLORS.accentTeal, 0.7)}`
              : "none",
          }}
        />
      </div>

      {/* ── Check mark (springs in at validation) ── */}
      <div
        style={{
          marginLeft: 6,
          marginRight: 0,
          width: 14,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${isValidated ? checkScale : 0})`,
          transformOrigin: "center",
          color: COLORS.accentTeal,
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 10,
          lineHeight: 1,
        }}
      >
        ✓
      </div>

      {/* ── Label text ── */}
      <span
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 9,
          letterSpacing: "0.13em",
          textTransform: "uppercase" as const,
          color: labelColor,
          flex: 1,
          overflow: "hidden",
          whiteSpace: "nowrap" as const,
          textOverflow: "ellipsis",
          lineHeight: 1,
          userSelect: "none" as const,
        }}
      >
        {displayLabel}
      </span>

      {/* ── Status badge ── */}
      <div
        style={{
          flexShrink: 0,
          marginLeft: 6,
          padding: "2px 6px",
          borderRadius: 3,
          background: badgeBg,
          border: `1px solid ${badgeBorder}`,
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 7,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          color: badgeColor,
          whiteSpace: "nowrap" as const,
          lineHeight: 1.4,
          userSelect: "none" as const,
        }}
      >
        {badgeText}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SidebarStatus({ frame }: SidebarStatusProps): React.ReactElement {
  // We need fps for spring() — hard-coded to 60 matching the composition
  const fps = 60;

  // ─── Section header: opacity 0→1 over HEADER_APPEAR_DURATION frames ────────
  const headerOpacity = interpolate(
    frame,
    [HEADER_APPEAR_FRAME, HEADER_APPEAR_FRAME + HEADER_APPEAR_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.snappyOut,
    }
  );

  if (frame < HEADER_APPEAR_FRAME) {
    return <></>;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        paddingTop: 20,
        boxSizing: "border-box",
      }}
    >
      {/* ── Section header ── */}
      <div
        style={{
          paddingLeft: 16,
          paddingRight: 12,
          paddingBottom: 10,
          opacity: headerOpacity,
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 8,
            letterSpacing: "0.22em",
            textTransform: "uppercase" as const,
            color: COLORS.accentTeal,
          }}
        >
          BUILD PIPELINE
        </span>
      </div>

      {/* ── Divider under header ── */}
      <div
        style={{
          height: 1,
          background: COLORS.borderSubtle,
          marginBottom: 0,
          opacity: headerOpacity,
        }}
      />

      {/* ── Pipeline rows ── */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {PIPELINE.map((item, index) => (
          <PipelineRow
            key={item.label}
            item={item}
            index={index}
            frame={frame}
            fps={fps}
          />
        ))}
      </div>

      {/* ── Bottom summary bar ── */}
      <SummaryBar frame={frame} />
    </div>
  );
}

// ─── Summary bar at bottom of sidebar ────────────────────────────────────────

function SummaryBar({ frame }: { frame: number }): React.ReactElement {
  // Count how many items are validated
  const validatedCount = PIPELINE.filter(
    (item) => frame >= item.validationFrame
  ).length;
  const total = PIPELINE.length;

  // Progress bar width fraction
  const progressFraction = validatedCount / total;

  // Appear after first item validation
  const firstValidation = PIPELINE[0].validationFrame;
  const summaryOpacity = interpolate(
    frame,
    [firstValidation, firstValidation + 8],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.snappyOut,
    }
  );

  if (frame < firstValidation) return <></>;

  // Bar fill color: indigo until all done, teal when complete
  const allDone = validatedCount === total;
  const barColor = allDone ? COLORS.accentTeal : COLORS.accentIndigo;

  return (
    <div
      style={{
        borderTop: `1px solid ${COLORS.borderSubtle}`,
        padding: "10px 16px 12px",
        opacity: summaryOpacity,
        boxSizing: "border-box",
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 8,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: COLORS.textMuted,
            opacity: 0.7,
          }}
        >
          MODULES
        </span>
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 8,
            letterSpacing: "0.1em",
            color: allDone ? COLORS.accentTeal : COLORS.textHero,
          }}
        >
          {validatedCount}/{total}
        </span>
      </div>

      {/* Progress track */}
      <div
        style={{
          height: 2,
          background: rgba(COLORS.statusNeutral, 0.35),
          borderRadius: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${progressFraction * 100}%`,
            background: barColor,
            boxShadow: `0 0 6px ${rgba(barColor, 0.7)}`,
            borderRadius: 1,
            // Width transition avoided: width changes discretely per-frame,
            // which is deterministic and frame-accurate.
          }}
        />
      </div>
    </div>
  );
}
