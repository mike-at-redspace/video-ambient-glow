import { VIDEO_SOURCES, CARD_CONFIG } from '../constants.js'

/**
 * Creates a function to play a video from the playlist by index.
 * Updates the UI to show which video is currently playing.
 *
 * @param {HTMLVideoElement} video - The video element to control
 * @param {HTMLElement} videoTitleEl - Element to display the video title
 * @param {HTMLElement[]} cards - Array of card elements
 * @returns {(index: number) => void} Function that plays a video by index
 */
export const createPlayVideoFunction = (video, videoTitleEl, cards) =>
  function playVideo(index) {
    if (index < 0 || index >= cards.length || !cards[index]) {
      console.error(`Invalid video index: ${index}`)
      return
    }

    cards.forEach(c => c.classList.remove('playing'))
    cards[index].classList.add('playing')

    video.src = VIDEO_SOURCES[index]
    const titleElement = cards[index].querySelector('h3')
    if (titleElement) {
      videoTitleEl.textContent = `${titleElement.textContent}${CARD_CONFIG.TITLE_SUFFIX}`
    }

    video.load()
    video.play().catch(error => console.error('Error playing video:', error))
  }
