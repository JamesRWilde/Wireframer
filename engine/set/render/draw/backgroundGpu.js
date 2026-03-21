/**
 * backgroundGpu.js - GPU Background Rendering Pipeline
 *
 * PURPOSE:
 *   Renders the animated background particles using the GPU path when
 *   GPU mode is active. Worker updates particle data; GPU renderer draws
 *   to the GPU canvas.
 *
 * ARCHITECTURE ROLE:
 *   Used by main scene renderer in GPU mode.
 *   Separates GPU background pipeline from CPU background pipeline.
 */

"use strict";

import { canvas } from '@engine/get/render/background/canvas.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';
import { workerState } from '@engine/state/render/background/worker.js';
import { postToBackgroundWorker } from '@engine/set/render/postToBackgroundWorker.js';
import { getThemeMode } from '@engine/get/render/themeMode.js';
import { colors } from '@engine/get/render/background/colors.js';
import { backgroundWorker } from '@engine/init/render/backgroundWorker.js';
import { renderWorkerParticles } from '@engine/set/render/draw/renderWorkerParticles.js';

function parseCssColor(cssColor) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = cssColor || '#000000';
  const computed = ctx.fillStyle;

  const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
  if (!m) return [0, 0, 0, 1];
  return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255, Number(m[4] ?? 1)];
}

/**
 * backgroundGpu - GPU background pipeline
 *
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function backgroundGpu(nowMs) {
  const canvasState = canvas();
  if (!canvasState) return false;

  const { ctx, w, h } = canvasState;
  const { bgColor, particleColor } = colors();

  if (!workerState.workerReady) {
    if (!workerState.workerInitialized || !workerState.workerAvailable) {
      backgroundWorker('gpu');
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
    mode: 'gpu',
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

    // GPU path uses a subtle glow effect to keep CPU/GPU performance reasonable.
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 5;
    ctx.shadowColor = particleColor;
    ctx.globalCompositeOperation = getThemeMode() === 'light' ? 'multiply' : 'screen';

    renderWorkerParticles(ctx, pending.data, pending.count, opacity, particleColor, getThemeMode());

    // Single pass with softer opacity means less overhead and no harsh bloom.
    ctx.restore();
  }

  return true;
}
