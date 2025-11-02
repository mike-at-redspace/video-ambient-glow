Practical examples and use cases for video-ambient-glow.

## Basic Usage

### Minimal Setup

```typescript
import { AmbientGlow } from 'video-ambient-glow'

const video = document.querySelector('video')
const glow = new AmbientGlow(video)

video.play()
```

### With Default Options

```typescript
import { AmbientGlow } from 'video-ambient-glow'

const video = document.querySelector('video')
const glow = new AmbientGlow(video, {
  blur: 96,
  opacity: 0.65,
  brightness: 1.1,
  saturate: 1.2
})

video.addEventListener('loadedmetadata', () => {
  video.play()
})
```

## Custom Configurations

### Subtle Effect

```typescript
const glow = new AmbientGlow(video, {
  blur: 60,
  opacity: 0.3,
  brightness: 0.9,
  saturate: 0.8,
  scale: 1.05
})
```

### Dramatic Effect

```typescript
const glow = new AmbientGlow(video, {
  blur: 150,
  opacity: 0.9,
  brightness: 1.4,
  saturate: 2.0,
  scale: 1.15
})
```

### Monochrome Atmospheric

```typescript
const glow = new AmbientGlow(video, {
  blur: 100,
  opacity: 0.6,
  brightness: 1.0,
  saturate: 0.2, // Near-grayscale
  scale: 1.1
})
```

## Dynamic Updates

### Update on User Interaction

```typescript
const glow = new AmbientGlow(video, {
  blur: 96,
  opacity: 0.65
})

// User adjusts settings
document.getElementById('blur-slider')?.addEventListener('input', e => {
  const blur = parseInt((e.target as HTMLInputElement).value)
  glow.updateOptions({ blur })
})

document.getElementById('opacity-slider')?.addEventListener('input', e => {
  const opacity = parseFloat((e.target as HTMLInputElement).value)
  glow.updateOptions({ opacity })
})
```

### Preset Styles

```typescript
const glow = new AmbientGlow(video)

function setStyle(style: 'subtle' | 'dramatic' | 'neon') {
  const styles = {
    subtle: { blur: 60, opacity: 0.3, brightness: 0.9 },
    dramatic: { blur: 150, opacity: 0.9, brightness: 1.4 },
    neon: { blur: 120, opacity: 0.8, brightness: 1.6, saturate: 3.0 }
  }

  glow.updateOptions(styles[style])
}

// Usage
document.getElementById('subtle-btn')?.addEventListener('click', () => {
  setStyle('subtle')
})
```

## Performance Modes

### High Performance (Lower Quality)

```typescript
const glow = new AmbientGlow(video, {
  downscale: 0.04,
  updateInterval: 1500,
  blendOld: 0.9,
  blendNew: 0.1,
  blur: 80
})
```

### High Quality (Higher CPU)

```typescript
const glow = new AmbientGlow(video, {
  downscale: 0.15,
  updateInterval: 500,
  blendOld: 0.7,
  blendNew: 0.3,
  blur: 120
})
```

### Balanced (Recommended)

```typescript
const glow = new AmbientGlow(video, {
  downscale: 0.08,
  updateInterval: 900,
  blendOld: 0.85,
  blendNew: 0.15,
  blur: 96
})
```

## Video Playlist

```typescript
interface VideoItem {
  src: string
  title: string
  poster?: string
}

class VideoPlaylist {
  private video: HTMLVideoElement
  private glow: AmbientGlow
  private playlist: VideoItem[]
  private currentIndex: number = 0

  constructor(
    videoElement: HTMLVideoElement,
    playlist: VideoItem[],
    glowOptions = {}
  ) {
    this.video = videoElement
    this.playlist = playlist
    this.glow = new AmbientGlow(this.video, {
      blur: 96,
      opacity: 0.65,
      ...glowOptions
    })

    this.setupEventListeners()
    this.loadVideo(0)
  }

  private setupEventListeners() {
    this.video.addEventListener('ended', () => {
      this.playNext()
    })
  }

  loadVideo(index: number) {
    if (index < 0 || index >= this.playlist.length) return

    this.currentIndex = index
    const item = this.playlist[index]
    this.video.src = item.src
    this.video.load()
    this.video.play()
  }

  playNext() {
    const nextIndex = (this.currentIndex + 1) % this.playlist.length
    this.loadVideo(nextIndex)
  }

  playPrevious() {
    const prevIndex =
      (this.currentIndex - 1 + this.playlist.length) % this.playlist.length
    this.loadVideo(prevIndex)
  }

  updateGlowStyle(options: any) {
    this.glow.updateOptions(options)
  }

  destroy() {
    this.glow.destroy()
  }
}

// Usage
const video = document.querySelector('video')
const playlist = [
  { src: 'video1.mp4', title: 'First Video' },
  { src: 'video2.mp4', title: 'Second Video' },
  { src: 'video3.mp4', title: 'Third Video' }
]

const player = new VideoPlaylist(video, playlist, {
  blur: 96,
  opacity: 0.7
})

document.getElementById('next')?.addEventListener('click', () => {
  player.playNext()
})

document.getElementById('prev')?.addEventListener('click', () => {
  player.playPrevious()
})
```

## Dynamic Source Changes

```typescript
const video = document.querySelector('video')
const glow = new AmbientGlow(video, { blur: 96, opacity: 0.65 })

function changeVideoSource(newSrc: string) {
  video.src = newSrc
  video.load()
}

// Glow automatically resets on loadstart event
video.addEventListener('loadstart', () => {
  console.log('Video loading, glow will reset')
})

video.addEventListener('canplay', () => {
  console.log('Video ready, glow will update')
  video.play()
})

// Switch between multiple videos
const videos = ['video1.mp4', 'video2.mp4', 'video3.mp4']
let currentIndex = 0

document.getElementById('next-btn')?.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % videos.length
  changeVideoSource(videos[currentIndex])
})
```

## Error Handling

```typescript
import { AmbientGlow } from 'video-ambient-glow'

const video = document.querySelector('video')

// Ensure CORS is enabled for cross-origin sources
video.crossOrigin = 'anonymous'

try {
  const glow = new AmbientGlow(video, {
    blur: 96,
    opacity: 0.65
  })

  video.addEventListener('error', e => {
    console.error('Video loading failed:', e)
    glow.destroy()
  })

  video.play().catch(err => {
    console.error('Autoplay failed:', err)
  })
} catch (error) {
  if (error.message.includes('parent element')) {
    console.error('Video must be in DOM before creating glow')
  } else if (error.message.includes('2D rendering context')) {
    console.error('Canvas 2D not supported in this browser')
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Multiple Videos

```typescript
// Create glow effects for multiple videos
const videos = document.querySelectorAll('video')
const glows: AmbientGlow[] = []

videos.forEach(video => {
  const glow = new AmbientGlow(video, {
    blur: 96,
    opacity: 0.65
  })
  glows.push(glow)
})

// Later, clean up all glows
function cleanupAll() {
  glows.forEach(glow => glow.destroy())
  glows.length = 0
}
```

## Responsive Container

```typescript
const video = document.querySelector('video')
const glow = new AmbientGlow(video, {
  blur: 96,
  opacity: 0.65,
  scale: 1.1
})

// The glow automatically resizes with the video
// No additional resize handling needed

// Optional: Adjust scale based on screen size
const mediaQuery = window.matchMedia('(max-width: 768px)')
if (mediaQuery.matches) {
  glow.updateOptions({ scale: 1.05, blur: 60 })
}
```

## Full Control Interface

```typescript
import { AmbientGlow } from 'video-ambient-glow'

class GlowController {
  private glow: AmbientGlow
  private video: HTMLVideoElement

  constructor(video: HTMLVideoElement) {
    this.video = video
    this.glow = new AmbientGlow(video, {
      blur: 96,
      opacity: 0.65,
      brightness: 1.1,
      saturate: 1.2
    })

    this.setupControls()
  }

  private setupControls() {
    // Create UI controls
    const controls = document.createElement('div')
    controls.innerHTML = `
      <div>
        <label>Blur: <input type="range" id="blur" min="0" max="200" value="96"></label>
      </div>
      <div>
        <label>Opacity: <input type="range" id="opacity" min="0" max="1" step="0.01" value="0.65"></label>
      </div>
      <div>
        <label>Brightness: <input type="range" id="brightness" min="0" max="2" step="0.1" value="1.1"></label>
      </div>
      <div>
        <label>Saturate: <input type="range" id="saturate" min="0" max="3" step="0.1" value="1.2"></label>
      </div>
    `
    document.body.appendChild(controls)

    // Bind controls
    controls.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', e => {
        const id = (e.target as HTMLInputElement).id
        const value = parseFloat((e.target as HTMLInputElement).value)

        this.glow.updateOptions({ [id]: value })
      })
    })
  }

  destroy() {
    this.glow.destroy()
  }
}

// Usage
const video = document.querySelector('video')
const controller = new GlowController(video)
video.play()
```
