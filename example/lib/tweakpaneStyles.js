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
      zIndex: '1000',
      boxShadow: `
        0px 0.5px 0.6px hsl(0 0% 0% / 0.06),
        0px 1.8px 2.3px -0.5px hsl(0 0% 0% / 0.07),
        0px 4.2px 5.3px -1.1px hsl(0 0% 0% / 0.09),
        0px 9.7px 12.1px -1.6px hsl(0 0% 0% / 0.1)
      `,
      border: '2px solid light-dark(hsl(0 0% 0% / 0.1), hsl(0 0% 100% / 0.2))',
      borderRadius: '12px',
      backdropFilter: 'blur(8px) saturate(2.8) brightness(1.25) contrast(1.1)'
    })
  }
}
