import { DEFAULT_GLOW_PARAMS, TWEAKPANE_CONFIG } from '../constants.js'

/**
 * Sets up Tweakpane bindings for all glow parameters.
 * This creates controls for each parameter defined in TWEAKPANE_CONFIG.
 *
 * @param {import('tweakpane').Pane} pane - The Tweakpane instance
 * @param {Record<string, any>} params - The parameters object to bind
 * @param {import('video-ambient-glow').AmbientGlow} glow - The AmbientGlow instance
 */
export function setupPanepaneControls(pane, params, glow) {
  Object.keys(TWEAKPANE_CONFIG).forEach(key => {
    const config = TWEAKPANE_CONFIG[key]
    pane
      .addBinding(params, key, config)
      .on('change', () => glow.updateOptions({ [key]: params[key] }))
  })
}

/**
 * Creates a reset button handler for Tweakpane.
 *
 * @param {import('tweakpane').Pane} pane - The Tweakpane instance
 * @param {Record<string, any>} params - The parameters object to reset
 * @param {import('video-ambient-glow').AmbientGlow} glow - The AmbientGlow instance
 */
export function createResetButtonHandler(pane, params, glow) {
  return () => {
    Object.assign(params, DEFAULT_GLOW_PARAMS)
    pane.refresh() // Update Tweakpane UI to reflect reset values
    glow.updateOptions(DEFAULT_GLOW_PARAMS) // Apply reset to glow effect
  }
}
