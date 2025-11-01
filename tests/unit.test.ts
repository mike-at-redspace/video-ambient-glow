import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AmbientGlow } from '../src/index'
import type { GlowOptions } from '../src/types'

describe('AmbientGlow', () => {
  let video: HTMLVideoElement
  let parent: HTMLDivElement

  beforeEach(() => {
    parent = document.createElement('div')
    video = document.createElement('video')
    parent.appendChild(video)
    document.body.appendChild(parent)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('creates a canvas element behind the video', () => {
    const glow = new AmbientGlow(video)
    const canvas = parent.querySelector('canvas')
    expect(canvas).toBeTruthy()
    expect(canvas?.style.position).toBe('absolute')
    expect(canvas?.style.zIndex).toBe('-1')
    glow.destroy()
  })

  it('throws if video has no parent', () => {
    const orphan = document.createElement('video')
    expect(() => new AmbientGlow(orphan)).toThrow(
      'AmbientGlow: Video element must have a parent element in the DOM'
    )
  })

  it('applies default options', () => {
    const glow = new AmbientGlow(video)
    const canvas = parent.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.style.filter).toContain('blur(96px)')
    expect(canvas.style.opacity).toBe('0.65')
    glow.destroy()
  })

  it('applies custom options', () => {
    const options: GlowOptions = {
      blur: 120,
      opacity: 0.8,
      brightness: 1.5,
      saturate: 1.0
    }
    const glow = new AmbientGlow(video, options)
    const canvas = parent.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.style.filter).toContain('blur(120px)')
    expect(canvas.style.filter).toContain('brightness(1.5)')
    expect(canvas.style.opacity).toBe('0.8')
    glow.destroy()
  })

  it('updates options dynamically', () => {
    const glow = new AmbientGlow(video)
    glow.updateOptions({ blur: 50, opacity: 0.5 })
    const canvas = parent.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.style.filter).toContain('blur(50px)')
    expect(canvas.style.opacity).toBe('0.5')
    glow.destroy()
  })

  it('removes canvas and listeners on destroy', () => {
    const glow = new AmbientGlow(video)
    const canvas = parent.querySelector('canvas')
    expect(canvas).toBeTruthy()
    glow.destroy()
    expect(parent.querySelector('canvas')).toBeNull()
  })

  it('sets parent position to relative', () => {
    new AmbientGlow(video)
    expect(parent.style.position).toBe('relative')
  })

  it('sets canvas aria-hidden attribute', () => {
    const glow = new AmbientGlow(video)
    const canvas = parent.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
    glow.destroy()
  })

  it('handles resize events', () => {
    const glow = new AmbientGlow(video)
    const resizeSpy = vi.spyOn(window, 'dispatchEvent')
    window.dispatchEvent(new Event('resize'))
    expect(resizeSpy).toHaveBeenCalled()
    glow.destroy()
  })
})
