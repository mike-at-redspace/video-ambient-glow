/**
 * Event handler utilities for video and resize events.
 *
 * @module lib/eventHandlers
 * @internal
 */

/**
 * Video events we listen to.
 *
 * @internal
 */
export type VideoEventType =
  | 'loadstart'
  | 'loadedmetadata'
  | 'canplay'
  | 'play'
  | 'pause'
  | 'ended'
  | 'seeked'

/**
 * Callbacks for video/resize events.
 *
 * @internal
 */
export interface EventHandlers {
  onLoadStart: () => void
  onLoadedMetadata: () => void
  onCanPlay: () => void
  onPlay: () => void
  onPause: () => void
  onEnded: () => void
  onSeeked: () => void
  onResize: () => void
}

/**
 * Creates video event handlers.
 *
 * @param handlers - Callbacks for each event.
 * @returns Array of [eventType, handler] pairs.
 *
 * @internal
 */
export function createVideoEventHandlers(
  handlers: Pick<
    EventHandlers,
    | 'onLoadStart'
    | 'onLoadedMetadata'
    | 'onCanPlay'
    | 'onPlay'
    | 'onPause'
    | 'onEnded'
    | 'onSeeked'
  >
): [VideoEventType, EventListener][] {
  return [
    ['loadstart', handlers.onLoadStart],
    ['loadedmetadata', handlers.onLoadedMetadata],
    ['canplay', handlers.onCanPlay],
    ['play', handlers.onPlay],
    ['pause', handlers.onPause],
    ['ended', handlers.onEnded],
    ['seeked', handlers.onSeeked]
  ]
}
