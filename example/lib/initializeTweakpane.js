import { Pane } from 'tweakpane'
import { applyTweakpaneStyles } from './tweakpaneStyles.js'
import { makeTweakpaneDraggable } from './tweakpaneDrag.js'
import { setupTweakpaneControls } from './tweakpaneControls.js'

/**
 * Initializes Tweakpane styling and drag functionality.
 * Uses retry logic to handle asynchronous DOM creation.
 *
 * @param {import('tweakpane').Pane} pane - The Tweakpane instance to initialize
 * @returns {boolean} True if initialization was successful, false otherwise
 */
function initializeTweakpane(pane) {
  const tweakpaneElement = document.querySelector('.tp-dfwv')
  if (!tweakpaneElement) {
    return false
  }

  const rootView = tweakpaneElement.querySelector('.tp-rotv')
  if (!rootView) {
    return false
  }

  applyTweakpaneStyles()
  return makeTweakpaneDraggable(pane)
}

/**
 * Sets up Tweakpane initialization with retry logic.
 * Handles asynchronous DOM creation using MutationObserver and timeouts.
 *
 * @param {string} title - The title for the Tweakpane instance
 * @param {Record<string, any>} params - The parameters object to bind
 * @param {import('video-ambient-glow').AmbientGlow} glow - The AmbientGlow instance
 * @returns {import('tweakpane').Pane} The created Tweakpane instance
 */
export function setupTweak(title, params, glow) {
  const pane = new Pane({ title })

  let initialized = initializeTweakpane(pane)

  if (!initialized) {
    const observer = new MutationObserver(() => {
      if (initializeTweakpane(pane)) {
        initialized = true
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    const retries = [100, 300, 500, 1000]
    retries.forEach(delay => {
      setTimeout(() => {
        if (!initialized && initializeTweakpane(pane)) {
          initialized = true
          observer.disconnect()
        }
      }, delay)
    })

    setTimeout(() => observer.disconnect(), 1000)
  }

  setTimeout(() => {
    if (!initialized) {
      initializeTweakpane(pane)
    }
  }, 200)

  setupTweakpaneControls(pane, params, glow)

  return pane
}
