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

import { isGpuMode } from '@engine/set/render/isGpuMode.js';
import { getBgCanvas } from '@engine/get/render/background/getBgCanvas.js';
import { getColors } from '@engine/get/render/background/getColors.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';
import { backgroundWorkerState } from '@engine/state/render/background/worker.js';
import { postToBackgroundWorker } from '@engine/set/render/postToBackgroundWorker.js';
import { getThemeMode } from '@engine/get/render/getThemeMode.js';
import { renderWorkerParticles } from '@engine/set/render/draw/renderWorkerParticles.js';
import { initBackgroundWorker } from '@engine/init/render/initBackgroundWorker.js';

/**
 * backgroundCpu - GPU background pipeline (worker + 2D canvas)
 *
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function backgroundCpu(nowMs) {
  if (isGpuMode()) {
    throw new Error('backgroundCpu executed while GPU mode active');
  }

  const canvasState = getBgCanvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  const { bgColor, particleColor } = getColors();

  if (!backgroundWorkerState.workerReady) {
    if (!backgroundWorkerState.workerInitialized || !backgroundWorkerState.workerAvailable) {
      initBackgroundWorker('cpu');
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

  const pending = backgroundWorkerState.pendingWorkerParticles;
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
