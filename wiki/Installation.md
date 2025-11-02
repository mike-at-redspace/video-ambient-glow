# Installation

## npm

```bash
npm install video-ambient-glow
```

## yarn

```bash
yarn add video-ambient-glow
```

## pnpm

```bash
pnpm add video-ambient-glow
```

## Import Methods

### ES Modules (ESM)

```typescript
import { AmbientGlow } from 'video-ambient-glow'
```

### CommonJS (CJS)

```javascript
const { AmbientGlow } = require('video-ambient-glow')
```

### CDN (Browser)

```html
<script type="module">
  import { AmbientGlow } from 'https://cdn.skypack.dev/video-ambient-glow'
  
  const video = document.querySelector('video')
  const glow = new AmbientGlow(video)
</script>
```

## TypeScript Support

TypeScript type definitions are included in the package. No additional `@types` package is needed.

## Package Size

- **Uncompressed**: ~16.8KB
- **Gzipped**: ~4.6KB
- **Zero runtime dependencies**

## Requirements

- Modern browser with support for:
  - HTML5 Video API
  - Canvas 2D Context
  - CSS Filters (for blur, brightness, saturation)

## Next Steps

After installation, check out the [API Reference](API-Reference) to get started, or see [Framework Integration](Framework-Integration) for examples with your favorite framework.

