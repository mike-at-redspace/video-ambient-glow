/**
 * Frame processing - extracts frames from video and blends them.
 *
 * @module lib/frameProcessor
 * @internal
 */

import type { NormalizedGlowOptions } from '../types'
import { VIDEO_READY_STATE_CURRENT_DATA } from '../constants'

/**
 * Draws a video frame and blends it with the previous one for smooth transitions.
 *
 * @param video - Video element to sample.
 * @param tempCtx - Temp canvas for extraction.
 * @param mainCtx - Main canvas for glow.
 * @param canvasWidth - Canvas width.
 * @param canvasHeight - Canvas height.
 * @param options - Options with blend weights.
 * @param lastImage - Previous frame data, or null.
 * @returns New frame data for next blend.
 *
 * @internal
 */
export function drawAndBlendFrame(
  video: HTMLVideoElement,
  tempCtx: CanvasRenderingContext2D,
  mainCtx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  options: NormalizedGlowOptions,
  lastImage: ImageData | null
): ImageData | null {
  if (video.readyState < VIDEO_READY_STATE_CURRENT_DATA || canvasWidth === 0) {
    return lastImage
  }

  const { blendOld, blendNew } = options

  try {
    tempCtx.drawImage(video, 0, 0, canvasWidth, canvasHeight)
    const newFrame = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight)

    if (lastImage) {
      const blendedFrame = blendFrames(lastImage, newFrame, blendOld, blendNew)
      mainCtx.putImageData(blendedFrame, 0, 0)
      return blendedFrame
    } else {
      mainCtx.putImageData(newFrame, 0, 0)
      return newFrame
    }
  } catch (error) {
    // Handle CORS or other drawing errors gracefully
    console.warn('AmbientGlow: Failed to draw frame:', error)
    return lastImage
  }
}

/**
 * Blends two frames using weighted pixel averaging (modifies oldFrame in place).
 *
 * @param oldFrame - Previous frame (gets modified).
 * @param newFrame - New frame.
 * @param blendOld - Weight for old frame (0-1).
 * @param blendNew - Weight for new frame (0-1).
 * @returns Blended frame (same ref as oldFrame).
 *
 * @internal
 */
export function blendFrames(
  oldFrame: ImageData,
  newFrame: ImageData,
  blendOld: number,
  blendNew: number
): ImageData {
  const oldData = oldFrame.data
  const newData = newFrame.data
  const len = oldData.length

  for (let i = 0; i < len; i++) {
    oldData[i] = oldData[i] * blendOld + newData[i] * blendNew
  }

  return oldFrame
}
