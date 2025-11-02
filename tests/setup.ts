import { vi, beforeAll, afterAll } from 'vitest'

// Mock canvas 2D context for testing
const mockContext = {
  canvas: null as HTMLCanvasElement | null,
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  drawImage: vi.fn(),
  getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => {
    const data = new Uint8ClampedArray(w * h * 4)
    return { data, width: w, height: h, colorSpace: 'srgb' } as ImageData
  }),
  putImageData: vi.fn(),
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  createPattern: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn(),
  strokeText: vi.fn()
}

// Store original getContext to restore after tests
const originalGetContext = HTMLCanvasElement.prototype.getContext

// Set up canvas mocking before all tests
beforeAll(() => {
  // Override HTMLCanvasElement.prototype.getContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(HTMLCanvasElement.prototype.getContext as any) = function (
    this: HTMLCanvasElement,
    contextType: string,
    options?: CanvasRenderingContext2DSettings
  ) {
    if (contextType === '2d') {
      const ctx = { ...mockContext }
      ctx.canvas = this
      return ctx as unknown as CanvasRenderingContext2D
    }
    return originalGetContext.call(this, contextType, options)
  }
})

// Restore original getContext after all tests
afterAll(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext
})
