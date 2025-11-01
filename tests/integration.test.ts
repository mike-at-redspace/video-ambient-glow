import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AmbientGlow } from '../src/index'

describe('AmbientGlow Integration', () => {
  let video: HTMLVideoElement
  let parent: HTMLDivElement
  let glow: AmbientGlow

  beforeEach(() => {
    parent = document.createElement('div')
    video = document.createElement('video')
    video.width = 640
    video.height = 360
    parent.appendChild(video)
    document.body.appendChild(parent)
  })

  afterEach(() => {
    if (glow) glow.destroy()
    document.body.innerHTML = ''
  })

  it('creates a functional glow effect end-to-end', () => {
    glow = new AmbientGlow(video, {
      blur: 100,
      opacity: 0.7,
      downscale: 0.1
    })

    const canvas = parent.querySelector('canvas') as HTMLCanvasElement
    expect(canvas).toBeTruthy()
    expect(canvas.style.filter).toContain('blur(100px)')
    expect(canvas.style.opacity).toBe('0.7')
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
  })

  it('updates and renders correctly after option changes', () => {
    glow = new AmbientGlow(video)
    const canvas = parent.querySelector('canvas') as HTMLCanvasElement

    glow.updateOptions({ blur: 150, saturate: 2.0 })
    expect(canvas.style.filter).toContain('blur(150px)')
    expect(canvas.style.filter).toContain('saturate(2)')

    glow.updateOptions({ opacity: 0.9 })
    expect(canvas.style.opacity).toBe('0.9')
  })

  it('cleans up completely on destroy', () => {
    glow = new AmbientGlow(video)
    expect(parent.querySelector('canvas')).toBeTruthy()

    glow.destroy()
    expect(parent.querySelector('canvas')).toBeNull()
    expect(video.parentElement).toBe(parent)
  })

  it('handles multiple instances on different videos', () => {
    const video2 = document.createElement('video')
    const parent2 = document.createElement('div')
    parent2.appendChild(video2)
    document.body.appendChild(parent2)

    const glow1 = new AmbientGlow(video, { blur: 80 })
    const glow2 = new AmbientGlow(video2, { blur: 120 })

    const canvas1 = parent.querySelector('canvas') as HTMLCanvasElement
    const canvas2 = parent2.querySelector('canvas') as HTMLCanvasElement

    expect(canvas1.style.filter).toContain('blur(80px)')
    expect(canvas2.style.filter).toContain('blur(120px)')

    glow1.destroy()
    glow2.destroy()
    expect(parent.querySelector('canvas')).toBeNull()
    expect(parent2.querySelector('canvas')).toBeNull()
  })
})
