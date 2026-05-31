import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Easy to change voice
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const MODEL_ID = "eleven_multilingual_v2";

const VOICEOVER_TEXT = `Esto no es un juguete.
Es tu primer asistente de inteligencia artificial físico.
Lo ensamblas. Lo programas. Lo personalizas.
Con voz ElevenLabs, interfaz holográfica y cerebro conectado.
Tus llaves, tus datos y tu configuración permanecen bajo control local.
YARVIZ. Tu primer IA físico. Creado por ti.`;

async function generateVoiceover(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error("Error: ELEVENLABS_API_KEY environment variable is not set.");
    console.error("Set it with: export ELEVENLABS_API_KEY=your_key_here");
    process.exit(1);
  }

  const outputPath = path.resolve(__dirname, "../public/audio/yarviz-voiceover.mp3");

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  console.log("Generating YARVIZ voiceover via ElevenLabs...");
  console.log(`Voice ID: ${VOICE_ID}`);
  console.log(`Model: ${MODEL_ID}`);
  console.log(`Output: ${outputPath}`);

  const requestBody = JSON.stringify({
    text: VOICEOVER_TEXT,
    model_id: MODEL_ID,
    voice_settings: {
      stability: 0.65,
      similarity_boost: 0.82,
      style: 0.35,
      use_speaker_boost: true,
    },
  });

  // Use Node.js https to make the request
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.elevenlabs.io",
      path: `/v1/text-to-speech/${VOICE_ID}`,
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk.toString();
        });
        res.on("end", () => {
          reject(
            new Error(`ElevenLabs API error ${res.statusCode}: ${body}`)
          );
        });
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);

      fileStream.on("finish", () => {
        console.log(`✓ Voiceover saved to: ${outputPath}`);
        resolve();
      });

      fileStream.on("error", reject);
    });

    req.on("error", reject);
    req.write(requestBody);
    req.end();
  });
}

generateVoiceover().catch((err) => {
  console.error("Failed to generate voiceover:", err.message);
  process.exit(1);
});
