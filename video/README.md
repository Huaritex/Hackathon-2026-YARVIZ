# YARVIZ Promo Video

Premium dark-tech 12-second product reveal built with Remotion.

## Setup

```bash
cd video
npm install
```

## Generate Voiceover (optional)

```bash
export ELEVENLABS_API_KEY=your_key_here
npx ts-node scripts/generate-elevenlabs-voiceover.ts
```

This saves `public/audio/yarviz-voiceover.mp3`. If skipped, the video renders silently.

## Preview

```bash
npm start
# Opens Remotion Studio at http://localhost:3000
```

## Render

```bash
npm run render
# Outputs to out/yarviz-promo.mp4
```

## Specs

- 1920×1080 · 60fps · 12 seconds (720 frames)
- 5 scenes: Boot → Dashboard Build → Validation → Customization → Outro
- Audio: ElevenLabs Spanish voiceover (local-first, not required)
