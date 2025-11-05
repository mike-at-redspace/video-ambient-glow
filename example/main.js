import { AmbientGlow } from 'video-ambient-glow'
import { DOM_IDS, DEFAULT_GLOW_PARAMS, VIDEO_SOURCES } from './constants.js'
import {
  createVideoCard,
  createPlayVideoFunction,
  createCopyCodeButtonHandler,
  createResetButtonHandler,
  setupPane
} from './lib/index.js'

/**
 * Example application demonstrating the video-ambient-glow library.
 *
 * This demo showcases:
 * - Initializing the ambient glow effect on a video element
 * - Dynamically updating glow parameters at runtime
 * - Integration with a video player interface
 * - Interactive controls using Tweakpane
 * - Building a video playlist with cards
 *
 * @fileoverview Main application entry point for the example demo
 */

// ============================================================================
// DOM Element References
// ============================================================================

const video = document.getElementById(DOM_IDS.PLAYER)
const videoTitleEl = document.getElementById(DOM_IDS.VIDEO_TITLE)
const spinner = document.getElementById(DOM_IDS.SPINNER)
const cardsContainer = document.getElementById(DOM_IDS.CARDS_CONTAINER)

// ============================================================================
// Playlist Initialization
// ============================================================================

const cardElements = []
VIDEO_SOURCES.forEach((src, index) => {
  const card = createVideoCard(src, index)
  cardElements.push(card)
  cardsContainer.appendChild(card)
})

const cards = cardElements
const playVideo = createPlayVideoFunction(video, videoTitleEl, cards)

cards.forEach((card, index) => {
  card.addEventListener('click', () => playVideo(index))
})

playVideo(0)

// ============================================================================
// Ambient Glow Initialization
// ============================================================================

const params = { ...DEFAULT_GLOW_PARAMS }
const glow = new AmbientGlow(video, params)

// ============================================================================
// Video Loading State Management
// ============================================================================

const showSpinner = () => spinner.classList.remove('spinner-hidden')
const hideSpinner = () => spinner.classList.add('spinner-hidden')

video.addEventListener('loadstart', showSpinner)
video.addEventListener('playing', hideSpinner)
video.addEventListener('waiting', showSpinner)
video.addEventListener('error', hideSpinner)

// ============================================================================
// Tweakpane Controls Setup
// ============================================================================

const pane = setupPane(params, glow)

// Copy code button
const copyButton = pane.addButton({ title: 'Copy Code' })
copyButton.on('click', () => {
  createCopyCodeButtonHandler(params)()
  const button = copyButton.element
  if (button) {
    const textElement =
      button.querySelector('.tp-btnv_t') ||
      button.querySelector('span') ||
      button.firstChild
    const originalText = button.textContent.trim()

    if (textElement) {
      textElement.textContent = 'Copied!'
      setTimeout(() => {
        textElement.textContent = originalText
      }, 1000)
    }
  }
})

pane
  .addButton({ title: 'Reset' })
  .on('click', createResetButtonHandler(pane, params, glow))
