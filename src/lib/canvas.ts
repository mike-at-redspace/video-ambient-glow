/**
 * Canvas utilities - creates and styles the glow canvas.
 * Like YouTube's web player glow (minus the thumbnail spritesheet service).
 *
 * @module lib/canvas
 * @internal
 */

import type { NormalizedGlowOptions } from '../types'
import {
  CANVAS_STYLE,
  CANVAS_TRANSFORM,
  CANVAS_CONTEXT_OPTIONS
} from '../constants'

/**
 * Creates the main glow canvas.
 *
 * @param options - Glow styling options.
 * @returns Canvas ready to add to DOM.
 *
 * @internal
 */
export function createGlowCanvas(
  options: NormalizedGlowOptions
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  applyCanvasStyles(canvas, options)
  return canvas
}

/**
 * Creates a temp canvas for processing frames.
 *
 * @returns Temp canvas.
 *
 * @internal
 */
export function createTempCanvas(): HTMLCanvasElement {
  return document.createElement('canvas')
}

/**
 * Checks if context is a 2D context.
 *
 * @param ctx - Rendering context to check.
 * @returns True if it's 2D.
 *
 * @internal
 */
function isCanvasRenderingContext2D(
  ctx: RenderingContext | null
): ctx is CanvasRenderingContext2D {
  if (!ctx) return false
  // Check for a method that only exists on CanvasRenderingContext2D
  return (
    'drawImage' in ctx &&
    typeof (ctx as CanvasRenderingContext2D).drawImage === 'function'
  )
}

/**
 * Gets 2D context from canvas with optimized settings.
 *
 * @param canvas - Canvas to get context from.
 * @param canvasName - Name for error messages.
 * @returns The 2D context.
 * @throws {Error} If 2D context unavailable.
 *
 * @internal
 */
export function getCanvasContext(
  canvas: HTMLCanvasElement,
  canvasName: string = 'canvas'
): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', CANVAS_CONTEXT_OPTIONS)
  if (!isCanvasRenderingContext2D(ctx)) {
    throw new Error(
      `AmbientGlow: Unable to get 2D rendering context from ${canvasName}. Your browser may not support canvas 2D context.`
    )
  }
  return ctx
}

/**
 * Styles the canvas with blur, brightness, etc.
 *
 * @param canvas - Canvas to style.
 * @param options - Glow options.
 *
 * @internal
 */
export function applyCanvasStyles(
  canvas: HTMLCanvasElement,
  options: NormalizedGlowOptions
): void {
  const { blur, opacity, brightness, saturate } = options

  canvas.style.cssText = `
    position: ${CANVAS_STYLE.POSITION};
    top: 50%;
    left: 50%;
    transform: ${CANVAS_TRANSFORM};
    pointer-events: ${CANVAS_STYLE.POINTER_EVENTS};
    z-index: ${CANVAS_STYLE.Z_INDEX};
    border-radius: ${CANVAS_STYLE.BORDER_RADIUS};
  `
  canvas.style.filter = `blur(${blur}px) brightness(${brightness}) saturate(${saturate})`
  canvas.style.opacity = `${opacity}`
}

/**
 * Updates canvas filters when options change.
 *
 * @param canvas - Canvas to update.
 * @param options - New glow options.
 *
 * @internal
 */
export function updateCanvasFilterStyles(
  canvas: HTMLCanvasElement,
  options: NormalizedGlowOptions
): void {
  const { blur, opacity, brightness, saturate } = options
  canvas.style.filter = `blur(${blur}px) brightness(${brightness}) saturate(${saturate})`
  canvas.style.opacity = `${opacity}`
}

/**
 * Makes sure parent has positioning (sets to relative if needed).
 *
 * @param parent - Parent element to fix.
 *
 * @internal
 */
export function ensureParentPositioning(parent: HTMLElement): void {
  const parentPosition = window.getComputedStyle(parent).position
  // 'static' is the default, but some environments may return empty string
  // or we may need to check the actual style attribute
  if (
    parentPosition === 'static' ||
    !parent.style.position ||
    parent.style.position === ''
  ) {
    parent.style.position = 'relative'
  }
}
