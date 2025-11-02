# Configuration

Complete guide to all configuration options for customizing the ambient glow effect.

## Option Reference

### blur

**Type**: `number`  
**Default**: `96`  
**Range**: Any positive number

Controls the blur radius applied to the glow canvas in pixels. Higher values create a more diffused, softer glow effect.

```typescript
// Subtle blur
const glow = new AmbientGlow(video, { blur: 60 })

// Default blur
const glow = new AmbientGlow(video, { blur: 96 })

// Strong blur
const glow = new AmbientGlow(video, { blur: 150 })
```

### opacity

**Type**: `number`  
**Default**: `0.65`  
**Range**: `0` to `1`

Controls the opacity of the glow effect. Lower values make the glow more subtle, higher values make it more prominent.

```typescript
// Very subtle
const glow = new AmbientGlow(video, { opacity: 0.3 })

// Default
const glow = new AmbientGlow(video, { opacity: 0.65 })

// Very prominent
const glow = new AmbientGlow(video, { opacity: 0.9 })
```

### brightness

**Type**: `number`  
**Default**: `1.1`  
**Range**: Any positive number

Multiplies the brightness of the extracted colors. Values greater than 1 make the glow brighter, values less than 1 make it darker.

```typescript
// Dimmer glow
const glow = new AmbientGlow(video, { brightness: 0.9 })

// Default
const glow = new AmbientGlow(video, { brightness: 1.1 })

// Brighter glow
const glow = new AmbientGlow(video, { brightness: 1.5 })
```

### saturate

**Type**: `number`  
**Default**: `1.2`  
**Range**: Any positive number

Controls color saturation. Values less than 1 desaturate colors (toward grayscale), values greater than 1 enhance colors.

```typescript
// Monochrome/desaturated
const glow = new AmbientGlow(video, { saturate: 0.2 })

// Default
const glow = new AmbientGlow(video, { saturate: 1.2 })

// Highly saturated
const glow = new AmbientGlow(video, { saturate: 2.5 })
```

### scale

**Type**: `number`  
**Default**: `1.08`  
**Range**: Any positive number

Controls how much the glow canvas extends beyond the video element. A scale of `1.08` means the glow extends 8% beyond the video boundaries.

```typescript
// Minimal extension
const glow = new AmbientGlow(video, { scale: 1.05 })

// Default
const glow = new AmbientGlow(video, { scale: 1.08 })

// Extended glow
const glow = new AmbientGlow(video, { scale: 1.15 })
```

### downscale

**Type**: `number`  
**Default**: `0.08`  
**Range**: `0.01` to `0.5`

Controls the resolution at which frames are sampled for color extraction. Lower values sample at lower resolution (faster, less accurate), higher values sample at higher resolution (slower, more accurate).

**Performance Impact**: This is one of the most important performance settings. Lower values significantly reduce CPU usage.

```typescript
// Fast mode (lower quality, less CPU)
const glow = new AmbientGlow(video, { downscale: 0.04 })

// Default
const glow = new AmbientGlow(video, { downscale: 0.08 })

// Quality mode (higher quality, more CPU)
const glow = new AmbientGlow(video, { downscale: 0.15 })
```

### updateInterval

**Type**: `number`  
**Default**: `900`  
**Range**: Any positive number (in milliseconds)

Controls how frequently the glow updates. Higher values mean less frequent updates (saves CPU, smoother but less reactive), lower values mean more frequent updates (uses more CPU, more reactive).

**Performance Impact**: Increasing this value can significantly reduce CPU usage.

```typescript
// Update less frequently (saves CPU)
const glow = new AmbientGlow(video, { updateInterval: 1500 })

// Default
const glow = new AmbientGlow(video, { updateInterval: 900 })

// Update more frequently (more reactive)
const glow = new AmbientGlow(video, { updateInterval: 500 })
```

### blendOld

**Type**: `number`  
**Default**: `0.85`  
**Range**: `0` to `1`

The weight given to the previous frame when blending with the new frame. Higher values create smoother, slower color transitions.

```typescript
// Fast color changes
const glow = new AmbientGlow(video, { blendOld: 0.7, blendNew: 0.3 })

// Default smooth blending
const glow = new AmbientGlow(video, { blendOld: 0.85, blendNew: 0.15 })

// Very smooth transitions
const glow = new AmbientGlow(video, { blendOld: 0.9, blendNew: 0.1 })
```

### blendNew

**Type**: `number`  
**Default**: `0.15`  
**Range**: `0` to `1`

The weight given to the new frame when blending with the previous frame. Lower values create smoother transitions, higher values make color changes more immediate.

**Note**: `blendOld` and `blendNew` should typically sum to 1.0 for best results, though this is not enforced.

## Preset Configurations

### Subtle Ambient Effect

```typescript
const glow = new AmbientGlow(video, {
  blur: 60,
  opacity: 0.3,
  brightness: 0.9,
  saturate: 0.8,
  scale: 1.05
})
```

### Dramatic Immersive Effect

```typescript
const glow = new AmbientGlow(video, {
  blur: 150,
  opacity: 0.9,
  brightness: 1.4,
  saturate: 2.0,
  scale: 1.15
})
```

### Monochrome Atmospheric Effect

```typescript
const glow = new AmbientGlow(video, {
  blur: 100,
  opacity: 0.6,
  brightness: 1.0,
  saturate: 0.2, // Near-grayscale
  scale: 1.1
})
```

### Neon-Style High Contrast

```typescript
const glow = new AmbientGlow(video, {
  blur: 120,
  opacity: 0.8,
  brightness: 1.6,
  saturate: 3.0,
  scale: 1.12
})
```

### High-Performance Mode

```typescript
const glow = new AmbientGlow(video, {
  downscale: 0.04,
  updateInterval: 1500,
  blendOld: 0.9,
  blendNew: 0.1,
  blur: 80
})
```

### High-Quality Mode

```typescript
const glow = new AmbientGlow(video, {
  downscale: 0.15,
  updateInterval: 500,
  blendOld: 0.7,
  blendNew: 0.3,
  blur: 120
})
```

## Dynamic Updates

All configuration options can be updated dynamically using `updateOptions()`:

```typescript
const glow = new AmbientGlow(video, {
  blur: 96,
  opacity: 0.65
})

// Later, update settings
glow.updateOptions({
  blur: 120,
  opacity: 0.8,
  brightness: 1.5
})

// Only specified options are updated
glow.updateOptions({ saturate: 2.0 })
// blur and opacity remain at their updated values
```

## Performance Tuning

For optimal performance on lower-end devices:

1. **Lower `downscale`** - Biggest performance impact (e.g., 0.04)
2. **Increase `updateInterval`** - Reduces update frequency (e.g., 1500ms)
3. **Increase `blendOld`** - Reduces need for frequent updates (e.g., 0.9)

For maximum quality on high-end devices:

1. **Increase `downscale`** - Better color accuracy (e.g., 0.15)
2. **Decrease `updateInterval`** - More reactive (e.g., 500ms)
3. **Adjust `blendOld`/`blendNew`** - Based on desired transition speed
