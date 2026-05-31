import React from "react";
import { interpolate } from "remotion";
import { COLORS, rgba } from "../lib/color";
import { Easing } from "../lib/easing";

interface LayoutContainerProps {
  frame: number;
  children?: React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;
const SIDEBAR_W = 320;
const TOP_BAR_H = 44;
const BOTTOM_BAR_H = 36;
const CORNER_MARK_LEN = 14; // px, arm of the L-shape

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Faint radial-gradient dot grid covering the full canvas. */
function DotGrid(): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/** L-shaped corner accent mark. `corner` drives which quadrant it lives in. */
function CornerMark({
  corner,
}: {
  corner: "top-left" | "bottom-right";
}): React.ReactElement {
  const isTopLeft = corner === "top-left";
  const offset = 14; // inset from workspace edge

  // Both arms of the L
  const hStyle: React.CSSProperties = {
    position: "absolute",
    width: CORNER_MARK_LEN,
    height: 1.5,
    background: COLORS.accentTeal,
    boxShadow: `0 0 6px ${rgba(COLORS.accentTeal, 0.7)}`,
  };
  const vStyle: React.CSSProperties = {
    position: "absolute",
    width: 1.5,
    height: CORNER_MARK_LEN,
    background: COLORS.accentTeal,
    boxShadow: `0 0 6px ${rgba(COLORS.accentTeal, 0.7)}`,
  };

  if (isTopLeft) {
    return (
      <div style={{ position: "absolute", left: offset, top: offset }}>
        {/* horizontal arm */}
        <div style={{ ...hStyle, left: 0, top: 0 }} />
        {/* vertical arm */}
        <div style={{ ...vStyle, left: 0, top: 0 }} />
      </div>
    );
  }

  // bottom-right — arms point inward (up and left)
  return (
    <div
      style={{
        position: "absolute",
        right: offset,
        bottom: offset,
      }}
    >
      {/* horizontal arm */}
      <div style={{ ...hStyle, right: 0, bottom: 0 }} />
      {/* vertical arm */}
      <div style={{ ...vStyle, right: 0, bottom: 0 }} />
    </div>
  );
}

/** Top bar with logo, status indicator and mock system stats. */
function TopBar(): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: TOP_BAR_H,
        background: rgba(COLORS.bgMain.replace("#", ""), 0) === "rgba(0,0,0,0)"
          ? "rgba(9,9,11,0.97)"
          : "rgba(9,9,11,0.97)",
        borderBottom: `1px solid ${COLORS.borderSubtle}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 20,
        zIndex: 10,
        boxSizing: "border-box",
      }}
    >
      {/* ── Logo left ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Small teal accent square */}
        <div
          style={{
            width: 8,
            height: 8,
            background: COLORS.accentTeal,
            boxShadow: `0 0 8px ${rgba(COLORS.accentTeal, 0.8)}`,
            transform: "rotate(45deg)",
          }}
        />
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase" as const,
            color: COLORS.textHero,
          }}
        >
          YARVIZ
        </span>
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: COLORS.textMuted,
            marginLeft: 4,
            opacity: 0.7,
          }}
        >
          CONFIGURATOR v2.6
        </span>
      </div>

      {/* ── Right cluster: stats + status ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Mock CPU stat */}
        <StatChip label="CPU" value="12%" />
        {/* Mock MEM stat */}
        <StatChip label="MEM" value="341 MB" />

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 18,
            background: COLORS.borderSubtle,
          }}
        />

        {/* SYSTEM ONLINE indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Teal dot */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: COLORS.statusReady,
              boxShadow: `0 0 8px ${rgba(COLORS.statusReady, 0.9)}`,
            }}
          />
          <span
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase" as const,
              color: COLORS.statusReady,
            }}
          >
            SYSTEM ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}

/** Tiny two-column stat chip. */
function StatChip({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
      <span
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 8,
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          color: COLORS.textMuted,
          opacity: 0.6,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 9,
          letterSpacing: "0.08em",
          color: COLORS.textHero,
          opacity: 0.85,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** Bottom status bar. */
function BottomBar(): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: BOTTOM_BAR_H,
        background: "rgba(9,9,11,0.95)",
        borderTop: `1px solid ${COLORS.borderSubtle}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 20,
        zIndex: 10,
        boxSizing: "border-box",
      }}
    >
      {/* Left: build version */}
      <span
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 8,
          letterSpacing: "0.16em",
          textTransform: "uppercase" as const,
          color: COLORS.textMuted,
          opacity: 0.5,
        }}
      >
        2026.05.30 — BUILD 001
      </span>

      {/* Center: separator dots */}
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: COLORS.statusNeutral,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Right: FPS indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: COLORS.accentTeal,
            opacity: 0.9,
          }}
        />
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 8,
            letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            color: COLORS.textMuted,
            opacity: 0.6,
          }}
        >
          60 FPS
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LayoutContainer({
  frame,
  children,
}: LayoutContainerProps): React.ReactElement {
  // ─── Slide-in animation: frames 60–80 ─────────────────────────────────────
  const slideInOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  const slideInY = interpolate(frame, [60, 80], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  // Before frame 60 the whole container is invisible
  if (frame < 60) {
    return <></>;
  }

  // ─── Geometry ─────────────────────────────────────────────────────────────
  const contentTop = TOP_BAR_H;
  const contentBottom = BOTTOM_BAR_H;
  const contentH = CANVAS_H - contentTop - contentBottom;
  const mainLeft = SIDEBAR_W;
  const mainW = CANVAS_W - SIDEBAR_W;

  return (
    <div
      style={{
        position: "absolute",
        width: CANVAS_W,
        height: CANVAS_H,
        background: COLORS.bgMain,
        overflow: "hidden",
        opacity: slideInOpacity,
        transform: `translateY(${slideInY}px)`,
      }}
    >
      {/* ── Dot grid background ── */}
      <DotGrid />

      {/* ── Corner accent marks ── */}
      <CornerMark corner="top-left" />
      <CornerMark corner="bottom-right" />

      {/* ── Top bar ── */}
      <TopBar />

      {/* ── Left sidebar ── */}
      <div
        style={{
          position: "absolute",
          top: contentTop,
          left: 0,
          width: SIDEBAR_W,
          height: contentH,
          background: "rgba(18,18,20,0.97)",
          borderRight: `1px solid ${COLORS.borderSubtle}`,
          zIndex: 5,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Sidebar children slot — first child expected to be SidebarStatus */}
        {React.Children.toArray(children)[0] ?? null}
      </div>

      {/* ── Main content area ── */}
      <div
        style={{
          position: "absolute",
          top: contentTop,
          left: mainLeft,
          width: mainW,
          height: contentH,
          background: "rgba(9,9,11,0.98)",
          zIndex: 4,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Main children slot — second child and beyond */}
        {React.Children.toArray(children).slice(1)}
      </div>

      {/* ── Bottom bar ── */}
      <BottomBar />
    </div>
  );
}
