import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AmbientGlow } from '../src/index'

describe('AmbientGlow Integration', () => {
  let video: HTMLVideoElement
  let parent: HTMLDivElement

  beforeEach(() => {
    parent = document.createElement('div')
    video = document.createElement('video')
    video.width = 640
    video.height = 360
    parent.appendChild(video)
    document.body.appendChild(parent)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('multiple instances', () => {
    it('handles multiple instances on different videos independently', () => {
      const video2 = document.createElement('video')
      const parent2 = document.createElement('div')
      video2.width = 1280
      video2.height = 720
      parent2.appendChild(video2)
      document.body.appendChild(parent2)

      const glow1 = new AmbientGlow(video, { blur: 80, opacity: 0.6 })
      const glow2 = new AmbientGlow(video2, { blur: 120, opacity: 0.8 })

      const canvas1 = parent.querySelector('canvas') as HTMLCanvasElement
      const canvas2 = parent2.querySelector('canvas') as HTMLCanvasElement

      expect(canvas1).toBeTruthy()
      expect(canvas2).toBeTruthy()
      expect(canvas1.style.filter).toContain('blur(80px)')
      expect(canvas2.style.filter).toContain('blur(120px)')
      expect(canvas1.style.opacity).toBe('0.6')
      expect(canvas2.style.opacity).toBe('0.8')

      // Update one instance without affecting the other
      glow1.updateOptions({ blur: 100 })
      expect(canvas1.style.filter).toContain('blur(100px)')
      expect(canvas2.style.filter).toContain('blur(120px)') // Unchanged

      glow1.destroy()
      glow2.destroy()
      expect(parent.querySelector('canvas')).toBeNull()
      expect(parent2.querySelector('canvas')).toBeNull()
    })

    it('handles multiple instances on the same parent element', () => {
      const video2 = document.createElement('video')
      video2.width = 320
      video2.height = 240
      parent.appendChild(video2)

      const glow1 = new AmbientGlow(video, { blur: 50 })
      const glow2 = new AmbientGlow(video2, { blur: 75 })

      const canvases = parent.querySelectorAll('canvas')
      expect(canvases.length).toBe(2)

      glow1.destroy()
      expect(parent.querySelectorAll('canvas').length).toBe(1)

      glow2.destroy()
      expect(parent.querySelector('canvas')).toBeNull()
    })
  })

  describe('full lifecycle', () => {
    it('handles complete video playback lifecycle', () => {
      const glow = new AmbientGlow(video, {
        blur: 96,
        opacity: 0.65,
        updateInterval: 100
      })

      // Simulate video loading
      Object.defineProperty(video, 'readyState', {
        value: 0,
        writable: true,
        configurable: true
      })
      video.dispatchEvent(new Event('loadstart'))

      Object.defineProperty(video, 'readyState', {
        value: 2,
        writable: true,
        configurable: true
      })
      video.dispatchEvent(new Event('loadedmetadata'))
      video.dispatchEvent(new Event('canplay'))

      // Simulate playback
      video.dispatchEvent(new Event('play'))

      // Simulate seeking during playback
      video.dispatchEvent(new Event('seeked'))

      // Simulate pause and resume
      video.dispatchEvent(new Event('pause'))
      video.dispatchEvent(new Event('play'))

      // Simulate end of video
      video.dispatchEvent(new Event('ended'))

      expect(glow.getIsDestroyed()).toBe(false)
      glow.destroy()
      expect(glow.getIsDestroyed()).toBe(true)
    })

    it('handles rapid option updates during playback', () => {
      const glow = new AmbientGlow(video)
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement

      Object.defineProperty(video, 'readyState', {
        value: 2,
        writable: true,
        configurable: true
      })
      video.dispatchEvent(new Event('play'))

      // Rapid option changes
      glow.updateOptions({ blur: 50 })
      glow.updateOptions({ blur: 100, opacity: 0.7 })
      glow.updateOptions({ saturate: 1.5 })
      glow.updateOptions({ brightness: 1.2, opacity: 0.9 })

      expect(canvas.style.filter).toContain('blur(100px)')
      expect(canvas.style.filter).toContain('saturate(1.5)')
      expect(canvas.style.filter).toContain('brightness(1.2)')
      expect(canvas.style.opacity).toBe('0.9')

      glow.destroy()
    })
  })

  describe('resize handling', () => {
    it('integrates with ResizeObserver when available', () => {
      const mockObserve = vi.fn()
      const mockDisconnect = vi.fn()
      const ResizeObserverMock = vi.fn(function ResizeObserver(
        this: ResizeObserver,
        _callback: ResizeObserverCallback
      ) {
        this.observe = mockObserve
        this.disconnect = mockDisconnect
        this.unobserve = vi.fn()
      }) as unknown as typeof ResizeObserver

      // Store original
      const OriginalResizeObserver = global.ResizeObserver
      global.ResizeObserver = ResizeObserverMock

      const glow = new AmbientGlow(video)

      // Should use ResizeObserver if available
      if (typeof ResizeObserver !== 'undefined') {
        expect(ResizeObserverMock).toHaveBeenCalled()
        expect(mockObserve).toHaveBeenCalledWith(video)
      }

      glow.destroy()

      if (typeof ResizeObserver !== 'undefined') {
        expect(mockDisconnect).toHaveBeenCalled()
      }

      global.ResizeObserver = OriginalResizeObserver
    })

    it('handles window resize fallback when ResizeObserver unavailable', () => {
      const OriginalResizeObserver = global.ResizeObserver
      // @ts-expect-error - testing fallback behavior
      delete global.ResizeObserver

      const windowResizeSpy = vi.spyOn(window, 'addEventListener')

      const glow = new AmbientGlow(video)

      // Should fallback to window resize listener when ResizeObserver is undefined
      expect(windowResizeSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )

      glow.destroy()

      // Restore
      if (OriginalResizeObserver) {
        global.ResizeObserver = OriginalResizeObserver
      }
      windowResizeSpy.mockRestore()
    })
  })

  describe('error handling', () => {
    it('handles destroyed instance gracefully', () => {
      const glow = new AmbientGlow(video)
      expect(glow.getIsDestroyed()).toBe(false)

      glow.destroy()
      console.warn(
        'Expected behavior: The following stderr is intentional ⬇⬇⬇'
      )
      expect(glow.getIsDestroyed()).toBe(true)

      // Operations on destroyed instance should not throw
      expect(() => glow.updateOptions({ blur: 100 })).not.toThrow()
      expect(() => glow.destroy()).not.toThrow()
    })

    it('prevents operations after destroy', () => {
      // updateOptions should warn but not throw
      const glow = new AmbientGlow(video)
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})

      glow.destroy()
      glow.updateOptions({ blur: 100 })
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AmbientGlow: Cannot update options on destroyed instance'
      )

      consoleWarnSpy.mockRestore()
    })
  })
})
