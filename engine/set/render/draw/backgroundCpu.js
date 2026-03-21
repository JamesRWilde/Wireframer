/**
 * backgroundCpu.js - CPU Background Rendering Pipeline
 *
 * PURPOSE:
 *   Renders the background particles onto the background canvas using the CPU
 *   render pipeline. Particle positions and alpha are computed in the worker,
 *   then rendered on 2D canvas with bucketed fillRect drawing.
 *
 * ARCHITECTURE ROLE:
 *   Used by the main scene renderer when CPU mode is active.
 *   This pipeline is independent of GPU background pipeline.
 */

"use strict";

import { canvas } from '@engine/get/render/background/canvas.js';
import { colors } from '@engine/get/render/background/colors.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';
import { workerState } from '@engine/state/render/background/worker.js';
import { postToBackgroundWorker } from '@engine/set/render/postToBackgroundWorker.js';
import { getThemeMode } from '@engine/get/render/themeMode.js';
import { renderWorkerParticles } from '@engine/set/render/draw/renderWorkerParticles.js';
import { backgroundWorker } from '@engine/init/render/backgroundWorker.js';

/**
 * backgroundCpu - GPU background pipeline (worker + 2D canvas)
 *
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function backgroundCpu(nowMs) {
  const canvasState = canvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  const { bgColor, particleColor } = colors();

  if (!workerState.workerReady) {
    if (!workerState.workerInitialized || !workerState.workerAvailable) {
      backgroundWorker('cpu');
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    return false;
  }

  const density = bgState.densityPct;
  const speed = bgState.velocityPct;
  const opacity = bgState.opacityPct;

  postToBackgroundWorker({
    type: 'update',
    mode: 'cpu',
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
    // CPU path uses straightforward fillRect rendering; no additional shadow/glow.
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.globalCompositeOperation = 'source-over';
    renderWorkerParticles(ctx, pending.data, pending.count, opacity, particleColor, getThemeMode());
    ctx.restore();
  }

  return true;
}
