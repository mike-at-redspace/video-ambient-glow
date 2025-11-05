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
export const createPlayVideoFunction = (video, videoTitleEl, cards) => {
  let currentCanPlayHandler = null
  let currentSource = null

  const cleanupPreviousLoad = () => {
    if (currentCanPlayHandler) {
      video.removeEventListener('canplay', currentCanPlayHandler)
      currentCanPlayHandler = null
    }
  }

  const attemptPlay = () => {
    video.play().catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Error playing video:', error)
      }
    })
  }

  return function playVideo(index) {
    if (index < 0 || index >= cards.length) {
      console.error(`Invalid video index: ${index}`)
      return
    }

    const card = cards[index]
    const newSrc = VIDEO_SOURCES[index]
    const titleElement = card.querySelector('h3')

    cards.forEach(c => c.classList.remove('playing'))
    card.classList.add('playing')

    if (titleElement) {
      videoTitleEl.textContent = `${titleElement.textContent}${CARD_CONFIG.TITLE_SUFFIX}`
    }

    if (video.src === newSrc && currentSource === newSrc) {
      attemptPlay()
      return
    }

    cleanupPreviousLoad()

    currentSource = newSrc
    video.src = newSrc

    currentCanPlayHandler = () => {
      cleanupPreviousLoad()

      if (video.src === newSrc) {
        currentSource = null
        attemptPlay()
      }
    }

    video.addEventListener('canplay', currentCanPlayHandler, { once: true })

    video.load()
  }
}
