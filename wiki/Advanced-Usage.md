Advanced patterns, performance optimization, error handling, and edge cases.

## Performance Optimization

### Understanding Performance Parameters

The three main performance parameters are:

1. **`downscale`** - Biggest impact on CPU usage
2. **`updateInterval`** - Controls update frequency
3. **`blendOld`/`blendNew`** - Affects transition smoothness

### Performance Profiles

#### Mobile/Low-End Device Profile

```typescript
const glow = new AmbientGlow(video, {
  downscale: 0.04, // Low resolution sampling
  updateInterval: 1500, // Update every 1.5 seconds
  blendOld: 0.9, // Very smooth transitions
  blendNew: 0.1,
  blur: 70 // Slightly reduced blur
})
```

**CPU Usage**: ~30% less than default  
**Quality**: Slightly less accurate color representation

#### Desktop/High-End Device Profile

```typescript
const glow = new AmbientGlow(video, {
  downscale: 0.15, // Higher resolution sampling
  updateInterval: 500, // Update every 500ms
  blendOld: 0.7, // More reactive transitions
  blendNew: 0.3,
  blur: 120
})
```

**CPU Usage**: ~50% more than default  
**Quality**: Sharper, more accurate color transitions

#### Adaptive Performance

```typescript
function createAdaptiveGlow(video: HTMLVideoElement) {
  // Detect device capability
  const isMobile = /Mobi|Android/i.test(navigator.userAgent)
  const isLowEnd = navigator.hardwareConcurrency <= 4

  const profile = isMobile || isLowEnd ? 'low' : 'high'

  const configs = {
    low: {
      downscale: 0.04,
      updateInterval: 1500,
      blendOld: 0.9,
      blur: 70
    },
    high: {
      downscale: 0.15,
      updateInterval: 500,
      blendOld: 0.7,
      blur: 120
    }
  }

  return new AmbientGlow(video, configs[profile])
}
```

### Performance Monitoring

```typescript
class PerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 0

  constructor() {
    this.monitor()
  }

  private monitor() {
    const now = performance.now()
    this.frameCount++

    if (now >= this.lastTime + 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastTime = now
      console.log(`Glow FPS: ${this.fps}`)
    }

    requestAnimationFrame(() => this.monitor())
  }

  getFPS() {
    return this.fps
  }
}

// Usage
const monitor = new PerformanceMonitor()
const glow = new AmbientGlow(video)

// Adjust if performance is poor
if (monitor.getFPS() < 30) {
  glow.updateOptions({ downscale: 0.04, updateInterval: 2000 })
}
```

## CORS and Cross-Origin Videos

### Enabling CORS

```typescript
const video = document.createElement('video')
video.crossOrigin = 'anonymous' // Required for cross-origin sources
video.src = 'https://example.com/video.mp4'

document.body.appendChild(video)

const glow = new AmbientGlow(video, {
  blur: 96,
  opacity: 0.65
})
```

### Handling CORS Errors

```typescript
const video = document.querySelector('video')
video.crossOrigin = 'anonymous'

const glow = new AmbientGlow(video)

// Listen for canvas errors (CORS issues)
const originalWarn = console.warn
console.warn = (...args) => {
  if (args[0]?.includes?.('canvas') || args[0]?.includes?.('CORS')) {
    console.error(
      'CORS error detected. Video must be served with proper CORS headers.'
    )
    // Optionally disable glow or show fallback
  }
  originalWarn.apply(console, args)
}
```

### Server-Side CORS Setup

For videos you control, ensure proper CORS headers:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Range
```

## Error Handling

### Comprehensive Error Handling

```typescript
import { AmbientGlow } from 'video-ambient-glow'

function createSafeGlow(video: HTMLVideoElement, options = {}) {
  try {
    // Validate video element
    if (!video || !(video instanceof HTMLVideoElement)) {
      throw new Error('Invalid video element')
    }

    // Check if video is in DOM
    if (!video.parentElement) {
      throw new Error('Video element must be in the DOM')
    }

    // Check browser support
    if (!document.createElement('canvas').getContext('2d')) {
      throw new Error('Canvas 2D not supported in this browser')
    }

    const glow = new AmbientGlow(video, options)

    // Handle video errors
    video.addEventListener('error', e => {
      console.error('Video error:', e)
      // Don't destroy glow - it will handle gracefully
    })

    // Handle CORS issues
    video.addEventListener('loadstart', () => {
      if (!video.crossOrigin && video.src.startsWith('http')) {
        console.warn(
          'Consider setting crossOrigin="anonymous" for cross-origin videos'
        )
      }
    })

    return glow
  } catch (error) {
    console.error('Failed to create glow effect:', error)
    // Return null or a no-op object
    return null
  }
}

// Usage
const video = document.querySelector('video')
const glow = createSafeGlow(video, { blur: 96, opacity: 0.65 })

if (glow) {
  video.play()
}
```

### Graceful Degradation

```typescript
function createGlowWithFallback(video: HTMLVideoElement) {
  try {
    return new AmbientGlow(video, { blur: 96, opacity: 0.65 })
  } catch (error) {
    // Fallback: Add a simple CSS-based glow
    video.style.boxShadow = '0 0 60px rgba(128, 128, 128, 0.3)'
    video.style.filter = 'drop-shadow(0 0 20px rgba(128, 128, 128, 0.2))'

    return {
      updateOptions: () => {},
      destroy: () => {
        video.style.boxShadow = ''
        video.style.filter = ''
      },
      getIsDestroyed: () => false
    }
  }
}
```

## Video Source Management

### Handling Source Changes

```typescript
class VideoManager {
  private video: HTMLVideoElement
  private glow: AmbientGlow
  private currentSource: string | null = null

  constructor(video: HTMLVideoElement) {
    this.video = video
    this.glow = new AmbientGlow(video, { blur: 96, opacity: 0.65 })

    this.setupListeners()
  }

  private setupListeners() {
    this.video.addEventListener('loadstart', () => {
      console.log('New video loading, glow will reset')
      // Glow automatically handles reset
    })

    this.video.addEventListener('canplay', () => {
      console.log('Video ready, glow will update')
    })
  }

  changeSource(src: string) {
    if (this.currentSource === src) return

    this.currentSource = src
    this.video.src = src
    this.video.load()
  }

  destroy() {
    this.glow.destroy()
  }
}
```

### Multiple Source Elements

```typescript
function setupVideoWithSources(video: HTMLVideoElement, sources: string[]) {
  const glow = new AmbientGlow(video)

  sources.forEach(src => {
    const sourceElement = document.createElement('source')
    sourceElement.src = src
    sourceElement.type = `video/${src.split('.').pop()}`
    video.appendChild(sourceElement)
  })

  video.load()
  return glow
}
```

## Viewport and Resize Handling

The glow automatically handles viewport changes, but you can customize behavior:

```typescript
const video = document.querySelector('video')
const glow = new AmbientGlow(video, { blur: 96, opacity: 0.65 })

// Adjust scale based on viewport
function handleResize() {
  const isMobile = window.innerWidth < 768
  glow.updateOptions({
    scale: isMobile ? 1.05 : 1.1,
    blur: isMobile ? 60 : 96
  })
}

window.addEventListener('resize', handleResize)
handleResize() // Initial call
```

## State Management

### Storing and Restoring Settings

```typescript
interface GlowSettings {
  blur: number
  opacity: number
  brightness: number
  saturate: number
}

class GlowStateManager {
  private storageKey = 'glow-settings'

  save(glow: AmbientGlow) {
    // Note: You'll need to extend AmbientGlow or track settings separately
    const settings: GlowSettings = {
      blur: 96, // Get current values from your state
      opacity: 0.65,
      brightness: 1.1,
      saturate: 1.2
    }

    localStorage.setItem(this.storageKey, JSON.stringify(settings))
  }

  load(): Partial<GlowSettings> | null {
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : null
  }

  apply(glow: AmbientGlow) {
    const settings = this.load()
    if (settings) {
      glow.updateOptions(settings)
    }
  }
}

// Usage
const glow = new AmbientGlow(video)
const stateManager = new GlowStateManager()

// Load saved settings
stateManager.apply(glow)

// Save settings when user changes them
function updateSettings(newSettings: Partial<GlowSettings>) {
  glow.updateOptions(newSettings)
  // Save to localStorage
  stateManager.save(glow)
}
```

## Multiple Videos with Independent Controls

```typescript
class MultiVideoGlowManager {
  private glows = new Map<HTMLVideoElement, AmbientGlow>()
  private settings = new Map<HTMLVideoElement, any>()

  addVideo(video: HTMLVideoElement, options = {}) {
    if (this.glows.has(video)) {
      return this.glows.get(video)!
    }

    const glow = new AmbientGlow(video, options)
    this.glows.set(video, glow)
    this.settings.set(video, { ...options })

    return glow
  }

  removeVideo(video: HTMLVideoElement) {
    const glow = this.glows.get(video)
    if (glow) {
      glow.destroy()
      this.glows.delete(video)
      this.settings.delete(video)
    }
  }

  updateVideo(video: HTMLVideoElement, options: any) {
    const glow = this.glows.get(video)
    if (glow) {
      glow.updateOptions(options)
      const current = this.settings.get(video) || {}
      this.settings.set(video, { ...current, ...options })
    }
  }

  updateAll(options: any) {
    this.glows.forEach(glow => {
      glow.updateOptions(options)
    })
  }

  destroyAll() {
    this.glows.forEach(glow => glow.destroy())
    this.glows.clear()
    this.settings.clear()
  }
}

// Usage
const manager = new MultiVideoGlowManager()

const video1 = document.querySelector('#video1')
const video2 = document.querySelector('#video2')

manager.addVideo(video1, { blur: 96, opacity: 0.65 })
manager.addVideo(video2, { blur: 120, opacity: 0.8 })

// Update all videos at once
manager.updateAll({ brightness: 1.2 })

// Update individual video
manager.updateVideo(video1, { blur: 150 })
```

## Testing and Debugging

### Debug Mode

```typescript
function createDebugGlow(video: HTMLVideoElement, options = {}) {
  const glow = new AmbientGlow(video, options)

  // Add visual debugging
  const canvas = document.querySelector('canvas[data-ambient-glow]')
  if (canvas) {
    canvas.style.border = '2px solid red'
    canvas.style.opacity = '0.5'

    // Remove debug styling after a moment
    setTimeout(() => {
      canvas.style.border = ''
      canvas.style.opacity = ''
    }, 2000)
  }

  return glow
}
```

### Logging Updates

```typescript
class LoggedGlow extends AmbientGlow {
  updateOptions(options: any) {
    console.log('Glow options updated:', options)
    super.updateOptions(options)
  }
}

// Note: This requires modifying the library or using a wrapper
```

## Integration with Media Libraries

### Video.js Integration

```typescript
import videojs from 'video.js'
import { AmbientGlow } from 'video-ambient-glow'

const player = videojs('my-video')
let glow: AmbientGlow | null = null

player.ready(() => {
  const videoElement = player.el().querySelector('video')
  if (videoElement) {
    glow = new AmbientGlow(videoElement, {
      blur: 96,
      opacity: 0.65
    })
  }
})

player.on('dispose', () => {
  glow?.destroy()
})
```

### Plyr Integration

```typescript
import Plyr from 'plyr'
import { AmbientGlow } from 'video-ambient-glow'

const player = new Plyr('#video')
let glow: AmbientGlow | null = null

player.on('ready', () => {
  const videoElement = document.querySelector('video')
  if (videoElement) {
    glow = new AmbientGlow(videoElement, {
      blur: 96,
      opacity: 0.65
    })
  }
})

player.on('destroy', () => {
  glow?.destroy()
})
```
