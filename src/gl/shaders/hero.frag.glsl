precision highp float;

uniform float uTime;
uniform float uScrollProgress;
uniform vec2  uMouse;
uniform vec2  uResolution;

varying vec2 vUv;

// ── Simplex noise 2D ──────────────────────────────────────────────────────────
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m * m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ── Layer 1: Perspective data grid ───────────────────────────────────────────
float dataGrid(vec2 uv, float t) {
  vec2 c = uv - 0.5;

  // Horizontal lines — denser toward bottom (perspective illusion)
  float perspY   = uv.y;
  float lineFreq = 14.0 * (1.0 - perspY * 0.65);
  float scroll   = mod(t * 0.12, 1.0);
  float hLines   = step(0.965, abs(sin((perspY * lineFreq + scroll) * 3.14159)));

  // Vertical lines — uniform
  float vLines = step(0.972, abs(sin(c.x * 18.0 * 3.14159)));

  // Fade edges + top
  float fade = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x)
             * smoothstep(1.0, 0.45, uv.y);

  return (hLines + vLines) * fade * 0.065;
}

// ── Layer 2: Particle field ───────────────────────────────────────────────────
float particles(vec2 uv, float t, vec2 mouse) {
  // Subtle cursor parallax on particle positions
  vec2 pos = uv + mouse * 0.018;
  float result = 0.0;

  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 drift = vec2(
      snoise(vec2(fi * 3.71, t * 0.09)),
      snoise(vec2(fi * 2.33 + 11.0, t * 0.07))
    ) * 0.35;

    vec2 center = vec2(fract(fi * 0.618 + 0.08), fract(fi * 0.382 + 0.12)) + drift;
    float dist  = length(pos - center);
    float pulse = 0.5 + 0.5 * sin(t * 1.3 + fi * 2.09);
    float r     = 0.004 + 0.003 * pulse;
    result += smoothstep(r, 0.0, dist) * (0.35 + 0.65 * pulse);
  }

  // Scattered noise sparkles
  float sparkle = smoothstep(0.78, 1.0, snoise(pos * 9.0 + t * 0.04)) * 0.28;

  return clamp(result + sparkle, 0.0, 1.0);
}

// ── Layer 3: Radial vignette ──────────────────────────────────────────────────
float vignette(vec2 uv, float scrollProg) {
  float dist      = length(uv - 0.5) * 2.0;
  float intensity = mix(0.28, 0.88, scrollProg);
  return smoothstep(0.38, 1.05, dist) * intensity;
}

// ── Main ──────────────────────────────────────────────────────────────────────
void main() {
  vec2 uv = vUv;

  vec3 bgColor     = vec3(0.035, 0.035, 0.043);  // #09090b
  vec3 indigoColor = vec3(0.388, 0.400, 0.945);  // #6366f1
  vec3 tealColor   = vec3(0.078, 0.722, 0.651);  // #14b8a6

  // Layer 1 — data grid
  float grid = dataGrid(uv, uTime);
  vec3 col   = bgColor + indigoColor * grid;

  // Layer 2 — particles
  float ptcl = particles(uv, uTime, uMouse);
  col += indigoColor * ptcl * 0.45;

  // Subtle teal tint on particle peaks
  col += tealColor * ptcl * 0.15;

  // Layer 3 — vignette
  float vig = vignette(uv, uScrollProgress);
  col = mix(col, vec3(0.0), vig);

  gl_FragColor = vec4(col, 1.0);
}
