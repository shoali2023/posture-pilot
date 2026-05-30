// Mock for @mediapipe/tasks-vision — prevents loading WASM/models during tests
export const mockDetectForVideo = vi.fn(() => ({ landmarks: [], worldLandmarks: [] }))

export const mockLandmarker = {
  detectForVideo: mockDetectForVideo,
  close: vi.fn(),
}

vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({}),
  },
  PoseLandmarker: {
    createFromOptions: vi.fn().mockResolvedValue(mockLandmarker),
  },
}))

// Mock getUserMedia
Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
  configurable: true,
  writable: true,
})

// Mock canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  drawImage: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  clearRect: vi.fn(),
}) as unknown as typeof HTMLCanvasElement.prototype.getContext

// Mock requestAnimationFrame / cancelAnimationFrame
globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  setTimeout(() => cb(performance.now()), 16)
  return 0
})
globalThis.cancelAnimationFrame = vi.fn()
