/**
 * Makes the Tweakpane draggable by its header.
 * Adds drag functionality to the title bar of the pane.
 *
 * @param {import('tweakpane').Pane} [pane] - Optional Pane instance to keep expanded after drag
 * @returns {Function|null} Cleanup function to remove event listeners, or null if setup failed
 */
export function makeTweakpaneDraggable(pane = null) {
  const tweakpaneElement = document.querySelector('.tp-dfwv')
  if (!tweakpaneElement) {
    console.warn('Tweakpane element (.tp-dfwv) not found')
    return null
  }

  const titleElement = findTitleElement(tweakpaneElement)
  if (!titleElement) {
    console.warn('Could not find Tweakpane title element for dragging')
    return null
  }

  const state = {
    isDragging: false,
    dragHappened: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialBottom: 0
  }

  setupDraggableStyles(titleElement)

  const handlers = {
    dragStart: e =>
      handleDragStart(e, state, tweakpaneElement, titleElement, pane),
    drag: e => handleDrag(e, state, tweakpaneElement, pane),
    dragEnd: e => handleDragEnd(e, state, tweakpaneElement, pane),
    preventClick: e => handleClickPrevention(e, state, pane),
    preventSelect: e => e.preventDefault()
  }

  attachEventListeners(titleElement, handlers)

  return () => {
    removeEventListeners(titleElement, handlers)
    titleElement.style.cursor = ''
    titleElement.style.userSelect = ''
  }
}

/**
 * Finds the title element in the Tweakpane structure
 * @param {HTMLElement} tweakpaneElement
 * @returns {HTMLElement|null}
 */
function findTitleElement(tweakpaneElement) {
  const rootView = tweakpaneElement.querySelector('.tp-rotv')

  if (rootView) {
    const labelView = rootView.querySelector('.tp-lblv')
    if (labelView) {
      const labelText = labelView.querySelector('.tp-lblv_l')
      if (labelText || labelView) {
        return labelText || labelView
      }
    }
  }

  const selectors = [
    '.tp-lblv_l',
    '.tp-lblv',
    '.tp-rotv > .tp-lblv',
    '.tp-rotv > .tp-lblv_l'
  ]

  for (const selector of selectors) {
    const element = tweakpaneElement.querySelector(selector)
    if (element) return element
  }

  if (rootView) {
    return rootView.firstElementChild || rootView
  }

  return tweakpaneElement.firstElementChild
}

/**
 * Sets up cursor and user-select styles for draggable element
 * @param {HTMLElement} titleElement
 */
function setupDraggableStyles(titleElement) {
  titleElement.style.cursor = 'move'
  titleElement.style.userSelect = 'none'
  titleElement.style.pointerEvents = 'auto'

  const parent = titleElement.parentElement
  if (
    parent?.classList.contains('tp-lblv') ||
    parent?.classList.contains('tp-rotv')
  ) {
    parent.style.cursor = 'move'
    parent.style.userSelect = 'none'
  }
}

/**
 * Checks if the clicked element is valid for initiating drag
 * @param {MouseEvent} e
 * @param {HTMLElement} titleElement
 * @returns {boolean}
 */
function isValidDragTarget(e, titleElement) {
  const clickedElement = e.target
  const parent = titleElement.parentElement

  return (
    clickedElement === titleElement ||
    titleElement.contains(clickedElement) ||
    (parent?.classList.contains('tp-lblv') &&
      (clickedElement === parent || parent.contains(clickedElement)))
  )
}

/**
 * Handles drag start event
 * @param {MouseEvent} e
 * @param {Object} state
 * @param {HTMLElement} tweakpaneElement
 * @param {HTMLElement} titleElement
 * @param {import('tweakpane').Pane} pane
 */
function handleDragStart(e, state, tweakpaneElement, titleElement, pane) {
  if (!isValidDragTarget(e, titleElement) || e.button !== 0) {
    return
  }

  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  if (pane) {
    pane.expanded = true
  }

  state.isDragging = true
  state.dragHappened = false
  state.startX = e.clientX
  state.startY = e.clientY

  const rect = tweakpaneElement.getBoundingClientRect()
  state.initialLeft = rect.left
  state.initialBottom = window.innerHeight - rect.bottom

  tweakpaneElement.style.transition = 'none'
}

/**
 * Handles drag movement
 * @param {MouseEvent} e
 * @param {Object} state
 * @param {HTMLElement} tweakpaneElement
 * @param {import('tweakpane').Pane} pane
 */
function handleDrag(e, state, tweakpaneElement, pane) {
  if (!state.isDragging) return

  e.preventDefault()

  const dragDistanceX = Math.abs(e.clientX - state.startX)
  const dragDistanceY = Math.abs(e.clientY - state.startY)
  const DRAG_THRESHOLD = 5

  if (dragDistanceX > DRAG_THRESHOLD || dragDistanceY > DRAG_THRESHOLD) {
    state.dragHappened = true
  }

  if (pane) {
    pane.expanded = true
  }

  const deltaX = e.clientX - state.startX
  const deltaY = e.clientY - state.startY

  const newLeft = state.initialLeft + deltaX
  const newBottom = state.initialBottom - deltaY

  const rect = tweakpaneElement.getBoundingClientRect()
  const clampedLeft = Math.max(
    0,
    Math.min(window.innerWidth - rect.width, newLeft)
  )
  const clampedBottom = Math.max(
    0,
    Math.min(window.innerHeight - rect.height, newBottom)
  )

  tweakpaneElement.style.left = `${clampedLeft}px`
  tweakpaneElement.style.bottom = `${clampedBottom}px`
  tweakpaneElement.style.right = 'auto'
  tweakpaneElement.style.top = 'auto'
}

/**
 * Handles drag end event
 * @param {MouseEvent} e
 * @param {Object} state
 * @param {HTMLElement} tweakpaneElement
 * @param {import('tweakpane').Pane} pane
 */
function handleDragEnd(e, state, tweakpaneElement, pane) {
  if (!state.isDragging) return

  state.isDragging = false
  tweakpaneElement.style.transition = ''

  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  requestAnimationFrame(() => {
    if (pane) {
      pane.expanded = true
    } else {
      ensurePaneExpanded(tweakpaneElement)
    }
  })

  setTimeout(() => {
    if (pane) {
      pane.expanded = true
    }
  }, 0)
}

/**
 * Prevents click event from toggling pane after drag
 * @param {MouseEvent} e
 * @param {Object} state
 * @param {import('tweakpane').Pane} pane
 */
function handleClickPrevention(e, state, pane) {
  if (state.dragHappened) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    state.dragHappened = false

    if (pane) {
      pane.expanded = true
    }
  }
}

/**
 * Manually ensures pane is expanded (fallback when no pane reference)
 * @param {HTMLElement} tweakpaneElement
 */
function ensurePaneExpanded(tweakpaneElement) {
  if (tweakpaneElement.classList.contains('tp-dfwv-c')) {
    tweakpaneElement.classList.remove('tp-dfwv-c')
    const rootView = tweakpaneElement.querySelector('.tp-rotv')
    if (rootView) {
      rootView.style.display = ''
    }
  }
}

/**
 * Attaches all event listeners
 * @param {HTMLElement} titleElement
 * @param {Object} handlers
 */
function attachEventListeners(titleElement, handlers) {
  titleElement.addEventListener('selectstart', handlers.preventSelect)
  titleElement.addEventListener('dragstart', handlers.preventSelect)

  titleElement.addEventListener('mousedown', handlers.dragStart, {
    passive: false
  })

  const parent = titleElement.parentElement
  if (parent?.classList.contains('tp-lblv')) {
    parent.addEventListener('mousedown', handlers.dragStart, {
      passive: false
    })
  }

  document.addEventListener('mousemove', handlers.drag, { passive: false })
  document.addEventListener('mouseup', handlers.dragEnd, { passive: false })

  titleElement.addEventListener('click', handlers.preventClick, {
    capture: true
  })
}

/**
 * Removes all event listeners
 * @param {HTMLElement} titleElement
 * @param {Object} handlers
 */
function removeEventListeners(titleElement, handlers) {
  titleElement.removeEventListener('selectstart', handlers.preventSelect)
  titleElement.removeEventListener('dragstart', handlers.preventSelect)
  titleElement.removeEventListener('mousedown', handlers.dragStart)
  titleElement.removeEventListener('click', handlers.preventClick)

  const parent = titleElement.parentElement
  if (parent?.classList.contains('tp-lblv')) {
    parent.removeEventListener('mousedown', handlers.dragStart)
  }

  document.removeEventListener('mousemove', handlers.drag)
  document.removeEventListener('mouseup', handlers.dragEnd)
}
