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

// Import background canvas getter
import {canvas}from '@engine/get/render/background/canvas.js';

// Import theme-aware color getters
import {colors}from '@engine/get/render/background/colors.js';

// Import background worker state directly (avoid function wrapper)
import { workerState }from '@engine/state/render/background/worker.js';

// Import background worker initialization helper
import { backgroundWorker }from '@engine/init/render/backgroundWorker.js';

// Import message sender for background worker
import { postToBackgroundWorker }from '@engine/set/render/postToBackgroundWorker.js';

// Import centralized render state
import { getThemeMode } from '@engine/get/render/themeMode.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';

// IMPORTANT: This function attempts worker initialization when necessary and
// does not run main-thread particle updates for fallback. It preserves the
// static background color while the worker warms up.

// Import helper function for worker-particle rendering
import { renderWorkerParticles } from '@engine/set/render/draw/renderWorkerParticles.js';

// Debug helper (avoid console spam)
let backgroundWorkerNotReadyLogged = false;

/**
 * background - Renders the animated particle background
 *
 * @param {number} [nowMs] - Current timestamp in milliseconds
 * @returns {boolean} Whether the background was rendered successfully
 */
export function background(nowMs) {
  const canvasState = canvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  const { bgColor, particleColor } = colors();

  // If the worker is not yet ready, attempt initialization on each frame.
  // Render at least static background color (no CPU particle fallbacks).
  if (!workerState.workerReady) {
    if (!workerState.workerInitialized || !workerState.workerAvailable) {
      backgroundWorker();
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    return false;
  }

  const density = bgState.densityPct;
  const speed = bgState.velocityPct;
  const opacity = bgState.opacityPct;

  // Send update command to the worker thread.
  postToBackgroundWorker({
    type: 'update',
    timestamp: nowMs ?? performance.now(),
    density,
    speed,
    opacity,
    themeMode: getThemeMode(),
  });

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  const pending = workerState.pendingWorkerParticles;
  if (pending) {
    ctx.save();
    ctx.globalCompositeOperation = getThemeMode() === 'light' ? 'multiply' : 'screen';
    renderWorkerParticles(ctx, pending.data, pending.count, opacity, particleColor, getThemeMode());
    ctx.restore();
  }

  return true;
}
