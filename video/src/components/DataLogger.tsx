/**
 * DataLogger.tsx
 * Scrolling terminal/log panel showing streaming build output for the YARVIZ robot kit.
 * All animations are deterministic and frame-based — no CSS transitions, no random().
 */

import React from "react";
import { interpolate } from "remotion";
import { typeProgress } from "../lib/timing";

interface DataLoggerProps {
  frame: number;
}

type LogType = "ok" | "sync" | "lock" | "run" | "info";

interface LogLine {
  frame: number;
  text: string;
  type: LogType;
}

interface TypingString {
  startFrame: number;
  text: string;
}

const LOG_LINES: LogLine[] = [
  { frame: 120, text: "[OK] STL blueprints mounted",               type: "ok" },
  { frame: 131, text: "[OK] ESP32 firmware compiled",              type: "ok" },
  { frame: 142, text: "[SYNC] ElevenLabs voice route active",      type: "sync" },
  { frame: 153, text: "[LOCK] API credentials stored in local flash", type: "lock" },
  { frame: 164, text: "[RUN] Holographic expression pack initialized", type: "run" },
  { frame: 175, text: "[INFO] Memory: 4MB PSRAM detected",         type: "info" },
  { frame: 186, text: "[INFO] Wi-Fi: connected to local network",  type: "info" },
  { frame: 197, text: "[OK] Voice model: loaded (ElevenLabs)",     type: "ok" },
  { frame: 208, text: "[OK] Hologram layer: active",               type: "ok" },
];

const TYPING_STRINGS: TypingString[] = [
  { startFrame: 150, text: "Loading YARVIZ voice profile..." },
  { startFrame: 170, text: "Connecting ElevenLabs voice model..." },
  { startFrame: 195, text: "Encrypting API keys locally..." },
];

const TYPE_COLORS: Record<LogType, string> = {
  ok:   "#14b8a6",
  sync: "#6366f1",
  lock: "#f59e0b",
  run:  "#14b8a6",
  info: "#a1a1aa",
};

/** Extract the bracket prefix "[XX]" and the rest of the line separately. */
function splitLogText(text: string): { prefix: string; body: string } {
  const match = text.match(/^(\[[A-Z]+\])\s*(.*)/);
  if (match) {
    return { prefix: match[1], body: " " + match[2] };
  }
  return { prefix: "", body: text };
}

/** Clip-path reveal: top-to-bottom over revealDuration frames. */
function lineRevealClipPath(frame: number, startFrame: number, revealDuration = 8): string {
  const pct = interpolate(frame, [startFrame, startFrame + revealDuration], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return `inset(0 0 ${pct}% 0)`;
}

/** Blinking cursor: on for first half of every 30-frame cycle. */
function blinkingCursor(frame: number): string {
  return frame % 30 < 15 ? "|" : "";
}

/** Return the active typing string to display at a given frame. */
function getActiveTypingString(frame: number): { text: string; startFrame: number } | null {
  // Find the last typing string whose startFrame has passed
  let active: TypingString | null = null;
  for (const ts of TYPING_STRINGS) {
    if (frame >= ts.startFrame) {
      active = ts;
    }
  }
  return active;
}

export const DataLogger: React.FC<DataLoggerProps> = ({ frame }) => {
  // Determine which log lines are visible
  const visibleLines = LOG_LINES.filter((line) => frame >= line.frame);

  // Pulsing green dot: oscillates between full and dim opacity
  const dotOpacity = 0.6 + 0.4 * Math.sin(frame * 0.12);

  // Active typing string
  const activeTyping = getActiveTypingString(frame);
  const typedText = activeTyping
    ? typeProgress(frame, activeTyping.startFrame, activeTyping.text, 2)
    : "";
  const cursor = blinkingCursor(frame);

  // Determine scroll-feel opacity: lines beyond index 5 from the bottom get faded
  const totalVisible = visibleLines.length;

  return (
    <div
      style={{
        width: "100%",
        height: 220,
        background: "rgba(9,9,11,0.92)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 6,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: '"JetBrains Mono", "Fira Mono", "Courier New", monospace',
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {/* Pulsing green dot */}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#22c55e",
            opacity: dotOpacity,
            boxShadow: `0 0 6px rgba(34,197,94,${dotOpacity * 0.8})`,
          }}
        />
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.15em",
            color: "#14b8a6",
            textTransform: "uppercase" as const,
          }}
        >
          SYSTEM LOG
        </span>
      </div>

      {/* Log lines area */}
      <div
        style={{
          flex: 1,
          padding: "6px 12px 0 12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        {visibleLines.map((line, i) => {
          // Determine scroll-fade: older lines (more than 5 from end) are faded
          const fromBottom = totalVisible - 1 - i;
          const isOld = fromBottom > 5;
          const lineOpacity = isOld ? 0.4 : 1;

          const { prefix, body } = splitLogText(line.text);
          const color = TYPE_COLORS[line.type];
          const clipPath = lineRevealClipPath(frame, line.frame, 8);

          return (
            <div
              key={`log-${line.frame}-${i}`}
              style={{
                clipPath,
                opacity: lineOpacity,
                fontSize: 11,
                lineHeight: "18px",
                whiteSpace: "nowrap" as const,
                overflow: "hidden",
              }}
            >
              <span style={{ color }}>{prefix}</span>
              <span style={{ color: "#a1a1aa" }}>{body}</span>
            </div>
          );
        })}
      </div>

      {/* Active command / typing area */}
      <div
        style={{
          flexShrink: 0,
          padding: "4px 12px 8px 12px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          minHeight: 26,
        }}
      >
        {activeTyping && (
          <span
            style={{
              fontSize: 11,
              color: "#ffffff",
              fontFamily: "inherit",
            }}
          >
            <span style={{ color: "#14b8a6", marginRight: 6 }}>$</span>
            {typedText}
            <span
              style={{
                color: "#14b8a6",
                fontWeight: "bold",
                opacity: cursor === "|" ? 1 : 0,
              }}
            >
              |
            </span>
          </span>
        )}
      </div>

      {/* Bottom gradient fade for scroll illusion */}
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: 0,
          right: 0,
          height: 32,
          background: "linear-gradient(to bottom, transparent, rgba(9,9,11,0.85))",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
