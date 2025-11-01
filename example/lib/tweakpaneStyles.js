/**
 * Applies custom positioning styles to Tweakpane element.
 * Tweakpane injects styles dynamically, so we need to apply ours after it initializes.
 * Uses inline styles (highest specificity) to override Tweakpane's injected styles.
 */
export function applyTweakpaneStyles() {
  const tweakpaneElement = document.querySelector('.tp-dfwv')
  if (tweakpaneElement) {
    Object.assign(tweakpaneElement.style, {
      position: 'fixed',
      top: 'auto',
      left: 'auto',
      bottom: '1rem',
      right: '1rem',
      width: 'auto',
      zIndex: '1000'
    })
  }
}
