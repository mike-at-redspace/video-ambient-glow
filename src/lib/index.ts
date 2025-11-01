/**
 * @module lib
 * @packageDocumentation
 *
 * Internal library modules for canvas operations, frame processing, and event handling.
 *
 * @internal
 */

export {
  createGlowCanvas,
  createTempCanvas,
  getCanvasContext,
  updateCanvasFilterStyles,
  ensureParentPositioning
} from './canvas'
export { drawAndBlendFrame } from './frameProcessor'
export {
  createVideoEventHandlers,
  type VideoEventType,
  type EventHandlers
} from './eventHandlers'
