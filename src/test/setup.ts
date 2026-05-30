import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Three.js WebGLRenderer is not available in jsdom — mock it
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(function () {
      return {
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
      }
    }),
  }
})

// Mock GSAP ScrollTrigger in component tests
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(() => ({ kill: vi.fn() })),
    getAll: vi.fn(() => []),
    refresh: vi.fn(),
    normalizeScroll: vi.fn(),
  },
}))
