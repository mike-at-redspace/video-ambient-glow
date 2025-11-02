/**
 * Unit tests for frame processing utilities.
 *
 * @module lib/frameProcessor
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { drawAndBlendFrame, blendFrames } from '../src/lib/frameProcessor'
import { DEFAULT_OPTIONS } from '../src/constants'
import type { NormalizedGlowOptions } from '../src/types'

describe('frameProcessor utilities', () => {
  let video: HTMLVideoElement
  let tempCanvas: HTMLCanvasElement
  let mainCanvas: HTMLCanvasElement
  let tempCtx: CanvasRenderingContext2D
  let mainCtx: CanvasRenderingContext2D

  beforeEach(() => {
    video = document.createElement('video')
    tempCanvas = document.createElement('canvas')
    mainCanvas = document.createElement('canvas')
    tempCanvas.width = 100
    tempCanvas.height = 60
    mainCanvas.width = 100
    mainCanvas.height = 60

    tempCtx = tempCanvas.getContext('2d')!
    mainCtx = mainCanvas.getContext('2d')!
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('blendFrames', () => {
    it('blends two frames using weighted averaging', () => {
      // Create mock ImageData objects
      const oldFrame = {
        data: new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 255]), // Red pixels
        width: 2,
        height: 1
      } as ImageData

      const newFrame = {
        data: new Uint8ClampedArray([0, 0, 255, 255, 0, 0, 255, 255]), // Blue pixels
        width: 2,
        height: 1
      } as ImageData

      // Blend with 50/50 weights
      const blended = blendFrames(oldFrame, newFrame, 0.5, 0.5)

      // Result should be around 127.5 (clamped to 128 by Uint8ClampedArray)
      expect(blended.data[0]).toBeGreaterThanOrEqual(127) // R
      expect(blended.data[0]).toBeLessThanOrEqual(128) // R
      expect(blended.data[1]).toBe(0) // G
      expect(blended.data[2]).toBeGreaterThanOrEqual(127) // B
      expect(blended.data[2]).toBeLessThanOrEqual(128) // B
      expect(blended.data[3]).toBe(255) // A
    })

    it('uses default blend weights from options', () => {
      const oldFrame = {
        data: new Uint8ClampedArray(8).fill(255), // White
        width: 2,
        height: 1
      } as ImageData

      const newFrame = {
        data: new Uint8ClampedArray(8).fill(0), // Black
        width: 2,
        height: 1
      } as ImageData

      // Blend with default weights (0.85 old, 0.15 new)
      const blended = blendFrames(
        oldFrame,
        newFrame,
        DEFAULT_OPTIONS.blendOld,
        DEFAULT_OPTIONS.blendNew
      )

      // Result should be mostly white (216.75)
      expect(blended.data[0]).toBeCloseTo(216.75, 0)
    })

    it('modifies old frame in place', () => {
      const oldFrame = {
        data: new Uint8ClampedArray(8).fill(100),
        width: 2,
        height: 1
      } as ImageData

      const newFrame = {
        data: new Uint8ClampedArray(8).fill(200),
        width: 2,
        height: 1
      } as ImageData

      const blended = blendFrames(oldFrame, newFrame, 0.5, 0.5)

      // Should be the same reference
      expect(blended).toBe(oldFrame)
      // Values should be updated
      expect(oldFrame.data[0]).toBe(150)
    })

    it('handles edge case with 100% old weight', () => {
      const oldFrame = {
        data: new Uint8ClampedArray(8).fill(100),
        width: 2,
        height: 1
      } as ImageData

      const newFrame = {
        data: new Uint8ClampedArray(8).fill(200),
        width: 2,
        height: 1
      } as ImageData

      const blended = blendFrames(oldFrame, newFrame, 1.0, 0.0)
      expect(blended.data[0]).toBe(100)
    })

    it('handles edge case with 100% new weight', () => {
      const oldFrame = {
        data: new Uint8ClampedArray(8).fill(100),
        width: 2,
        height: 1
      } as ImageData

      const newFrame = {
        data: new Uint8ClampedArray(8).fill(200),
        width: 2,
        height: 1
      } as ImageData

      const blended = blendFrames(oldFrame, newFrame, 0.0, 1.0)
      expect(blended.data[0]).toBe(200)
    })
  })

  describe('drawAndBlendFrame', () => {
    it('returns null if video is not ready', () => {
      Object.defineProperty(video, 'readyState', {
        value: 0,
        writable: true,
        configurable: true
      })
      const result = drawAndBlendFrame(
        video,
        tempCtx,
        mainCtx,
        100,
        60,
        DEFAULT_OPTIONS,
        null
      )
      expect(result).toBeNull()
    })

    it('returns lastImage if canvas width is 0', () => {
      Object.defineProperty(video, 'readyState', {
        value: 2,
        writable: true,
        configurable: true
      })
      const lastImage = {
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1
      } as ImageData
      const result = drawAndBlendFrame(
        video,
        tempCtx,
        mainCtx,
        0,
        60,
        DEFAULT_OPTIONS,
        lastImage
      )
      expect(result).toBe(lastImage)
    })

    it('draws new frame when lastImage is null', () => {
      Object.defineProperty(video, 'readyState', {
        value: 2,
        writable: true,
        configurable: true
      })

      const drawImageSpy = vi.spyOn(tempCtx, 'drawImage')
      const getImageDataSpy = vi.spyOn(tempCtx, 'getImageData')
      const putImageDataSpy = vi.spyOn(mainCtx, 'putImageData')

      const result = drawAndBlendFrame(
        video,
        tempCtx,
        mainCtx,
        100,
        60,
        DEFAULT_OPTIONS,
        null
      )

      expect(drawImageSpy).toHaveBeenCalledWith(video, 0, 0, 100, 60)
      expect(getImageDataSpy).toHaveBeenCalledWith(0, 0, 100, 60)
      expect(putImageDataSpy).toHaveBeenCalled()
      expect(result).toBeTruthy()
      expect(result?.width).toBe(100)
      expect(result?.height).toBe(60)
    })

    it('blends frames when lastImage exists', () => {
      Object.defineProperty(video, 'readyState', {
        value: 2,
        writable: true,
        configurable: true
      })

      // Create a mock previous frame
      const lastImage = {
        data: new Uint8ClampedArray(100 * 60 * 4).fill(100),
        width: 100,
        height: 60
      } as ImageData

      const drawImageSpy = vi.spyOn(tempCtx, 'drawImage')
      const putImageDataSpy = vi.spyOn(mainCtx, 'putImageData')

      const result = drawAndBlendFrame(
        video,
        tempCtx,
        mainCtx,
        100,
        60,
        DEFAULT_OPTIONS,
        lastImage
      )

      expect(drawImageSpy).toHaveBeenCalled()
      expect(putImageDataSpy).toHaveBeenCalled()
      expect(result).toBeTruthy()
      expect(result).toBe(lastImage) // Should be modified in place
    })

    it('handles drawing errors gracefully', () => {
      Object.defineProperty(video, 'readyState', {
        value: 2,
        writable: true,
        configurable: true
      })
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})

      // Force drawImage to throw (e.g., CORS error)
      const drawImageSpy = vi
        .spyOn(tempCtx, 'drawImage')
        .mockImplementation(() => {
          throw new Error('CORS error')
        })

      const lastImage = {
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1
      } as ImageData
      const result = drawAndBlendFrame(
        video,
        tempCtx,
        mainCtx,
        100,
        60,
        DEFAULT_OPTIONS,
        lastImage
      )

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AmbientGlow: Failed to draw frame:',
        expect.any(Error)
      )
      expect(result).toBe(lastImage)

      // Clean up spies
      consoleWarnSpy.mockRestore()
      drawImageSpy.mockRestore()
    })

    it('uses custom blend options', () => {
      Object.defineProperty(video, 'readyState', {
        value: 2,
        writable: true,
        configurable: true
      })
      const customOptions: NormalizedGlowOptions = {
        ...DEFAULT_OPTIONS,
        blendOld: 0.5,
        blendNew: 0.5
      }

      const lastImage = {
        data: new Uint8ClampedArray(100 * 60 * 4).fill(200),
        width: 100,
        height: 60
      } as ImageData

      const result = drawAndBlendFrame(
        video,
        tempCtx,
        mainCtx,
        100,
        60,
        customOptions,
        lastImage
      )

      expect(result).toBeTruthy()
      // The values should be blended (can't test exact values without mock video data)
    })
  })
})
