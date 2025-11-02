/**
 * Unit tests for event handler utilities.
 *
 * @module lib/eventHandlers
 */

import { describe, it, expect, vi } from 'vitest'
import { createVideoEventHandlers } from '../src/lib/eventHandlers'
import type { EventHandlers } from '../src/lib/eventHandlers'

describe('eventHandlers utilities', () => {
  describe('createVideoEventHandlers', () => {
    it('returns array of event type and handler pairs', () => {
      const handlers: Pick<
        EventHandlers,
        | 'onLoadStart'
        | 'onLoadedMetadata'
        | 'onCanPlay'
        | 'onPlay'
        | 'onPause'
        | 'onEnded'
        | 'onSeeked'
      > = {
        onLoadStart: vi.fn(),
        onLoadedMetadata: vi.fn(),
        onCanPlay: vi.fn(),
        onPlay: vi.fn(),
        onPause: vi.fn(),
        onEnded: vi.fn(),
        onSeeked: vi.fn()
      }

      const eventHandlers = createVideoEventHandlers(handlers)

      expect(eventHandlers).toHaveLength(7)
      expect(eventHandlers[0][0]).toBe('loadstart')
      expect(eventHandlers[1][0]).toBe('loadedmetadata')
      expect(eventHandlers[2][0]).toBe('canplay')
      expect(eventHandlers[3][0]).toBe('play')
      expect(eventHandlers[4][0]).toBe('pause')
      expect(eventHandlers[5][0]).toBe('ended')
      expect(eventHandlers[6][0]).toBe('seeked')
    })

    it('maps handlers to correct event types', () => {
      const onLoadStart = vi.fn()
      const onLoadedMetadata = vi.fn()
      const onCanPlay = vi.fn()
      const onPlay = vi.fn()
      const onPause = vi.fn()
      const onEnded = vi.fn()
      const onSeeked = vi.fn()

      const eventHandlers = createVideoEventHandlers({
        onLoadStart,
        onLoadedMetadata,
        onCanPlay,
        onPlay,
        onPause,
        onEnded,
        onSeeked
      })

      expect(eventHandlers[0][1]).toBe(onLoadStart)
      expect(eventHandlers[1][1]).toBe(onLoadedMetadata)
      expect(eventHandlers[2][1]).toBe(onCanPlay)
      expect(eventHandlers[3][1]).toBe(onPlay)
      expect(eventHandlers[4][1]).toBe(onPause)
      expect(eventHandlers[5][1]).toBe(onEnded)
      expect(eventHandlers[6][1]).toBe(onSeeked)
    })

    it('can be used with addEventListener', () => {
      const video = document.createElement('video')
      const onPlay = vi.fn()

      const eventHandlers = createVideoEventHandlers({
        onLoadStart: vi.fn(),
        onLoadedMetadata: vi.fn(),
        onCanPlay: vi.fn(),
        onPlay,
        onPause: vi.fn(),
        onEnded: vi.fn(),
        onSeeked: vi.fn()
      })

      // Add all event listeners
      eventHandlers.forEach(([type, handler]) => {
        video.addEventListener(type, handler)
      })

      // Trigger play event
      video.dispatchEvent(new Event('play'))
      expect(onPlay).toHaveBeenCalledTimes(1)

      // Clean up
      eventHandlers.forEach(([type, handler]) => {
        video.removeEventListener(type, handler)
      })
    })

    it('creates independent handler arrays', () => {
      const handlers1 = createVideoEventHandlers({
        onLoadStart: vi.fn(),
        onLoadedMetadata: vi.fn(),
        onCanPlay: vi.fn(),
        onPlay: vi.fn(),
        onPause: vi.fn(),
        onEnded: vi.fn(),
        onSeeked: vi.fn()
      })

      const handlers2 = createVideoEventHandlers({
        onLoadStart: vi.fn(),
        onLoadedMetadata: vi.fn(),
        onCanPlay: vi.fn(),
        onPlay: vi.fn(),
        onPause: vi.fn(),
        onEnded: vi.fn(),
        onSeeked: vi.fn()
      })

      expect(handlers1).not.toBe(handlers2)
      expect(handlers1[0][1]).not.toBe(handlers2[0][1])
    })
  })
})
