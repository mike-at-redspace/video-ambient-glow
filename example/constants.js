/**
 * Constants for the video-ambient-glow example application.
 *
 * This module exports all configuration values, selectors, and data used
 * throughout the example application. Centralizing constants here makes
 * the codebase easier to maintain and modify.
 *
 * @module constants
 */

/**
 * DOM element ID selectors used throughout the application.
 * These should match the IDs in index.html.
 *
 * @constant {Object<string, string>}
 */
export const DOM_IDS = {
  PLAYER: 'player',
  VIDEO_TITLE: 'video-title',
  SPINNER: 'spinner',
  CARDS_CONTAINER: 'cards'
}

/**
 * Default glow effect parameters.
 * These values match the library's default options and are optimized
 * for a smooth, YouTube-style ambient glow effect.
 *
 * @constant {Object}
 * @property {number} blur - CSS blur amount in pixels
 * @property {number} opacity - Canvas opacity (0-1)
 * @property {number} brightness - Brightness filter multiplier
 * @property {number} saturate - Saturation filter multiplier
 * @property {number} scale - Canvas scale relative to video
 * @property {number} downscale - Video downscale factor for sampling
 * @property {number} updateInterval - Frame update interval in milliseconds
 * @property {number} responsiveness - Simplified blending control (0.0-1.0). Higher = more responsive. Overrides blendOld/blendNew when set.
 */
export const DEFAULT_GLOW_PARAMS = {
  blur: 96,
  opacity: 0.65,
  brightness: 1.1,
  saturate: 1.2,
  scale: 1.08,
  downscale: 0.08,
  updateInterval: 900,
  responsiveness: 0.15
}

/**
 * Tweakpane control configuration for each glow parameter.
 * Defines the min, max, step, label, and format function for each interactive control.
 * Format functions are used to display values with appropriate units (px, x, etc.).
 *
 * @constant {Object<string, Object>}
 * @property {Object} scale - Scale control configuration
 * @property {Object} downscale - Quality/downscale control configuration
 * @property {Object} updateInterval - Update interval control configuration
 * @property {Object} responsiveness - Responsiveness control configuration
 * @property {Object} blur - Blur control configuration (formatted as px)
 * @property {Object} opacity - Opacity control configuration (formatted as decimal)
 * @property {Object} brightness - Brightness control configuration (formatted as multiplier)
 * @property {Object} saturate - Saturation control configuration (formatted as multiplier)
 */
export const TWEAKPANE_CONFIG = {
  scale: {
    min: 0.5,
    max: 3,
    step: 0.01,
    label: 'Scale',
    format: v => `${v.toFixed(2)}x`
  },
  downscale: {
    min: 0.01,
    max: 0.5,
    step: 0.01,
    label: 'Quality',
    format: v => `${v.toFixed(2)}x`
  },
  updateInterval: {
    min: 16,
    max: 2000,
    step: 16,
    label: 'Update Freq',
    format: v => `${v}ms`
  },
  responsiveness: {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Responsiveness',
    format: v => v.toFixed(2)
  },
  brightness: {
    min: 0.5,
    max: 2,
    step: 0.05,
    label: 'Brightness',
    format: v => `${v.toFixed(2)}x`
  },
  saturate: {
    min: 0,
    max: 2,
    step: 0.05,
    label: 'Saturate',
    format: v => `${v.toFixed(2)}x`
  },
  opacity: {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Opacity',
    format: v => v.toFixed(2)
  },
  blur: {
    min: 0,
    max: 200,
    step: 1,
    label: 'Blur',
    format: v => `${v}px`
  }
}

/**
 * Title displayed in the Tweakpane control panel.
 *
 * @constant {string}
 */
export const TWEAKPANE_TITLE = 'Ambient Glow Settings 🛠️'

/**
 * Array of video source URLs from Pexels (free stock video).
 * These sample videos are used to demonstrate the ambient glow effect
 * across different content types, colors, and styles.
 *
 * @constant {string[]}
 * @see https://www.pexels.com/videos/
 */
export const VIDEO_SOURCES = [
  'https://videos.pexels.com/video-files/1943483/1943483-uhd_3840_2160_25fps.mp4',
  'https://videos.pexels.com/video-files/33942941/14403293_2560_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/29448550/12676721_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/33624499/14290410_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/6528444/6528444-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/33410351/14221566_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/33017899/14070378_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/2287044/2287044-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/7771041/7771041-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/19722972/19722972-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/29570755/12728548_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/34165002/14484190_2560_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/4129702/4129702-uhd_2560_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/3640406/3640406-uhd_2560_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/2256074/2256074-uhd_2732_1440_24fps.mp4',
  'https://videos.pexels.com/video-files/28295448/12353428_1920_1080_25fps.mp4'
]

/**
 * Configuration constants for video card display and metadata.
 * Used to generate realistic-looking video cards with random metadata
 * for demonstration purposes.
 *
 * @constant {Object}
 * @property {number} GRADIENT_COUNT - Number of gradient variations available (0-15)
 * @property {number} VIEWS_MULTIPLIER - Multiplier for random view count generation
 * @property {number} VIEWS_MIN - Minimum view count baseline
 * @property {number} DAYS_MAX - Maximum days ago for "uploaded" date
 * @property {string} PUBLISHER_NAME - Fake publisher name for demo cards
 * @property {string} TITLE_SUFFIX - Suffix appended to video titles
 */
export const CARD_CONFIG = {
  GRADIENT_COUNT: 16,
  VIEWS_MULTIPLIER: 30,
  VIEWS_MIN: 2,
  DAYS_MAX: 7,
  PUBLISHER_NAME: 'Lore M. Media',
  TITLE_SUFFIX: ' — Ambient Glow Showcase'
}
