# video-ambient-glow

**A lightweight TypeScript library that adds YouTube-style ambient glow effects to HTML5 video elements.**

## Overview

video-ambient-glow extracts colors directly from playing videos and renders them as a smooth, blurred backdrop behind the video element, creating an immersive viewing experience. Unlike YouTube's implementation, this library requires no thumbnail spritesheets or external services—it processes video frames in real-time using canvas APIs.

## Key Features

- 🎨 **Real-time color extraction** - Extracts colors directly from video frames
- 🌊 **Smooth transitions** - Frame blending for natural color transitions
- ⚡ **Lightweight** - Small bundle size (~4.6KB gzipped) with zero runtime dependencies
- 🎛️ **Highly customizable** - Control blur, opacity, brightness, saturation, and more
- 📦 **Universal support** - Works with ESM and CommonJS formats
- 🔒 **Type-safe** - Full TypeScript type definitions included
- ♿ **Accessible** - Canvas uses `aria-hidden` for screen readers
- 🎯 **Auto-responsive** - Automatically responds to video events and viewport changes
- 🚀 **Performance optimized** - Configurable update intervals and downscaling options

## Quick Start

```typescript
import { AmbientGlow } from 'video-ambient-glow'

const video = document.querySelector('video')
const glow = new AmbientGlow(video, {
  blur: 96,
  opacity: 0.65,
  brightness: 1.1,
  saturate: 1.2
})

video.play()

// Cleanup when done
glow.destroy()
```

## Documentation

- **[Installation](Installation)** - How to install and set up the library
- **[API Reference](API-Reference)** - Complete API documentation
- **[Configuration](Configuration)** - All configuration options explained
- **[Framework Integration](Framework-Integration)** - React, Vue, Svelte, and Angular examples
- **[Examples](Examples)** - Usage examples and patterns
- **[Advanced Usage](Advanced-Usage)** - Performance optimization, error handling, and more

## Live Demo

🎬 [View the live example](https://video-ambient-glow.netlify.app/)

## Installation

```bash
npm install video-ambient-glow
```

## Use Cases

Perfect for:
- Media players and video galleries
- Streaming platforms
- Marketing websites with video backgrounds
- Video portfolios and showcases
- Immersive video experiences

## How It Works

1. **Frame Capture** - Captures frames from the video (downscaled for performance)
2. **Color Blending** - Blends new and old frames for smooth transitions
3. **Canvas Rendering** - Draws the result to a background canvas
4. **CSS Filtering** - Applies CSS filters (blur, brightness, saturation)
5. **Throttled Updates** - Uses `requestAnimationFrame` at a configurable rate

The effect automatically responds to video events (play, pause, seek) and viewport changes while maintaining optimal performance through configurable update intervals and downscaling options.

## Browser Support

Works in all modern browsers that support:
- HTML5 Video API
- Canvas 2D Context
- CSS Filters

## License

MIT License - See [LICENSE](../LICENSE) file for details.

