/**
 * @module types
 * @packageDocumentation
 *
 * Type definitions for the glow effect.
 */

/**
 * Options for the glow effect.
 *
 * @public
 */
export interface GlowOptions {
  /**
   * CSS blur in pixels. Higher = more diffused.
   * @defaultValue 96
   */
  blur?: number
  /**
   * Canvas opacity 0-1. Controls glow intensity.
   * @defaultValue 0.65
   */
  opacity?: number
  /**
   * Brightness multiplier. > 1 brightens, < 1 darkens.
   * @defaultValue 1.1
   */
  brightness?: number
  /**
   * Saturation multiplier. > 1 increases color, 0 removes it.
   * @defaultValue 1.2
   */
  saturate?: number
  /**
   * Canvas scale relative to video. > 1 makes glow bigger.
   * @defaultValue 1.08
   */
  scale?: number
  /**
   * Downscale factor for perf. Lower = faster but lower quality.
   * Range: 0.01-0.5 (recommended: 0.08)
   * @defaultValue 0.08
   */
  downscale?: number
  /**
   * Update interval in ms. Lower = smoother but more CPU.
   * @defaultValue 450
   */
  updateInterval?: number
  /**
   * Blend weight for previous frame (0-1). Higher = smoother transitions.
   * Note: blendOld + blendNew should usually equal 1.
   * Ignored if `responsiveness` is set.
   * @defaultValue 0.85
   * @deprecated Use `responsiveness` instead. This option will be removed in a future version.
   */
  blendOld?: number
  /**
   * Blend weight for new frame (0-1). Higher = faster reaction to changes.
   * Note: blendOld + blendNew should usually equal 1.
   * Ignored if `responsiveness` is set.
   * @defaultValue 0.15
   * @deprecated Use `responsiveness` instead. This option will be removed in a future version.
   */
  blendNew?: number
  /**
   * Simplified blending control (0.0-1.0). Higher = more responsive to changes.
   * Internally sets `blendNew = responsiveness` and `blendOld = 1 - responsiveness`.
   * Overrides `blendOld` and `blendNew` when set.
   * @defaultValue undefined
   */
  responsiveness?: number
}

/**
 * Internal normalized options (all required after merging with defaults).
 *
 * @internal
 */
export interface NormalizedGlowOptions {
  /** @internal */
  blur: number
  /** @internal */
  opacity: number
  /** @internal */
  brightness: number
  /** @internal */
  saturate: number
  /** @internal */
  scale: number
  /** @internal */
  downscale: number
  /** @internal */
  updateInterval: number
  /** @internal */
  blendOld: number
  /** @internal */
  blendNew: number
}
