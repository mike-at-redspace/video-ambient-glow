/**
 * Constants for the glow effect.
 *
 * @module constants
 * @internal
 */

/**
 * Default options - tuned for YouTube web player style glow.
 *
 * @internal
 */
export const DEFAULT_OPTIONS = {
  blur: 96,
  opacity: 0.65,
  brightness: 1.1,
  saturate: 1.2,
  scale: 1.08,
  downscale: 0.08,
  updateInterval: 98,
  blendOld: 0.85,
  blendNew: 0.15
} as const

/**
 * Video readyState value for checking if we can extract frames.
 *
 * @internal
 */
export const VIDEO_READY_STATE_CURRENT_DATA = 2

/**
 * Resize debounce delay in ms (stops excessive resizing).
 *
 * @internal
 */
export const RESIZE_DEBOUNCE_MS = 100

/**
 * Canvas CSS styles.
 *
 * @internal
 */
export const CANVAS_STYLE = {
  BORDER_RADIUS: '12px',
  Z_INDEX: '-1',
  POSITION: 'absolute',
  POINTER_EVENTS: 'none'
} as const

/**
 * CSS transform to center canvas.
 *
 * @internal
 */
export const CANVAS_TRANSFORM = 'translate(-50%, -50%)'

/**
 * Canvas context options.
 *
 * @internal
 */
export const CANVAS_CONTEXT_OPTIONS = {
  willReadFrequently: true,
  alpha: false
} as const

/**
 * Min canvas size.
 *
 * @internal
 */
export const MIN_CANVAS_DIMENSION = 1

/**
 * Min video size.
 *
 * @internal
 */
export const MIN_VIDEO_DIMENSION = 0
