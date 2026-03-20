/**
 * background.js - Background Renderer
 *
 * PURPOSE:
 *   Renders the animated particle background using either the Web Worker
 *   path (when available) or a main-thread fallback. Draws a solid
 *   background color and composites particles with appropriate blend modes
 *   for the active theme.
 *
 * ARCHITECTURE ROLE:
 *   Called each frame by the render loop to draw the background layer.
 *   Manages worker lifecycle, particle seeding, and theme-aware rendering
 *   (multiply blend for light theme, screen blend for dark theme).
 *
 * DETAILS:
 *   Falls back to main-thread particle updates if the background worker
 *   is not ready. Theme affects blend mode and particle opacity boost.
 */

"use strict";

// Import background canvas getter
import {canvas}from '@engine/get/render/background/canvas.js';

// Import theme-aware color getters
import {colors}from '@engine/get/render/background/colors.js';

// Import particle seeding for main-thread fallback
import { seedParticles }from '@engine/set/render/seedParticles.js';

// Import main-thread particle updater for fallback path
import { workersUpdateParticles }from '@workers/workersUpdateParticles.js';

// Import background worker initialization
import { backgroundWorker }from '@engine/init/render/backgroundWorker.js';

// Import background worker state directly (avoid function wrapper)
import { workerState }from '@engine/state/render/background/worker.js';

// Import message sender for background worker
import { postToBackgroundWorker }from '@engine/set/render/postToBackgroundWorker.js';

// Import centralized render state
import { getThemeMode } from '@engine/get/render/themeMode.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';

// Main-thread particle array (used as fallback when worker is unavailable)
let particles = [];

// Track whether the background worker has been initialized
let workerInitialized = false;

// Import helper functions for particle rendering
import { renderWorkerParticles } from '@engine/set/render/draw/renderWorkerParticles.js';
import { renderMainThreadParticles } from '@engine/set/render/draw/renderMainThreadParticles.js';

/**
 * background - Renders the animated particle background
 *
 * @param {number} [nowMs] - Current timestamp in milliseconds
 * @returns {boolean} Whether the background was rendered successfully
 */
export function background(nowMs) {
  // Get the background canvas and context
  const canvasState = canvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  // Get theme-aware colors
  const { bgColor, particleColor } = colors();

  // Lazy-initialize the background worker
  if (!workerInitialized) {
    backgroundWorker();
    workerInitialized = true;
  }

  // Worker path: send update command and render received particle data
  if (workerState.workerReady) {
    const density = bgState.densityPct;
    const speed = bgState.velocityPct;
    const opacity = bgState.opacityPct;

    // Send update command to background worker
    postToBackgroundWorker({
      type: 'update',
      timestamp: nowMs ?? performance.now(),
      density, speed, opacity,
      themeMode: getThemeMode()
    });

    // Draw solid background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // Render particles received from worker
    const pending = workerState.pendingWorkerParticles;
    if (pending) {
      ctx.save();
      ctx.globalCompositeOperation = getThemeMode() === 'light' ? 'multiply' : 'screen';
      renderWorkerParticles(ctx, pending.data, pending.count, opacity, particleColor, getThemeMode());
      ctx.restore();
    }

    return true;
  }

  // Main-thread fallback: seed and update particles locally
  const { velScale, opacityScale, themeAlphaBoost } = seedParticles(particles, w, h);
  const now = nowMs ?? performance.now();

  // Update particle positions and alpha on the main thread
  workersUpdateParticles(particles, w, h, now, velScale, opacityScale, themeAlphaBoost);

  // Draw solid background color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // Draw particles with appropriate blend mode
  ctx.save();
  ctx.globalCompositeOperation = getThemeMode() === 'light' ? 'multiply' : 'screen';
  renderMainThreadParticles(ctx, particles, opacityScale, themeAlphaBoost, particleColor);
  ctx.restore();

  return true;
}
