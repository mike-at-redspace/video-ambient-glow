Complete examples for integrating video-ambient-glow with popular JavaScript frameworks.

## React

### Basic Component

```tsx
import { useEffect, useRef } from 'react'
import { AmbientGlow } from 'video-ambient-glow'

export function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const glowRef = useRef<AmbientGlow | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    glowRef.current = new AmbientGlow(videoRef.current, {
      blur: 96,
      opacity: 0.65,
      brightness: 1.1,
      saturate: 1.2
    })

    return () => {
      if (glowRef.current) {
        glowRef.current.destroy()
        glowRef.current = null
      }
    }
  }, [])

  const handleUpdateGlow = () => {
    glowRef.current?.updateOptions({ blur: 150, opacity: 0.9 })
  }

  return (
    <div>
      <video ref={videoRef} src={src} controls />
      <button onClick={handleUpdateGlow}>Enhance Glow</button>
    </div>
  )
}
```

### With Props for Configuration

```tsx
import { useEffect, useRef } from 'react'
import { AmbientGlow } from 'video-ambient-glow'

interface VideoPlayerProps {
  src: string
  blur?: number
  opacity?: number
  brightness?: number
  saturate?: number
}

export function VideoPlayer({
  src,
  blur = 96,
  opacity = 0.65,
  brightness = 1.1,
  saturate = 1.2
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const glowRef = useRef<AmbientGlow | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    glowRef.current = new AmbientGlow(videoRef.current, {
      blur,
      opacity,
      brightness,
      saturate
    })

    return () => {
      glowRef.current?.destroy()
    }
  }, [])

  // Update glow when props change
  useEffect(() => {
    glowRef.current?.updateOptions({ blur, opacity, brightness, saturate })
  }, [blur, opacity, brightness, saturate])

  return <video ref={videoRef} src={src} controls />
}
```

### Custom Hook

```tsx
import { useEffect, useRef } from 'react'
import { AmbientGlow, GlowOptions } from 'video-ambient-glow'

function useAmbientGlow(
  videoRef: React.RefObject<HTMLVideoElement>,
  options?: GlowOptions
) {
  const glowRef = useRef<AmbientGlow | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    glowRef.current = new AmbientGlow(videoRef.current, options)

    return () => {
      glowRef.current?.destroy()
    }
  }, [])

  const updateGlow = (newOptions: Partial<GlowOptions>) => {
    glowRef.current?.updateOptions(newOptions)
  }

  return { updateGlow }
}

// Usage
export function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { updateGlow } = useAmbientGlow(videoRef, {
    blur: 96,
    opacity: 0.65
  })

  return (
    <div>
      <video ref={videoRef} src={src} controls />
      <button onClick={() => updateGlow({ blur: 150 })}>Increase Blur</button>
    </div>
  )
}
```

## Vue 3 (Composition API)

### Basic Component

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { AmbientGlow } from 'video-ambient-glow'

interface Props {
  src: string
  blur?: number
  opacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  blur: 96,
  opacity: 0.65
})

const videoElement = ref<HTMLVideoElement | null>(null)
let glow: AmbientGlow | null = null

onMounted(() => {
  if (videoElement.value) {
    glow = new AmbientGlow(videoElement.value, {
      blur: props.blur,
      opacity: props.opacity
    })
  }
})

watch([() => props.blur, () => props.opacity], ([newBlur, newOpacity]) => {
  glow?.updateOptions({ blur: newBlur, opacity: newOpacity })
})

onUnmounted(() => {
  glow?.destroy()
  glow = null
})
</script>

<template>
  <div class="video-container">
    <video ref="videoElement" :src="src" controls />
  </div>
</template>

<style scoped>
.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
}
</style>
```

### With Options API

```vue
<script lang="ts">
import { AmbientGlow } from 'video-ambient-glow'

export default {
  props: {
    src: {
      type: String,
      required: true
    },
    blur: {
      type: Number,
      default: 96
    },
    opacity: {
      type: Number,
      default: 0.65
    }
  },
  data() {
    return {
      glow: null as AmbientGlow | null
    }
  },
  mounted() {
    const videoElement = this.$refs.videoElement as HTMLVideoElement
    if (videoElement) {
      this.glow = new AmbientGlow(videoElement, {
        blur: this.blur,
        opacity: this.opacity
      })
    }
  },
  watch: {
    blur(newBlur: number) {
      this.glow?.updateOptions({ blur: newBlur })
    },
    opacity(newOpacity: number) {
      this.glow?.updateOptions({ opacity: newOpacity })
    }
  },
  beforeUnmount() {
    this.glow?.destroy()
    this.glow = null
  }
}
</script>

<template>
  <video ref="videoElement" :src="src" controls />
</template>
```

## Svelte

### Basic Component

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { AmbientGlow } from 'video-ambient-glow'

  export let src: string
  export let blur: number = 96
  export let opacity: number = 0.65

  let videoElement: HTMLVideoElement
  let glow: AmbientGlow | null = null

  onMount(() => {
    if (videoElement) {
      glow = new AmbientGlow(videoElement, { blur, opacity })
    }
  })

  onDestroy(() => {
    glow?.destroy()
    glow = null
  })

  // Reactive updates
  $: if (glow && !glow.getIsDestroyed()) {
    glow.updateOptions({ blur, opacity })
  }

  function enhanceGlow() {
    blur = 150
    opacity = 0.9
  }
</script>

<div class="video-wrapper">
  <video bind:this={videoElement} {src} controls />
  <button on:click={enhanceGlow}>Enhance Glow</button>
</div>

<style>
  .video-wrapper {
    position: relative;
    width: 100%;
  }
</style>
```

### With Stores

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { writable } from 'svelte/store'
  import { AmbientGlow } from 'video-ambient-glow'

  export let src: string

  export const glowSettings = writable({
    blur: 96,
    opacity: 0.65,
    brightness: 1.1,
    saturate: 1.2
  })

  let videoElement: HTMLVideoElement
  let glow: AmbientGlow | null = null

  onMount(() => {
    if (videoElement) {
      glowSettings.subscribe((settings) => {
        if (glow) {
          glow.updateOptions(settings)
        } else {
          glow = new AmbientGlow(videoElement, settings)
        }
      })
    }
  })

  onDestroy(() => {
    glow?.destroy()
    glow = null
  })
</script>

<video bind:this={videoElement} {src} controls />
```

## Angular

### Component with Lifecycle Hooks

```typescript
import {
  Component,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
  ElementRef
} from '@angular/core'
import { AmbientGlow } from 'video-ambient-glow'

@Component({
  selector: 'app-video-player',
  template: `
    <div class="video-container">
      <video #videoElement [src]="src" controls></video>
      <button (click)="updateGlowEffect()">Update Glow</button>
    </div>
  `,
  styles: [
    `
      .video-container {
        position: relative;
        width: 100%;
        max-width: 800px;
      }
    `
  ]
})
export class VideoPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() src!: string
  @Input() blur: number = 96
  @Input() opacity: number = 0.65

  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>

  private glow: AmbientGlow | null = null

  ngAfterViewInit() {
    if (this.videoElement?.nativeElement) {
      this.glow = new AmbientGlow(this.videoElement.nativeElement, {
        blur: this.blur,
        opacity: this.opacity,
        brightness: 1.1,
        saturate: 1.2
      })
    }
  }

  ngOnChanges() {
    if (this.glow && !this.glow.getIsDestroyed()) {
      this.glow.updateOptions({
        blur: this.blur,
        opacity: this.opacity
      })
    }
  }

  updateGlowEffect() {
    if (this.glow && !this.glow.getIsDestroyed()) {
      this.glow.updateOptions({
        blur: this.blur * 1.5,
        opacity: Math.min(this.opacity * 1.3, 1)
      })
    }
  }

  ngOnDestroy() {
    this.glow?.destroy()
    this.glow = null
  }
}
```

### Service-Based Approach

```typescript
import { Injectable } from '@angular/core'
import { AmbientGlow, GlowOptions } from 'video-ambient-glow'

@Injectable({
  providedIn: 'root'
})
export class GlowService {
  private instances = new Map<HTMLVideoElement, AmbientGlow>()

  createGlow(video: HTMLVideoElement, options?: GlowOptions): AmbientGlow {
    if (this.instances.has(video)) {
      return this.instances.get(video)!
    }

    const glow = new AmbientGlow(video, options)
    this.instances.set(video, glow)
    return glow
  }

  destroyGlow(video: HTMLVideoElement): void {
    const glow = this.instances.get(video)
    if (glow) {
      glow.destroy()
      this.instances.delete(video)
    }
  }

  updateGlow(video: HTMLVideoElement, options: Partial<GlowOptions>): void {
    const glow = this.instances.get(video)
    glow?.updateOptions(options)
  }
}
```

## SolidJS

```tsx
import { onMount, onCleanup } from 'solid-js'
import { AmbientGlow } from 'video-ambient-glow'

interface VideoPlayerProps {
  src: string
  blur?: number
  opacity?: number
}

export function VideoPlayer(props: VideoPlayerProps) {
  let videoElement: HTMLVideoElement | undefined
  let glow: AmbientGlow | null = null

  onMount(() => {
    if (videoElement) {
      glow = new AmbientGlow(videoElement, {
        blur: props.blur ?? 96,
        opacity: props.opacity ?? 0.65
      })
    }
  })

  onCleanup(() => {
    glow?.destroy()
    glow = null
  })

  return <video ref={videoElement} src={props.src} controls />
}
```

## Best Practices

### Always Clean Up

Always call `destroy()` when the component unmounts to prevent memory leaks:

```typescript
// React
useEffect(() => {
  return () => glow?.destroy()
}, [])

// Vue
onUnmounted(() => {
  glow?.destroy()
})

// Svelte
onDestroy(() => {
  glow?.destroy()
})

// Angular
ngOnDestroy() {
  this.glow?.destroy()
}
```

### Check Before Updates

When updating from reactive sources, check that the glow hasn't been destroyed:

```typescript
if (glow && !glow.getIsDestroyed()) {
  glow.updateOptions({ blur: newBlur })
}
```

### Video Element Must Be in DOM

Ensure the video element is mounted before creating the glow:

```typescript
// React - use useEffect with empty deps
useEffect(() => {
  // videoElement is now in DOM
}, [])

// Vue - use onMounted
onMounted(() => {
  // videoElement is now in DOM
})
```
