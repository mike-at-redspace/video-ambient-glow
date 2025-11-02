/**
 * Unit tests for canvas utilities.
 *
 * @module lib/canvas
 */

import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  createGlowCanvas,
  createTempCanvas,
  getCanvasContext,
  applyCanvasStyles,
  updateCanvasFilterStyles,
  ensureParentPositioning
} from '../src/lib/canvas'
import { DEFAULT_OPTIONS } from '../src/constants'
import type { NormalizedGlowOptions } from '../src/types'

describe('canvas utilities', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('createGlowCanvas', () => {
    it('creates a canvas with aria-hidden attribute', () => {
      const canvas = createGlowCanvas(DEFAULT_OPTIONS)
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.getAttribute('aria-hidden')).toBe('true')
    })

    it('applies styles to the canvas', () => {
      const canvas = createGlowCanvas(DEFAULT_OPTIONS)
      expect(canvas.style.position).toBe('absolute')
      expect(canvas.style.zIndex).toBe('-1')
      expect(canvas.style.filter).toContain('blur(96px)')
      expect(canvas.style.opacity).toBe('0.65')
    })

    it('applies custom options', () => {
      const options: NormalizedGlowOptions = {
        ...DEFAULT_OPTIONS,
        blur: 120,
        opacity: 0.8,
        brightness: 1.5,
        saturate: 2.0
      }
      const canvas = createGlowCanvas(options)
      expect(canvas.style.filter).toContain('blur(120px)')
      expect(canvas.style.filter).toContain('brightness(1.5)')
      expect(canvas.style.filter).toContain('saturate(2)')
      expect(canvas.style.opacity).toBe('0.8')
    })
  })

  describe('createTempCanvas', () => {
    it('creates a basic canvas element', () => {
      const canvas = createTempCanvas()
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    })
  })

  describe('getCanvasContext', () => {
    it('returns a 2D context for a valid canvas', () => {
      const canvas = document.createElement('canvas')
      const ctx = getCanvasContext(canvas)
      expect(ctx).toBeTruthy()
      expect(typeof ctx.drawImage).toBe('function')
    })

    it('throws error if 2D context is not available', () => {
      const canvas = document.createElement('canvas')
      vi.spyOn(canvas, 'getContext').mockReturnValue(null)
      expect(() => getCanvasContext(canvas, 'test-canvas')).toThrow(
        'AmbientGlow: Unable to get 2D rendering context from test-canvas'
      )
    })

    it('uses default canvas name in error message', () => {
      const canvas = document.createElement('canvas')
      vi.spyOn(canvas, 'getContext').mockReturnValue(null)
      expect(() => getCanvasContext(canvas)).toThrow(
        'AmbientGlow: Unable to get 2D rendering context from canvas'
      )
    })

    it('throws error for invalid context type', () => {
      const canvas = document.createElement('canvas')
      // Mock returning an object without drawImage method
      vi.spyOn(canvas, 'getContext').mockReturnValue({} as RenderingContext)
      expect(() => getCanvasContext(canvas)).toThrow()
    })
  })

  describe('applyCanvasStyles', () => {
    it('applies all CSS styles correctly', () => {
      const canvas = document.createElement('canvas')
      applyCanvasStyles(canvas, DEFAULT_OPTIONS)

      expect(canvas.style.position).toBe('absolute')
      expect(canvas.style.top).toBe('50%')
      expect(canvas.style.left).toBe('50%')
      expect(canvas.style.transform).toContain('translate(-50%, -50%)')
      expect(canvas.style.pointerEvents).toBe('none')
      expect(canvas.style.zIndex).toBe('-1')
      expect(canvas.style.borderRadius).toBe('12px')
    })

    it('applies filter styles from options', () => {
      const canvas = document.createElement('canvas')
      const options: NormalizedGlowOptions = {
        ...DEFAULT_OPTIONS,
        blur: 100,
        brightness: 1.3,
        saturate: 1.5,
        opacity: 0.75
      }
      applyCanvasStyles(canvas, options)

      expect(canvas.style.filter).toContain('blur(100px)')
      expect(canvas.style.filter).toContain('brightness(1.3)')
      expect(canvas.style.filter).toContain('saturate(1.5)')
      expect(canvas.style.opacity).toBe('0.75')
    })
  })

  describe('updateCanvasFilterStyles', () => {
    it('updates filter and opacity styles', () => {
      const canvas = document.createElement('canvas')
      const options: NormalizedGlowOptions = {
        ...DEFAULT_OPTIONS,
        blur: 80,
        opacity: 0.9,
        brightness: 1.2,
        saturate: 1.1
      }
      updateCanvasFilterStyles(canvas, options)

      expect(canvas.style.filter).toContain('blur(80px)')
      expect(canvas.style.filter).toContain('brightness(1.2)')
      expect(canvas.style.filter).toContain('saturate(1.1)')
      expect(canvas.style.opacity).toBe('0.9')
    })

    it('updates only changed values', () => {
      const canvas = document.createElement('canvas')
      applyCanvasStyles(canvas, DEFAULT_OPTIONS)

      const newOptions: NormalizedGlowOptions = {
        ...DEFAULT_OPTIONS,
        blur: 150,
        opacity: 0.5
      }
      updateCanvasFilterStyles(canvas, newOptions)

      expect(canvas.style.filter).toContain('blur(150px)')
      expect(canvas.style.opacity).toBe('0.5')
    })
  })

  describe('ensureParentPositioning', () => {
    it('sets position to relative if parent is static', () => {
      const parent = document.createElement('div')
      document.body.appendChild(parent)
      expect(parent.style.position).toBe('')

      ensureParentPositioning(parent)
      expect(parent.style.position).toBe('relative')
    })

    it('does not change position if already set to non-static', () => {
      const parent = document.createElement('div')
      parent.style.position = 'absolute'
      document.body.appendChild(parent)

      ensureParentPositioning(parent)
      expect(parent.style.position).toBe('absolute')
    })

    it('does not change position if set to fixed', () => {
      const parent = document.createElement('div')
      parent.style.position = 'fixed'
      document.body.appendChild(parent)

      ensureParentPositioning(parent)
      expect(parent.style.position).toBe('fixed')
    })

    it('handles empty position string', () => {
      const parent = document.createElement('div')
      parent.style.position = ''
      document.body.appendChild(parent)

      ensureParentPositioning(parent)
      expect(parent.style.position).toBe('relative')
    })
  })
})
