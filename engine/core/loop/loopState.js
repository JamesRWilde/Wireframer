// Loop state - shared state for the main render loop
// Export a single object so that bindings remain const while properties are mutable.
export const state = {
  RENDER_FRAME_ID: 0,
  lastFrameMs: -1,
  lastPresentedFrameMs: -1,
  frameCount: 0,
  foregroundRenderMode: 'unknown',
  telemetryLastUiMs: 0,
  // EMA metrics
  emaFrameMs: 0,
  emaFpsFrameIntervalMs: 0,
  emaPhysMs: 0,
  emaBgMs: 0,
  emaFgMs: 0,
};

// FPS limiting
export const MAX_FPS = 0;
export const MIN_FRAME_INTERVAL_MS = MAX_FPS > 0 ? (1000 / MAX_FPS) : 0;

// Telemetry UI interval
export const TELEMETRY_UI_INTERVAL_MS = 250;
export const TELEMETRY_ALPHA = 0.2;

// Setters for mutable state
// Mutating `state` should be done by importing `state` and writing properties directly.
// Trivial setter functions were removed to follow the project's single-responsibility rule.
