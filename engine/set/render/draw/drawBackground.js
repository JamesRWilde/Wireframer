/**
 * background.js - Background Renderer
 *
 * PURPOSE:
 *   Renders the animated particle background through the dedicated background
 *   worker pipeline. Draws a solid background color and composites particles
 *   with appropriate blend modes for the active theme.
 *
 * ARCHITECTURE ROLE:
 *   Called each frame by the render loop to draw the background layer.
 *   Assumes backgroundWorker was initialized at startup.
 *
 * DETAILS:
 *   No main-thread fallback; if the worker is unavailable, only the base
 *   background color is drawn.
 */

"use strict";

import { isGpuMode } from '@engine/set/render/isGpuMode.js';
import { backgroundCpu } from '@engine/set/render/draw/backgroundCpu.js';
import { backgroundGpu } from '@engine/set/render/draw/backgroundGpu.js';

/**
 * background - Chooses background pipeline by mode
 *
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function drawBackground(nowMs) {
  if (isGpuMode()) {
    return backgroundGpu(nowMs);
  }

  return backgroundCpu(nowMs);
}
