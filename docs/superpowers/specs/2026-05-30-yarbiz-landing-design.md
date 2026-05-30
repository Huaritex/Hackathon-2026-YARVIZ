# YARBIZ Landing Page — Design Spec
**Date:** 2026-05-30  
**Stack:** Vite + React + TypeScript + Tailwind CSS  
**Status:** Approved

---

## 1. Product Context

YARBIZ is a physical AI robot assistant with a holographic interface powered by an ESP32. Business model: DIY kits sold to teenagers and high-school students entering the tech world. The landing page is an **experience**, not a document — the user should feel it, not read it.

**Aesthetic direction:** Dark UI — Mr. Robot meets high-impact anime (Blue Lock energy). Cold, intense, premium. No warm accents, no green matrix clichés.

---

## 2. Color System

| Token | Value | Role |
|---|---|---|
| `--bg-void` | `#04040a` | Page background (black with blue undertone) |
| `--bg-surface` | `#0d0d1f` | Cards, panels, overlays |
| `--accent-cyan` | `#00f0ff` | Primary accent — glows, active borders, CTAs |
| `--accent-violet` | `#9333ea` | Secondary accent — gradients, hover states, featured badge |
| `--text-primary` | `#e2e8f0` | Body copy, headings |
| `--text-dim` | `#475569` | Labels, subtexts, captions |
| `--grid-line` | `rgba(0,240,255,0.07)` | Data-grid lines in hero shader |
| `--glow-cyan` | `rgba(0,240,255,0.15)` | Box-shadow glow on cards and buttons |

**Rule:** Three accent colors maximum. Never add a warm color (orange, yellow) — breaks dark UI elegance.

---

## 3. Architecture

### 3.1 Tech Stack

- **Vite** — build tool, HMR for animation iteration
- **React 18** + **TypeScript** — component layer only
- **Tailwind CSS v3** — utility classes, CSS custom properties for tokens
- **Three.js** — WebGL canvas, STLLoader, ShaderMaterial
- **GSAP** + **ScrollTrigger** — all animation orchestration
- **GSAP ticker** — drives Three.js render loop (replaces `requestAnimationFrame`)

### 3.2 WebGL Isolation Pattern

The Three.js canvas is **completely isolated from the React render tree**:

- Canvas lives in a `<div id="gl-root">` with `position: fixed; inset: 0; z-index: 0; pointer-events: none`
- `ShaderBackground.ts` and `RobotScene.ts` are **vanilla TypeScript classes**, not React components
- React components communicate with the GL layer via **mutable refs only** — no `useState`, no re-renders
- `gsap.ticker.add(render)` drives the Three.js render loop — single unified tick

### 3.3 Project Structure

```
src/
├── gl/
│   ├── ShaderBackground.ts        # Three.js scene, renderer, uniforms
│   ├── RobotScene.ts              # STLLoader, robot mesh, assembly animation
│   └── shaders/
│       ├── hero.vert.glsl         # Pass-through vertex shader
│       └── hero.frag.glsl         # Three-layer composite fragment shader
├── components/
│   ├── sections/
│   │   ├── HeroSection.tsx        # Mounts canvas, triggers GL init, ScrollTrigger pin
│   │   ├── EcosystemSection.tsx   # Sticky feature swap with parallax
│   │   └── PricingSection.tsx     # Glassmorphism cards with cursor glow
│   ├── ui/
│   │   ├── GlitchText.tsx         # Glitch / terminal-typing text effect
│   │   ├── PricingCard.tsx        # Single card with cursor tracking
│   │   └── NavBar.tsx             # Minimal dark nav, blur on scroll
├── hooks/
│   ├── useScrollTrigger.ts        # Global ScrollTrigger init + cleanup on unmount
│   └── useCursorGlow.ts           # mousemove → --mouse-x/--mouse-y CSS custom props
├── App.tsx                        # Section order, smooth scroll config
└── main.tsx
```

### 3.4 Assets

| File | Size | Usage |
|---|---|---|
| `cuerpo yarvis original-CuerpoPocket012.stl` | 177 KB | Robot body mesh — hero scene |
| `tapa deslisable-CuerpoPad001.stl` | 22 KB | Sliding lid mesh — hero assembly animation |

Both STLs copied to `public/models/` and loaded via `STLLoader` at runtime. No conversion to GLTF needed — sizes are web-friendly.

---

## 4. Section 1 — Hero (Pinned + Shader + Robot Assembly)

### Pin behavior
- `ScrollTrigger.pin("#hero-container")` — pinned for `300vh` of scroll distance
- `scrub: 1` — smooth scrubbing tied to scroll position
- After 300vh, scroll is released to Section 2

### Scroll phases (0 → 1 normalized progress)

| Range | What happens |
|---|---|
| `0.00 → 0.33` | `GlitchText` reveals "YARBIZ" with terminal-typing glitch. Subtitle fades in. Robot invisible (scale 0, translateZ -200px in Three.js). `uScrollProgress` = 0 |
| `0.33 → 0.66` | Robot body STL rises from below (`y: -150 → 0`, `scale: 0 → 1`). Vignette darkens borders as `uScrollProgress` goes 0→0.6 |
| `0.66 → 1.00` | Lid STL slides into place (translateY). Robot emits cyan glow (`emissiveIntensity` ramps). CTA button "Get Your Kit →" fades in. `uScrollProgress` → 1 |

### Robot material
- `MeshStandardMaterial` — `color: #1a1a2e`, `emissive: #00f0ff`, `emissiveIntensity: 0 → 0.4 (animated)`, `metalness: 0.8`, `roughness: 0.2`
- One `PointLight` cyan + one `AmbientLight` dim violet
- Continuous slow rotation: `gsap.ticker` increments `mesh.rotation.y += 0.003`
- `uMouse` adds `±0.08 rad` tilt on X/Y axes responsively

### GLSL Hero Shader — `hero.frag.glsl`

Three composited layers, single draw call:

**Layer 1 — Perspective data-grid**
- Orthographic grid of horizontal + vertical lines
- `uTime` translates lines toward the viewer on Z — creates tunnel/speed effect
- Color: `vec3(0.0, 0.94, 1.0) * 0.07` (grid-line token)

**Layer 2 — Simplex noise particle field**
- 200–300 soft circular particles from noise field
- Position drifts with `uTime * 0.2`
- Alpha modulated by `distance(uv, particleCenter)` + `sin(uTime + seed)`
- `uMouse` offsets particle field by `±0.02 uv units` — subtle cursor parallax
- Color: `--accent-cyan` at alpha 0.0–0.6

**Layer 3 — Radial vignette**
- `smoothstep(0.4, 1.0, length(uv - 0.5) * 2.0)` darkens edges
- Intensity lerps from `0.3` to `0.85` as `uScrollProgress` goes 0→1
- Creates "falling into the system" sensation on scroll

**Uniforms:**
```glsl
uniform float uTime;           // gsap.ticker accumulator
uniform float uScrollProgress; // ScrollTrigger normalized 0→1
uniform vec2  uMouse;          // normalized -0.5→0.5 from center
uniform vec2  uResolution;     // canvas size for aspect correction
```

---

## 5. Section 2 — Ecosystem (Storytelling Feature Swap)

### Layout
- Wrapper div: `height: 300vh`
- Inner container: `position: sticky; top: 0; height: 100vh; overflow: hidden`
- Three feature panels (`position: absolute; inset: 0`) stack in same space

### Features

| # | Title | Description |
|---|---|---|
| 1 | Deep Customization | Web/mobile app to define YARBIZ personality via behavior prompts |
| 2 | Your Voice | Native ElevenLabs integration — YARBIZ sounds exactly how you choose |
| 3 | Hologram Studio | Animation creation tool for the holographic display — total creative freedom |

### Animation pattern (GSAP timeline, scrubbed by ScrollTrigger)
- Feature entering: `{ opacity: 0, y: 40 } → { opacity: 1, y: 0, duration: 0.4 }`
- Feature exiting: `{ opacity: 1, y: 0 } → { opacity: 0, y: -40, duration: 0.4 }`
- Each feature occupies ~100vh of scroll progress

### Parallax (transform only, no background-position)
- Text layer: `translateY` at 1× scroll speed (default)
- Visual/icon layer: `translateY` at 0.6× scroll speed via `gsap.to(visualRef, { y: parallaxOffset })`
- Both driven by `ScrollTrigger` `onUpdate` callback → no layout thrash

---

## 6. Section 3 — Pricing (Glassmorphism + Cursor Glow)

### Card styles
- `background: rgba(13,13,31,0.6)` — glassmorphism base
- `backdrop-filter: blur(12px) saturate(150%)`
- `border: 1px solid rgba(0,240,255,0.15)`
- `border-radius: 16px`

### Three tiers

| Tier | Price | Contents |
|---|---|---|
| Starter | $10 | 3D printing blueprints + hardware list & recommendations |
| Builder | $15 | Everything in Starter + Full source code + Electronic schematic diagrams |
| Pro | $20 | Everything in Builder + Step-by-step assembly video tutorials + Priority customer support |

**Tier 2 (Builder)** is visually featured:
- Border color `--accent-violet`
- Badge: "MOST POPULAR" in violet
- Default `translateY(-8px)` offset — elevated above peers

### Cursor glow effect (`useCursorGlow` hook)
- `mousemove` on each card → calculate `{ x, y }` relative to card bounding rect
- Write to CSS custom properties: `--mouse-x: 240px; --mouse-y: 180px`
- Card `::before` pseudo-element with `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(0,240,255,0.12), transparent 70%)`
- Gradient follows cursor in real time — glow appears to track the pointer around card edges

### Hover micro-interactions
- `transform: scale(1.03)` — GSAP `mouseenter/mouseleave` with `duration: 0.3, ease: "power2.out"`
- `box-shadow` intensifies: `0 0 40px rgba(0,240,255,0.2)` on hover
- Tier 2 hover uses violet glow: `0 0 40px rgba(147,51,234,0.3)`

---

## 7. Performance Constraints

- **60fps hard target** — all animations on `transform` and `opacity` only, no layout properties
- **No `background-position` parallax** — strictly prohibited, use `translateY` via GSAP
- **Single GL canvas** — one renderer, one scene, no multiple WebGL contexts
- **STL loads once** — cached in module-level variable, no re-fetches on React remounts
- **GSAP ticker as single RAF** — `gsap.ticker.add(render)` replaces all manual `requestAnimationFrame` calls
- **ScrollTrigger cleanup** — all triggers killed in `useEffect` cleanup to prevent memory leaks on HMR

---

## 8. Out of Scope

- Authentication, user accounts, database
- Actual payment processing
- Mobile-first responsive (desktop-first for hackathon, mobile pass is optional polish)
- CMS or editable content
- SEO / SSR
