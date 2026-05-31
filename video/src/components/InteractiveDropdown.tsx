/**
 * InteractiveDropdown.tsx
 * Voice/personality menu pop-over with spring animations.
 * Used in Scene 4 (frames 420-600).
 * All animations are deterministic and frame-based — no CSS transitions, no random().
 */

import React from "react";
import { interpolate, spring } from "remotion";
import { staggerDelay, frameProgress } from "../lib/timing";
import { COLORS, rgba } from "../lib/color";
import { Easing } from "../lib/easing";

type Category = "voice" | "personality" | "privacy" | "hologram";

interface InteractiveDropdownProps {
  frame: number;
  category: Category;
  anchorX: number;
  anchorY: number;
  openFrame: number;
  selectedIndex?: number;
}

const OPTIONS: Record<Category, string[]> = {
  voice: ["Clone my voice", "Premium narrator", "Robotic assistant", "Anime companion"],
  personality: ["Helpful mentor", "Curious builder", "Strict coach", "Friendly companion"],
  privacy: ["Store API keys locally", "Encrypt audio logs", "Disable cloud memory"],
  hologram: ["Reactive avatar", "Emotion icons", "Boot sequence", "Custom animation pack"],
};

const CATEGORY_LABELS: Record<Category, string> = {
  voice: "VOICE",
  personality: "PERSONALITY",
  privacy: "PRIVACY",
  hologram: "HOLOGRAM",
};

/** Frames for each item's stagger appearance. */
function itemAppearFrame(openFrame: number, index: number): number {
  return openFrame + 6 + index * Math.round(0.04 * 60);
}

export const InteractiveDropdown: React.FC<InteractiveDropdownProps> = ({
  frame,
  category,
  anchorX,
  anchorY,
  openFrame,
  selectedIndex = 0,
}) => {
  const items = OPTIONS[category];
  const label = CATEGORY_LABELS[category];

  // ── Menu box entrance ──────────────────────────────────────────────────────

  // scaleY: 0.8 → 1.0 over 6 frames — spec requires axis-isolated Y scale + backOut pop
  const scaleY = interpolate(frame, [openFrame, openFrame + 6], [0.8, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.backOut,
  });

  // opacity: 0 → 1 over 6 frames — fast sweep with expo.out
  const opacity = interpolate(frame, [openFrame, openFrame + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.expoOut,
  });

  // ── Selection marker spring ────────────────────────────────────────────────
  // Spring-animated dot appears on selected row
  const selectionAppearFrame = itemAppearFrame(openFrame, selectedIndex);
  const selectionDotScale = spring({
    fps: 60,
    frame: Math.max(0, frame - selectionAppearFrame),
    config: {
      mass: 0.4,
      damping: 10,
      stiffness: 220,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: anchorX,
        top: anchorY,
        opacity,
        transform: `scaleY(${scaleY})`,
        transformOrigin: "top left",
        minWidth: 240,
        background: "rgba(18,18,20,0.95)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(20,184,166,0.08)",
        zIndex: 100,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px 6px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", "Fira Mono", monospace',
            fontSize: 9,
            letterSpacing: "0.16em",
            color: "#14b8a6",
            textTransform: "uppercase" as const,
          }}
        >
          {label}
        </span>
        <span
          style={{
            color: "#a1a1aa",
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          ▾
        </span>
      </div>

      {/* Menu items */}
      <div style={{ padding: "4px 0" }}>
        {items.map((item, i) => {
          const appearAt = itemAppearFrame(openFrame, i);
          const isSelected = i === selectedIndex;

          // Item stagger: translateY(8→0), opacity(0→1) over 8 frames
          const itemProgress = frameProgress(frame, appearAt, 8, Easing.snappyOut);
          const itemTranslateY = interpolate(itemProgress, [0, 1], [8, 0]);
          const itemOpacity = itemProgress;

          return (
            <div
              key={`${category}-item-${i}`}
              style={{
                position: "relative",
                height: 36,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                opacity: itemOpacity,
                transform: `translateY(${itemTranslateY}px)`,
                background: isSelected
                  ? "rgba(20,184,166,0.07)"
                  : "transparent",
                borderLeft: isSelected
                  ? "2px solid #14b8a6"
                  : "2px solid transparent",
              }}
            >
              {/* Spring-animated selection marker dot */}
              {isSelected && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#14b8a6",
                    marginRight: 8,
                    flexShrink: 0,
                    transform: `scale(${selectionDotScale})`,
                    boxShadow: `0 0 8px rgba(20,184,166,${0.6 * selectionDotScale})`,
                  }}
                />
              )}

              {/* Spacer for non-selected rows to align text */}
              {!isSelected && (
                <div style={{ width: 14, flexShrink: 0 }} />
              )}

              <span
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Mono", monospace',
                  fontSize: 12,
                  color: isSelected ? "#ffffff" : COLORS.textMuted,
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap" as const,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
