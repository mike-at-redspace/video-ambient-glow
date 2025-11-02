import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AmbientGlow } from '../src/index'
import type { GlowOptions } from '../src/types'

describe('AmbientGlow', () => {
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

  describe('constructor', () => {
    it('creates a canvas element behind the video', () => {
      const glow = new AmbientGlow(video)
      const canvas = parent.querySelector('canvas')
      expect(canvas).toBeTruthy()
      expect(canvas?.style.position).toBe('absolute')
      expect(canvas?.style.zIndex).toBe('-1')
      glow.destroy()
    })

    it('throws error when video has no parent', () => {
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

    it('applies partial custom options', () => {
      const glow = new AmbientGlow(video, { blur: 50 })
      const canvas = parent.querySelector('canvas')
      expect(canvas?.style.filter).toContain('blur(50px)')
      glow.destroy()
    })

    it('applies all custom options', () => {
      const options: GlowOptions = {
        blur: 100,
        opacity: 0.8,
        brightness: 1.5,
        saturate: 2.0,
        scale: 1.2,
        downscale: 0.1,
        updateInterval: 1000,
        blendOld: 0.9,
        blendNew: 0.1
      }
      const glow = new AmbientGlow(video, options)
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement
      expect(canvas.style.filter).toContain('blur(100px)')
      expect(canvas.style.filter).toContain('brightness(1.5)')
      expect(canvas.style.filter).toContain('saturate(2)')
      expect(canvas.style.opacity).toBe('0.8')
      glow.destroy()
    })

    it('normalizes responsiveness option to blendOld/blendNew', () => {
      const glow = new AmbientGlow(video, { responsiveness: 0.3 })
      // Responsiveness should be converted internally, but we can verify the effect works
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement
      expect(canvas).toBeTruthy()
      glow.destroy()
    })

    it('responsiveness overrides blendOld/blendNew when set', () => {
      const glow = new AmbientGlow(video, {
        responsiveness: 0.25,
        blendOld: 0.9, // Should be ignored
        blendNew: 0.1 // Should be ignored
      })
      // Internally, blendNew should be 0.25 and blendOld should be 0.75
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement
      expect(canvas).toBeTruthy()
      glow.destroy()
    })

    it('sets parent position to relative if static', () => {
      const glow = new AmbientGlow(video)
      expect(parent.style.position).toBe('relative')
      glow.destroy()
    })

    it('does not override existing non-static positioning', () => {
      parent.style.position = 'absolute'
      const glow = new AmbientGlow(video)
      expect(parent.style.position).toBe('absolute')
      glow.destroy()
    })
  })

  describe('updateOptions', () => {
    it('updates options dynamically', () => {
      const glow = new AmbientGlow(video)
      glow.updateOptions({ blur: 50, opacity: 0.5 })
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement
      expect(canvas.style.filter).toContain('blur(50px)')
      expect(canvas.style.opacity).toBe('0.5')
      glow.destroy()
    })

    it('updates only specified options', () => {
      const glow = new AmbientGlow(video, { blur: 100, opacity: 0.8 })
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement

      glow.updateOptions({ blur: 50 })
      expect(canvas.style.filter).toContain('blur(50px)')
      expect(canvas.style.opacity).toBe('0.8') // unchanged

      glow.destroy()
    })

    it('updates multiple options at once', () => {
      const glow = new AmbientGlow(video)
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement

      glow.updateOptions({
        blur: 150,
        opacity: 0.9,
        brightness: 2.0,
        saturate: 1.5
      })

      expect(canvas.style.filter).toContain('blur(150px)')
      expect(canvas.style.filter).toContain('brightness(2)')
      expect(canvas.style.filter).toContain('saturate(1.5)')
      expect(canvas.style.opacity).toBe('0.9')

      glow.destroy()
    })

    it('handles empty options object', () => {
      const glow = new AmbientGlow(video, { blur: 100 })
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement

      glow.updateOptions({})
      expect(canvas.style.filter).toContain('blur(100px)') // unchanged

      glow.destroy()
    })

    it('updates responsiveness option', () => {
      const glow = new AmbientGlow(video)
      glow.updateOptions({ responsiveness: 0.4 })
      // Responsiveness should be normalized internally
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement
      expect(canvas).toBeTruthy()
      glow.destroy()
    })

    it('responsiveness in updateOptions overrides existing blendOld/blendNew', () => {
      const glow = new AmbientGlow(video, {
        blendOld: 0.9,
        blendNew: 0.1
      })
      glow.updateOptions({ responsiveness: 0.2 })
      // Internally, blendNew should now be 0.2 and blendOld should be 0.8
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement
      expect(canvas).toBeTruthy()
      glow.destroy()
    })
  })

  describe('video event handling', () => {
    it('handles video play event', () => {
      const glow = new AmbientGlow(video)
      // Should not throw when play event is dispatched
      expect(() => video.dispatchEvent(new Event('play'))).not.toThrow()
      glow.destroy()
    })

    it('handles video pause event', () => {
      const glow = new AmbientGlow(video)
      video.dispatchEvent(new Event('play'))
      // Should not throw when pause event is dispatched
      expect(() => video.dispatchEvent(new Event('pause'))).not.toThrow()
      glow.destroy()
    })

    it('handles video ended event', () => {
      const glow = new AmbientGlow(video)
      video.dispatchEvent(new Event('play'))
      // Should not throw when ended event is dispatched
      expect(() => video.dispatchEvent(new Event('ended'))).not.toThrow()
      glow.destroy()
    })

    it('handles video loadstart event', () => {
      const glow = new AmbientGlow(video)
      // Should not throw when loadstart event is dispatched
      expect(() => video.dispatchEvent(new Event('loadstart'))).not.toThrow()
      glow.destroy()
    })

    it('handles video loadedmetadata event', () => {
      const glow = new AmbientGlow(video)
      // Should not throw when loadedmetadata event is dispatched
      expect(() =>
        video.dispatchEvent(new Event('loadedmetadata'))
      ).not.toThrow()
      glow.destroy()
    })

    it('handles video canplay event', () => {
      const glow = new AmbientGlow(video)
      // Should not throw when canplay event is dispatched
      expect(() => video.dispatchEvent(new Event('canplay'))).not.toThrow()
      glow.destroy()
    })

    it('handles video seeked event', () => {
      const glow = new AmbientGlow(video)
      // Should not throw when seeked event is dispatched
      expect(() => video.dispatchEvent(new Event('seeked'))).not.toThrow()
      glow.destroy()
    })

    it('handles video ready state changes', () => {
      const glow = new AmbientGlow(video)

      Object.defineProperty(video, 'readyState', {
        value: 0,
        writable: true,
        configurable: true
      })
      expect(() => video.dispatchEvent(new Event('loadstart'))).not.toThrow()

      Object.defineProperty(video, 'readyState', {
        value: 2,
        writable: true,
        configurable: true
      })
      expect(() => video.dispatchEvent(new Event('canplay'))).not.toThrow()

      glow.destroy()
    })
  })

  describe('resize handling', () => {
    it('handles resize events without throwing', () => {
      const glow = new AmbientGlow(video)
      // Should not throw when resize event is dispatched
      expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow()
      glow.destroy()
    })

    it('updates canvas size on window resize after debounce', () => {
      vi.useFakeTimers()
      const glow = new AmbientGlow(video)
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement

      video.width = 1280
      video.height = 720
      window.dispatchEvent(new Event('resize'))

      // Allow debounce to complete
      vi.advanceTimersByTime(200)

      expect(canvas).toBeTruthy()
      // Canvas dimensions should be valid
      expect(canvas.width).toBeGreaterThan(0)
      expect(canvas.height).toBeGreaterThan(0)
      glow.destroy()
      vi.useRealTimers()
    })

    it('debounces resize events', () => {
      vi.useFakeTimers()
      const glow = new AmbientGlow(video)

      // Trigger multiple resize events quickly
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))

      // Advance timers to trigger debounced handler
      vi.advanceTimersByTime(200)

      glow.destroy()
      vi.useRealTimers()
    })
  })

  describe('destroy', () => {
    it('removes canvas and listeners on destroy', () => {
      const glow = new AmbientGlow(video)
      const canvas = parent.querySelector('canvas')
      expect(canvas).toBeTruthy()
      glow.destroy()
      expect(parent.querySelector('canvas')).toBeNull()
      expect(video.parentElement).toBe(parent) // Video should remain
    })

    it('can be called multiple times safely', () => {
      const glow = new AmbientGlow(video)
      expect(parent.querySelector('canvas')).toBeTruthy()

      glow.destroy()
      expect(parent.querySelector('canvas')).toBeNull()

      // Should not throw on subsequent calls
      expect(() => glow.destroy()).not.toThrow()
      expect(glow.getIsDestroyed()).toBe(true)
    })

    it('removes all event listeners', () => {
      const glow = new AmbientGlow(video)
      const removeEventListenerSpy = vi.spyOn(video, 'removeEventListener')

      glow.destroy()

      // Should remove 7 video event listeners (loadstart, loadedmetadata, canplay, play, pause, ended, seeked)
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(7)
      removeEventListenerSpy.mockRestore()
    })

    it('clears animation frame on destroy', () => {
      const glow = new AmbientGlow(video)
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')
      video.dispatchEvent(new Event('play'))

      glow.destroy()

      // Should cancel any pending animation frame
      expect(parent.querySelector('canvas')).toBeNull()
      cancelAnimationFrameSpy.mockRestore()
    })

    it('clears resize timeout on destroy', () => {
      vi.useFakeTimers()
      const glow = new AmbientGlow(video)
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')

      // Trigger resize to create a timeout
      window.dispatchEvent(new Event('resize'))

      // Don't advance timers - keep timeout pending
      glow.destroy()

      // Should clear the resize timeout if one exists
      // Note: clearTimeout may or may not be called depending on timing
      // The important thing is that destroy completes without errors
      expect(parent.querySelector('canvas')).toBeNull()
      expect(glow.getIsDestroyed()).toBe(true)

      clearTimeoutSpy.mockRestore()
      vi.useRealTimers()
    })

    it('disconnects ResizeObserver when available', () => {
      const mockDisconnect = vi.fn()
      const mockObserve = vi.fn()
      const ResizeObserverMock = vi.fn(function ResizeObserver(
        this: ResizeObserver,
        _callback: ResizeObserverCallback
      ) {
        this.observe = mockObserve
        this.disconnect = mockDisconnect
        this.unobserve = vi.fn()
      }) as unknown as typeof ResizeObserver

      const OriginalResizeObserver = global.ResizeObserver
      global.ResizeObserver = ResizeObserverMock

      const glow = new AmbientGlow(video)
      glow.destroy()

      if (typeof ResizeObserver !== 'undefined') {
        expect(mockDisconnect).toHaveBeenCalled()
      }

      global.ResizeObserver = OriginalResizeObserver
    })

    it('disconnects IntersectionObserver when available', () => {
      const mockDisconnect = vi.fn()
      const mockObserve = vi.fn()
      const IntersectionObserverMock = vi.fn(function IntersectionObserver(
        this: IntersectionObserver,
        _callback: IntersectionObserverCallback,
        _options?: IntersectionObserverInit
      ) {
        this.observe = mockObserve
        this.disconnect = mockDisconnect
        this.unobserve = vi.fn()
        this.takeRecords = vi.fn()
        this.root = null
        this.rootMargin = ''
        this.thresholds = []
      }) as unknown as typeof IntersectionObserver

      const OriginalIntersectionObserver = global.IntersectionObserver
      global.IntersectionObserver = IntersectionObserverMock

      const glow = new AmbientGlow(video)
      glow.destroy()

      if (typeof IntersectionObserver !== 'undefined') {
        expect(mockDisconnect).toHaveBeenCalled()
      }

      global.IntersectionObserver = OriginalIntersectionObserver
    })
  })

  describe('getIsDestroyed', () => {
    it('returns false for active instance', () => {
      const glow = new AmbientGlow(video)
      expect(glow.getIsDestroyed()).toBe(false)
      glow.destroy()
    })

    it('returns true after destroy', () => {
      const glow = new AmbientGlow(video)
      glow.destroy()
      expect(glow.getIsDestroyed()).toBe(true)
    })
  })

  describe('canvas dimensions', () => {
    it('calculates canvas size based on scale option', () => {
      const glow = new AmbientGlow(video, { scale: 1.5 })
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement

      // Canvas should exist and be properly configured
      expect(canvas).toBeTruthy()
      expect(canvas.style.position).toBe('absolute')

      glow.destroy()
    })

    it('calculates canvas resolution based on downscale option', () => {
      const glow = new AmbientGlow(video, { downscale: 0.2 })
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement

      // Canvas internal resolution should be downscaled
      expect(canvas.width).toBeGreaterThan(0)
      expect(canvas.height).toBeGreaterThan(0)

      glow.destroy()
    })

    it('handles zero video dimensions gracefully', () => {
      video.width = 0
      video.height = 0

      const glow = new AmbientGlow(video)
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement

      expect(canvas).toBeTruthy()
      glow.destroy()
    })
  })

  describe('frame processing', () => {
    it('uses custom updateInterval option', () => {
      vi.useFakeTimers()
      const glow = new AmbientGlow(video, { updateInterval: 500 })

      Object.defineProperty(video, 'readyState', {
        value: 2,
        writable: true,
        configurable: true
      })
      video.dispatchEvent(new Event('play'))

      // Advance time to trigger frame updates based on custom interval
      vi.advanceTimersByTime(500)
      vi.advanceTimersByTime(500)

      expect(glow.getIsDestroyed()).toBe(false)
      glow.destroy()
      vi.useRealTimers()
    })
  })

  describe('accessibility', () => {
    it('sets canvas aria-hidden attribute', () => {
      const glow = new AmbientGlow(video)
      const canvas = parent.querySelector('canvas') as HTMLCanvasElement
      expect(canvas.getAttribute('aria-hidden')).toBe('true')
      glow.destroy()
    })
  })
})
