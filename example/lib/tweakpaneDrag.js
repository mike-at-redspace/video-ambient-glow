/**
 * Makes a Tweakpane draggable via its header.
 * Returns a cleanup function to remove event listeners.
 *
 * @param {import('tweakpane').Pane} [pane] Optional Pane instance to keep expanded after drag
 * @returns {Function|null} Cleanup function or null if setup failed
 */
export function makeTweakpaneDraggable(pane = null) {
  const paneEl = document.querySelector('.tp-dfwv')
  if (!paneEl) return null

  const headerEl = findHeader(paneEl)
  if (!headerEl) return null

  const state = {
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    left: 0,
    bottom: 0
  }
  setupDraggableStyles(headerEl)

  const handlers = {
    mouseDown: e => startDrag(e, state, paneEl, headerEl, pane),
    mouseMove: e => drag(e, state, paneEl, pane),
    mouseUp: e => endDrag(e, state, paneEl, pane),
    click: e => preventClickAfterDrag(e, state, pane),
    selectStart: e => e.preventDefault()
  }

  attachListeners(headerEl, handlers)
  return () => detachListeners(headerEl, handlers)
}

/**
 * Find the draggable header element inside a Tweakpane.
 * @param {HTMLElement} paneEl Tweakpane root element
 * @returns {HTMLElement|null} Header element or null if not found
 */
function findHeader(paneEl) {
  const selectors = [
    '.tp-rotv .tp-lblv_l',
    '.tp-rotv .tp-lblv',
    '.tp-lblv_l',
    '.tp-lblv',
    '.tp-rotv > .tp-lblv',
    '.tp-rotv > .tp-lblv_l'
  ]
  for (const sel of selectors) {
    const el = paneEl.querySelector(sel)
    if (el) return el
  }
  return (
    paneEl.querySelector('.tp-rotv')?.firstElementChild ||
    paneEl.firstElementChild
  )
}

/**
 * Apply draggable styles to element and its parent if relevant.
 * @param {HTMLElement} el Draggable element
 */
function setupDraggableStyles(el) {
  ;[el, el.parentElement].forEach(elm => {
    if (!elm) return
    elm.style.cursor = 'move'
    elm.style.userSelect = 'none'
    elm.style.pointerEvents = 'auto'
  })
}

/**
 * Check if a mouse event target is valid for drag start.
 * @param {MouseEvent} e Mouse event
 * @param {HTMLElement} el Header element
 * @returns {boolean} True if drag can start
 */
function isValidTarget(e, el) {
  const parent = el.parentElement
  return (
    e.target === el ||
    el.contains(e.target) ||
    (parent?.classList.contains('tp-lblv') &&
      (e.target === parent || parent.contains(e.target)))
  )
}

/**
 * Handle drag start event.
 * @param {MouseEvent} e Mouse event
 * @param {Object} state Drag state
 * @param {HTMLElement} paneEl Tweakpane element
 * @param {HTMLElement} el Header element
 * @param {import('tweakpane').Pane|null} pane Optional pane instance
 */
function startDrag(e, state, paneEl, el, pane) {
  if (!isValidTarget(e, el) || e.button !== 0) return
  e.preventDefault()

  expandPane(pane)
  Object.assign(state, {
    dragging: true,
    moved: false,
    startX: e.clientX,
    startY: e.clientY
  })

  const rect = paneEl.getBoundingClientRect()
  state.left = rect.left
  state.bottom = window.innerHeight - rect.bottom
  paneEl.style.transition = 'none'
}

/**
 * Handle drag movement.
 * @param {MouseEvent} e Mouse event
 * @param {Object} state Drag state
 * @param {HTMLElement} paneEl Tweakpane element
 * @param {import('tweakpane').Pane|null} pane Optional pane instance
 */
function drag(e, state, paneEl, pane) {
  if (!state.dragging) return
  e.preventDefault()

  const dx = e.clientX - state.startX
  const dy = e.clientY - state.startY

  if (!state.moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) state.moved = true
  expandPane(pane)

  const rect = paneEl.getBoundingClientRect()
  paneEl.style.left = `${clamp(state.left + dx, 0, window.innerWidth - rect.width)}px`
  paneEl.style.bottom = `${clamp(state.bottom - dy, 0, window.innerHeight - rect.height)}px`
  paneEl.style.top = 'auto'
  paneEl.style.right = 'auto'
}

/**
 * Handle drag end.
 * @param {MouseEvent} e Mouse event
 * @param {Object} state Drag state
 * @param {HTMLElement} paneEl Tweakpane element
 * @param {import('tweakpane').Pane|null} pane Optional pane instance
 */
function endDrag(e, state, paneEl, pane) {
  if (!state.dragging) return
  state.dragging = false
  paneEl.style.transition = ''
  e.preventDefault()
  requestAnimationFrame(() => expandPane(pane) || ensureExpanded(paneEl))
}

/**
 * Prevent click toggle after a drag.
 * @param {MouseEvent} e Mouse event
 * @param {Object} state Drag state
 * @param {import('tweakpane').Pane|null} pane Optional pane instance
 */
function preventClickAfterDrag(e, state, pane) {
  if (!state.moved) return
  e.preventDefault()
  state.moved = false
  expandPane(pane)
}

/**
 * Ensure pane is expanded if no pane reference is available.
 * @param {HTMLElement} paneEl Tweakpane element
 */
function ensureExpanded(paneEl) {
  if (!paneEl.classList.contains('tp-dfwv-c')) return
  paneEl.classList.remove('tp-dfwv-c')
  const root = paneEl.querySelector('.tp-rotv')
  if (root) root.style.display = ''
}

/**
 * Expand pane safely if reference exists.
 * @param {import('tweakpane').Pane|null} pane Optional pane instance
 * @returns {import('tweakpane').Pane|null} The pane instance
 */
function expandPane(pane) {
  if (pane) pane.expanded = true
  return pane
}

/**
 * Attach all event listeners for drag.
 * @param {HTMLElement} el Header element
 * @param {Object} handlers Event handlers
 * @param {Function} handlers.mouseDown
 * @param {Function} handlers.mouseMove
 * @param {Function} handlers.mouseUp
 * @param {Function} handlers.click
 * @param {Function} handlers.selectStart
 */
function attachListeners(
  el,
  { mouseDown, mouseMove, mouseUp, click, selectStart }
) {
  const targets = [
    el,
    el.parentElement?.classList.contains('tp-lblv') && el.parentElement
  ].filter(Boolean)
  targets.forEach(t =>
    t.addEventListener('mousedown', mouseDown, { passive: false })
  )

  el.addEventListener('selectstart', selectStart)
  el.addEventListener('dragstart', selectStart)
  el.addEventListener('click', click, { capture: true })

  document.addEventListener('mousemove', mouseMove, { passive: false })
  document.addEventListener('mouseup', mouseUp, { passive: false })
}

/**
 * Detach all event listeners for drag.
 * @param {HTMLElement} el Header element
 * @param {Object} handlers Event handlers
 * @param {Function} handlers.mouseDown
 * @param {Function} handlers.mouseMove
 * @param {Function} handlers.mouseUp
 * @param {Function} handlers.click
 * @param {Function} handlers.selectStart
 */
function detachListeners(
  el,
  { mouseDown, mouseMove, mouseUp, click, selectStart }
) {
  const targets = [
    el,
    el.parentElement?.classList.contains('tp-lblv') && el.parentElement
  ].filter(Boolean)
  targets.forEach(t => t.removeEventListener('mousedown', mouseDown))

  el.removeEventListener('selectstart', selectStart)
  el.removeEventListener('dragstart', selectStart)
  el.removeEventListener('click', click)

  document.removeEventListener('mousemove', mouseMove)
  document.removeEventListener('mouseup', mouseUp)
}

/**
 * Clamp a number between min and max.
 * @param {number} val Value to clamp
 * @param {number} min Minimum
 * @param {number} max Maximum
 * @returns {number} Clamped value
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}
