import { DEFAULT_GLOW_PARAMS } from '../constants.js'

/**
 * Generates example JavaScript code for AmbientGlow based on current settings.
 *
 * Creates a code snippet showing how to initialize AmbientGlow with the
 * provided parameters, excluding default values for cleaner output.
 *
 * @param {Record<string, any>} params - The current glow parameters
 * @returns {string} The generated code example with import and initialization
 *
 * @example
 * const code = generateCodeExample({ blur: 50, opacity: 0.8 })
 * // Returns:
 * // import { AmbientGlow } from 'video-ambient-glow'
 * //
 * // const video = document.getElementById('my-video')
 * //
 * // const glow = new AmbientGlow(video, {
 * //   blur: 50,
 * //   opacity: 0.8
 * // })
 */
export function generateCodeExample(params) {
  const options = generateOptionsObject(params)
  return `/* 
  Using React or other frameworks? 
  See: https://github.com/mike-at-redspace/video-ambient-glow/wiki/Framework-Integration 
*/

import { AmbientGlow } from 'video-ambient-glow'

const video = document.getElementById('my-video')

const glow = new AmbientGlow(video, ${options})`
}

/**
 * Generates a formatted options object string from parameters.
 *
 * Filters out default values and formats the remaining parameters as a
 * properly indented JavaScript object literal. Uses epsilon comparison
 * for floating-point values to avoid precision issues.
 *
 * @param {Record<string, any>} params - The current glow parameters
 * @returns {string} Formatted options object string (e.g., "{ blur: 50 }")
 *
 * @private
 */
function generateOptionsObject(params) {
  const EPSILON = 0.001
  // Filter out default values to keep code clean
  const filtered = Object.entries(params).filter(([key, value]) => {
    const defaultValue = DEFAULT_GLOW_PARAMS[key]
    if (defaultValue === undefined) {
      return false
    }
    if (typeof value === 'number' && typeof defaultValue === 'number') {
      return Math.abs(value - defaultValue) > EPSILON
    }
    return defaultValue !== value
  })

  // If all values are defaults, return empty object
  if (filtered.length === 0) {
    return '{}'
  }

  // Format the options object with proper indentation
  const optionsLines = filtered.map(([key, value]) => {
    const formattedValue = formatValue(value)
    return `  ${key}: ${formattedValue}`
  })

  return `{\n${optionsLines.join(',\n')}\n}`
}

/**
 * Formats a value for inclusion in the code.
 * Handles numbers, strings, and ensures proper formatting.
 *
 * @param {any} value - The value to format
 * @returns {string} Formatted value string
 */
function formatValue(value) {
  if (typeof value === 'number') {
    // For numbers, preserve precision but avoid unnecessary decimals
    if (Number.isInteger(value)) {
      return value.toString()
    }
    // For floats, use reasonable precision
    const rounded = Math.round(value * 100) / 100
    return rounded.toString()
  }
  if (typeof value === 'string') {
    return `'${value}'`
  }
  return String(value)
}
