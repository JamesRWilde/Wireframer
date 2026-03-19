/**
 * backgroundState.js - Background Renderer State
 * 
 * PURPOSE:
 *   Defines the shared state and constants for the background particle
 *   rendering system. This includes the GPU renderer reference, timing
 *   constants, and canvas reference.
 * 
 * ARCHITECTURE ROLE:
 *   Imported by background rendering modules that need to read or update
 *   the background renderer state. The state object is mutable while the
 *   export binding is const.
 * 
 * WHY SEPARATE STATE:
 *   The background renderer has its own state separate from the main loop
 *   because it can run on a different cadence (throttled to 60fps max)
 *   and may use a different rendering path (GPU vs CPU fallback).
 */

/**
 * BG_GPU_MAX_FPS - Maximum FPS for GPU background rendering
 * 
 * The background is throttled to 60fps to avoid wasting GPU resources
 * on particle updates that don't need to be faster than the display.
 */
export const BG_GPU_MAX_FPS = 60;

/**
 * BG_GPU_MIN_INTERVAL_MS - Minimum time between GPU background renders
 * 
 * Calculated from BG_GPU_MAX_FPS. Used to throttle background rendering.
 */
export const BG_GPU_MIN_INTERVAL_MS = 1000 / BG_GPU_MAX_FPS;

/**
 * bgState - Background renderer shared state
 * 
 * @property {Object|null} renderer - GPU renderer instance (WebGL context wrapper)
 * @property {boolean} rendererFailed - Whether GPU renderer initialization failed
 * @property {number} gpuLastRenderMs - Timestamp of last GPU render (for throttling)
 * @property {HTMLCanvasElement|null} canvas - The background canvas element
 * 
 * Note: consumers should import `bgState` and read/write properties directly.
 */
export const bgState = {
	renderer: null,
	rendererFailed: false,
	gpuLastRenderMs: -1,
	canvas: null,

	// Particle density multiplier (1.0 = default)
	densityPct: 1,
	// Particle speed multiplier (1.0 = default)
	velocityPct: 1,
	// Particle opacity multiplier (1.0 = default)
	opacityPct: 1,
};

export function throttleBackgroundRendering(lastRenderTime, currentTime) {
  return (currentTime - lastRenderTime) >= BG_GPU_MIN_INTERVAL_MS;
}
