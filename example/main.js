import { AmbientGlow } from 'video-ambient-glow'
import { Pane } from 'tweakpane'
import {
  DOM_IDS,
  DEFAULT_GLOW_PARAMS,
  TWEAKPANE_TITLE,
  VIDEO_SOURCES
} from './constants.js'
import {
  createVideoCard,
  createPlayVideoFunction,
  setupTweakpaneControls,
  createResetButtonHandler,
  setupTweakpaneInitialization
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

const showSpinner = () => (spinner.style.display = 'block')
const hideSpinner = () => (spinner.style.display = 'none')

video.addEventListener('loadstart', showSpinner)
video.addEventListener('playing', hideSpinner)
video.addEventListener('waiting', showSpinner)
video.addEventListener('error', hideSpinner)

// ============================================================================
// Tweakpane Controls Setup
// ============================================================================

const pane = new Pane({ title: TWEAKPANE_TITLE })
setupTweakpaneInitialization(pane)

setupTweakpaneControls(pane, params, glow)

pane
  .addButton({ title: 'Reset' })
  .on('click', createResetButtonHandler(pane, params, glow))
