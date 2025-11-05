import {
  DEFAULT_GLOW_PARAMS,
  TWEAKPANE_CONFIG,
  PRESETS,
  PARAM_CATEGORIES
} from '../constants.js'

/**
 * Applies a preset configuration to the glow effect.
 *
 * @param {Record<string, any>} params - The parameters object to update
 * @param {import('tweakpane').Pane} pane - The Tweakpane instance to refresh
 * @param {import('video-ambient-glow').AmbientGlow} glow - The AmbientGlow instance
 * @param {Object} preset - The preset configuration object
 */
const applyPreset = (params, pane, glow, preset) => {
  Object.assign(params, preset)
  pane.refresh()
  glow.updateOptions(preset)
}

/**
 * Sets up Tweakpane bindings for all glow parameters, organized into folders.
 * Controls are grouped into Visual Properties and Performance categories.
 *
 * @param {import('tweakpane').Pane} pane - The Tweakpane instance
 * @param {Record<string, any>} params - The parameters object to bind
 * @param {import('video-ambient-glow').AmbientGlow} glow - The AmbientGlow instance
 */
export const setupPanepaneControls = (pane, params, glow) => {
  const presetsFolder = pane.addFolder({ title: '🎛️ Presets', expanded: true })
  const presetOptions = {
    Default: 'default',
    Subtle: 'subtle',
    Dramatic: 'dramatic',
    Monochrome: 'monochrome',
    Neon: 'neon',
    'High Performance': 'performance',
    'High Quality': 'quality'
  }
  const presetParams = { preset: 'default' }
  presetsFolder
    .addBinding(presetParams, 'preset', {
      view: 'list',
      options: presetOptions,
      label: 'Preset'
    })
    .on('change', ev => {
      const presetKey = ev.value
      if (presetKey === 'default') {
        applyPreset(params, pane, glow, DEFAULT_GLOW_PARAMS)
      } else if (PRESETS[presetKey]) {
        applyPreset(params, pane, glow, PRESETS[presetKey])
      }
    })

  // Visual Properties folder
  const visualFolder = pane.addFolder({
    title: '🎨 Visual Properties',
    expanded: true
  })
  PARAM_CATEGORIES.visual.forEach(key => {
    const config = TWEAKPANE_CONFIG[key]
    visualFolder
      .addBinding(params, key, config)
      .on('change', () => glow.updateOptions({ [key]: params[key] }))
  })

  // Performance folder
  const performanceFolder = pane.addFolder({
    title: '🚀 Performance',
    expanded: true
  })
  PARAM_CATEGORIES.performance.forEach(key => {
    const config = TWEAKPANE_CONFIG[key]
    performanceFolder
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
export const createResetButtonHandler = (pane, params, glow) => () => {
  Object.assign(params, DEFAULT_GLOW_PARAMS)
  pane.refresh() // Update Tweakpane UI to reflect reset values
  glow.updateOptions(DEFAULT_GLOW_PARAMS) // Apply reset to glow effect
}
