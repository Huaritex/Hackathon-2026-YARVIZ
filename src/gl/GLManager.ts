import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import vertexShader from './shaders/hero.vert.glsl'
import fragmentShader from './shaders/hero.frag.glsl'

interface BgUniforms {
  [key: string]: THREE.IUniform<unknown>
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
  private bodyGeo: THREE.BufferGeometry | null = null
  private lidGeo: THREE.BufferGeometry | null = null
  private normScale = 1
  private robotLoaded = false

  private bgGeo: THREE.PlaneGeometry
  private bgMat: THREE.ShaderMaterial

  private mouse = new THREE.Vector2(0, 0)
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
    this.bgGeo = bgGeo
    this.bgMat = bgMat
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

    this.bodyGeo = bodyGeo
    this.lidGeo = lidGeo

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
    this.bgGeo.dispose()
    this.bgMat.dispose()
    this.bodyGeo?.dispose()
    this.lidGeo?.dispose()
    ;(this.bodyMesh?.material as THREE.MeshStandardMaterial | null)?.dispose()
    ;(this.lidMesh?.material as THREE.MeshStandardMaterial | null)?.dispose()
    this.bgScene.clear()
    this.robotScene.clear()
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
