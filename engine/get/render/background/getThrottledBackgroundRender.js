/**
 * getThrottledBackgroundRender.js - Background Rendering Throttle
 *
 * PURPOSE:
 *   Determines whether enough time has elapsed since the last background
 *   render to allow a new GPU frame. Prevents excessive GPU usage by
 *   enforcing a minimum interval between background particle renders.
 *
 * ARCHITECTURE ROLE:
 *   Called by the background rendering loop to throttle GPU-intensive
 *   particle drawing. Uses the BG_GPU_MIN_INTERVAL_MS constant from
 *   backgroundState.
 *
 * WHY THIS EXISTS:
 *   Centralizes throttle timing policy to avoid duplicating interval checks
 *   across multiple rendering entry points.
 */

'use strict';

import { BG_GPU_MIN_INTERVAL_MS } from '@engine/state/render/background/stateBackgroundState.js';

/**
 * Checks whether enough time has elapsed to allow a new background render.
 * @param {number} lastRenderTime - Timestamp of the last background render (ms).
 * @param {number} currentTime - Current timestamp (ms).
 * @returns {boolean} True if the minimum interval has been met.
 */
export function getThrottledBackgroundRender(lastRenderTime, currentTime) {
  return (currentTime - lastRenderTime) >= BG_GPU_MIN_INTERVAL_MS;
}
