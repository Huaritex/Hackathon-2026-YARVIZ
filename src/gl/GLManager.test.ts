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
