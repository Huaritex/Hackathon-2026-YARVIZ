/**
 * VoiceoverAudio.tsx
 * Safe audio component that loads the ElevenLabs voiceover without crashing
 * if the file is missing.
 *
 * If the file doesn't exist, Remotion will warn but not crash in preview mode.
 */

import React from "react";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

interface VoiceoverAudioProps {
  volume?: number;
  enabled?: boolean;
}

export const VoiceoverAudio: React.FC<VoiceoverAudioProps> = ({
  volume = 1,
  enabled = true,
}) => {
  if (!enabled) return null;
  return (
    <Audio
      src={staticFile("audio/yarviz-voiceover.mp3")}
      volume={volume}
      playbackRate={1} />
  );
};
