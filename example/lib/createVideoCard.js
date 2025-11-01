import Handlebars from 'handlebars'
import cardTemplateSource from '../templates/video-card.hbs?raw'
import { CARD_CONFIG } from '../constants.js'

const cardTemplate = Handlebars.compile(cardTemplateSource)

/**
 * Creates a video card element for the playlist using Handlebars template.
 *
 * @param {string} videoSrc - Video source URL
 * @param {number} index - Index of the video in the playlist
 * @returns {HTMLElement} The created card element
 */
export function createVideoCard(videoSrc, index) {
  const views = (
    Math.random() * CARD_CONFIG.VIEWS_MULTIPLIER +
    CARD_CONFIG.VIEWS_MIN
  ).toFixed(1)
  const daysAgo = Math.ceil(Math.random() * CARD_CONFIG.DAYS_MAX)
  const gradientIndex = index % CARD_CONFIG.GRADIENT_COUNT

  const templateData = {
    title: `Sample Video ${index + 1}`,
    publisher: CARD_CONFIG.PUBLISHER_NAME,
    views,
    daysAgo,
    gradientIndex
  }

  const cardHtml = cardTemplate(templateData)

  const card = document.createElement('article')
  card.id = `card-${index}`
  card.className = 'video-card'
  card.innerHTML = cardHtml

  const thumb = card.querySelector('.thumb')
  if (thumb) {
    thumb.style.background = `var(--gradient-${gradientIndex})`
  }

  return card
}
