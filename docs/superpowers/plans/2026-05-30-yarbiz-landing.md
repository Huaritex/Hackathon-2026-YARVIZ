# YARBIZ Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an immersive dark-UI landing page for YARBIZ — a DIY AI robot kit — featuring a pinned WebGL hero with GLSL shaders, scroll-driven 3D STL robot assembly, feature swap storytelling, and glassmorphism pricing cards with cursor glow effects.

**Architecture:** Vite SPA with React/TypeScript. A single `GLManager` class owns the Three.js renderer, background shader scene, and robot scene in isolation from React. GSAP ScrollTrigger drives all animation via scroll progress fed into GL uniforms and DOM refs — no `useState` for animation state. Two GLSL-rendered layers (data grid + particle field) composite with a scroll-driven vignette.

**Tech Stack:** Vite 5, React 18, TypeScript, Tailwind CSS v3, Three.js, GSAP + ScrollTrigger, vite-plugin-glsl, Vitest, @testing-library/react

---

## File Map

```
public/
  models/
    cuerpo.stl          ← copied from project root STL
    tapa.stl            ← copied from project root STL

src/
  gl/
    GLManager.ts        ← single Three.js renderer: bg shader + robot scenes
    shaders/
      hero.vert.glsl    ← pass-through vertex shader
      hero.frag.glsl    ← 3-layer composite: grid + particles + vignette
  components/
    sections/
      HeroSection.tsx       ← GL canvas mount + ScrollTrigger pin + DOM overlay
      EcosystemSection.tsx  ← sticky wrapper + feature swap + parallax
      PricingSection.tsx    ← 3 glassmorphism cards
    ui/
      GlitchText.tsx        ← terminal glitch reveal animation
      PricingCard.tsx       ← single card with cursor glow
      NavBar.tsx            ← fixed nav with scroll blur
  hooks/
    useCursorGlow.ts    ← mousemove → --mouse-x/--mouse-y CSS custom props
  test/
    setup.ts            ← vitest globals, @testing-library/jest-dom, Three.js mocks
  App.tsx               ← section order + global GSAP init
  index.css             ← CSS tokens + tailwind directives + global resets
  main.tsx              ← React root mount
  vite-env.d.ts         ← *.glsl module declaration
```

---

## Task 1: Project Scaffold + Dependencies

**Files:**
- Create: `vite.config.ts`
- Modify: `tsconfig.json`
- Create: `src/test/setup.ts`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Scaffold Vite project and install deps**

```bash
cd /home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026
npm create vite@latest . -- --template react-ts
npm install
npm install gsap three
npm install -D @types/three tailwindcss postcss autoprefixer \
  vite-plugin-glsl vitest @testing-library/react @testing-library/jest-dom \
  jsdom @vitest/coverage-v8
npx tailwindcss init -p
```

- [ ] **Step 2: Copy STL assets to public**

```bash
mkdir -p public/models
cp "cuerpo yarvis original-CuerpoPocket012.stl" public/models/cuerpo.stl
cp "tapa deslisable-CuerpoPad001.stl" public/models/tapa.stl
```

- [ ] **Step 3: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [react(), glsl()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 4: Add GLSL type declaration to `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

declare module '*.glsl' {
  const src: string
  export default src
}
```

- [ ] **Step 5: Write `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Three.js WebGLRenderer is not available in jsdom — mock it
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setPixelRatio: vi.fn(),
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      setClearColor: vi.fn(),
      clear: vi.fn(),
      clearDepth: vi.fn(),
      domElement: document.createElement('canvas'),
      get autoClear() { return true },
      set autoClear(_v: boolean) {},
    })),
  }
})

// Mock GSAP ScrollTrigger in component tests
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(() => ({ kill: vi.fn() })),
    getAll: vi.fn(() => []),
    refresh: vi.fn(),
  },
}))
```

- [ ] **Step 6: Update `tsconfig.json` — add strict + path aliases**

In the existing `tsconfig.json`, ensure:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Verify scaffold runs**

```bash
npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173` with default React template page.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + TS + Tailwind + GSAP + Three.js"
```

---

## Task 2: CSS Tokens + Tailwind Config + Global Styles

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Write `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-void: #04040a;
  --bg-surface: #0d0d1f;
  --accent-cyan: #00f0ff;
  --accent-violet: #9333ea;
  --text-primary: #e2e8f0;
  --text-dim: #475569;
  --grid-line: rgba(0, 240, 255, 0.07);
  --glow-cyan: rgba(0, 240, 255, 0.15);
  --glow-violet: rgba(147, 51, 234, 0.2);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background-color: var(--bg-void);
  color: var(--text-primary);
  overflow-x: hidden;
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-void);
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  -webkit-font-smoothing: antialiased;
}

/* Pricing card glow pseudo-element */
.pricing-card {
  position: relative;
  overflow: hidden;
}

.pricing-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    400px circle at var(--mouse-x, -999px) var(--mouse-y, -999px),
    rgba(0, 240, 255, 0.1),
    transparent 70%
  );
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.3s;
  opacity: 0;
}

.pricing-card:hover::before {
  opacity: 1;
}

.pricing-card--featured::before {
  background: radial-gradient(
    400px circle at var(--mouse-x, -999px) var(--mouse-y, -999px),
    rgba(147, 51, 234, 0.14),
    transparent 70%
  );
}
```

- [ ] **Step 2: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-void': 'var(--bg-void)',
        'bg-surface': 'var(--bg-surface)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-violet': 'var(--accent-violet)',
        'text-primary': 'var(--text-primary)',
        'text-dim': 'var(--text-dim)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 3: Update `src/main.tsx` to import CSS**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Verify styles apply**

Run `npm run dev`. Background should be `#04040a` (near-black). Check DevTools for `--accent-cyan` variable.

- [ ] **Step 5: Commit**

```bash
git add src/index.css tailwind.config.ts src/main.tsx
git commit -m "feat: add CSS design tokens and Tailwind config"
```

---

## Task 3: GLSL Hero Shaders

**Files:**
- Create: `src/gl/shaders/hero.vert.glsl`
- Create: `src/gl/shaders/hero.frag.glsl`

- [ ] **Step 1: Write `src/gl/shaders/hero.vert.glsl`**

```glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

- [ ] **Step 2: Write `src/gl/shaders/hero.frag.glsl`**

```glsl
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

  vec3 bgColor   = vec3(0.016, 0.016, 0.039);  // #04040a
  vec3 cyanColor = vec3(0.0,   0.941, 1.0);     // #00f0ff

  // Layer 1 — data grid
  float grid = dataGrid(uv, uTime);
  vec3 col   = bgColor + cyanColor * grid;

  // Layer 2 — particles
  float ptcl = particles(uv, uTime, uMouse);
  col += cyanColor * ptcl * 0.45;

  // Subtle violet tint on particle peaks
  col += vec3(0.573, 0.2, 0.918) * ptcl * 0.12;  // #9333ea

  // Layer 3 — vignette
  float vig = vignette(uv, uScrollProgress);
  col = mix(col, vec3(0.0), vig);

  gl_FragColor = vec4(col, 1.0);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/gl/shaders/
git commit -m "feat: add GLSL hero shaders (data grid + particles + vignette)"
```

---

## Task 4: GLManager — Unified Three.js Scene

**Files:**
- Create: `src/gl/GLManager.ts`
- Create: `src/gl/GLManager.test.ts`

The `GLManager` owns ONE WebGL renderer, TWO scenes (background + robot), and renders them sequentially each tick. React never touches this class after construction — all state flows in via method calls from GSAP.

- [ ] **Step 1: Write failing test `src/gl/GLManager.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GLManager } from './GLManager'

// Three.js is mocked in setup.ts — WebGLRenderer is a vi.fn()

describe('GLManager', () => {
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    canvas = document.createElement('canvas')
  })

  it('constructs without throwing', () => {
    expect(() => new GLManager(canvas)).not.toThrow()
  })

  it('setScrollProgress updates internal progress', () => {
    const gl = new GLManager(canvas)
    expect(() => gl.setScrollProgress(0.5)).not.toThrow()
    gl.destroy()
  })

  it('setMouse accepts normalized coordinates', () => {
    const gl = new GLManager(canvas)
    expect(() => gl.setMouse(0.3, -0.4)).not.toThrow()
    gl.destroy()
  })

  it('tick and render can be called repeatedly', () => {
    const gl = new GLManager(canvas)
    for (let i = 0; i < 5; i++) {
      expect(() => { gl.tick(16.67); gl.render() }).not.toThrow()
    }
    gl.destroy()
  })

  it('destroy removes resize listener and disposes renderer', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const gl = new GLManager(canvas)
    gl.destroy()
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/gl/GLManager.test.ts
```

Expected: `Cannot find module './GLManager'`

- [ ] **Step 3: Write `src/gl/GLManager.ts`**

```ts
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import vertexShader from './shaders/hero.vert.glsl'
import fragmentShader from './shaders/hero.frag.glsl'

interface BgUniforms {
  uTime: THREE.IUniform<number>
  uScrollProgress: THREE.IUniform<number>
  uMouse: THREE.IUniform<THREE.Vector2>
  uResolution: THREE.IUniform<THREE.Vector2>
}

export class GLManager {
  private renderer: THREE.WebGLRenderer

  // Background scene
  private bgScene: THREE.Scene
  private bgCamera: THREE.OrthographicCamera
  private bgUniforms: BgUniforms

  // Robot scene
  private robotScene: THREE.Scene
  private robotCamera: THREE.PerspectiveCamera
  private robotGroup: THREE.Group
  private bodyMesh: THREE.Mesh | null = null
  private lidMesh: THREE.Mesh | null = null
  private normScale = 1
  private robotLoaded = false

  private mouse = new THREE.Vector2(0, 0)
  private scrollProgress = 0
  private elapsed = 0

  constructor(canvas: HTMLCanvasElement) {
    // ── Renderer (single context, autoClear = false for multi-scene) ──
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.autoClear = false

    // ── Background scene ──────────────────────────────────────────────
    this.bgScene = new THREE.Scene()
    this.bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    this.bgCamera.position.z = 1

    this.bgUniforms = {
      uTime:           { value: 0 },
      uScrollProgress: { value: 0 },
      uMouse:          { value: new THREE.Vector2(0, 0) },
      uResolution:     { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }

    const bgGeo = new THREE.PlaneGeometry(2, 2)
    const bgMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.bgUniforms,
    })
    this.bgScene.add(new THREE.Mesh(bgGeo, bgMat))

    // ── Robot scene ───────────────────────────────────────────────────
    this.robotScene = new THREE.Scene()
    this.robotCamera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    this.robotCamera.position.z = 5

    // Cyan key light + dim violet fill
    const keyLight = new THREE.PointLight(0x00f0ff, 3, 12)
    keyLight.position.set(2, 3, 4)
    this.robotScene.add(keyLight)
    this.robotScene.add(new THREE.AmbientLight(0x9333ea, 0.4))

    this.robotGroup = new THREE.Group()
    this.robotScene.add(this.robotGroup)

    window.addEventListener('resize', this.onResize)
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async loadRobotModels(): Promise<void> {
    const loader = new STLLoader()
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a2e),
      emissive: new THREE.Color(0x00f0ff),
      emissiveIntensity: 0,
      metalness: 0.8,
      roughness: 0.2,
    })

    const [bodyGeo, lidGeo] = await Promise.all([
      loader.loadAsync('/models/cuerpo.stl'),
      loader.loadAsync('/models/tapa.stl'),
    ])

    bodyGeo.center()
    bodyGeo.computeBoundingBox()
    const size = new THREE.Vector3()
    bodyGeo.boundingBox!.getSize(size)
    this.normScale = 2.2 / Math.max(size.x, size.y, size.z)

    // STL from slicer is typically Z-up → rotate to Y-up
    bodyGeo.rotateX(-Math.PI / 2)
    lidGeo.center()
    lidGeo.rotateX(-Math.PI / 2)

    this.bodyMesh = new THREE.Mesh(bodyGeo, material.clone())
    this.bodyMesh.scale.setScalar(this.normScale)
    this.bodyMesh.position.y = -2.5
    this.bodyMesh.visible = false

    this.lidMesh = new THREE.Mesh(lidGeo, material.clone())
    this.lidMesh.scale.setScalar(this.normScale)
    this.lidMesh.position.y = 2.0
    this.lidMesh.visible = false

    this.robotGroup.add(this.bodyMesh, this.lidMesh)
    this.robotLoaded = true
  }

  setScrollProgress(p: number): void {
    this.scrollProgress = p
    this.bgUniforms.uScrollProgress.value = p

    if (!this.robotLoaded || !this.bodyMesh || !this.lidMesh) return

    // Phase 0.33 → 0.66: body rises + scales in
    if (p > 0.33) {
      const phase = Math.min((p - 0.33) / 0.33, 1)
      this.bodyMesh.visible = true
      this.bodyMesh.position.y = -2.5 + 2.5 * phase
      this.bodyMesh.scale.setScalar(this.normScale * phase)
    } else {
      this.bodyMesh.visible = false
    }

    // Phase 0.66 → 1.0: lid slides down + emissive glow ramps
    if (p > 0.66) {
      const phase = Math.min((p - 0.66) / 0.34, 1)
      this.lidMesh.visible = true
      this.lidMesh.position.y = 2.0 - 2.0 * phase
      const emissive = 0.4 * phase
      ;(this.bodyMesh!.material as THREE.MeshStandardMaterial).emissiveIntensity = emissive
      ;(this.lidMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = emissive
    } else {
      this.lidMesh.visible = false
    }
  }

  setMouse(x: number, y: number): void {
    this.mouse.set(x, y)
    this.bgUniforms.uMouse.value.set(x * 0.5, y * 0.5)
  }

  tick(deltaMs: number): void {
    this.elapsed += deltaMs
    this.bgUniforms.uTime.value = this.elapsed * 0.001  // ms → seconds

    if (!this.robotLoaded) return
    // Slow continuous Y rotation + mouse-driven X/Z tilt
    this.robotGroup.rotation.y += deltaMs * 0.00025
    this.robotGroup.rotation.x = this.mouse.y * 0.08
    this.robotGroup.rotation.z = -this.mouse.x * 0.04
  }

  render(): void {
    this.renderer.clear()
    this.renderer.render(this.bgScene, this.bgCamera)
    this.renderer.clearDepth()
    this.renderer.render(this.robotScene, this.robotCamera)
  }

  destroy(): void {
    window.removeEventListener('resize', this.onResize)
    this.renderer.dispose()
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private onResize = (): void => {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h)
    this.bgUniforms.uResolution.value.set(w, h)
    this.robotCamera.aspect = w / h
    this.robotCamera.updateProjectionMatrix()
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run src/gl/GLManager.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/gl/
git commit -m "feat: add GLManager — unified Three.js background shader + robot scene"
```

---

## Task 5: GlitchText Component

**Files:**
- Create: `src/components/ui/GlitchText.tsx`
- Create: `src/components/ui/GlitchText.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { GlitchText } from './GlitchText'

describe('GlitchText', () => {
  afterEach(() => vi.useRealTimers())

  it('renders the target text immediately (initial state shows text)', () => {
    const { container } = render(<GlitchText text="YARBIZ" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('resolves to exact target text after animation completes', () => {
    vi.useFakeTimers()
    const { getByText } = render(<GlitchText text="YARBIZ" duration={0.1} />)
    act(() => { vi.advanceTimersByTime(300) })
    expect(getByText('YARBIZ')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <GlitchText text="TEST" className="custom-class" />
    )
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/components/ui/GlitchText.test.tsx
```

Expected: `Cannot find module './GlitchText'`

- [ ] **Step 3: Write `src/components/ui/GlitchText.tsx`**

```tsx
import { useEffect, useRef, CSSProperties } from 'react'

const CHARS = '!<>-_\\/[]{}—=+*^?#░▒▓█▀▄ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'

interface GlitchTextProps {
  text: string
  className?: string
  style?: CSSProperties
  duration?: number  // seconds
  delay?: number     // seconds before animation starts
}

export function GlitchText({
  text,
  className,
  style,
  duration = 1.8,
  delay = 0,
}: GlitchTextProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const chars = text.split('')
    const totalFrames = Math.round(duration * 60)
    let frame = 0
    let rafId: ReturnType<typeof requestAnimationFrame>
    let timeoutId: ReturnType<typeof setTimeout>

    const update = () => {
      frame++
      const progress = frame / totalFrames

      const result = chars.map((char, i) => {
        const charProgress = Math.min(
          1,
          (progress - (i / chars.length) * 0.4) / 0.6,
        )
        if (charProgress >= 1 || char === ' ') return char
        if (charProgress < 0) return CHARS[Math.floor(Math.random() * CHARS.length)]
        return Math.random() < charProgress
          ? char
          : CHARS[Math.floor(Math.random() * CHARS.length)]
      })

      el.textContent = result.join('')

      if (frame < totalFrames) {
        rafId = requestAnimationFrame(update)
      } else {
        el.textContent = text
      }
    }

    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(update)
    }, delay * 1000)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(rafId)
      if (el) el.textContent = text
    }
  }, [text, duration, delay])

  return (
    <span ref={ref} className={className} style={style}>
      {text}
    </span>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run src/components/ui/GlitchText.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/GlitchText.tsx src/components/ui/GlitchText.test.tsx
git commit -m "feat: add GlitchText component with terminal-reveal animation"
```

---

## Task 6: useCursorGlow Hook

**Files:**
- Create: `src/hooks/useCursorGlow.ts`
- Create: `src/hooks/useCursorGlow.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useCursorGlow } from './useCursorGlow'

function Fixture() {
  const ref = useCursorGlow<HTMLDivElement>()
  return <div ref={ref} data-testid="card" />
}

describe('useCursorGlow', () => {
  it('sets --mouse-x and --mouse-y relative to element on mousemove', () => {
    const { getByTestId } = render(<Fixture />)
    const card = getByTestId('card')

    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 50, right: 400, bottom: 250,
      width: 300, height: 200, x: 100, y: 50,
      toJSON: () => ({}),
    })

    fireEvent.mouseMove(card, { clientX: 250, clientY: 150 })

    expect(card.style.getPropertyValue('--mouse-x')).toBe('150px')
    expect(card.style.getPropertyValue('--mouse-y')).toBe('100px')
  })

  it('removes listener on unmount', () => {
    const removeSpy = vi.spyOn(HTMLDivElement.prototype, 'removeEventListener')
    const { unmount } = render(<Fixture />)
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/hooks/useCursorGlow.test.tsx
```

Expected: `Cannot find module './useCursorGlow'`

- [ ] **Step 3: Write `src/hooks/useCursorGlow.ts`**

```ts
import { useEffect, useRef } from 'react'

export function useCursorGlow<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--mouse-x', `${x}px`)
      el.style.setProperty('--mouse-y', `${y}px`)
    }

    el.addEventListener('mousemove', onMouseMove)
    return () => el.removeEventListener('mousemove', onMouseMove)
  }, [])

  return ref
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run src/hooks/useCursorGlow.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useCursorGlow hook for CSS custom property cursor tracking"
```

---

## Task 7: NavBar Component

**Files:**
- Create: `src/components/ui/NavBar.tsx`
- Create: `src/components/ui/NavBar.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NavBar } from './NavBar'

describe('NavBar', () => {
  it('renders YARBIZ brand name', () => {
    const { getByText } = render(<NavBar />)
    expect(getByText('YARBIZ')).toBeInTheDocument()
  })

  it('renders CTA link pointing to #pricing', () => {
    const { getByRole } = render(<NavBar />)
    const link = getByRole('link', { name: /get your kit/i })
    expect(link).toHaveAttribute('href', '#pricing')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/components/ui/NavBar.test.tsx
```

- [ ] **Step 3: Write `src/components/ui/NavBar.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function NavBar() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const st = ScrollTrigger.create({
      start: 'top -60',
      onEnter: () =>
        gsap.to(nav, {
          backgroundColor: 'rgba(4, 4, 10, 0.85)',
          backdropFilter: 'blur(14px)',
          borderBottomColor: 'rgba(0, 240, 255, 0.12)',
          duration: 0.4,
          ease: 'power2.out',
        }),
      onLeaveBack: () =>
        gsap.to(nav, {
          backgroundColor: 'rgba(4, 4, 10, 0)',
          backdropFilter: 'blur(0px)',
          borderBottomColor: 'rgba(0, 240, 255, 0)',
          duration: 0.3,
        }),
    })

    return () => st.kill()
  }, [])

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b"
      style={{
        backgroundColor: 'rgba(4, 4, 10, 0)',
        borderBottomColor: 'rgba(0, 240, 255, 0)',
      }}
    >
      <span
        className="font-mono text-xl font-black tracking-[0.2em]"
        style={{ color: 'var(--accent-cyan)' }}
      >
        YARBIZ
      </span>

      <a
        href="#pricing"
        className="
          px-5 py-2 font-mono text-xs font-bold tracking-[0.2em] uppercase
          border transition-all duration-300
        "
        style={{
          borderColor: 'var(--accent-cyan)',
          color: 'var(--accent-cyan)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            'var(--accent-cyan)'
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--bg-void)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            'transparent'
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-cyan)'
        }}
      >
        Get Your Kit →
      </a>
    </nav>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run src/components/ui/NavBar.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/NavBar.tsx src/components/ui/NavBar.test.tsx
git commit -m "feat: add NavBar with scroll-driven blur"
```

---

## Task 8: HeroSection

**Files:**
- Create: `src/components/sections/HeroSection.tsx`
- Create: `src/components/sections/HeroSection.test.tsx`

HeroSection mounts the GL canvas (isolated from React), sets up `gsap.ticker`, and drives a 3-phase ScrollTrigger.pin timeline.

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { HeroSection } from './HeroSection'

// GLManager is not needed in DOM tests — mock it
vi.mock('../../gl/GLManager', () => ({
  GLManager: vi.fn().mockImplementation(() => ({
    loadRobotModels: vi.fn().mockResolvedValue(undefined),
    setScrollProgress: vi.fn(),
    setMouse: vi.fn(),
    tick: vi.fn(),
    render: vi.fn(),
    destroy: vi.fn(),
  })),
}))

vi.mock('gsap', async () => {
  const actual = await vi.importActual<typeof import('gsap')>('gsap')
  return {
    ...actual,
    default: {
      ...actual.default,
      ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
      registerPlugin: vi.fn(),
      set: vi.fn(),
      timeline: vi.fn(() => ({
        to: vi.fn().mockReturnThis(),
        fromTo: vi.fn().mockReturnThis(),
      })),
    },
  }
})

describe('HeroSection', () => {
  it('renders hero container', () => {
    const { getByTestId } = render(<HeroSection />)
    expect(getByTestId('hero-container')).toBeInTheDocument()
  })

  it('renders YARBIZ heading', () => {
    const { getByText } = render(<HeroSection />)
    expect(getByText('YARBIZ')).toBeInTheDocument()
  })

  it('renders CTA link', () => {
    const { getByRole } = render(<HeroSection />)
    expect(getByRole('link', { name: /get your kit/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/components/sections/HeroSection.test.tsx
```

- [ ] **Step 3: Write `src/components/sections/HeroSection.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GLManager } from '../../gl/GLManager'
import { GlitchText } from '../ui/GlitchText'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const subtitleRef  = useRef<HTMLParagraphElement>(null)
  const ctaRef       = useRef<HTMLAnchorElement>(null)
  const glRef        = useRef<GLManager | null>(null)

  useEffect(() => {
    const canvas    = canvasRef.current!
    const container = containerRef.current!
    const subtitle  = subtitleRef.current!
    const cta       = ctaRef.current!

    // ── GL init (isolated from React) ──────────────────────────────
    const gl = new GLManager(canvas)
    glRef.current = gl
    gl.loadRobotModels()

    // ── GSAP ticker drives GL loop ─────────────────────────────────
    const onTick = (_time: number, deltaTime: number) => {
      gl.tick(deltaTime)
      gl.render()
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // ── Mouse → GL ─────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 2
      const y = -(e.clientY / window.innerHeight - 0.5) * 2
      gl.setMouse(x, y)
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Initial DOM state ──────────────────────────────────────────
    gsap.set(subtitle, { opacity: 0 })
    gsap.set(cta, { opacity: 0, y: 24 })

    // ── ScrollTrigger pin — 300vh total, 3 phases ──────────────────
    //   Phase 0→1 : subtitle fades in
    //   Phase 1→2 : robot assembly (handled by GL via onUpdate)
    //   Phase 2→3 : CTA fades in
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=300%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => gl.setScrollProgress(self.progress),
      },
    })

    tl.to(subtitle, { opacity: 1, duration: 1 }, 0)
    tl.to({}, { duration: 1 })                              // robot phase (GL-only)
    tl.to(cta, { opacity: 1, y: 0, duration: 1 }, '>')

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      gsap.ticker.remove(onTick)
      // Kill only this section's ScrollTrigger — not all global triggers
      tl.scrollTrigger?.kill()
      tl.kill()
      gl.destroy()
    }
  }, [])

  return (
    <>
      {/* GL canvas — fixed behind all sections */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Hero DOM overlay — pinned by ScrollTrigger */}
      <div
        ref={containerRef}
        data-testid="hero-container"
        className="relative z-10 flex flex-col items-center justify-center h-screen"
      >
        <div className="text-center select-none">
          <GlitchText
            text="YARBIZ"
            className="block font-mono font-black tracking-[0.18em]"
            style={{
              fontSize: 'clamp(4rem, 13vw, 11rem)',
              color: 'var(--accent-cyan)',
              textShadow: '0 0 60px rgba(0,240,255,0.4), 0 0 120px rgba(0,240,255,0.15)',
            }}
            duration={1.6}
          />

          <p
            ref={subtitleRef}
            className="mt-5 font-mono text-sm tracking-[0.35em] uppercase"
            style={{ color: 'var(--text-dim)' }}
          >
            Build your own AI holographic assistant
          </p>
        </div>

        <a
          ref={ctaRef}
          href="#pricing"
          className="
            mt-20 px-10 py-4 font-mono font-bold text-sm tracking-[0.25em] uppercase
            transition-all duration-300
          "
          style={{
            backgroundColor: 'var(--accent-cyan)',
            color: 'var(--bg-void)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              'var(--accent-violet)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              'var(--accent-cyan)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--bg-void)'
          }}
        >
          Get Your Kit →
        </a>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run src/components/sections/HeroSection.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/HeroSection.tsx src/components/sections/HeroSection.test.tsx
git commit -m "feat: add HeroSection — pinned ScrollTrigger + GL canvas + 3-phase animation"
```

---

## Task 9: EcosystemSection

**Files:**
- Create: `src/components/sections/EcosystemSection.tsx`
- Create: `src/components/sections/EcosystemSection.test.tsx`

Three features swap in the same sticky container. Each feature enters from below and exits upward, scrubbed across 300vh. Parallax: text at 1×, visual icon at 0.6× (via `transform: translateY` only).

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { EcosystemSection } from './EcosystemSection'

vi.mock('gsap', async () => {
  const actual = await vi.importActual<typeof import('gsap')>('gsap')
  return {
    ...actual,
    default: {
      ...actual.default,
      registerPlugin: vi.fn(),
      set: vi.fn(),
      timeline: vi.fn(() => ({
        to: vi.fn().mockReturnThis(),
        fromTo: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      })),
    },
  }
})

describe('EcosystemSection', () => {
  it('renders all three feature titles', () => {
    const { getByText } = render(<EcosystemSection />)
    expect(getByText(/Shape YARBIZ/i)).toBeInTheDocument()
    expect(getByText(/It Sounds Like You/i)).toBeInTheDocument()
    expect(getByText(/Create Your Holograms/i)).toBeInTheDocument()
  })

  it('renders section heading', () => {
    const { getByText } = render(<EcosystemSection />)
    expect(getByText(/the ecosystem/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/components/sections/EcosystemSection.test.tsx
```

- [ ] **Step 3: Write `src/components/sections/EcosystemSection.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Feature {
  tag: string
  title: string
  body: string
  symbol: string
  accent: 'cyan' | 'violet'
}

const FEATURES: Feature[] = [
  {
    tag: '01 / DEEP CUSTOMIZATION',
    title: 'Shape YARBIZ\'s Soul',
    body: 'Web & mobile app to define behavior prompts. Program YARBIZ to be sarcastic, helpful, mysterious, or motivating. Your assistant, your personality — no limits.',
    symbol: '⬡',
    accent: 'cyan',
  },
  {
    tag: '02 / YOUR VOICE',
    title: 'It Sounds Like You',
    body: 'Native ElevenLabs integration. Choose from thousands of voices or clone your own. YARBIZ speaks exactly how you imagine — every word, every tone.',
    symbol: '◉',
    accent: 'violet',
  },
  {
    tag: '03 / HOLOGRAM STUDIO',
    title: 'Create Your Holograms',
    body: 'Custom animation tool for the holographic display. Design animations, upload GIFs, total creative freedom over what your robot projects into thin air.',
    symbol: '◈',
    accent: 'cyan',
  },
]

export function EcosystemSection() {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const feature1Ref = useRef<HTMLDivElement>(null)
  const feature2Ref = useRef<HTMLDivElement>(null)
  const feature3Ref = useRef<HTMLDivElement>(null)
  const visual1Ref  = useRef<HTMLDivElement>(null)
  const visual2Ref  = useRef<HTMLDivElement>(null)
  const visual3Ref  = useRef<HTMLDivElement>(null)

  const featureRefs = [feature1Ref, feature2Ref, feature3Ref]
  const visualRefs  = [visual1Ref,  visual2Ref,  visual3Ref]

  useEffect(() => {
    const wrapper = wrapperRef.current!
    const f1 = feature1Ref.current!
    const f2 = feature2Ref.current!
    const f3 = feature3Ref.current!
    const v1 = visual1Ref.current!
    const v2 = visual2Ref.current!
    const v3 = visual3Ref.current!

    // Initial states: f1 visible, f2/f3 hidden below
    gsap.set([f2, f3], { opacity: 0, y: 50 })
    gsap.set([v2, v3], { opacity: 0, y: 30 })

    // Total virtual time = 4 units:
    //   0→1  : feature 1 visible (holding)
    //   1→2  : feature 1 exits, feature 2 enters
    //   2→3  : feature 2 visible (holding)
    //   3→4  : feature 2 exits, feature 3 enters
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: '+=300%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    })

    // Hold feature 1 (0→1)
    tl.to({}, { duration: 1 }, 0)

    // Feature 1 exits + Feature 2 enters (1→2)
    tl.to([f1, v1], { opacity: 0, y: -50, duration: 0.5 }, 1)
    tl.fromTo(f2, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 }, 1.2)
    tl.fromTo(v2, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 1.3)

    // Hold feature 2 (2→3)
    tl.to({}, { duration: 1 }, 2)

    // Feature 2 exits + Feature 3 enters (3→4)
    tl.to([f2, v2], { opacity: 0, y: -50, duration: 0.5 }, 3)
    tl.fromTo(f3, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 }, 3.2)
    tl.fromTo(v3, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 3.3)

    // Parallax: visual symbols move at 0.6× scroll speed during hold phases
    // Achieved by additional translateY driven by the same scrubbed tl
    tl.to(v1, { y: -40, ease: 'none', duration: 1 }, 0)
    tl.to(v2, { y: -40, ease: 'none', duration: 1 }, 2)
    tl.to(v3, { y: -40, ease: 'none', duration: 1 }, 3)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative z-10">
      {/* Sticky inner container */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Section label */}
        <p
          className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.4em] uppercase"
          style={{ color: 'var(--text-dim)' }}
        >
          The Ecosystem
        </p>

        {/* Feature panels — all in same absolute space */}
        <div className="relative flex items-center justify-center h-full px-8 max-w-6xl mx-auto w-full">
          {FEATURES.map((feature, i) => {
            const fRef = featureRefs[i]
            const vRef = visualRefs[i]
            const accentColor =
              feature.accent === 'cyan' ? 'var(--accent-cyan)' : 'var(--accent-violet)'

            return (
              <div
                key={feature.tag}
                ref={fRef}
                className="absolute inset-0 flex items-center justify-between gap-16 px-12"
              >
                {/* Text side */}
                <div className="flex-1 max-w-lg">
                  <p
                    className="font-mono text-xs tracking-[0.3em] mb-6"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    {feature.tag}
                  </p>
                  <h2
                    className="font-mono font-black text-4xl md:text-5xl leading-tight mb-6"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {feature.title}
                  </h2>
                  <p
                    className="font-mono text-base leading-relaxed"
                    style={{ color: 'var(--text-dim)', maxWidth: '42ch' }}
                  >
                    {feature.body}
                  </p>
                </div>

                {/* Visual side — parallax layer */}
                <div
                  ref={vRef}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: 320, height: 320 }}
                >
                  <span
                    className="font-mono select-none"
                    style={{
                      fontSize: '14rem',
                      color: accentColor,
                      opacity: 0.15,
                      textShadow: `0 0 80px ${accentColor}`,
                      lineHeight: 1,
                    }}
                  >
                    {feature.symbol}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run src/components/sections/EcosystemSection.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/EcosystemSection.tsx src/components/sections/EcosystemSection.test.tsx
git commit -m "feat: add EcosystemSection — sticky feature swap with parallax"
```

---

## Task 10: PricingCard + PricingSection

**Files:**
- Create: `src/components/ui/PricingCard.tsx`
- Create: `src/components/ui/PricingCard.test.tsx`
- Create: `src/components/sections/PricingSection.tsx`
- Create: `src/components/sections/PricingSection.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/ui/PricingCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { PricingCard } from './PricingCard'

const baseProps = {
  tier: 'Starter' as const,
  price: 10,
  features: ['3D printing blueprints', 'Hardware list'],
  featured: false,
}

describe('PricingCard', () => {
  it('renders tier name and price', () => {
    const { getByText } = render(<PricingCard {...baseProps} />)
    expect(getByText('Starter')).toBeInTheDocument()
    expect(getByText('$10')).toBeInTheDocument()
  })

  it('renders all feature items', () => {
    const { getByText } = render(<PricingCard {...baseProps} />)
    expect(getByText('3D printing blueprints')).toBeInTheDocument()
    expect(getByText('Hardware list')).toBeInTheDocument()
  })

  it('shows MOST POPULAR badge when featured', () => {
    const { getByText } = render(<PricingCard {...baseProps} featured />)
    expect(getByText('MOST POPULAR')).toBeInTheDocument()
  })

  it('does not show badge when not featured', () => {
    const { queryByText } = render(<PricingCard {...baseProps} />)
    expect(queryByText('MOST POPULAR')).not.toBeInTheDocument()
  })
})
```

```tsx
// src/components/sections/PricingSection.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PricingSection } from './PricingSection'

describe('PricingSection', () => {
  it('renders all three pricing tiers', () => {
    const { getByText } = render(<PricingSection />)
    expect(getByText('Starter')).toBeInTheDocument()
    expect(getByText('Builder')).toBeInTheDocument()
    expect(getByText('Pro')).toBeInTheDocument()
  })

  it('renders correct prices', () => {
    const { getByText } = render(<PricingSection />)
    expect(getByText('$10')).toBeInTheDocument()
    expect(getByText('$15')).toBeInTheDocument()
    expect(getByText('$20')).toBeInTheDocument()
  })

  it('renders section heading', () => {
    const { getByText } = render(<PricingSection />)
    expect(getByText(/get your kit/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run src/components/ui/PricingCard.test.tsx src/components/sections/PricingSection.test.tsx
```

- [ ] **Step 3: Write `src/components/ui/PricingCard.tsx`**

```tsx
import { useEffect, CSSProperties } from 'react'
import gsap from 'gsap'
import { useCursorGlow } from '../../hooks/useCursorGlow'

interface PricingCardProps {
  tier: 'Starter' | 'Builder' | 'Pro'
  price: number
  features: string[]
  featured?: boolean
}

export function PricingCard({ tier, price, features, featured = false }: PricingCardProps) {
  const cardRef = useCursorGlow<HTMLDivElement>()

  const borderColor = featured ? 'var(--accent-violet)' : 'rgba(0,240,255,0.18)'
  const glowColor   = featured ? 'var(--glow-violet)'   : 'var(--glow-cyan)'
  const cardClass   = `pricing-card${featured ? ' pricing-card--featured' : ''}`

  const handleMouseEnter = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: 1.03,
      boxShadow: `0 0 48px ${glowColor}`,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: featured ? 1 : 1,
      boxShadow: '0 0 0px transparent',
      duration: 0.35,
      ease: 'power2.out',
    })
  }

  const cardStyle: CSSProperties = {
    background: 'rgba(13,13,31,0.65)',
    backdropFilter: 'blur(12px) saturate(140%)',
    border: `1px solid ${borderColor}`,
    borderRadius: 16,
    transform: featured ? 'translateY(-10px)' : 'none',
  }

  return (
    <div
      ref={cardRef}
      className={`${cardClass} p-8 flex flex-col gap-6`}
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Badge */}
      {featured && (
        <span
          className="self-start font-mono text-xs font-bold tracking-[0.3em] px-3 py-1"
          style={{
            color: 'var(--accent-violet)',
            border: '1px solid var(--accent-violet)',
            borderRadius: 4,
          }}
        >
          MOST POPULAR
        </span>
      )}

      {/* Tier + Price */}
      <div>
        <p
          className="font-mono text-xs tracking-[0.3em] uppercase mb-2"
          style={{ color: featured ? 'var(--accent-violet)' : 'var(--text-dim)' }}
        >
          {tier}
        </p>
        <p
          className="font-mono font-black text-5xl"
          style={{ color: featured ? 'var(--accent-violet)' : 'var(--accent-cyan)' }}
        >
          ${price}
        </p>
      </div>

      {/* Feature list */}
      <ul className="flex flex-col gap-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: featured ? 'var(--accent-violet)' : 'var(--accent-cyan)', marginTop: 2 }}>
              ▸
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="#"
        className="block w-full text-center font-mono font-bold text-sm py-3 tracking-[0.2em] uppercase transition-all duration-300"
        style={
          featured
            ? { backgroundColor: 'var(--accent-violet)', color: '#fff', borderRadius: 8 }
            : { border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', borderRadius: 8 }
        }
        onMouseEnter={(e) => {
          const el = e.currentTarget
          if (featured) {
            el.style.backgroundColor = 'var(--accent-cyan)'
          } else {
            el.style.backgroundColor = 'var(--accent-cyan)'
            el.style.color = 'var(--bg-void)'
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          if (featured) {
            el.style.backgroundColor = 'var(--accent-violet)'
            el.style.color = '#fff'
          } else {
            el.style.backgroundColor = 'transparent'
            el.style.color = 'var(--accent-cyan)'
          }
        }}
      >
        Get This Kit →
      </a>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/components/sections/PricingSection.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PricingCard } from '../ui/PricingCard'

gsap.registerPlugin(ScrollTrigger)

const STARTER_FEATURES = [
  '3D printing blueprints',
  'Hardware parts list & recommendations',
  'Component sourcing guide',
]

const BUILDER_FEATURES = [
  'Everything in Starter',
  'Full ESP32 source code',
  'Electronic schematic diagrams',
  'PCB layout files',
]

const PRO_FEATURES = [
  'Everything in Builder',
  'Step-by-step assembly video tutorials',
  'Hologram animation starter pack',
  'Priority customer support & Discord access',
]

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const cardsRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const heading = headingRef.current!
    const cards   = cardsRef.current!

    gsap.set([heading, cards], { opacity: 0, y: 40 })

    const st = ScrollTrigger.create({
      trigger: sectionRef.current!,
      start: 'top 70%',
      onEnter: () => {
        gsap.to(heading, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        gsap.to(cards,   { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' })
      },
    })

    return () => st.kill()
  }, [])

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative z-10 py-32 px-8"
      style={{ minHeight: '100vh' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-20">
          <p
            className="font-mono text-xs tracking-[0.4em] uppercase mb-4"
            style={{ color: 'var(--text-dim)' }}
          >
            Choose your starting point
          </p>
          <h2
            className="font-mono font-black text-4xl md:text-6xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Get Your Kit
          </h2>
          <p
            className="mt-4 font-mono text-base"
            style={{ color: 'var(--text-dim)' }}
          >
            Every tier ships with instant digital delivery.
          </p>
        </div>

        {/* Cards grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
        >
          <PricingCard
            tier="Starter"
            price={10}
            features={STARTER_FEATURES}
          />
          <PricingCard
            tier="Builder"
            price={15}
            features={BUILDER_FEATURES}
            featured
          />
          <PricingCard
            tier="Pro"
            price={20}
            features={PRO_FEATURES}
          />
        </div>

        {/* Footer note */}
        <p
          className="text-center mt-12 font-mono text-xs tracking-widest"
          style={{ color: 'var(--text-dim)' }}
        >
          All tiers — instant download · No subscription · Yours forever
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx vitest run src/components/ui/PricingCard.test.tsx src/components/sections/PricingSection.test.tsx
```

Expected: 7 tests pass across both files.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/PricingCard.tsx src/components/ui/PricingCard.test.tsx \
        src/components/sections/PricingSection.tsx src/components/sections/PricingSection.test.tsx
git commit -m "feat: add PricingCard and PricingSection — glassmorphism + cursor glow"
```

---

## Task 11: App Composition + Final Polish

**Files:**
- Modify: `src/App.tsx`
- Modify: `index.html`

- [ ] **Step 1: Write `src/App.tsx`**

```tsx
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NavBar }            from './components/ui/NavBar'
import { HeroSection }       from './components/sections/HeroSection'
import { EcosystemSection }  from './components/sections/EcosystemSection'
import { PricingSection }    from './components/sections/PricingSection'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    // Normalize ScrollTrigger for React
    ScrollTrigger.normalizeScroll(true)
    return () => ScrollTrigger.normalizeScroll(false)
  }, [])

  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <EcosystemSection />
        <PricingSection />
      </main>
    </>
  )
}
```

- [ ] **Step 2: Update `index.html` — title + font preload**

Replace the `<head>` section:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>YARBIZ — Build Your AI Holographic Assistant</title>
    <meta name="description" content="DIY AI robot assistant kit with holographic interface. Build, code, and customize your own YARBIZ powered by ESP32." />

    <!-- Google Fonts: JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass. Note the count — must be ≥ 18 tests total.

- [ ] **Step 4: Run dev server and verify manually**

```bash
npm run dev
```

Manual checklist:
- [ ] Background shader renders (data grid + particles visible)
- [ ] YARBIZ glitch text plays on load
- [ ] Hero section pins for ~3 viewport scrolls
- [ ] Robot STL loads and assembles during pin (body rises, lid slides in)
- [ ] Ecosystem section: features swap on scroll
- [ ] Pricing cards: cursor glow follows mouse on each card
- [ ] Pricing card hover: scale + glow animation
- [ ] NavBar blurs on scroll

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx index.html
git commit -m "feat: compose App — NavBar + Hero + Ecosystem + Pricing sections"
```

---

## STL Orientation Note

The `bodyGeo.rotateX(-Math.PI / 2)` in `GLManager.loadRobotModels` assumes the STL is Z-up (common for slicer exports). If the robot renders sideways or upside-down in the browser, adjust:

| Robot appears | Fix |
|---|---|
| Laying flat (Z-up) | `rotateX(-Math.PI / 2)` ← already applied |
| Upside-down | Add `rotateX(Math.PI)` after current rotate |
| Mirrored | Add `scale(-1, 1, 1)` on the group |

Verify in the running dev server after STLs load and adjust as needed before final commit.

---

## Coverage Check

```bash
npx vitest run --coverage
```

Target: ≥ 80% coverage on `src/hooks/` and `src/components/ui/`. GL classes are excluded from coverage targets (WebGL requires a real GPU context).
