# video-ambient-glow Example

[![Netlify Status](https://api.netlify.com/api/v1/badges/8a3d5952-e15b-4719-8f99-7e288dc3eedd/deploy-status)](https://app.netlify.com/projects/video-ambient-glow/deploys)

**[🎬 View Live Demo](https://video-ambient-glow.netlify.app/)**

Interactive demo with real-time controls and a video playlist showcasing the glow effect.

## Features

- 🎨 Real-time glow effect with live parameter adjustments
- 🎛️ Interactive Tweakpane controls for all options
- 📹 Video playlist with sample content
- 📱 Responsive layout

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Building

```bash
npm run build
```

Output in `dist/` directory.

## Customization

Edit `constants.js` to change:

- **Video sources** — Update `VIDEO_SOURCES` array
- **Default glow params** — Modify `DEFAULT_GLOW_PARAMS`
- **Control ranges** — Adjust `TWEAKPANE_CONFIG`

## Project Structure

The example is organized into modules under `lib/`:

- `createVideoCard.js` — Creates playlist card elements from templates
- `playVideo.js` — Handles video playback and UI updates
- `tweakpaneControls.js` — Sets up Tweakpane bindings for glow parameters
- `tweakpaneStyles.js` — Applies custom positioning styles to Tweakpane
- `tweakpaneDrag.js` — Makes Tweakpane draggable
- `initializeTweakpane.js` — Initializes Tweakpane with retry logic for async DOM

## Tech Stack

video-ambient-glow • Tweakpane • Handlebars • Vite • Tailwind CSS
