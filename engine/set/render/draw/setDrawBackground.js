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
 * WHY THIS EXISTS:
 *   Provides unified mode selection for background rendering while isolating
 *   CPU/GPU pipeline specifics behind dedicated functions.
 *
 * DETAILS:
 *   No main-thread fallback; if the worker is unavailable, only the base
 *   background color is drawn.
 */

"use strict";

import { isGpuMode as getIsGpuMode } from '@engine/get/render/getIsGpuMode.js';
import { setBackgroundCpu } from '@engine/set/render/draw/setBackgroundCpu.js';
import { setBackgroundGpu } from '@engine/set/render/draw/setBackgroundGpu.js';

/**
 * background - Chooses background pipeline by mode
 *
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function setDrawBackground(nowMs) {
  if (getIsGpuMode()) {
    return setBackgroundGpu(nowMs);
  }

  return setBackgroundCpu(nowMs);
}
