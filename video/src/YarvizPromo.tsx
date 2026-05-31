/**
 * YarvizPromo.tsx
 *
 * Main 720-frame promo composition for the YARVIZ DIY robotics kit.
 * 1920×1080 @ 60fps = 12 seconds.
 *
 * Architecture:
 *   - A single root useCurrentFrame() supplies the GLOBAL frame (0–719).
 *   - That global frame is passed as a prop to every child component, so all
 *     animation math stays anchored to absolute composition time.
 *   - <Sequence> is used ONLY for mounting/unmounting scene groups
 *     (the from/durationInFrames windows). Components do NOT rely on the
 *     sequence-relative frame; they always animate from the global frame prop.
 *
 * Determinism rules (Remotion):
 *   - useCurrentFrame()/useVideoConfig() are called only at the root level.
 *   - No CSS transitions/animations, no Math.random — every value is frame-derived.
 *
 * Scene boundaries (see lib/transients.ts):
 *   Scene 1: 0–60    boot sequence
 *   Scene 2: 60–240  dashboard intro + voice engine focus
 *   Scene 3: 240–420 build pipeline validation
 *   Scene 4: 420–600 interactive dropdowns
 *   Scene 5: 600–720 brand outro
 */

import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";

import { GlobalCamera } from "./components/GlobalCamera";
import { LayoutContainer } from "./components/LayoutContainer";
import { SidebarStatus } from "./components/SidebarStatus";
import { DataLogger } from "./components/DataLogger";
import { VoiceWaveform } from "./components/VoiceWaveform";
import { VoiceoverAudio } from "./components/VoiceoverAudio";
import { InteractiveDropdown } from "./components/InteractiveDropdown";
import { CentralMonolith } from "./components/CentralMonolith";
import { HologramPrism } from "./components/HologramPrism";
import { RobotCoreBadge } from "./components/RobotCoreBadge";

import { COLORS, rgba } from "./lib/color";
import { Easing } from "./lib/easing";

// ─── Composition constants ──────────────────────────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Scene windows (absolute frames)
const SCENE1 = { from: 0, duration: 60 } as const;
const SCENE2TO4 = { from: 60, duration: 540 } as const;
const SCENE5 = { from: 600, duration: 120 } as const;

// Flash overlay window (Scene 4 → Scene 5 cut)
const FLASH_START = 600;
const FLASH_PEAK = 602;
const FLASH_END = 604;
const FLASH_PEAK_OPACITY = 0.25;

// Voice waveform window
const WAVEFORM_APPEAR = 90; // global frame the waveform scales in
const WAVEFORM_ACTIVE_START = 90;
const WAVEFORM_ACTIVE_END = 240;

// Dropdown timing
const DROPDOWN_VOICE_OPEN = 420;
const DROPDOWN_PERSONALITY_OPEN = 470;

// Shared props passed to every frame-driven component.
interface FrameProps {
  frame: number;
}

// ─── Background ───────────────────────────────────────────────────────────────

/**
 * Full-canvas backdrop: deep zinc base + indigo radial center glow that breathes,
 * plus a very subtle SVG dot-grid + data-line layer behind everything.
 */
function Background({ frame }: FrameProps): React.ReactElement {
  // Center glow breathes gently the whole video.
  const glowPulse = 0.5 + 0.5 * Math.sin(frame * 0.02);
  const glowOpacity = 0.35 + 0.25 * glowPulse;

  return (
    <AbsoluteFill style={{ background: COLORS.bgMain }}>
      {/* Indigo radial center glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${rgba(
            COLORS.accentIndigo,
            0.18 * glowOpacity
          )} 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      {/* Subtle dot-grid + data-line SVG layer (~3% opacity) */}
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{ position: "absolute", inset: 0, opacity: 0.03 }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <pattern
            id="bg-dot-grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#ffffff" />
          </pattern>
        </defs>
        <rect width={CANVAS_W} height={CANVAS_H} fill="url(#bg-dot-grid)" />

        {/* A few long horizontal data lines drifting very slightly */}
        {[220, 540, 860].map((baseY, i) => {
          const drift = Math.sin(frame * 0.01 + i) * 6;
          const y = baseY + drift;
          return (
            <line
              key={`bg-line-${i}`}
              x1={0}
              y1={y}
              x2={CANVAS_W}
              y2={y}
              stroke="#ffffff"
              strokeWidth={1}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
}

// ─── Scene 1: Boot sequence ─────────────────────────────────────────────────

/**
 * Boot sequence. CentralMonolith handles its own scale/scanline/typed-label
 * animations from the global frame. A floating HologramPrism sits above the icon.
 */
function Scene1({ frame }: FrameProps): React.ReactElement {
  return (
    <AbsoluteFill>
      {/* Localized indigo center glow for the boot icon */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${rgba(
            COLORS.accentIndigo,
            0.22
          )} 0%, transparent 45%)`,
          pointerEvents: "none",
        }}
      />

      {/* Floating prism above the monolith */}
      <HologramPrism frame={frame} x={CANVAS_W / 2} y={CANVAS_H / 2 - 230} size={46} />

      {/* Central robot monolith — owns its own boot animation + typed label */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CentralMonolith frame={frame} scene={1} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── Scene 2–4: Dashboard ───────────────────────────────────────────────────

/**
 * Persistent dashboard spanning Scenes 2–4 (frames 60–599).
 * LayoutContainer renders the chrome (top/bottom bars, sidebar, main area) and
 * slots its first child into the sidebar, the rest into the main content area.
 */
function Scene2to4({ frame }: FrameProps): React.ReactElement {
  // RobotCoreBadge status reflects pipeline progress.
  // active during voice-engine focus, validated as modules confirm, complete after.
  const badgeStatus: "idle" | "active" | "validated" | "complete" =
    frame >= 360
      ? "complete"
      : frame >= 252
        ? "validated"
        : frame >= 90
          ? "active"
          : "idle";

  const badgeLabel =
    frame >= 360
      ? "SYSTEM READY"
      : frame >= 252
        ? "VALIDATING MODULES"
        : frame >= 90
          ? "VOICE ENGINE ONLINE"
          : "INITIALIZING";

  // Waveform is "active" only during the voice-engine focus window.
  const waveformActive =
    frame >= WAVEFORM_ACTIVE_START && frame <= WAVEFORM_ACTIVE_END;

  // Main-content fade-in mirrors LayoutContainer's slide-in (frames 60–80).
  const mainOpacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  return (
    <AbsoluteFill>
      {/* Decorative corner prisms (behind the layout chrome via z-order). */}
      <HologramPrism frame={frame} x={1780} y={170} size={30} opacity={0.45} />
      <HologramPrism frame={frame} x={150} y={930} size={26} opacity={0.4} />

      {/* Dashboard chrome. First child → sidebar; remaining children → main. */}
      <LayoutContainer frame={frame}>
        {/* ── Sidebar child ── */}
        <SidebarStatus frame={frame} />

        {/* ── Main content children ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            padding: "28px 32px",
            opacity: mainOpacity,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Top row: core badge + voice waveform */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <RobotCoreBadge
              frame={frame}
              label={badgeLabel}
              status={badgeStatus}
              appearFrame={88}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: 9,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: COLORS.accentTeal,
                  opacity: waveformActive ? 0.9 : 0.4,
                }}
              >
                ELEVENLABS
              </span>
              <VoiceWaveform
                frame={frame}
                active={waveformActive}
                appearFrame={WAVEFORM_APPEAR}
                width={280}
                height={48}
              />
            </div>
          </div>

          {/* Streaming system log */}
          <DataLogger frame={frame} />
        </div>
      </LayoutContainer>

      {/* ── Scene 4 interactive dropdowns ── */}
      {/* Mounted unconditionally; they self-hide via opacity before openFrame. */}
      <InteractiveDropdown
        frame={frame}
        category="voice"
        anchorX={1300}
        anchorY={350}
        openFrame={DROPDOWN_VOICE_OPEN}
        selectedIndex={0}
      />
      <InteractiveDropdown
        frame={frame}
        category="personality"
        anchorX={1300}
        anchorY={450}
        openFrame={DROPDOWN_PERSONALITY_OPEN}
        selectedIndex={1}
      />
    </AbsoluteFill>
  );
}

// ─── Scene 5: Brand outro ───────────────────────────────────────────────────

/**
 * Outro: the monolith re-enters (CentralMonolith scene 5 owns its fade + glow
 * pulse), the YARVIZ wordmark tracks open, the subtitle fades in, and decorative
 * prisms intensify their glow (HologramPrism ramps glow over frames 640–660).
 */
function Scene5({ frame }: FrameProps): React.ReactElement {
  // Wordmark letter-spacing opens from tight to airy over frames 620–660.
  const letterSpacingEm = interpolate(frame, [620, 660], [-0.25, 0.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  // Wordmark opacity comes up alongside the monolith fade.
  const titleOpacity = interpolate(frame, [612, 640], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  // Subtitle fade.
  const subtitleOpacity = interpolate(frame, [625, 655], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  // Footer fades in last.
  const footerOpacity = interpolate(frame, [650, 680], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  // Final glow pulse around frame 660 — a soft radial bloom behind the wordmark.
  const finalGlow = interpolate(frame, [655, 665, 700], [0, 1, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.snappyOut,
  });

  return (
    <AbsoluteFill>
      {/* Final glow bloom */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, ${rgba(
            COLORS.accentTeal,
            0.16 * finalGlow
          )} 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      {/* Decorative prisms in corners — glow intensifies via internal frame logic */}
      <HologramPrism frame={frame} x={460} y={300} size={34} opacity={0.5} />
      <HologramPrism frame={frame} x={1460} y={300} size={34} opacity={0.5} />
      <HologramPrism frame={frame} x={460} y={780} size={30} opacity={0.45} />
      <HologramPrism frame={frame} x={1460} y={780} size={30} opacity={0.45} />

      {/* Re-entering robot monolith */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 150,
        }}
      >
        <CentralMonolith frame={frame} scene={5} />
      </AbsoluteFill>

      {/* Brand text block */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 170,
        }}
      >
        <div style={{ textAlign: "center" }}>
          {/* YARVIZ wordmark */}
          <div
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: `${letterSpacingEm}em`,
              color: COLORS.textHero,
              opacity: titleOpacity,
              textShadow: `0 0 32px ${rgba(COLORS.accentTeal, 0.5)}, 0 0 64px ${rgba(
                COLORS.accentIndigo,
                0.3
              )}`,
              lineHeight: 1,
              // Pad left so the tight negative tracking does not clip the first glyph.
              paddingLeft: "0.25em",
            }}
          >
            YARVIZ
          </div>

          {/* Subtitle */}
          <div
            style={{
              marginTop: 24,
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 26,
              letterSpacing: "0.04em",
              color: COLORS.textMuted,
              opacity: subtitleOpacity,
            }}
          >
            Tu primer IA físico. Creado por ti.
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 28,
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: COLORS.accentTeal,
              opacity: footerOpacity * 0.8,
            }}
          >
            DIY ROBOTICS KIT · ESP32 + ELEVENLABS · LOCAL-FIRST
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── Flash overlay (Scene 4 → 5 cut) ─────────────────────────────────────────

/**
 * Full-screen white flash at the Scene 4→5 cut. Opacity 0 → 0.25 → 0,
 * peaking at frame 602. Always rendered; opacity is 0 outside the window.
 */
function FlashOverlay({ frame }: FrameProps): React.ReactElement {
  const opacity = interpolate(
    frame,
    [FLASH_START, FLASH_PEAK, FLASH_END],
    [0, FLASH_PEAK_OPACITY, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        background: "#ffffff",
        opacity,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    />
  );
}

// ─── Composition root ────────────────────────────────────────────────────────

export function YarvizPromo(): React.ReactElement {
  const frame = useCurrentFrame(); // GLOBAL frame, 0–719

  return (
    <AbsoluteFill style={{ background: COLORS.bgMain }}>
      <GlobalCamera frame={frame}>
        <AbsoluteFill>
          {/* Persistent background */}
          <Background frame={frame} />

          {/* Scene 1: Boot sequence */}
          <Sequence from={SCENE1.from} durationInFrames={SCENE1.duration}>
            <Scene1 frame={frame} />
          </Sequence>

          {/* Scenes 2–4: Dashboard */}
          <Sequence from={SCENE2TO4.from} durationInFrames={SCENE2TO4.duration}>
            <Scene2to4 frame={frame} />
          </Sequence>

          {/* Scene 5: Outro */}
          <Sequence from={SCENE5.from} durationInFrames={SCENE5.duration}>
            <Scene5 frame={frame} />
          </Sequence>

          {/* Flash overlay across the Scene 4→5 cut */}
          <FlashOverlay frame={frame} />
        </AbsoluteFill>
      </GlobalCamera>

      {/* Voiceover audio (graceful if the file is missing in preview) */}
      <VoiceoverAudio enabled={true} volume={0.9} />
    </AbsoluteFill>
  );
}
