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

// Import message sender for background worker
import { postToBackgroundWorker }from '@engine/set/render/postToBackgroundWorker.js';

// Import centralized render state
import { getThemeMode } from '@engine/get/render/themeMode.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';

// IMPORTANT: backgroundWorker is initialized at startup (startApp/initRenderPipeline)
// and non-worker fallback code has been removed to enforce worker-first behavior.

// Import helper function for worker-particle rendering
import { renderWorkerParticles } from '@engine/set/render/draw/renderWorkerParticles.js';

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

  // If background worker is not ready, draw only static background color.
  // No main-thread fallback mode is allowed to keep behavior deterministic.
  if (!workerState.workerReady) {
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
