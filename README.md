# video-ambient-glow

[![Netlify Status](https://api.netlify.com/api/v1/badges/8a3d5952-e15b-4719-8f99-7e288dc3eedd/deploy-status)](https://app.netlify.com/projects/video-ambient-glow/deploys)

A tiny, zero-dependency library that adds a smooth, color-reactive glow behind any HTML5 video — just like YouTube’s immersive mode.

## Demo

🎬 [Live Example](https://video-ambient-glow.netlify.app/) | [Original on CodePen](https://codepen.io/mike-at-redspace/pen/MYKGdMb)

## Features

- 🎨 Extracts colors directly from the video
- 🌊 Smooth frame blending for natural transitions
- ⚡ Small bundle size (~5.4KB minified, ~2KB gzipped)
- 🎛️ Customizable blur, opacity, brightness, saturation
- 📦 ESM + CJS, tree-shakeable
- 🔒 Written in TypeScript with full types
- ♿ Accessible (canvas uses `aria-hidden`)

## Install

```bash
npm install video-ambient-glow
```

## Quick Start

```ts
import { AmbientGlow } from 'video-ambient-glow'

const video = document.querySelector('video')
const glow = new AmbientGlow(video, {
  blur: 96,
  opacity: 0.65,
  brightness: 1.1,
  saturate: 1.2
})

video.play()

// Cleanup
glow.destroy()
```

## API

### `new AmbientGlow(video, options?)`

Creates a glow behind a video element.

**video** — target `HTMLVideoElement`  
**options** — optional configuration

```ts
interface GlowOptions {
  blur?: number // default: 96
  opacity?: number // 0–1, default: 0.65
  brightness?: number // default: 1.1
  saturate?: number // default: 1.2
  scale?: number // canvas scale, default: 1.08
  downscale?: number // sampling 0.01–0.5, default: 0.08
  updateInterval?: number // in ms, default: 900
  blendOld?: number // old frame weight, default: 0.85
  blendNew?: number // new frame weight, default: 0.15
}
```

### Methods

```ts
glow.updateOptions({ blur: 120, opacity: 0.8 }) // Update settings
glow.destroy() // Remove glow + listeners
```

## Examples

### Basic

```ts
const glow = new AmbientGlow(document.querySelector('video'))
```

### Custom Settings

```ts
const glow = new AmbientGlow(video, {
  blur: 120,
  opacity: 0.8,
  brightness: 1.3,
  saturate: 1.5,
  updateInterval: 500
})
```

### Dynamic Updates

```ts
glow.updateOptions({ opacity: 0.4, blur: 60 })
glow.updateOptions({ opacity: 0.9, blur: 150, saturate: 2.0 })
```

### React Example

```tsx
import { useEffect, useRef } from 'react'
import { AmbientGlow } from 'video-ambient-glow'

export function VideoPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const glow = new AmbientGlow(ref.current, { blur: 96, opacity: 0.65 })
    return () => glow.destroy()
  }, [])

  return <video ref={ref} src={src} controls />
}
```

### Full Demo App

```bash
cd example
npm install
npm run dev
```

Then open http://localhost:5173

## How It Works

1. Captures frames from the video (downscaled for speed)
2. Blends new and old frames for smooth transitions
3. Draws the result to a background canvas
4. Applies CSS filters (blur, brightness, saturation)
5. Uses `requestAnimationFrame` at a throttled rate for performance

Low update rates and small sampling keep it lightweight while still reactive.

## Architecture

- `index.ts` — Main class
- `lib/` — Internal modules
  - `canvas.ts` — Canvas creation and styling
  - `frameProcessor.ts` — Color extraction and blending
  - `eventHandlers.ts` — Safe event listeners
- `constants.ts` — Default config values
- `types.ts` — Type definitions

Modular, typed, and easy to extend.

## Performance Tips

- Lower `downscale` for faster performance
- Increase `updateInterval` to save CPU
- Tune `blendOld`/`blendNew` for smoother or snappier color shifts
- Auto-pauses when the video stops

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run format
```

## Testing

Uses **Vitest** + **happy-dom**.

```bash
npm test
npm run test:watch
```

## License

MIT © [video-ambient-glow contributors](LICENSE)
