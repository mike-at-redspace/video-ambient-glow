## AmbientGlow Class

The main class for creating and managing ambient glow effects on video elements.

### Constructor

```typescript
new AmbientGlow(video: HTMLVideoElement, options?: GlowOptions)
```

Creates a new ambient glow effect instance attached to a video element.

#### Parameters

- **video** (`HTMLVideoElement`, required) - The HTML5 video element to attach the glow effect to
- **options** (`GlowOptions`, optional) - Configuration object for customizing the glow effect

#### Returns

An `AmbientGlow` instance.

#### Example

```typescript
const video = document.querySelector('video')
const glow = new AmbientGlow(video, {
  blur: 96,
  opacity: 0.65,
  brightness: 1.1,
  saturate: 1.2
})
```

### GlowOptions Interface

```typescript
interface GlowOptions {
  blur?: number // Blur radius in pixels (default: 96)
  opacity?: number // Opacity 0-1 (default: 0.65)
  brightness?: number // Brightness multiplier (default: 1.1)
  saturate?: number // Saturation multiplier (default: 1.2)
  scale?: number // Canvas scale factor (default: 1.08)
  downscale?: number // Frame sampling scale 0.01-0.5 (default: 0.08)
  updateInterval?: number // Update interval in ms (default: 900)
  blendOld?: number // Old frame blend weight (default: 0.85)
  blendNew?: number // New frame blend weight (default: 0.15)
}
```

See [Configuration](Configuration) for detailed explanations of each option.

## Methods

### updateOptions

Dynamically update glow parameters while the video is playing.

```typescript
glow.updateOptions(options: Partial<GlowOptions>): void
```

#### Parameters

- **options** (`Partial<GlowOptions>`) - Partial options object with properties to update

#### Example

```typescript
// Update blur and opacity
glow.updateOptions({ blur: 120, opacity: 0.8 })

// Update multiple properties
glow.updateOptions({
  brightness: 1.5,
  saturate: 2.0,
  blur: 150
})

// Only specified options are updated, others remain unchanged
glow.updateOptions({ opacity: 0.3 })
```

### destroy

Clean up the glow effect by removing event listeners, stopping animations, and removing the canvas from the DOM.

```typescript
glow.destroy(): void
```

#### Example

```typescript
// Clean up when done
glow.destroy()

// Check if destroyed
if (glow.getIsDestroyed()) {
  console.log('Glow has been cleaned up')
}
```

**Note**: After calling `destroy()`, attempting to call other methods will log warnings. Always check `getIsDestroyed()` before using other methods if needed.

### getIsDestroyed

Check if the glow instance has been destroyed.

```typescript
glow.getIsDestroyed(): boolean
```

#### Returns

`true` if the instance has been destroyed, `false` otherwise.

#### Example

```typescript
if (!glow.getIsDestroyed()) {
  glow.updateOptions({ blur: 100 })
}
```

## Behavior

### Automatic Event Handling

The glow effect automatically responds to video events:

- **Play** - Effect starts/resumes updating
- **Pause** - Effect pauses (stops updating but remains visible)
- **Seek** - Effect updates to reflect the new frame
- **Loadstart** - Effect resets and clears previous frame data
- **Resize** - Canvas resizes to match video dimensions

### Canvas Positioning

The glow canvas is automatically:

- Positioned behind the video element using absolute positioning
- Scaled based on the `scale` option (default: 1.08, extends 8% beyond video)
- Synchronized with video dimensions and viewport changes

### Performance

- Updates are throttled based on `updateInterval` option
- Frame sampling is downscaled based on `downscale` option
- Animation automatically pauses when video is paused
- Updates only occur when video is playing

## Error Handling

The library handles common errors gracefully:

- **CORS issues** - Logs warnings but continues with previous frame data
- **Canvas context errors** - Throws descriptive errors at initialization
- **Missing video element** - Validates that video is in the DOM before creating glow

See [Advanced Usage](Advanced-Usage) for detailed error handling examples.
