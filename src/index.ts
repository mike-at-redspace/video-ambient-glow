/**
 * @module index
 * @packageDocumentation
 *
 * Main entry point - creates a YouTube web player style ambient glow behind videos.
 * Unlike YouTube's immersive player, this doesn't need a thumbnail spritesheet service.
 *
 * Modular structure:
 * - `lib/` - Internal modules (canvas, frame processing, event handling)
 * - `constants.ts` - Config constants
 * - `types.ts` - Type definitions
 */

import type { GlowOptions, NormalizedGlowOptions } from './types'
import {
  DEFAULT_OPTIONS,
  RESIZE_DEBOUNCE_MS,
  MIN_CANVAS_DIMENSION,
  MIN_VIDEO_DIMENSION
} from './constants'
import {
  createGlowCanvas,
  createTempCanvas,
  getCanvasContext,
  updateCanvasFilterStyles,
  ensureParentPositioning,
  drawAndBlendFrame
} from './lib'

/**
 * Creates a YouTube web player style glow behind HTML5 videos.
 * Extracts colors from frames, blends them, and renders as a blurred backdrop.
 *
 * @example
 * ```typescript
 * const video = document.querySelector('video');
 * const glow = new AmbientGlow(video, {
 *   blur: 96,
 *   opacity: 0.65,
 * });
 *
 * video.play();
 * glow.destroy(); // when done
 * ```
 *
 * @public
 */
export class AmbientGlow {
  private video: HTMLVideoElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private tempCanvas: HTMLCanvasElement
  private tempCtx: CanvasRenderingContext2D
  private options: NormalizedGlowOptions
  private lastImage: ImageData | null = null
  private isLooping = false
  private animationFrameId: number | null = null
  private lastUpdateTime = 0
  private resizeTimeout: number | null = null
  private boundHandlers: Map<string, EventListener> = new Map()
  private isDestroyed = false
  private resizeObserver: ResizeObserver | null = null
  private intersectionObserver: IntersectionObserver | null = null
  private isVisible = true

  /**
   * Creates a glow instance attached to a video element.
   *
   * @param video - Video element (must be in DOM with a parent).
   * @param options - Optional glow config. See {@link GlowOptions}.
   *
   * @throws {Error} If video has no parent or canvas context unavailable.
   *
   * @example
   * ```typescript
   * const video = document.querySelector('video');
   * const glow = new AmbientGlow(video, {
   *   blur: 120,
   *   opacity: 0.8,
   *   brightness: 1.2,
   * });
   * ```
   */
  constructor(video: HTMLVideoElement, options: GlowOptions = {}) {
    this.video = video
    this.options = this.normalizeOptions(options)

    this.canvas = createGlowCanvas(this.options)
    this.ctx = getCanvasContext(this.canvas, 'canvas')

    this.tempCanvas = createTempCanvas()
    this.tempCtx = getCanvasContext(this.tempCanvas, 'temporary canvas')

    const parent = video.parentElement
    if (!parent) {
      throw new Error(
        'AmbientGlow: Video element must have a parent element in the DOM. The video element needs to be inserted into the DOM before creating AmbientGlow.'
      )
    }

    ensureParentPositioning(parent)
    parent.insertBefore(this.canvas, video)

    this.setupEventListeners()
    this.resizeCanvas()
  }

  /**
   * Normalizes options, converting responsiveness to blendOld/blendNew if set.
   *
   * @param options - Options to normalize.
   * @returns Normalized options with all required fields.
   */
  private normalizeOptions(options: GlowOptions): NormalizedGlowOptions {
    const normalized = { ...DEFAULT_OPTIONS, ...options }

    // If responsiveness is set, override blendOld and blendNew
    if (options.responsiveness !== undefined) {
      normalized.blendNew = options.responsiveness
      normalized.blendOld = 1 - options.responsiveness
    }

    return normalized
  }

  /**
   * Applies CSS filters (blur, brightness, etc.) to the canvas.
   */
  private applyFilterStyles(): void {
    updateCanvasFilterStyles(this.canvas, this.options)
  }

  /**
   * Sets up video/resize event listeners (stored for cleanup).
   */
  private setupEventListeners(): void {
    // Bind methods and store them
    this.boundHandlers.set('loadstart', this.handleLoadStart.bind(this))
    this.boundHandlers.set(
      'loadedmetadata',
      this.handleLoadedMetadata.bind(this)
    )
    this.boundHandlers.set('canplay', this.handleCanPlay.bind(this))
    this.boundHandlers.set('play', this.handlePlay.bind(this))
    this.boundHandlers.set('pause', this.handlePause.bind(this))
    this.boundHandlers.set('ended', this.handleEnded.bind(this))
    this.boundHandlers.set('seeked', this.handleSeeked.bind(this))

    this.boundHandlers.forEach((handler, event) => {
      this.video.addEventListener(event, handler)
    })

    // Use ResizeObserver for better performance if available
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.debouncedResize.bind(this))
      this.resizeObserver.observe(this.video)
    } else {
      // Fallback to window resize
      const resizeHandler = this.debouncedResize.bind(this)
      this.boundHandlers.set('resize', resizeHandler)
      window.addEventListener('resize', resizeHandler)
    }

    // Use IntersectionObserver to pause animation when video is out of view
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        entries => {
          if (this.isDestroyed) return
          const entry = entries[0]
          this.isVisible = entry.isIntersecting
          this.handleVisibilityChange()
        },
        { threshold: 0 }
      )
      this.intersectionObserver.observe(this.video)
    }
  }

  /**
   * Handles visibility changes from IntersectionObserver.
   * Pauses animation when out of view, resumes when back in view (if playing).
   */
  private handleVisibilityChange(): void {
    if (this.isDestroyed) return

    if (!this.isVisible) {
      // Out of view - pause animation loop
      this.isLooping = false
    } else if (!this.video.paused && !this.video.ended) {
      // Back in view and playing - resume animation loop
      this.isLooping = true
      if (!this.animationFrameId) {
        this.lastUpdateTime = 0
        this.animationFrameId = requestAnimationFrame(t =>
          this.animationLoop(t)
        )
      }
    }
  }

  private handleLoadStart(): void {
    if (this.isDestroyed) return
    this.lastImage = null
    this.drawFrameImmediately()
  }

  private handleLoadedMetadata(): void {
    if (this.isDestroyed) return
    this.resizeCanvas()
  }

  private handleCanPlay(): void {
    if (this.isDestroyed) return
    this.resizeCanvas()
    this.drawFrame()
  }

  private handlePlay(): void {
    if (this.isDestroyed) return
    this.lastImage = null
    this.drawFrameImmediately()
    this.isLooping = true
    if (!this.animationFrameId) {
      this.lastUpdateTime = 0
      this.animationFrameId = requestAnimationFrame(t => this.animationLoop(t))
    }
  }

  private handleSeeked(): void {
    if (this.isDestroyed) return
    this.lastImage = null
    this.drawFrameImmediately()
  }

  private handlePause(): void {
    this.isLooping = false
  }

  private handleEnded(): void {
    this.isLooping = false
  }

  /**
   * Debounces resize events to avoid excessive canvas resizing.
   */
  private debouncedResize(): void {
    if (this.isDestroyed) return

    if (this.resizeTimeout !== null) clearTimeout(this.resizeTimeout)
    this.resizeTimeout = window.setTimeout(() => {
      if (this.isDestroyed) return
      this.resizeCanvas()
      this.drawFrame()
    }, RESIZE_DEBOUNCE_MS)
  }

  /**
   * Resizes canvas to match video. Internal canvas is downscaled for perf,
   * CSS size is scaled up for the glow.
   */
  private resizeCanvas(): void {
    if (this.isDestroyed) return

    const { downscale, scale } = this.options
    const rect = this.video.getBoundingClientRect()
    const videoW = this.video.videoWidth || rect.width
    const videoH = this.video.videoHeight || rect.height

    if (videoW <= MIN_VIDEO_DIMENSION || videoH <= MIN_VIDEO_DIMENSION) return

    const w = Math.max(MIN_CANVAS_DIMENSION, Math.round(videoW * downscale))
    const h = Math.max(MIN_CANVAS_DIMENSION, Math.round(videoH * downscale))

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
      this.tempCanvas.width = w
      this.tempCanvas.height = h
      this.lastImage = null
    }

    const cssWidth = rect.width * scale
    const cssHeight = rect.height * scale
    this.canvas.style.width = `${cssWidth}px`
    this.canvas.style.height = `${cssHeight}px`
  }

  /**
   * Draws a video frame and blends with previous frame for smooth transitions.
   * Video readyState must be at least HAVE_CURRENT_DATA.
   */
  private drawFrame(): void {
    if (this.isDestroyed) return

    if (this.canvas.width === 0) {
      return
    }

    this.lastImage = drawAndBlendFrame(
      this.video,
      this.tempCtx,
      this.ctx,
      this.canvas.width,
      this.canvas.height,
      this.options,
      this.lastImage
    )
  }

  /**
   * Draws a video frame immediately without blending (ignores previous frame).
   * Used when video changes, is seeked, or playback resumes.
   */
  private drawFrameImmediately(): void {
    if (this.isDestroyed) return

    if (this.canvas.width === 0) {
      return
    }

    this.lastImage = drawAndBlendFrame(
      this.video,
      this.tempCtx,
      this.ctx,
      this.canvas.width,
      this.canvas.height,
      this.options,
      null
    )
  }

  /**
   * Animation loop - updates glow at configured intervals.
   *
   * @param currentTime - Timestamp from requestAnimationFrame.
   */
  private animationLoop(currentTime: number): void {
    if (!this.isLooping || this.isDestroyed) {
      this.animationFrameId = null
      return
    }
    this.animationFrameId = requestAnimationFrame(t => this.animationLoop(t))

    if (!this.lastUpdateTime) this.lastUpdateTime = currentTime
    const elapsed = currentTime - this.lastUpdateTime

    if (elapsed >= this.options.updateInterval) {
      this.lastUpdateTime =
        currentTime - (elapsed % this.options.updateInterval)
      this.drawFrame()
    }
  }

  /**
   * Updates glow options on the fly.
   *
   * @param newOptions - Partial options to update (others stay unchanged).
   *
   * @example
   * ```typescript
   * glow.updateOptions({ blur: 120, opacity: 0.8 });
   * ```
   */
  public updateOptions(newOptions: Partial<GlowOptions>): void {
    if (this.isDestroyed) {
      console.warn('AmbientGlow: Cannot update options on destroyed instance')
      return
    }

    // Normalize options to handle responsiveness
    this.options = this.normalizeOptions({ ...this.options, ...newOptions })
    this.applyFilterStyles()

    if (newOptions.downscale !== undefined || newOptions.scale !== undefined) {
      this.resizeCanvas()
    }
    this.drawFrame()
  }

  /**
   * Checks if glow has been destroyed.
   * @returns True if destroy() was called.
   */
  public getIsDestroyed(): boolean {
    return this.isDestroyed
  }

  /**
   * Cleans up - stops animation, removes listeners, removes canvas from DOM.
   *
   * @example
   * ```typescript
   * glow.destroy();
   * ```
   */
  public destroy(): void {
    if (this.isDestroyed) return
    this.isDestroyed = true

    this.isLooping = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.resizeTimeout !== null) {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = null
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }

    this.boundHandlers.forEach((handler, event) => {
      if (event === 'resize') {
        window.removeEventListener('resize', handler)
      } else {
        this.video.removeEventListener(event, handler)
      }
    })
    this.boundHandlers.clear()

    this.canvas.remove()

    this.lastImage = null
  }
}

export type { GlowOptions, NormalizedGlowOptions } from './types'
